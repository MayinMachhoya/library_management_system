from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from models import db
from config import Config

# Import Blueprints
from routes.auth_routes import auth_bp
from routes.book_routes import book_bp
from routes.student_routes import student_bp
from routes.circ_routes import circ_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    CORS(app, resources={r"/*": {"origins": "*"}})
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(book_bp, url_prefix='/api/books')
    app.register_blueprint(student_bp, url_prefix='/api/students')
    app.register_blueprint(circ_bp, url_prefix='/api/circulation')
    
    # Generic error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({'error': 'NotFoundError', 'message': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'InternalServerError', 'message': 'An unexpected error occurred'}), 500
        
    return app
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
