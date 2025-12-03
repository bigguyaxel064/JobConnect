from flask import Flask, jsonify, render_template, request, redirect, url_for, session
from flask_cors import CORS
from db import bp as db_bp
from models.user import bp as user_bp
from models.company import bp as company_bp
from models.application import bp as application_bp
from models.advertisement import bp as advertisement_bp
from models.application_log import bp as application_log_bp
from models.auth import bp as auth_bp
from models.uploads import bp as uploads_bp
from models.stats import bp as stats_bp

app = Flask(__name__)
import os
# CORS config: allow frontend origin and credentials (needed for session cookie)
FRONTEND_ORIGIN = os.getenv('FRONTEND_ORIGIN', 'http://localhost:5173')
CORS(app, supports_credentials=True, resources={r"/*": {"origins": FRONTEND_ORIGIN}})
import os


app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')
import os

# Enregistrement des blueprints
app.register_blueprint(db_bp)
app.register_blueprint(user_bp)
app.register_blueprint(company_bp)
app.register_blueprint(application_bp)
app.register_blueprint(application_log_bp)
app.register_blueprint(advertisement_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(uploads_bp)
app.register_blueprint(stats_bp)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
