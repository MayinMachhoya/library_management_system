from flask import Blueprint, request, jsonify
from models import db, Book
from auth import admin_required

book_bp = Blueprint('books', __name__, url_prefix='/api/books')

@book_bp.route('', methods=['GET'])
def get_books():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    search = request.args.get('search', '', type=str)
    category = request.args.get('category', '', type=str)
    
    query = Book.query
    
    if search:
        query = query.filter(
            (Book.name.ilike(f'%{search}%')) | 
            (Book.author.ilike(f'%{search}%')) | 
            (Book.isbn.ilike(f'%{search}%'))
        )
        
    if category:
         query = query.filter(Book.category.ilike(f'%{category}%'))
         
    paginated_books = query.paginate(page=page, per_page=limit, error_out=False)
    
    return jsonify({
        'data': [book.to_dict() for book in paginated_books.items],
        'meta': {
            'total_records': paginated_books.total,
            'current_page': paginated_books.page,
            'total_pages': paginated_books.pages,
            'has_next': paginated_books.has_next,
            'has_prev': paginated_books.has_prev
        }
    }), 200

@book_bp.route('', methods=['POST'])
@admin_required
def add_book(current_user):
    data = request.get_json()
    
    required = ['name', 'author', 'isbn', 'category']
    if not all(k in data for k in required):
        return jsonify({'error': 'ValidationError', 'message': 'Missing required book fields'}), 400
        
    if Book.query.filter_by(isbn=data['isbn']).first():
         return jsonify({'error': 'ConflictError', 'message': 'Book with this ISBN already exists'}), 409
         
    book = Book(
        name=data['name'],
        author=data['author'],
        isbn=data['isbn'],
        category=data['category'],
        quantity=data.get('quantity', 1)
    )
    db.session.add(book)
    db.session.commit()
    
    return jsonify({
        'message': 'Book added successfully',
        'book': book.to_dict()
    }), 201

@book_bp.route('/<int:book_id>', methods=['DELETE'])
@admin_required
def delete_book(current_user, book_id):
    book = Book.query.get_or_404(book_id)
    db.session.delete(book)
    db.session.commit()
    return jsonify({'message': 'Book deleted successfully'}), 200
