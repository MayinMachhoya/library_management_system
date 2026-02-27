from datetime import datetime, date
from flask_sqlalchemy import SQLAlchemy
import werkzeug.security as security

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(20), nullable=False, default='student') # admin or student
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Profile details (optional for admin, required for students)
    phone = db.Column(db.String(20))
    branch = db.Column(db.String(50))
    classroom = db.Column(db.String(20))
    roll_no = db.Column(db.String(20))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = security.generate_password_hash(password)

    def check_password(self, password):
        return security.check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "role": self.role,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "branch": self.branch,
            "classroom": self.classroom,
            "roll_no": self.roll_no
        }

class Book(db.Model):
    __tablename__ = 'books'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(255), nullable=False)
    isbn = db.Column(db.String(100), unique=True, nullable=False)
    category = db.Column(db.String(150))
    quantity = db.Column(db.Integer, default=1)  # New feature: Inventory tracking
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "author": self.author,
            "isbn": self.isbn,
            "category": self.category,
            "quantity": self.quantity
        }

class IssuedBook(db.Model):
    __tablename__ = 'issued_books'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    
    issue_date = db.Column(db.Date, default=date.today)
    due_date = db.Column(db.Date, nullable=False)
    return_date = db.Column(db.Date, nullable=True)
    
    status = db.Column(db.String(20), default='active') # active, returned
    fine_paid = db.Column(db.Boolean, default=False)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('issued_books', lazy=True))
    book = db.relationship('Book', backref=db.backref('issued_instances', lazy=True))
    
    def calculate_fine(self):
        # Fine calculation: 5 units/day post 14 days. 
        # (Assuming due_date is set to issue_date + 14 days)
        if self.status == 'returned' and self.return_date:
            days_overdue = (self.return_date - self.due_date).days
        else:
            days_overdue = (date.today() - self.due_date).days
            
        if days_overdue > 0 and not self.fine_paid:
            return days_overdue * 5.0
        return 0.0

    def to_dict(self):
        return {
            "issue_id": self.id,
            "user_id": self.user_id,
            "student_name": self.user.name if self.user else None,
            "book_id": self.book_id,
            "book_name": self.book.name if self.book else None,
            "isbn": self.book.isbn if self.book else None,
            "issue_date": str(self.issue_date),
            "due_date": str(self.due_date),
            "return_date": str(self.return_date) if self.return_date else None,
            "status": self.status,
            "fine_paid": self.fine_paid,
            "current_fine": self.calculate_fine()
        }
