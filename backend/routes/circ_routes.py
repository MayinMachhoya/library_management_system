from flask import Blueprint, request, jsonify
from models import db, IssuedBook, Book, User
from auth import admin_required
from datetime import date, timedelta

circ_bp = Blueprint('circulation', __name__, url_prefix='/api/circulation')

@circ_bp.route('', methods=['GET'])
@admin_required
def get_all_issues(current_user):
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    status = request.args.get('status', 'active', type=str) # active, returned, all
    
    query = IssuedBook.query
    if status != 'all':
        query = query.filter_by(status=status)
        
    paginated_issues = query.paginate(page=page, per_page=limit, error_out=False)
    
    return jsonify({
        'data': [issue.to_dict() for issue in paginated_issues.items],
        'meta': {
            'total_records': paginated_issues.total,
            'current_page': paginated_issues.page,
            'total_pages': paginated_issues.pages,
            'has_next': paginated_issues.has_next,
            'has_prev': paginated_issues.has_prev
        }
    }), 200

@circ_bp.route('/issue', methods=['POST'])
@admin_required
def issue_book(current_user):
    data = request.get_json()
    student_id = data.get('student_id')
    isbn = data.get('isbn')
    
    if not student_id or not isbn:
        return jsonify({'error': 'ValidationError', 'message': 'Missing student_id or isbn'}), 400
        
    student = User.query.filter_by(id=student_id, role='student').first()
    if not student:
        return jsonify({'error': 'NotFoundError', 'message': 'Student not found'}), 404
        
    book = Book.query.filter_by(isbn=isbn).first()
    if not book:
        return jsonify({'error': 'NotFoundError', 'message': 'Book not found'}), 404
        
    if book.quantity <= 0:
        return jsonify({'error': 'BusinessRuleViolation', 'message': 'Book is out of stock'}), 400
        
    # Check if this student already has this book active
    existing_issue = IssuedBook.query.filter_by(user_id=student.id, book_id=book.id, status='active').first()
    if existing_issue:
        return jsonify({'error': 'BusinessRuleViolation', 'message': 'Student already issued this book'}), 400
        
    issue = IssuedBook(
        user_id=student.id,
        book_id=book.id,
        issue_date=date.today(),
        due_date=date.today() + timedelta(days=14)
    )
    
    book.quantity -= 1
    
    db.session.add(issue)
    db.session.commit()
    
    return jsonify({
        'message': 'Book issued successfully',
        'issue_record': issue.to_dict()
    }), 201

@circ_bp.route('/return/<int:issue_id>', methods=['POST'])
@admin_required
def return_book(current_user, issue_id):
    issue = IssuedBook.query.get(issue_id)
    if not issue:
        return jsonify({'error': 'NotFoundError', 'message': 'Issue record not found'}), 404
        
    if issue.status == 'returned':
        return jsonify({'error': 'ValidationError', 'message': 'Book already returned'}), 400
        
    issue.status = 'returned'
    issue.return_date = date.today()
    
    if issue.book:
        issue.book.quantity += 1
        
    fine_incurred = issue.calculate_fine()
    if fine_incurred == 0:
        issue.fine_paid = True
        
    db.session.commit()
    
    return jsonify({
        'message': 'Book returned successfully',
        'details': {
            'issue_id': issue.id,
            'days_overdue': max(0, (issue.return_date - issue.due_date).days),
            'fine_incurred': fine_incurred,
            'fine_paid': issue.fine_paid,
            'book_quantity_updated': issue.book.quantity if issue.book else 0
        }
    }), 200

@circ_bp.route('/pay-fine/<int:issue_id>', methods=['POST'])
@admin_required
def pay_fine(current_user, issue_id):
    issue = IssuedBook.query.get(issue_id)
    if not issue:
        return jsonify({'error': 'NotFoundError', 'message': 'Issue record not found'}), 404
        
    if issue.fine_paid:
         return jsonify({'error': 'ValidationError', 'message': 'Fine already paid'}), 400
         
    issue.fine_paid = True
    db.session.commit()
    
    return jsonify({'message': 'Fine marked as paid'}), 200
