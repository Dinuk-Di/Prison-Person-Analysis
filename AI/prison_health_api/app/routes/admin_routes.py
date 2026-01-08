from flask import Blueprint, request, jsonify
from app.services.pdf_service import store_pdf_in_vector_db
from app.services.rag_service import generate_health_profile
from app.model import Inmate, SurveyAnswer, EmotionLog
import os

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/upload_medical_record', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file"}), 400
    
    # Get ALL files sent with the key 'file'
    files = request.files.getlist('file') 
    
    saved_files = []
    for file in files:
        if file.filename == '':
            continue
            
        save_path = os.path.join("uploads", file.filename)
        file.save(save_path)
        
        # Process each file (The new batched service will handle the rate limits)
        success = store_pdf_in_vector_db(save_path)
        if success:
            saved_files.append(file.filename)
            
    return jsonify({"message": f"Successfully processed: {', '.join(saved_files)}"}), 200


@admin_bp.route('/analyze_inmate/<int:inmate_id>', methods=['GET'])
def analyze_inmate(inmate_id):
    inmate = Inmate.query.get_or_404(inmate_id)
    
    # Fetch recent data from SQL
    recent_emotions = EmotionLog.query.filter_by(inmate_id=inmate_id).order_by(EmotionLog.timestamp.desc()).limit(5).all()
    emotion_str = ", ".join([e.predicted_emotion for e in recent_emotions])
    
    recent_answers = SurveyAnswer.query.filter_by(inmate_id=inmate_id).limit(10).all()
    survey_summary = "; ".join([f"Q: {a.question_text} A: {a.answer_text}" for a in recent_answers])
    
    # Call Gemini RAG
    analysis_json = generate_health_profile(inmate, emotion_str, survey_summary)
    
    return jsonify({"analysis": analysis_json})