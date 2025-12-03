from flask import Blueprint, send_from_directory, current_app, request, jsonify, session
from db import get_db_connection
import os
import uuid

bp = Blueprint("uploads", __name__)


@bp.route('/uploads/<path:filename>')
def uploaded_file(filename):
    uploads_dir = os.path.join(current_app.root_path, 'uploads')
    return send_from_directory(uploads_dir, filename)


@bp.route('/upload', methods=['POST'])
def upload_file():
    """Generic file upload endpoint for CVs"""
    if not session.get('user_id'):
        return jsonify({"error": "unauthorized", "message": "not logged in"}), 403

    if 'file' not in request.files:
        return jsonify({"error": "validation_error", "message": "file is required"}), 400

    f = request.files['file']
    filename = f.filename or ''
    
    if filename == '':
        return jsonify({"error": "validation_error", "message": "empty filename"}), 400

    # Allow PDF and Word documents
    allowed_types = ['application/pdf', 'application/msword', 
                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if f.mimetype not in allowed_types:
        return jsonify({
            "error": "validation_error", 
            "message": "only PDF and Word files are allowed"
        }), 400

    # Size check (5MB)
    f.seek(0, os.SEEK_END)
    size = f.tell()
    f.seek(0)
    MAX = 5 * 1024 * 1024
    
    if size > MAX:
        return jsonify({"error": "validation_error", "message": "file exceeds 5MB"}), 400

    # Generate unique filename
    ext = os.path.splitext(filename)[1]
    unique_filename = f'cv_{session.get("user_id")}_{uuid.uuid4().hex}{ext}'
    
    # Save file
    uploads_dir = os.path.join(current_app.root_path, 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    dest = os.path.join(uploads_dir, unique_filename)
    f.save(dest)

    file_path = f'/uploads/{unique_filename}'
    return jsonify({"file_path": file_path}), 200


@bp.route('/users/<int:user_id>/cv', methods=['PUT'])
def upload_user_cv(user_id):
    """Upload CV specifically for user profile"""
    # Authorization: user must be owner or admin
    if not session.get('user_id'):
        return jsonify({"error": "unauthorized", "message": "not logged in"}), 403
    if session.get('user_id') != user_id and not session.get('is_admin'):
        return jsonify({"error": "forbidden", "message": "insufficient privileges"}), 403

    if 'file' not in request.files:
        return jsonify({"error": "validation_error", "message": "file is required"}), 400

    f = request.files['file']
    # Basic validation: filename and content type
    filename = f.filename or ''
    if filename == '':
        return jsonify({"error": "validation_error", "message": "empty filename"}), 400

    # Allow only PDFs by default
    allowed = ['application/pdf']
    if f.mimetype not in allowed:
        return jsonify({"error": "validation_error", "message": "only PDF files are allowed"}), 400

    # Size check (5MB)
    f.seek(0, os.SEEK_END)
    size = f.tell()
    f.seek(0)
    MAX = 5 * 1024 * 1024
    if size > MAX:
        return jsonify({"error": "validation_error", "message": "file exceeds 5MB"}), 400

    # Save file
    uploads_dir = os.path.join(current_app.root_path, 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    safe_name = f'user_{user_id}_cv.pdf'
    dest = os.path.join(uploads_dir, safe_name)
    f.save(dest)

    # Update DB
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("UPDATE user_account SET cv = %s WHERE id = %s", (f'/uploads/{safe_name}', user_id))
        conn.commit()
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally:
        if conn:
            conn.close()

    return jsonify({"cv": f'/uploads/{safe_name}' }), 200
