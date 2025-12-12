from flask import Blueprint, jsonify, request, session, make_response, current_app
from db import get_db_connection

bp = Blueprint("auth", __name__)


def current_user():
    """Return the current user payload from the session or None."""
    if session.get('user_id'):
        return {
            'id': session.get('user_id'),
            'first_name': session.get('user_first_name'),
            'last_name': session.get('user_last_name'),
            'email': session.get('user_email'),
            'is_admin': bool(session.get('is_admin', False)),
        }
    return None


@bp.route('/login', methods=['POST'])
def login():
    """Simple login endpoint.
    Accepts either form-urlencoded (email/identifiant, password) or JSON.
    """
  
    email = request.form.get('email') or request.form.get('identifiant')
    password = request.form.get('password')
    if request.is_json:
        data = request.get_json(silent=True) or {}
        email = data.get('email') or data.get('identifiant') or email
        password = data.get('password') or password

    if not email or not password:
        return jsonify({"error": "validation_error", "message": "email and password are required"}), 400


    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, email, is_admin, password_hash, first_name, last_name, cv, phone, role FROM user_account WHERE email = %s",
                (email,)
            )
            user = cursor.fetchone()

        if not user or user.get('password_hash') != password:
            return jsonify({"error": "unauthorized", "message": "invalid credentials"}), 401

        
        session['user_id'] = user['id']
        session['user_email'] = user['email']
        session['is_admin'] = bool(user.get('is_admin', False))
        session['user_first_name'] = user.get('first_name')
        session['user_last_name'] = user.get('last_name')

        return jsonify({
            "message": "connected",
            "user": {
                "id": user['id'],
                "first_name": user.get('first_name'),
                "last_name": user.get('last_name'),
                "email": user['email'],
                "is_admin": bool(user.get('is_admin', False)),
                "cv": user.get('cv'),
                "phone": user.get('phone'),
                "role": user.get('role')
            }
        }), 200
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally:
        if conn:
            conn.close()


@bp.route('/logout', methods=['POST', 'GET'])
def logout():
    """Log out the current user by clearing session and deleting the session cookie."""

    session.clear()

   
    resp = make_response('', 204)
    cookie_name = current_app.config.get('SESSION_COOKIE_NAME', 'session')
    cookie_path = current_app.config.get('SESSION_COOKIE_PATH', '/')
    cookie_domain = current_app.config.get('SESSION_COOKIE_DOMAIN', None)
    resp.delete_cookie(cookie_name, path=cookie_path, domain=cookie_domain)
    return resp


@bp.route('/session', methods=['GET'])
def session_info():
    """Return the current session user with fresh data from database."""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'user': None}), 200
    
  
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, first_name, last_name, email, is_admin, cv, phone, role FROM user_account WHERE id = %s",
                (user_id,)
            )
            user = cursor.fetchone()
        
        if not user:
           
            session.clear()
            return jsonify({'user': None}), 200
        
        return jsonify({
            'user': {
                'id': user['id'],
                'first_name': user.get('first_name'),
                'last_name': user.get('last_name'),
                'email': user['email'],
                'is_admin': bool(user.get('is_admin', False)),
                'cv': user.get('cv'),
                'phone': user.get('phone'),
                'role': user.get('role')
            }
        }), 200
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally:
        if conn:
            conn.close()

