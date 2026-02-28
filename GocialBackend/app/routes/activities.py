"""
Activity routes

The heart of Gocial - creating, finding, joining activities.
Handles all the CRUD, filtering, participation requests, and likes.
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from math import radians, cos, sin, asin, sqrt

from app import db
from app.models import User, Activity, Participation, ActivityLike, Friendship

activities_bp = Blueprint('activities', __name__)


def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate distance in km between two points.
    The classic haversine formula.
    """
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    return 6371 * c  # Earth radius in km


# ---------------------------------------------------------------------
# Get activity feed
# ---------------------------------------------------------------------

@activities_bp.route('/', methods=['GET'])
@jwt_required()
def get_activities():
    """
    Main activity feed with all the filters.
    
    Query params:
    - type: real | visio (defaults to real)
    - category: activity category
    - date: specific date (YYYY-MM-DD)
    - lat, lng, radius: location-based filter (km)
    - girls_only: filter women-only activities
    - free_only: show only free activities
    - page, per_page: pagination
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    # Parse all the filter params
    activity_type = request.args.get('type', 'real')
    category = request.args.get('category', '').strip()
    date_str = request.args.get('date', '').strip()
    
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    radius = request.args.get('radius', 50, type=float)  # default 50km
    
    girls_only = request.args.get('girls_only', 'false').lower() == 'true'
    free_only = request.args.get('free_only', 'false').lower() == 'true'
    
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 50)
    
    # Base query - only published, future activities
    query = Activity.query.filter(
        Activity.status == 'published',
        Activity.date >= datetime.utcnow()
    )
    
    # Filter by type
    if activity_type in ('real', 'visio'):
        query = query.filter(Activity.activity_type == activity_type)
    
    # Category filter
    if category:
        query = query.filter(Activity.category == category)
    
    # Date filter
    if date_str:
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            next_day = target_date + timedelta(days=1)
            query = query.filter(
                Activity.date >= datetime.combine(target_date, datetime.min.time()),
                Activity.date < datetime.combine(next_day, datetime.min.time())
            )
        except ValueError:
            pass  # Ignore invalid dates
    
    # Girls only filter
    if girls_only or (current_user and current_user.girls_only_mode):
        query = query.filter(Activity.gender_restriction == 'female')
    
    # Free activities only
    if free_only:
        query = query.filter(
            (Activity.price == None) | (Activity.price == 0)
        )
    
    # Location-based filtering
    # Note: For production, you'd want PostGIS or similar for proper geo queries
    if lat is not None and lng is not None:
        # We'll filter by bounding box first (rough filter)
        # then calculate exact distance in Python
        # This isn't ideal for huge datasets but works fine for small/medium scale
        lat_delta = radius / 111  # ~111km per degree lat
        lng_delta = radius / (111 * cos(radians(lat)))
        
        query = query.filter(
            Activity.latitude.between(lat - lat_delta, lat + lat_delta),
            Activity.longitude.between(lng - lng_delta, lng + lng_delta)
        )
    
    # Visibility check - public activities or friends-only if we're friends
    friend_ids = []
    if current_user:
        friendships = Friendship.query.filter(
            ((Friendship.user_id == current_user_id) | (Friendship.friend_id == current_user_id)),
            Friendship.status == 'accepted'
        ).all()
        
        for f in friendships:
            friend_ids.append(f.friend_id if f.user_id == current_user_id else f.user_id)
    
    query = query.filter(
        (Activity.visibility == 'public') |
        (Activity.visibility == 'friends_only') & (Activity.host_id.in_(friend_ids)) |
        (Activity.host_id == current_user_id)
    )
    
    # Sort by date
    query = query.order_by(Activity.date.asc())
    
    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    activities = pagination.items
    
    # Post-process for exact distance if location filter is active
    if lat is not None and lng is not None:
        activities_with_distance = []
        for activity in activities:
            if activity.latitude and activity.longitude:
                dist = haversine(lng, lat, activity.longitude, activity.latitude)
                if dist <= radius:
                    activity_dict = activity.to_dict(viewer_id=current_user_id)
                    activity_dict['distance_km'] = round(dist, 1)
                    activities_with_distance.append(activity_dict)
        
        result = activities_with_distance
    else:
        result = [a.to_dict(viewer_id=current_user_id) for a in activities]
    
    return jsonify({
        'activities': result,
        'total': len(result) if lat else pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'has_next': pagination.has_next,
    }), 200


# ---------------------------------------------------------------------
# Get single activity
# ---------------------------------------------------------------------

@activities_bp.route('/<int:activity_id>', methods=['GET'])
@jwt_required()
def get_activity(activity_id):
    """
    Get full details of an activity.
    """
    current_user_id = get_jwt_identity()
    
    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({'error': 'Activity not found'}), 404
    
    # Check visibility
    if activity.visibility == 'friends_only' and activity.host_id != current_user_id:
        # Check if we're friends with host
        friendship = Friendship.query.filter(
            ((Friendship.user_id == current_user_id) & (Friendship.friend_id == activity.host_id)) |
            ((Friendship.user_id == activity.host_id) & (Friendship.friend_id == current_user_id)),
            Friendship.status == 'accepted'
        ).first()
        
        if not friendship:
            return jsonify({'error': 'Activity not found'}), 404
    
    # Get participant list if host or if already participating
    include_participants = False
    current_participation = None
    
    if activity.host_id == current_user_id:
        include_participants = True
    else:
        current_participation = Participation.query.filter_by(
            activity_id=activity_id,
            user_id=current_user_id
        ).first()
        
        if current_participation and current_participation.status == 'validated':
            include_participants = True
    
    response = activity.to_dict(viewer_id=current_user_id)
    
    # Add participation status
    if current_participation:
        response['my_participation'] = {
            'status': current_participation.status,
            'requested_at': current_participation.created_at.isoformat(),
        }
    
    # Add participant list if allowed
    if include_participants:
        participants = Participation.query.filter_by(
            activity_id=activity_id,
            status='validated'
        ).all()
        
        response['participants'] = [
            {
                'user': User.query.get(p.user_id).to_dict(),
                'joined_at': p.validated_at.isoformat() if p.validated_at else None
            }
            for p in participants
        ]
    
    return jsonify(response), 200


# ---------------------------------------------------------------------
# Create activity
# ---------------------------------------------------------------------

@activities_bp.route('/', methods=['POST'])
@jwt_required()
def create_activity():
    """
    Create a new activity.
    
    Required fields: title, activity_type, date
    Optional: description, category, max_participants, price, location stuff, etc.
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate required fields
    title = data.get('title', '').strip()
    activity_type = data.get('activity_type', '').strip()
    date_str = data.get('date', '').strip()
    
    if not title:
        return jsonify({'error': 'Title is required'}), 400
    
    if activity_type not in ('real', 'visio'):
        return jsonify({'error': 'Activity type must be "real" or "visio"'}), 400
    
    if not date_str:
        return jsonify({'error': 'Date is required'}), 400
    
    # Parse date
    try:
        activity_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400
    
    # Can't create activities in the past
    if activity_date < datetime.utcnow():
        return jsonify({'error': 'Cannot create activity in the past'}), 400
    
    # Build activity
    # Map frontend fields to model columns
    girls_only = data.get('is_girls_only', False)
    gender = 'female' if girls_only else data.get('gender_restriction', 'all')
    
    approval = data.get('require_approval', True)
    validation = 'manual' if approval else 'auto'
    
    activity = Activity(
        host_id=user_id,
        title=title,
        activity_type=activity_type,
        date=activity_date,
        description=data.get('description', '').strip() or None,
        category=data.get('category', '').strip() or None,
        max_participants=data.get('max_participants'),
        price=data.get('price'),
        visibility=data.get('visibility', 'public'),
        gender_restriction=gender,
        validation_type=validation,
        status=data.get('status', 'published'),
    )
    
    # Location for IRL activities
    if activity_type == 'real':
        activity.address = data.get('address', '').strip() or None
        activity.city = data.get('city', '').strip() or None
        activity.postal_code = data.get('postal_code', '').strip() or None
        activity.latitude = data.get('latitude')
        activity.longitude = data.get('longitude')
    
    # Visio link for online activities
    if activity_type == 'visio':
        activity.visio_url = data.get('visio_link', '').strip() or data.get('visio_url', '').strip() or None
    
    try:
        db.session.add(activity)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Activity creation failed: {e}')
        return jsonify({'error': 'Failed to create activity'}), 500
    
    return jsonify({
        'message': 'Activity created',
        'activity': activity.to_dict(viewer_id=user_id)
    }), 201


