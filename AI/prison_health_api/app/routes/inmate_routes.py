from flask import Blueprint, request, jsonify
from app.model import db, Inmate, SurveyAnswer, EmotionLog
from app.services.emotion_service import analyze_video_emotions
from app.utils.constants import MEDICAL_QUESTIONS
import os

inmate_bp = Blueprint('inmate', __name__)

@inmate_bp.route('/questions', methods=['GET'])
def get_questions():
    return jsonify({"questions": MEDICAL_QUESTIONS})

@inmate_bp.route('/register', methods=['POST'])
def register_inmate():
    data = request.json
    # incremental inmate id
    inmate_id = max([i.id for i in Inmate.query.all()]) + 1 if Inmate.query.all() else 1
    name = data.get('name')
    age = data.get('age')
    gender = data.get('gender')
    if Inmate.query.get(inmate_id):
        return jsonify({"error": "Inmate ID already exists"}), 400
    new_inmate = Inmate(id=inmate_id, name=name, age=age, gender=gender)
    db.session.add(new_inmate)
    db.session.commit()
    return jsonify({"message": "Inmate registered successfully"}), 201


@inmate_bp.route('/submit_survey', methods=['POST'])
def submit_survey():
    data = request.json
    username = data.get('Username')
    inmate = Inmate.query.filter_by(name=username).first()
    inmate_id = inmate.id if inmate else None
    if not inmate_id:
        return jsonify({"error": "Inmate not found"}), 404
    answers = data.get('answers')
    
    for item in answers:
        new_answer = SurveyAnswer(
            inmate_id=inmate_id,
            question_text=item['question'],
            answer_text=item['answer']
        )
        db.session.add(new_answer)
    
    db.session.commit()
    return jsonify({"message": "Survey saved successfully"}), 201

@inmate_bp.route('/detect_emotion', methods=['POST'])
def detect_emotion():
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"}), 400
        
    video = request.files['video']
    username = request.form.get('Username')
    inmate = Inmate.query.filter_by(name=username).first()
    inmate_id = inmate.id if inmate else None
    if not inmate_id:
        return jsonify({"error": "Inmate not found"}), 404
    
    # Save temp file
    temp_path = os.path.join("uploads", video.filename)
    video.save(temp_path)
    
    # Predict using YOLO service
    emotion, conf = analyze_video_emotions(temp_path)
    
    # Store in SQL
    log = EmotionLog(inmate_id=inmate_id, predicted_emotion=emotion, confidence_score=conf)
    db.session.add(log)
    db.session.commit()
    
    # Cleanup
    os.remove(temp_path)
    
    return jsonify({"predicted_emotion": emotion, "confidence": conf}), 200