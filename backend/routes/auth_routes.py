from flask import Blueprint, request, jsonify
from models import db, User
from auth import generate_token
import werkzeug.security as security

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'ValidationError', 'message': 'Email and password are required'}), 400
        
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'AuthenticationError', 'message': 'Invalid credentials'}), 401
        
    token = generate_token(user.id, user.role)
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user.id,
            'role': user.role,
            'name': user.name,
            'email': user.email
        }
    }), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Required fields for student registration
    required = ['name', 'email', 'password', 'phone', 'branch', 'classroom', 'roll_no']
    if not all(k in data for k in required):
        return jsonify({'error': 'ValidationError', 'message': 'Missing required fields'}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'ConflictError', 'message': 'User with email already exists'}), 409
        
    user = User(
        role='student',
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        branch=data['branch'],
        classroom=data['classroom'],
        roll_no=data['roll_no']
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'Registration successful. You can now login.'}), 201