# ---------------------------------------------------------------------
# Update activity
# ---------------------------------------------------------------------

@activities_bp.route('/<int:activity_id>', methods=['PUT', 'PATCH'])
@jwt_required()
def update_activity(activity_id):
    """
    Update an existing activity.
    
    Only the host can update.
    """
    user_id = get_jwt_identity()
    data = request.get_json()
    
    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({'error': 'Activity not found'}), 404
    
    if activity.host_id != user_id:
        return jsonify({'error': 'Not authorized'}), 403
    
    # Direct-mapped fields
    simple_fields = [
        'title', 'description', 'category', 'address', 'city', 'postal_code',
        'max_participants', 'price', 'visibility', 'status'
    ]
    
    for field in simple_fields:
        if field in data:
            value = data[field]
            if isinstance(value, str):
                value = value.strip() or None
            setattr(activity, field, value)
    
    # Handle field name differences between frontend and model
    if 'is_girls_only' in data:
        activity.gender_restriction = 'female' if data['is_girls_only'] else 'all'
    if 'gender_restriction' in data:
        activity.gender_restriction = data['gender_restriction']
    if 'require_approval' in data:
        activity.validation_type = 'manual' if data['require_approval'] else 'auto'
    if 'visio_link' in data or 'visio_url' in data:
        activity.visio_url = (data.get('visio_link') or data.get('visio_url', '')).strip() or None
    
    # Handle date change
    if 'date' in data:
        try:
            new_date = datetime.fromisoformat(data['date'].replace('Z', '+00:00'))
            if new_date < datetime.utcnow():
                return jsonify({'error': 'Cannot set date in the past'}), 400
            activity.date = new_date
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
    
    # Location update
    if 'latitude' in data and 'longitude' in data:
        activity.latitude = data['latitude']
        activity.longitude = data['longitude']
    
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Activity update failed: {e}')
        return jsonify({'error': 'Update failed'}), 500
    
    return jsonify({
        'message': 'Activity updated',
        'activity': activity.to_dict(viewer_id=user_id)
    }), 200


