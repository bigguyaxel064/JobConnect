from flask import Blueprint, jsonify, request
from db import get_db_connection

bp = Blueprint("application_log", __name__)

@bp.route("/application_logs", methods=["GET"])
def get_application_logs():
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM application_log;")
            application_logs = cursor.fetchall()
        return jsonify({"application_logs": application_logs}), 200
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally: 
        if conn: 
            conn.close()


@bp.route("/application_log/<int:application_log_id>")
def get_one_application_log(application_log_id):
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM application_log WHERE id = %s", (application_log_id,))
            application_log = cursor.fetchone()
        
        if not application_log:
            return jsonify({"error": "not_found", "message": "application_log not found"}), 404
            
        return jsonify({"application_log": application_log}), 200
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally: 
        if conn: 
            conn.close()


@bp.route("/application_logs", methods=["POST"])
def add_application_log():
    conn = None
    try:
        data = request.get_json(silent=True) or {}

        required = ["application_id", "candidate_last_name", "candidate_first_name"]
        missing = [f for f in required if not data.get(f)]
        if missing:
            return jsonify({
                "error": "validation_error",
                "message": f"Missing required field(s): {', '.join(missing)}"
            }), 400

        conn = get_db_connection()
        with conn.cursor() as cursor:
            def _n(v):
                return v if (v is not None and str(v).strip() != "") else None

            cover_letter = _n(data.get("cover_letter"))
            if cover_letter and len(cover_letter) > 3000:
                return jsonify({"error": "validation_error", "message": "cover_letter exceeds 3000 characters"}), 400
            cursor.execute(
                """
                INSERT INTO application_log (
                    application_id, actor_id, status,
                    candidate_last_name, candidate_first_name, cv, cover_letter,
                    note, sent_at
                ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    data["application_id"],
                    _n(data.get("actor_id")),
                    _n(data.get("status")),
                    data.get("candidate_last_name"),
                    data.get("candidate_first_name"),
                    _n(data.get("cv")),
                    cover_letter,
                    _n(data.get("note")),
                    _n(data.get("sent_at")),
                ),
            )
            conn.commit()

            new_id = cursor.lastrowid
            cursor.execute("SELECT * FROM application_log WHERE id = %s", (new_id,))
            created = cursor.fetchone()

        return jsonify({"application_log": created}), 201
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally:
        if conn:
            conn.close()


@bp.route("/application_logs/<int:application_log_id>", methods=["DELETE"])
def delete_application_log(application_log_id):
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM application_log WHERE id = %s", (application_log_id,))
            affected = cursor.rowcount
        conn.commit()

        if affected == 0:
            return jsonify({"error": "not_found", "message": "application_log not found"}), 404
        return "", 204
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally:
        if conn:
            conn.close()
