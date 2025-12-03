from flask import Blueprint, jsonify, request, session
from db import get_db_connection

bp = Blueprint("advertisement", __name__)

@bp.route("/advertisements", methods=["GET"])
def get_advertisements():
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM advertisement;")
            advertisements = cursor.fetchall()
        return jsonify({"advertisements": advertisements}), 200
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally: 
        if conn: 
            conn.close()



@bp.route("/advertisement/<int:advertisement_id>")
@bp.route("/advertisements/<int:advertisement_id>")
def get_one_advertisement(advertisement_id):
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM advertisement WHERE id = %s", (advertisement_id,))
            advertisement = cursor.fetchone()
        
        if not advertisement:
            return jsonify({"error": "not_found", "message": "advertisement not found"}), 404
            
        return jsonify({"advertisement": advertisement}), 200
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally: 
        if conn: 
            conn.close()


@bp.route("/advertisements", methods=["POST"])
def add_advertisement():
    conn = None
    try:
        data = request.get_json(silent=True) or {}

        required_fields = [
            "title",
            "short_description",
            "description",
            "publish_date",
            "company_id",
        ]
        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            return jsonify({
                "error": "validation_error",
                "message": f"Missing required field(s): {', '.join(missing)}"
            }), 400


        # Only admins may create advertisements
        if not session.get('user_id') or not session.get('is_admin'):
            return jsonify({"error": "forbidden", "message": "admin_required"}), 403

        conn = get_db_connection()
        with conn.cursor() as cursor:
            def _n(v):
                return v if (v is not None and str(v).strip() != "") else None

            cursor.execute(
                """
                INSERT INTO advertisement 
                    (title, short_description, description, publish_date, company_id,
                     employment_type, work_mode, salary_min, salary_max, required_experience)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    data["title"],
                    data["short_description"],
                    data["description"],
                    data["publish_date"],
                    data["company_id"],
                    # Optional fields: empty string -> NULL
                    _n(data.get("employment_type")),
                    _n(data.get("work_mode")),
                    _n(data.get("salary_min")),
                    _n(data.get("salary_max")),
                    _n(data.get("required_experience")),
                ),
            )
            conn.commit()

            new_id = cursor.lastrowid
            # Fetch and return the created row
            cursor.execute("SELECT * FROM advertisement WHERE id = %s", (new_id,))
            created = cursor.fetchone()

        resp = jsonify({"advertisement": created})
        resp.status_code = 201
        resp.headers["Location"] = f"/advertisements/{new_id}"
        return resp

    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally:
        if conn:
            conn.close()


@bp.route("/advertisements/<int:advertisement_id>", methods=["PUT"])
def update_advertisement(advertisement_id):
    conn = None
    try:
        data = request.get_json(silent=True) or {}
        
        required_fields = [
            "title",
            "short_description",
            "description",
            "publish_date",
            "company_id",
        ]
        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            return jsonify({
                "error": "validation_error",
                "message": f"Missing required field(s): {', '.join(missing)}"
            }), 400
        
        # Only admins may update advertisements
        if not session.get('user_id') or not session.get('is_admin'):
            return jsonify({"error": "forbidden", "message": "admin_required"}), 403

        conn = get_db_connection()
        with conn.cursor() as cursor:
            # Normalize optional fields: empty strings -> NULL
            def _n(v):
                return v if (v is not None and str(v).strip() != "") else None

            cursor.execute(
                """
                UPDATE advertisement
                SET title=%s,
                    short_description=%s,
                    description=%s,
                    publish_date=%s,
                    company_id=%s,
                    employment_type=%s,
                    work_mode=%s,
                    salary_min=%s,
                    salary_max=%s,
                    required_experience=%s
                WHERE id=%s
                """,
                (
                    data["title"],
                    data["short_description"],
                    data["description"],
                    data["publish_date"],
                    data["company_id"],
                    _n(data.get("employment_type")),
                    _n(data.get("work_mode")),
                    _n(data.get("salary_min")),
                    _n(data.get("salary_max")),
                    _n(data.get("required_experience")),
                    advertisement_id,
                ),
            )
            affected = cursor.rowcount
            conn.commit()

            if affected == 0:
                return jsonify({"error": "not_found", "message": "advertisement not found"}), 404

            # Optionally return the updated row
            cursor.execute("SELECT * FROM advertisement WHERE id = %s", (advertisement_id,))
            updated = cursor.fetchone()

        return jsonify({"advertisement": updated}), 200
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally:
        if conn: 
            conn.close()


@bp.route("/advertisements/<int:advertisement_id>", methods=["DELETE"])
def delete_advertisement(advertisement_id): 
    conn = None
    try:
        # Only admins may delete advertisements
        if not session.get('user_id') or not session.get('is_admin'):
            return jsonify({"error": "forbidden", "message": "admin_required"}), 403

        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                "DELETE FROM advertisement WHERE id = %s",
                (advertisement_id,)
            )
            affected = cursor.rowcount
        conn.commit()

        if affected == 0:
            return jsonify({"error": "not_found", "message": "advertisement not found"}), 404
        return "", 204
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally: 
        if conn: 
            conn.close()