# ---------------------------------------------------------------------
# Delete activity
# ---------------------------------------------------------------------

@activities_bp.route('/<int:activity_id>', methods=['DELETE'])
@jwt_required()
def delete_activity(activity_id):
    """
    Delete an activity.
    
    Actually changes status to 'cancelled' - we don't hard delete.
    """
    user_id = get_jwt_identity()
    
    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({'error': 'Activity not found'}), 404
    
    if activity.host_id != user_id:
        return jsonify({'error': 'Not authorized'}), 403
    
    # Soft delete by marking as cancelled
    activity.status = 'cancelled'
    db.session.commit()
    
    # TODO: Notify participants that activity was cancelled
    
    return jsonify({'message': 'Activity cancelled'}), 200


# ---------------------------------------------------------------------
# Request participation
# ---------------------------------------------------------------------

@activities_bp.route('/<int:activity_id>/participate', methods=['POST'])
@jwt_required()
def request_participation(activity_id):
    """
    Request to join an activity.
    
    If approval is required, creates a pending request.
    Otherwise, directly validates participation.
    """
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({'error': 'Activity not found'}), 404
    
    # Can't join your own activity
    if activity.host_id == user_id:
        return jsonify({'error': 'You cannot join your own activity'}), 400
    
    # Check if activity is full
    if activity.is_full:
        return jsonify({'error': 'Activity is full'}), 400
    
    # Check if activity is in the past
    if activity.is_past:
        return jsonify({'error': 'Activity has already ended'}), 400
    
    # Check if already participating
    existing = Participation.query.filter_by(
        activity_id=activity_id,
        user_id=user_id
    ).first()
    
    if existing:
        if existing.status == 'validated':
            return jsonify({'error': 'Already participating'}), 400
        elif existing.status == 'pending':
            return jsonify({'error': 'Request already pending'}), 400
        elif existing.status == 'rejected':
            return jsonify({'error': 'Your request was rejected'}), 400
    
    # Create participation
    needs_approval = activity.validation_type == 'manual'
    status = 'pending' if needs_approval else 'validated'
    
    participation = Participation(
        activity_id=activity_id,
        user_id=user_id,
        status=status,
        request_message=data.get('message', '').strip() or None,
    )
    
    if status == 'validated':
        participation.validated_at = datetime.utcnow()
        activity.current_participants = (activity.current_participants or 1) + 1
        if activity.current_participants >= activity.max_participants:
            activity.status = 'full'
    
    db.session.add(participation)
    db.session.commit()
    
    # TODO: Send notification to host
    
    message = 'Participation requested' if status == 'pending' else 'Joined activity'
    
    return jsonify({
        'message': message,
        'status': status,
        'participation_id': participation.id
    }), 201


