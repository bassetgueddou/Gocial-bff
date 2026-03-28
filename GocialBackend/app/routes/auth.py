"""
Authentication routes

Handles signup, login, token refresh, password stuff.
All the gatekeeping happens here.
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from datetime import datetime
import re

from app import db
from app.models import User

auth_bp = Blueprint('auth', __name__)


# Email regex - not perfect but catches most garbage
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')


def validate_email(email):
    """Basic email format check."""
    return EMAIL_REGEX.match(email) is not None


def validate_password(password):
    """
    Password requirements:
    - At least 8 characters
    - Has a number
    - Has uppercase
    - Has lowercase and special characters
    """
    if len(password) < 8:
        return False, "Le mot de passe doit contenir au moins 8 caractères"
    if not any(c.isdigit() for c in password):
        return False, "Le mot de passe doit contenir au moins 1 chiffre"
    if not any(c.isupper() for c in password):
        return False, "Le mot de passe doit contenir au moins 1 majuscule"
    if not any(c.islower() for c in password):
        return False, "Le mot de passe doit contenir au moins 1 minuscule"
    if not any(not c.isalnum() for c in password):
        return False, "Le mot de passe doit contenir au moins 1 caractère spécial"
    return True, None


# ---------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Create a new user account.
    
    Required: email, password, user_type
    Optional: first_name, pseudo, phone, gender, city, birth_date, etc.
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Aucune donnée fournie'}), 400

    # Check required fields
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    user_type = data.get('user_type', 'person')

    if not email or not password:
        return jsonify({'error': "L'email et le mot de passe sont requis"}), 400

    if user_type not in ('person', 'pro', 'asso'):
        return jsonify({'error': "Type d'utilisateur invalide"}), 400

    # Validate email format
    if not validate_email(email):
        return jsonify({'error': "Format d'email invalide"}), 400
    
    # Validate password strength
    is_valid, error_msg = validate_password(password)
    if not is_valid:
        return jsonify({'error': error_msg}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Cet email est déjà utilisé'}), 409

    # Check pseudo uniqueness if provided
    pseudo = data.get('pseudo', '').strip()
    if pseudo:
        if len(pseudo) < 3:
            return jsonify({'error': 'Le pseudo doit contenir au moins 3 caractères'}), 400
        if User.query.filter_by(pseudo=pseudo).first():
            return jsonify({'error': 'Ce pseudo est déjà pris'}), 409
    
    # Create user object
    user = User(
        email=email,
        user_type=user_type,
        first_name=data.get('first_name', '').strip() or None,
        last_name=data.get('last_name', '').strip() or None,
        pseudo=pseudo or None,
        phone=data.get('phone', '').strip() or None,
        gender=data.get('gender'),
        city=data.get('city', '').strip() or None,
        company_name=data.get('company_name', '').strip() or None,
        siret=data.get('siret', '').strip() or None,
    )
    user.set_password(password)
    
    # Handle birth date
    birth_date_str = data.get('birth_date')
    if birth_date_str:
        try:
            user.birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
            
            # Quick age check - must be at least 13 (COPPA compliance-ish)
            age = (datetime.utcnow().date() - user.birth_date).days // 365
            if age < 13:
                return jsonify({'error': 'Vous devez avoir au moins 13 ans'}), 400
        except ValueError:
            return jsonify({'error': 'Format de date invalide (AAAA-MM-JJ attendu)'}), 400
    
    # Save to database
    try:
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Registration failed: {e}')
        return jsonify({'error': "L'inscription a échoué. Veuillez réessayer."}), 500
    
    # Generate tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Compte créé avec succès',
        'user': user.to_dict(include_private=True, include_settings=True),
        'access_token': access_token,
        'refresh_token': refresh_token,
    }), 201


# ---------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate and get tokens.
    
    Accepts email + password, returns user data and JWT tokens.
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Aucune donnée fournie'}), 400

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': "L'email et le mot de passe sont requis"}), 400

    # Find user
    user = User.query.filter_by(email=email).first()

    # Check password - use same error for both cases (security best practice)
    if not user or not user.check_password(password):
        return jsonify({'error': 'Email ou mot de passe incorrect'}), 401

    # Check if account is active
    if not user.is_active:
        return jsonify({'error': 'Ce compte est désactivé'}), 403
    
    # Update last login timestamp
    user.last_login = datetime.utcnow()
    user.last_seen = datetime.utcnow()
    db.session.commit()
    
    # Generate fresh tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Bon retour !',
        'user': user.to_dict(include_private=True, include_settings=True),
        'access_token': access_token,
        'refresh_token': refresh_token,
    }), 200


# ---------------------------------------------------------------------
# Token refresh
# ---------------------------------------------------------------------

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    """
    Get a new access token using refresh token.
    
    Call this when the access token expires (or is about to).
    """
    user_id = int(get_jwt_identity())

    # Make sure user still exists and is active
    user = User.query.get(user_id)
    if not user or not user.is_active:
        return jsonify({'error': 'Session invalide'}), 401

    # Update last seen
    user.last_seen = datetime.utcnow()
    db.session.commit()

    new_token = create_access_token(identity=str(user_id))
    
    return jsonify({'access_token': new_token}), 200


# ---------------------------------------------------------------------
# Get current user
# ---------------------------------------------------------------------

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    """
    Get the currently authenticated user's full profile.
    
    Includes private info since it's their own profile.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'Utilisateur introuvable'}), 404

    # Update last seen
    user.last_seen = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'user': user.to_dict(include_private=True, include_settings=True)
    }), 200


