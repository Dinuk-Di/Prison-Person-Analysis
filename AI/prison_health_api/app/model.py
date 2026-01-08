from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Inmate(db.Model):
    __tablename__ = 'inmates'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(20)) # 'Male' or 'Female' (for model selection)
    
    # Relationships
    answers = db.relationship('SurveyAnswer', backref='inmate', lazy=True)
    emotion_logs = db.relationship('EmotionLog', backref='inmate', lazy=True)

class SurveyAnswer(db.Model):
    __tablename__ = 'survey_answers'
    id = db.Column(db.Integer, primary_key=True)
    inmate_id = db.Column(db.Integer, db.ForeignKey('inmates.id'), nullable=False)
    question_text = db.Column(db.String(500), nullable=False)
    answer_text = db.Column(db.String(500), nullable=False) # e.g., "Not at all", "Several days"
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class EmotionLog(db.Model):
    __tablename__ = 'emotion_logs'
    id = db.Column(db.Integer, primary_key=True)
    inmate_id = db.Column(db.Integer, db.ForeignKey('inmates.id'), nullable=False)
    predicted_emotion = db.Column(db.String(50), nullable=False) # e.g., "Angry", "Sad"
    confidence_score = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)