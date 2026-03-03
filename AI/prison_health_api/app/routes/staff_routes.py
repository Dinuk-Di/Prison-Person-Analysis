from flask import Blueprint, request, jsonify
from app.model import db, Staff

staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/', methods=['GET'])
def get_staff():
    staff_list = Staff.query.all()
    result = []
    for s in staff_list:
        result.append({
            "id": s.id,
            "name": s.name,
            "role": s.role,
            "department": s.department,
            "contact": s.contact,
            "joined_date": s.joined_date.isoformat() if s.joined_date else None
        })
    return jsonify({"staff": result}), 200

@staff_bp.route('/', methods=['POST'])
def add_staff():
    data = request.json
    if not data or not data.get('name') or not data.get('role'):
        return jsonify({"error": "Name and role are required"}), 400
        
    new_staff = Staff(
        name=data.get('name'),
        role=data.get('role'),
        department=data.get('department', ''),
        contact=data.get('contact', '')
    )
    
    db.session.add(new_staff)
    db.session.commit()
    
    return jsonify({"message": "Staff member added successfully", "id": new_staff.id}), 201
