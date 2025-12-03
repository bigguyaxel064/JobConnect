from flask import Blueprint, jsonify, request
from db import get_db_connection

bp = Blueprint("user", __name__)

@bp.route("/users")
def get_users():
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM user_account;")
            users = cursor.fetchall()
        # Remove sensitive fields
        for u in users:
            u.pop("password_hash", None)
        return jsonify({"users": users}), 200
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally: 
        if conn: 
            conn.close()


@bp.route("/user/<int:user_id>")
def get_one_user(user_id):
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM user_account WHERE id = %s", (user_id,))
            user = cursor.fetchone()
        
        if not user:
            return jsonify({"error": "not_found", "message": "User not found"}), 404
            
        user.pop("password_hash", None)
        return jsonify({"user": user}), 200
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally: 
        if conn: 
            conn.close()
        



@bp.route("/users", methods=["POST"])
def add_user():
    conn = None
    try:
        data = request.get_json(silent=True) or {}

        required_fields = ["first_name", "last_name", "email", "password_hash", "role"]
        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            return jsonify({
                "error": "validation_error",
                "message": f"Missing required field(s): {', '.join(missing)}"
            }), 400

        conn = get_db_connection()
        with conn.cursor() as cursor:
            def _n(v):
                return v if (v is not None and str(v).strip() != "") else None

            cursor.execute(
                """
                INSERT INTO user_account (first_name, last_name, password_hash, email, phone, cv, role, is_admin)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    data["first_name"],
                    data["last_name"],
                    data["password_hash"],
                    data["email"],
                    _n(data.get("phone")),
                    _n(data.get("cv")),
                    data["role"],
                    bool(data.get("is_admin", False)),
                ),
            )
            conn.commit()

            new_id = cursor.lastrowid
            cursor.execute("SELECT * FROM user_account WHERE id = %s", (new_id,))
            created = cursor.fetchone()

        if created:
            created.pop("password_hash", None)
        return jsonify({"user": created}), 201
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally:
        if conn:
            conn.close()


@bp.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    conn = None
    try:
        data = request.get_json(silent=True) or {}
        required_fields = ["first_name", "last_name", "email", "role"]
        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            return jsonify({
                "error": "validation_error",
                "message": f"Missing required field(s): {', '.join(missing)}"
            }), 400

        conn = get_db_connection()
        with conn.cursor() as cursor:
            def _n(v):
                return v if (v is not None and str(v).strip() != "") else None

            cursor.execute(
                """
                UPDATE user_account
                SET first_name=%s,
                    last_name=%s,
                    email=%s,
                    phone=%s,
                    cv=%s,
                    role=%s,
                    is_admin=%s
                WHERE id=%s
                """,
                (
                    data["first_name"],
                    data["last_name"],
                    data["email"],
                    _n(data.get("phone")),
                    _n(data.get("cv")),
                    data["role"],
                    bool(data.get("is_admin", False)),
                    user_id,
                ),
            )
            affected = cursor.rowcount
            conn.commit()

            if affected == 0:
                return jsonify({"error": "not_found", "message": "User not found"}), 404

            cursor.execute("SELECT * FROM user_account WHERE id = %s", (user_id,))
            updated = cursor.fetchone()

        if updated:
            updated.pop("password_hash", None)
        return jsonify({"user": updated}), 200
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally:
        if conn:
            conn.close()


@bp.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM user_account WHERE id = %s", (user_id,))
            affected = cursor.rowcount
        conn.commit()

        if affected == 0:
            return jsonify({"error": "not_found", "message": "User not found"}), 404
        return "", 204
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally:
        if conn:
            conn.close()


