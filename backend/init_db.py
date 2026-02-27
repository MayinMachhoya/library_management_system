import os
from app import create_app
from models import db, User
from dotenv import load_dotenv

load_dotenv()

app = create_app()

def init_database():
    with app.app_context():
        # Create tables
        db.create_all()
        print("Database tables created.")
        
        # Check if superuser exists
        admin_email = "admin@library.local"
        admin = User.query.filter_by(email=admin_email).first()
        
        if not admin:
            print("Creating superuser admin@library.local...")
            admin = User(
                role='admin',
                name='Super Administrator',
                email=admin_email,
                phone='1234567890'
            )
            admin.set_password('AdminSecure2026!')
            db.session.add(admin)
            db.session.commit()
            print("Superuser created successfully.")
        else:
            print("Superuser already exists.")
            
if __name__ == '__main__':
    init_database()