# ---------------------------------------------------------------------
# Cancel participation
# ---------------------------------------------------------------------

@activities_bp.route('/<int:activity_id>/participate', methods=['DELETE'])
@jwt_required()
def cancel_participation(activity_id):
    """
    Cancel your participation in an activity.
    """
    user_id = get_jwt_identity()
    
    participation = Participation.query.filter_by(
        activity_id=activity_id,
        user_id=user_id
    ).first()
    
    if not participation:
        return jsonify({'error': 'You are not participating'}), 404
    
    # Decrement participant count if they were validated
    if participation.status == 'validated':
        activity = Activity.query.get(activity_id)
        if activity:
            activity.current_participants = max(1, (activity.current_participants or 1) - 1)
            if activity.status == 'full':
                activity.status = 'published'
    
    db.session.delete(participation)
    db.session.commit()
    
    return jsonify({'message': 'Participation cancelled'}), 200


# ---------------------------------------------------------------------
# Handle participation request (for hosts)
# ---------------------------------------------------------------------

@activities_bp.route('/<int:activity_id>/participants/<int:user_id>', methods=['PUT'])
@jwt_required()
def handle_participation(activity_id, user_id):
    """
    Accept or reject a participation request.
    
    Only the host can do this.
    """
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({'error': 'Activity not found'}), 404
    
    if activity.host_id != current_user_id:
        return jsonify({'error': 'Not authorized'}), 403
    
    participation = Participation.query.filter_by(
        activity_id=activity_id,
        user_id=user_id
    ).first()
    
    if not participation:
        return jsonify({'error': 'Participation request not found'}), 404
    
    action = data.get('action', '').lower()
    
    if action == 'accept':
        # Check if activity is full
        if activity.is_full:
            return jsonify({'error': 'Activity is full'}), 400
        
        participation.status = 'validated'
        participation.validated_at = datetime.utcnow()
        activity.current_participants = (activity.current_participants or 1) + 1
        if activity.current_participants >= activity.max_participants:
            activity.status = 'full'
        message = 'Participation accepted'
        
    elif action == 'reject':
        participation.status = 'rejected'
        message = 'Participation rejected'
        
    else:
        return jsonify({'error': 'Action must be "accept" or "reject"'}), 400
    
    db.session.commit()
    
    # TODO: Notify user of decision
    
    return jsonify({'message': message}), 200


# ---------------------------------------------------------------------
# Get participation requests (for hosts)
# ---------------------------------------------------------------------

@activities_bp.route('/<int:activity_id>/participants', methods=['GET'])
@jwt_required()
def get_participants(activity_id):
    """
    Get all participants and pending requests.
    
    Only accessible by the host.
    """
    user_id = get_jwt_identity()
    
    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({'error': 'Activity not found'}), 404
    
    if activity.host_id != user_id:
        return jsonify({'error': 'Not authorized'}), 403
    
    participations = Participation.query.filter_by(activity_id=activity_id).all()
    
    result = {
        'validated': [],
        'pending': [],
        'rejected': []
    }
    
    for p in participations:
        user = User.query.get(p.user_id)
        entry = {
            'user': user.to_dict() if user else None,
            'message': p.request_message,
            'requested_at': p.created_at.isoformat(),
            'validated_at': p.validated_at.isoformat() if p.validated_at else None,
        }
        result[p.status].append(entry)
    
    return jsonify(result), 200


# ---------------------------------------------------------------------
# Like/unlike activity
# ---------------------------------------------------------------------

