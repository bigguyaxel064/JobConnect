from flask import Blueprint, jsonify
from db import get_db_connection

bp = Blueprint("stats", __name__)

@bp.route("/stats")
def get_stats():
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute('SELECT COUNT(*) AS count FROM advertisement;')
            offres = cursor.fetchone()['count']
            cursor.execute('SELECT COUNT(*) AS count FROM company;')
            entreprises = cursor.fetchone()['count']
        return jsonify({
            'offres': offres,
            'entreprises': entreprises,
        })
    except Exception as e:
        return jsonify({'error': 'database_error', 'message': str(e)}), 500
    finally:
        if conn:
            conn.close()
