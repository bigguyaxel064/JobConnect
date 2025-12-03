from flask import Flask, Blueprint, jsonify, request
from db import get_db_connection

bp = Blueprint("company", __name__)

@bp.route("/companies", methods=["GET"])

def get_companies():
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM company;")
            companies = cursor.fetchall()
        return jsonify({"companies": companies}), 200
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally: 
        if conn:
            conn.close()


@bp.route("/company/<int:company_id>")
def get_one_company(company_id):
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM company WHERE id = %s", (company_id,))
            company = cursor.fetchone()
        
        if not company:
            return jsonify({"error": "not_found", "message": "company not found"}), 404
            
        return jsonify({"company": company}), 200
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally: 
        if conn: 
            conn.close()


@bp.route("/companies", methods=["POST"])
def add_company():
    conn = None
    try:
        data = request.get_json(silent=True) or {}

        required_fields = ["name"]
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
                INSERT INTO company (name, address, website, created_by)
                VALUES (%s, %s, %s, %s)
                """,
                (
                    data["name"],
                    _n(data.get("address")),
                    _n(data.get("website")),
                    _n(data.get("created_by")),
                ),
            )
            conn.commit()

            new_id = cursor.lastrowid
            cursor.execute("SELECT * FROM company WHERE id = %s", (new_id,))
            created = cursor.fetchone()

        resp = jsonify({"company": created})
        resp.status_code = 201
        resp.headers["Location"] = f"/companies/{new_id}"
        return resp

    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally:
        if conn:
            conn.close()


@bp.route("/companies/<int:company_id>", methods=["PUT"])
def update_company(company_id):
    conn = None
    try:
        data = request.get_json(silent=True) or {}

        required_fields = ["name"]
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
                UPDATE company
                SET name=%s,
                    address=%s,
                    website=%s,
                    created_by=%s
                WHERE id=%s
                """,
                (
                    data["name"],
                    _n(data.get("address")),
                    _n(data.get("website")),
                    _n(data.get("created_by")),
                    company_id,
                ),
            )
            affected = cursor.rowcount
            conn.commit()

            if affected == 0:
                return jsonify({"error": "not_found", "message": "company not found"}), 404

            cursor.execute("SELECT * FROM company WHERE id = %s", (company_id,))
            updated = cursor.fetchone()

        return jsonify({"company": updated}), 200
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally:
        if conn:
            conn.close()


@bp.route("/companies/<int:company_id>", methods=["DELETE"])
def delete_company(company_id):
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM company WHERE id = %s", (company_id,))
            affected = cursor.rowcount
        conn.commit()

        if affected == 0:
            return jsonify({"error": "not_found", "message": "company not found"}), 404
        return "", 204
    except Exception as e:
        return jsonify({"error": "database_error", "message": str(e)}), 500
    finally:
        if conn:
            conn.close()