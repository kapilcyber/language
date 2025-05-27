import os
import logging

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_login import LoginManager
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_babel import Babel

logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()
babel = Babel()

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key_for_dev")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)  # needed for url_for to generate with https

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///inclusive_learning.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Configure babel for internationalization
app.config['BABEL_DEFAULT_LOCALE'] = 'en'
app.config['BABEL_TRANSLATION_DIRECTORIES'] = 'translations'

# Initialize extensions
db.init_app(app)
login_manager.init_app(app)
login_manager.login_view = 'login'
babel.init_app(app)

# Old way: @babel.localeselector is deprecated in Flask-Babel 2.0+
# Define locale selector function using new approach
def get_locale():
    # Return locale based on user preference
    from flask_login import current_user
    from flask import session, request
    if current_user.is_authenticated:
        return current_user.preferred_language
    return session.get('language', request.accept_languages.best_match(['en', 'gu', 'hi']))
    
babel.init_app(app, locale_selector=get_locale)  # Register selector with babel

# Register get_language_name to make it available in templates
@app.context_processor
def inject_get_language_name():
    from services.language_service import get_language_name
    return dict(get_language_name=get_language_name)

with app.app_context():
    # Import models
    import models

    # Create tables
    db.create_all()
    
    # Import and register blueprints/routes
    from routes import register_routes
    register_routes(app)
