from flask import Blueprint, jsonify, request, session
from db import get_db_connection
from datetime import datetime

bp = Blueprint("application", __name__)

@bp.route("/applications", methods=["GET"])
def get_applications():
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM application;")
            applications = cursor.fetchall()
        return jsonify({"applications": applications}), 200
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally: 
        if conn: 
            conn.close()


@bp.route("/application/<int:application_id>")
@bp.route("/applications/<int:application_id>")
def get_one_application(application_id):
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM application WHERE id = %s", (application_id,))
            application = cursor.fetchone()
        
        if not application:
            return jsonify({"error": "not_found", "message": "application not found"}), 404
            
        return jsonify({"application": application}), 200
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally: 
        if conn: 
            conn.close()


@bp.route("/applications", methods=["POST"])
def add_application():
    conn = None
    try:

        if not session.get('user_id'):
            return jsonify({"error": "unauthorized", "message": "User must be logged in to apply"}), 401

        data = request.get_json(silent=True) or {}

        required_fields = ["advertisement_id"]
        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            return jsonify({
                "error": "validation_error",
                "message": f"Missing required field(s): {', '.join(missing)}"
            }), 400

        person_id = session.get('user_id')
        advertisement_id = data["advertisement_id"]
        cover_letter = data.get("cover_letter", "")
        cv_path = data.get("cv_path") 

        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT first_name, last_name, cv FROM user_account WHERE id = %s",
                (person_id,)
            )
            user = cursor.fetchone()
            
            if not user:
                return jsonify({"error": "not_found", "message": "User not found"}), 404

            # get cv user give or take it from the profil
            final_cv = cv_path if cv_path else user.get('cv', '')
            
            # verified if a cv is available
            if not final_cv:
                return jsonify({
                    "error": "validation_error",
                    "message": "A CV is required to apply"
                }), 400

            cursor.execute(
                "SELECT id FROM application WHERE person_id = %s AND advertisement_id = %s",
                (person_id, advertisement_id)
            )
            existing = cursor.fetchone()
            
            if existing:
                return jsonify({
                    "error": "conflict",
                    "message": "You have already applied to this position"
                }), 409

            apply_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute(
                """
                INSERT INTO application (person_id, advertisement_id, status, apply_date)
                VALUES (%s, %s, %s, %s)
                """,
                (person_id, advertisement_id, "Envoyée", apply_date)
            )
            
            application_id = cursor.lastrowid

            cursor.execute(
                """
                INSERT INTO application_log (
                    application_id, actor_id, status,
                    candidate_last_name, candidate_first_name, cv, cover_letter,
                    note, sent_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    application_id,
                    person_id,
                    "Envoyée",
                    user.get('last_name', ''),
                    user.get('first_name', ''),
                    final_cv, 
                    cover_letter[:3000] if cover_letter else None,
                    "Candidature initiale envoyée par le candidat",
                    apply_date
                )
            )
            
            conn.commit()

            cursor.execute("SELECT * FROM application WHERE id = %s", (application_id,))
            created = cursor.fetchone()

        resp = jsonify({"application": created})
        resp.status_code = 201
        resp.headers["Location"] = f"/applications/{application_id}"
        return resp

    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally:
        if conn:
            conn.close()


@bp.route("/applications/<int:application_id>", methods=["PUT"])
def update_application(application_id):
    conn = None
    try:
        data = request.get_json(silent=True) or {}

        required_fields = ["person_id", "advertisement_id", "status"]
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
                UPDATE application
                SET person_id=%s,
                    advertisement_id=%s,
                    handled_by=%s,
                    status=%s,
                    apply_date=COALESCE(%s, apply_date)
                WHERE id=%s
                """,
                (
                    data["person_id"],
                    data["advertisement_id"],
                    _n(data.get("handled_by")),
                    data["status"],
                    _n(data.get("apply_date")),
                    application_id,
                ),
            )
            affected = cursor.rowcount
            conn.commit()

            if affected == 0:
                return jsonify({"error": "not_found", "message": "application not found"}), 404

            cursor.execute("SELECT * FROM application WHERE id = %s", (application_id,))
            updated = cursor.fetchone()

            try:
                cursor.execute("""
                    SELECT id FROM application_log WHERE application_id = %s ORDER BY sent_at DESC LIMIT 1
                """, (updated['id'],))
                last_log = cursor.fetchone()
                if last_log:
                    actor_id = _n(data.get('handled_by'))
                    cursor.execute(
                        """
                        UPDATE application_log SET actor_id=%s, status=%s, sent_at=NOW()
                        WHERE id=%s
                        """,
                        (actor_id, data.get('status'), last_log['id'])
                    )
                    conn.commit()
            except Exception:
                pass

        return jsonify({"application": updated}), 200
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally:
        if conn:
            conn.close()


@bp.route("/applications/<int:application_id>", methods=["DELETE"])
def delete_application(application_id):
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM application WHERE id = %s", (application_id,))
            affected = cursor.rowcount
        conn.commit()

        if affected == 0:
            return jsonify({"error": "not_found", "message": "application not found"}), 404
        return "", 204
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally:
        if conn:
            conn.close()


@bp.route("/applications/user/<int:user_id>", methods=["GET"])
def get_applications_by_user(user_id):
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM application WHERE person_id = %s;", (user_id,))
            applications = cursor.fetchall()
        return jsonify({"applications": applications}), 200
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally:
        if conn:
            conn.close()