import jwt
import os
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from models import User, db
from services.ocr_service import verify_document
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key-change-this')

# Secret codes for community registration
SECRET_CODES = {
    'POLICE': os.getenv('POLICE_CODE', 'POL-AUTH$01'),
    'INFRASTRUCTURE': os.getenv('INFRASTRUCTURE_CODE', 'INFRA-CTRL$02'),
    'CYBERSECURITY': os.getenv('CYBERSECURITY_CODE', 'CYB-AUTH$03'),
    'EMERGENCY': os.getenv('EMERGENCY_CODE', 'EMRG-CTRL$04')
}


def generate_token(user_id, role):
    """Generate JWT token for authenticated user"""
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=7),  # Token expires in 7 days
        'iat': datetime.utcnow()
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token


def decode_token(token):
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        # Decode token
        payload = decode_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Get user from database
        current_user = User.query.get(payload['user_id'])
        if not current_user:
            return jsonify({'error': 'User not found'}), 401
        
        # Check if user is suspended
        if current_user.is_suspended:
            return jsonify({'error': 'Account is suspended'}), 403
        
        # Check if community user is approved
        if current_user.role != 'WOMAN' and current_user.role != 'ADMIN' and not current_user.is_approved:
            return jsonify({'error': 'Account pending approval'}), 403
        
        return f(current_user, *args, **kwargs)
    
    return decorated


def role_required(*allowed_roles):
    """Decorator to require specific role(s)"""
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if current_user.role not in allowed_roles:
                return jsonify({'error': 'Unauthorized access'}), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator


def validate_secret_code(role, code):
    """Validate secret code for community registration"""
    return SECRET_CODES.get(role) == code


def register_woman(data, document_file=None, doc_type=None):
    """Register a woman user with document verification"""
    try:
        # Validate required fields
        required_fields = ['name', 'phone', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return {'error': f'Missing required field: {field}'}, 400
        
        # Document verification is required
        if not document_file or not doc_type:
            return {'error': 'Document upload is required for verification'}, 400

        # Perform OCR Verification
        image_bytes = document_file.read()
        if not verify_document(image_bytes, doc_type):
            return {'error': 'Document verification failed. Only female users can register.'}, 400

        # Check if email or phone already exists
        if User.query.filter_by(email=data['email']).first():
            return {'error': 'Email already registered'}, 400
        
        if User.query.filter_by(phone=data['phone']).first():
            return {'error': 'Phone number already registered'}, 400
        
        # Create new user
        new_user = User(
            name=data['name'],
            phone=data['phone'],
            email=data['email'],
            role='WOMAN',
            is_approved=True  # Women are approved after OCR success
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        # Generate token
        token = generate_token(new_user.id, new_user.role)
        
        return {
            'message': 'Registration successful',
            'token': token,
            'user': new_user.to_dict()
        }, 201
    
    except Exception as e:
        db.session.rollback()
        return {'error': str(e)}, 500


def register_community(data):
    """Register a community user (requires admin approval)"""
    try:
        # Validate required fields
        required_fields = ['name', 'phone', 'email', 'password', 'role', 'secret_code']
        for field in required_fields:
            if field not in data:
                return {'error': f'Missing required field: {field}'}, 400
        
        # Validate role
        valid_roles = ['POLICE', 'INFRASTRUCTURE', 'CYBERSECURITY', 'EMERGENCY']
        if data['role'] not in valid_roles:
            return {'error': 'Invalid role'}, 400
        
        # Validate secret code
        if not validate_secret_code(data['role'], data['secret_code']):
            return {'error': 'Invalid secret code'}, 400
        
        # Check if email or phone already exists
        if User.query.filter_by(email=data['email']).first():
            return {'error': 'Email already registered'}, 400
        
        if User.query.filter_by(phone=data['phone']).first():
            return {'error': 'Phone number already registered'}, 400
        
        # Create new user
        new_user = User(
            name=data['name'],
            phone=data['phone'],
            email=data['email'],
            role=data['role'],
            is_approved=False  # Requires admin approval
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        return {
            'message': 'Registration successful. Awaiting admin approval.',
            'user': new_user.to_dict()
        }, 201
    
    except Exception as e:
        db.session.rollback()
        return {'error': str(e)}, 500


def login_user(data):
    """Login user and return JWT token"""
    try:
        # Validate required fields
        if 'email' not in data or 'password' not in data:
            return {'error': 'Email and password required'}, 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            return {'error': 'Invalid credentials'}, 401
        
        # Check password
        if not user.check_password(data['password']):
            return {'error': 'Invalid credentials'}, 401
        
        # Check if suspended
        if user.is_suspended:
            return {'error': 'Account is suspended'}, 403
        
        # Check if community user is approved
        if user.role != 'WOMAN' and user.role != 'ADMIN' and not user.is_approved:
            return {'error': 'Account pending approval'}, 403
        
        # Generate token
        token = generate_token(user.id, user.role)
        
        return {
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        }, 200
    
    except Exception as e:
        return {'error': str(e)}, 500
