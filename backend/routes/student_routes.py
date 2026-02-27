from flask import Blueprint, request, jsonify
from models import db, User, IssuedBook
from auth import token_required, admin_required

student_bp = Blueprint('students', __name__, url_prefix='/api/students')

@student_bp.route('/me', methods=['GET'])
@token_required
def get_my_profile(current_user):
    # Retrieve user's issued_books
    active_issues = IssuedBook.query.filter_by(user_id=current_user.id, status='active').all()
    
    return jsonify({
        'profile': current_user.to_dict(),
        'active_issues': [issue.to_dict() for issue in active_issues]
    }), 200

@student_bp.route('', methods=['GET'])
@admin_required
def get_students(current_user):
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    search = request.args.get('search', '', type=str)
    
    query = User.query.filter_by(role='student')
    
    if search:
        query = query.filter(
            (User.name.ilike(f'%{search}%')) |
            (User.email.ilike(f'%{search}%')) |
            (User.roll_no.ilike(f'%{search}%'))
        )
        
    paginated_students = query.paginate(page=page, per_page=limit, error_out=False)
    
    return jsonify({
        'data': [student.to_dict() for student in paginated_students.items],
        'meta': {
            'total_records': paginated_students.total,
            'current_page': paginated_students.page,
            'total_pages': paginated_students.pages,
            'has_next': paginated_students.has_next,
            'has_prev': paginated_students.has_prev
        }
    }), 200

@student_bp.route('/<int:student_id>', methods=['DELETE'])
@admin_required
def delete_student(current_user, student_id):
    student = User.query.filter_by(id=student_id, role='student').first()
    if not student:
        return jsonify({'error': 'NotFoundError', 'message': 'Student not found'}), 404
        
    db.session.delete(student)
    db.session.commit()
    
    return jsonify({'message': 'Student deleted successfully'}), 200

@student_bp.route('/me/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    
    current_user.phone = data.get('phone', current_user.phone)
    current_user.branch = data.get('branch', current_user.branch)
    current_user.classroom = data.get('classroom', current_user.classroom)
    current_user.roll_no = data.get('roll_no', current_user.roll_no)
    
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully', 'profile': current_user.to_dict()}), 200

@student_bp.route('/me/password', methods=['PUT'])
@token_required
def change_password(current_user):
    data = request.get_json()
    
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
         return jsonify({'error': 'ValidationError', 'message': 'Missing password fields'}), 400
         
    if not current_user.check_password(current_password):
        return jsonify({'error': 'ValidationError', 'message': 'Incorrect current password'}), 401
        
    current_user.set_password(new_password)
    db.session.commit()
    return jsonify({'message': 'Password changed successfully'}), 200
