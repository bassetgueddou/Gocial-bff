"""
External service helpers

Push notifications, email sending, file storage.
All the stuff that talks to third-party services.
"""

import os
from flask import current_app
from flask_mail import Mail, Message


# Mail instance - initialized in app factory
mail = Mail()


# ---------------------------------------------------------------------
# Email helpers
# ---------------------------------------------------------------------

def send_email(to, subject, body, html=None):
    """
    Send an email using Flask-Mail.
    
    Returns True on success, False on failure.
    """
    try:
        msg = Message(
            subject=subject,
            recipients=[to] if isinstance(to, str) else to,
            body=body,
            html=html,
        )
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f'Email send failed: {e}')
        return False


def send_verification_email(user, token):
    """
    Send account verification email.
    """
    verify_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/verify?token={token}"
    
    subject = "Verify your Gocial account"
    body = f"""Hey {user.first_name or user.pseudo}!

Welcome to Gocial! Please verify your email by clicking the link below:

{verify_url}

This link will expire in 24 hours.

If you didn't sign up for Gocial, just ignore this email.

Cheers,
The Gocial Team
"""
    
    return send_email(user.email, subject, body)


def send_password_reset_email(user, token):
    """
    Send password reset email.
    """
    reset_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={token}"
    
    subject = "Reset your Gocial password"
    body = f"""Hey {user.first_name or user.pseudo},

Someone requested a password reset for your account. If this was you, click here:

{reset_url}

This link will expire in 1 hour.

If you didn't request this, your account is safe - just ignore this email.

Cheers,
The Gocial Team
"""
    
    return send_email(user.email, subject, body)


# ---------------------------------------------------------------------
# Push notification helpers
# ---------------------------------------------------------------------

def send_push_notification(fcm_token, title, body, data=None):
    """
    Send a push notification via Firebase Cloud Messaging.
    
    Requires firebase-admin package and service account credentials.
    
    For now this is a stub - implement when ready to add push.
    """
    # TODO: Implement FCM push notifications
    # 
    # from firebase_admin import messaging
    # 
    # message = messaging.Message(
    #     notification=messaging.Notification(
    #         title=title,
    #         body=body,
    #     ),
    #     data=data or {},
    #     token=fcm_token,
    # )
    # 
    # try:
    #     response = messaging.send(message)
    #     return True
    # except Exception as e:
    #     current_app.logger.error(f'Push notification failed: {e}')
    #     return False
    
    current_app.logger.info(f'Push notification (stub): {title} -> {fcm_token[:20]}...')
    return True


def send_batch_push_notifications(tokens, title, body, data=None):
    """
    Send push notification to multiple devices.
    
    More efficient than calling send_push_notification in a loop.
    """
    # TODO: Implement batch FCM
    for token in tokens:
        send_push_notification(token, title, body, data)
    return True


# ---------------------------------------------------------------------
# File storage helpers
# ---------------------------------------------------------------------

def save_upload(file, subfolder='', filename=None):
    """
    Save an uploaded file.
    
    Returns the relative path where file was saved.
    """
    from werkzeug.utils import secure_filename
    import uuid
    
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    
    if subfolder:
        target_folder = os.path.join(upload_folder, subfolder)
    else:
        target_folder = upload_folder
    
    os.makedirs(target_folder, exist_ok=True)
    
    # Generate filename if not provided
    if not filename:
        ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        filename = f'{uuid.uuid4().hex}.{ext}' if ext else uuid.uuid4().hex
    
    filename = secure_filename(filename)
    filepath = os.path.join(target_folder, filename)
    
    file.save(filepath)
    
    # Return relative path from uploads root
    if subfolder:
        return f'{subfolder}/{filename}'
    return filename


def delete_upload(relative_path):
    """
    Delete an uploaded file.
    """
    upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
    filepath = os.path.join(upload_folder, relative_path)
    
    if os.path.exists(filepath):
        os.remove(filepath)
        return True
    return False


def get_upload_url(relative_path):
    """
    Get full URL for an uploaded file.
    
    In production this would return a CDN URL or signed S3 URL.
    """
    if not relative_path:
        return None
    
    base_url = current_app.config.get('UPLOADS_URL', '/uploads')
    return f'{base_url}/{relative_path}'


# ---------------------------------------------------------------------
# Token generation
# ---------------------------------------------------------------------

def generate_token(length=32):
    """
    Generate a random token for email verification, password reset, etc.
    """
    import secrets
    return secrets.token_urlsafe(length)


def generate_short_code(length=6):
    """
    Generate a short numeric code (for SMS verification, etc).
    """
    import random
    return ''.join(random.choices('0123456789', k=length))
