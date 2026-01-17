from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User
from auth import register_woman, register_community, login_user
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key-change-this')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///safespace.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize database
db.init_app(app)

# Import blueprints
from routes.women_routes import women_bp
from routes.police_routes import police_bp
from routes.infrastructure_routes import infrastructure_bp
from routes.cybersecurity_routes import cybersecurity_bp
from routes.emergency_routes import emergency_bp
from routes.admin_routes import admin_bp
from routes.chatbot_routes import chatbot_bp
from sse import create_sse_blueprint

# Register blueprints
app.register_blueprint(women_bp, url_prefix='/api/women')
app.register_blueprint(police_bp, url_prefix='/api/police')
app.register_blueprint(infrastructure_bp, url_prefix='/api/infrastructure')
app.register_blueprint(cybersecurity_bp, url_prefix='/api/cybersecurity')
app.register_blueprint(emergency_bp, url_prefix='/api/emergency')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
app.register_blueprint(create_sse_blueprint(), url_prefix='/api/sse')


# Authentication routes
@app.route('/api/auth/register/woman', methods=['POST'])
def register_woman_route():
    """Register a woman user"""
    data = request.get_json()
    result, status_code = register_woman(data)
    return jsonify(result), status_code


@app.route('/api/auth/register/community', methods=['POST'])
def register_community_route():
    """Register a community user"""
    data = request.get_json()
    result, status_code = register_community(data)
    return jsonify(result), status_code


@app.route('/api/auth/login', methods=['POST'])
def login_route():
    """Login user"""
    data = request.get_json()
    result, status_code = login_user(data)
    return jsonify(result), status_code


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'SafeSpace API is running'}), 200


# Create database tables and default admin
def init_database():
    """Initialize database with tables and default admin"""
    with app.app_context():
        db.create_all()
        
        # Create default admin if doesn't exist
        admin = User.query.filter_by(email='admin@safespace.com').first()
        if not admin:
            admin = User(
                name='Admin',
                phone='0000000000',
                email='admin@safespace.com',
                role='ADMIN',
                is_approved=True,
                is_suspended=False
            )
            admin.set_password('admin123')  # Change in production
            db.session.add(admin)
            db.session.commit()
            print("Default admin created: admin@safespace.com / admin123")
        
        print("Database initialized successfully")


if __name__ == '__main__':
    init_database()
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
