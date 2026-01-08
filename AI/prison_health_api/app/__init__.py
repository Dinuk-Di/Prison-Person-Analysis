from flask import Flask
from app.model import db
from app.routes.inmate_routes import inmate_bp
from app.routes.admin_routes import admin_bp
import os

def create_app():
    app = Flask(__name__)
    
    # Config
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///prison.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Init DB
    db.init_app(app)
    
    # Register Blueprints
    app.register_blueprint(inmate_bp, url_prefix='/api/inmate')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Create DB Tables
    with app.app_context():
        db.create_all()
        
    # Ensure upload folder exists
    os.makedirs('uploads', exist_ok=True)
        
    return app