@activities_bp.route('/<int:activity_id>/like', methods=['POST'])
@jwt_required()
def like_activity(activity_id):
    """
    Like an activity - saves it to favorites.
    """
    user_id = get_jwt_identity()
    
    activity = Activity.query.get(activity_id)
    if not activity:
        return jsonify({'error': 'Activity not found'}), 404
    
    existing = ActivityLike.query.filter_by(
        activity_id=activity_id,
        user_id=user_id
    ).first()
    
    if existing:
        return jsonify({'message': 'Already liked'}), 200
    
    like = ActivityLike(activity_id=activity_id, user_id=user_id)
    activity.likes_count = (activity.likes_count or 0) + 1
    db.session.add(like)
    db.session.commit()
    
    return jsonify({'message': 'Activity liked'}), 201


@activities_bp.route('/<int:activity_id>/like', methods=['DELETE'])
@jwt_required()
def unlike_activity(activity_id):
    """
    Remove like from an activity.
    """
    user_id = get_jwt_identity()
    
    like = ActivityLike.query.filter_by(
        activity_id=activity_id,
        user_id=user_id
    ).first()
    
    if not like:
        return jsonify({'message': 'Not liked'}), 200
    
    activity = Activity.query.get(activity_id)
    if activity:
        activity.likes_count = max(0, (activity.likes_count or 0) - 1)
    db.session.delete(like)
    db.session.commit()
    
    return jsonify({'message': 'Like removed'}), 200


# ---------------------------------------------------------------------
# Get liked activities
# ---------------------------------------------------------------------

@activities_bp.route('/liked', methods=['GET'])
@jwt_required()
def get_liked_activities():
    """
    Get activities you've liked.
    """
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 50)
    
    likes = ActivityLike.query.filter_by(user_id=user_id).order_by(
        ActivityLike.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    activities = []
    for like in likes.items:
        activity = Activity.query.get(like.activity_id)
        if activity and activity.status == 'published':
            activities.append(activity.to_dict(viewer_id=user_id))
    
    return jsonify({
        'activities': activities,
        'total': likes.total,
        'pages': likes.pages,
        'current_page': page,
    }), 200


# ---------------------------------------------------------------------
# Get my activities (as host)
# ---------------------------------------------------------------------

@activities_bp.route('/hosting', methods=['GET'])
@jwt_required()
def get_my_hosted_activities():
    """
    Get activities you're hosting.
    """
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 50)
    include_past = request.args.get('include_past', 'false').lower() == 'true'
    
    query = Activity.query.filter(
        Activity.host_id == user_id,
        Activity.status != 'cancelled'
    )
    
    if not include_past:
        query = query.filter(Activity.date >= datetime.utcnow())
    
    query = query.order_by(Activity.date.asc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'activities': [a.to_dict(viewer_id=user_id) for a in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
    }), 200


# ---------------------------------------------------------------------
# Get my participations
# ---------------------------------------------------------------------

@activities_bp.route('/participating', methods=['GET'])
@jwt_required()
def get_my_participations():
    """
    Get activities you're participating in.
    """
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 50)
    status = request.args.get('status', 'validated')  # validated, pending, all
    include_past = request.args.get('include_past', 'false').lower() == 'true'
    
    query = Participation.query.filter_by(user_id=user_id)
    
    if status != 'all':
        query = query.filter_by(status=status)
    
    participations = query.all()
    activity_ids = [p.activity_id for p in participations]
    
    # Get activities
    activity_query = Activity.query.filter(Activity.id.in_(activity_ids))
    
    if not include_past:
        activity_query = activity_query.filter(Activity.date >= datetime.utcnow())
    
    activity_query = activity_query.order_by(Activity.date.asc())
    pagination = activity_query.paginate(page=page, per_page=per_page, error_out=False)
    
    # Include participation status with each activity
    result = []
    for activity in pagination.items:
        participation = next((p for p in participations if p.activity_id == activity.id), None)
        activity_dict = activity.to_dict(viewer_id=user_id)
        if participation:
            activity_dict['my_participation'] = {
                'status': participation.status,
                'requested_at': participation.created_at.isoformat(),
            }
        result.append(activity_dict)
    
    return jsonify({
        'activities': result,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
    }), 200
