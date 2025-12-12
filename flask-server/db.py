from flask import Blueprint, jsonify, current_app
import pymysql
import os
from dotenv import load_dotenv
load_dotenv()


bp = Blueprint('db', __name__)

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'db'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'mypassword'),
    'database': os.getenv('DB_NAME', 'react_flask_db'),
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor,
}


def get_db_connection():
    """Create a new DB connection using PyMySQL"""
    return pymysql.connect(host=DB_CONFIG['host'],
                           user=DB_CONFIG['user'],
                           password=DB_CONFIG['password'],
                           database=DB_CONFIG['database'],
                           charset=DB_CONFIG['charset'],
                           init_command=DB_CONFIG.get('init_command'),
                           cursorclass=DB_CONFIG['cursorclass'])


@bp.route('/health/db', methods=['GET'])
def check_db_health(): 
    """Here just to test the health of our connexion to the db"""
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1;")
            cursor.fetchone()
        return jsonify({"status": "healthy:", "database": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500
    finally: 
        if conn:
            conn.close()