# ---------------------------------------------------------------------
# Password change
# ---------------------------------------------------------------------

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """
    Change password for logged-in user.
    
    Requires current password for verification.
    """
    data = request.get_json()
    user_id = int(get_jwt_identity())

    old_password = data.get('old_password', '')
    new_password = data.get('new_password', '')
    
    if not old_password or not new_password:
        return jsonify({'error': "L'ancien et le nouveau mot de passe sont requis"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Utilisateur introuvable'}), 404

    # Verify current password
    if not user.check_password(old_password):
        return jsonify({'error': 'Le mot de passe actuel est incorrect'}), 401

    # Validate new password
    is_valid, error_msg = validate_password(new_password)
    if not is_valid:
        return jsonify({'error': error_msg}), 400

    # Don't allow same password
    if old_password == new_password:
        return jsonify({'error': 'Le nouveau mot de passe doit être différent'}), 400

    # Update password
    user.set_password(new_password)
    db.session.commit()

    return jsonify({'message': 'Mot de passe mis à jour'}), 200


# ---------------------------------------------------------------------
# Logout (optional - mainly for token blacklisting later)
# ---------------------------------------------------------------------

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout - update last seen, potential future token blacklist.
    
    For now this is mostly informational since JWTs are stateless.
    Real logout happens client-side by deleting tokens.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if user:
        user.last_seen = datetime.utcnow()
        db.session.commit()

    # TODO: Add token to blacklist when we implement that

    return jsonify({'message': 'Déconnecté avec succès'}), 200


# ---------------------------------------------------------------------
# Email availability check
# ---------------------------------------------------------------------

@auth_bp.route('/check-email', methods=['POST'])
def check_email():
    """
    Check if an email is available for registration.
    
    Useful for real-time validation in signup forms.
    """
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    
    if not email:
        return jsonify({'error': "L'email est requis"}), 400
    
    if not validate_email(email):
        return jsonify({'available': False, 'reason': 'invalid_format'}), 200
    
    exists = User.query.filter_by(email=email).first() is not None
    
    return jsonify({
        'available': not exists,
        'reason': 'taken' if exists else None
    }), 200


# ---------------------------------------------------------------------
# Pseudo availability check
# ---------------------------------------------------------------------

@auth_bp.route('/check-pseudo', methods=['POST'])
def check_pseudo():
    """
    Check if a pseudo/username is available.
    """
    data = request.get_json()
    pseudo = data.get('pseudo', '').strip()
    
    if not pseudo:
        return jsonify({'error': 'Le pseudo est requis'}), 400
    
    if len(pseudo) < 3:
        return jsonify({'available': False, 'reason': 'too_short'}), 200
    
    if len(pseudo) > 30:
        return jsonify({'available': False, 'reason': 'too_long'}), 200
    
    # Only allow alphanumeric and underscores
    if not re.match(r'^[a-zA-Z0-9_]+$', pseudo):
        return jsonify({'available': False, 'reason': 'invalid_characters'}), 200
    
    exists = User.query.filter_by(pseudo=pseudo).first() is not None
    
    return jsonify({
        'available': not exists,
        'reason': 'taken' if exists else None
    }), 200
