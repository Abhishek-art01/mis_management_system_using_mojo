import os
import json
from pathlib import Path
from django.core.exceptions import ImproperlyConfigured
import dj_database_url
from dotenv import load_dotenv

# ==========================================
# 1. SECRET LOADING (Render + Local Ready)
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / '.env')

SECRETS_FILE = BASE_DIR / 'secrets.json'
secrets = {}

if SECRETS_FILE.exists():
    try:
        with open(SECRETS_FILE) as f:
            secrets = json.load(f)
    except json.JSONDecodeError:
        raise ImproperlyConfigured(f"Error decoding JSON in: {SECRETS_FILE}")

def get_secret(setting_name, required=True, default=None):
    if setting_name in os.environ:
        return os.environ[setting_name]
    if setting_name in secrets:
        return secrets[setting_name]
    if default is not None:
        return default
    if required:
        raise ImproperlyConfigured(
            f"Missing secret: '{setting_name}'. "
            f"Set it in .env, secrets.json, or as an Environment Variable on Render."
        )
    return None

# ==========================================
# 2. CORE DJANGO SETTINGS
# ==========================================

SECRET_KEY = get_secret('SECRET_KEY')
DEBUG = str(get_secret('DEBUG', required=False) or 'false').lower() in ['true', '1', 't']

_render_host = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
if _render_host:
    ALLOWED_HOSTS.append(_render_host)

# FIX: CSRF_TRUSTED_ORIGINS must include the full https:// origin for any
# host that submits POST forms. Without this Django rejects all POSTs on HTTPS.
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
if _render_host:
    CSRF_TRUSTED_ORIGINS.append(f'https://{_render_host}')

_frontend_url = os.environ.get('FRONTEND_URL', secrets.get('FRONTEND_URL', '')).rstrip('/')
if _frontend_url:
    CSRF_TRUSTED_ORIGINS.append(_frontend_url)

INSTALLED_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'cloudinary_storage',
    'django.contrib.staticfiles',
    'cloudinary',
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'mis_core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'mis_core.wsgi.application'

# ==========================================
# 3. DATABASE CONFIGURATION
# ==========================================

if 'RENDER' in os.environ:
    db_url = os.environ.get('DATABASE_URL')
    DATABASES = {
        'default': dj_database_url.config(
            default=db_url,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
    DATABASES['default'].setdefault('OPTIONS', {})['sslmode'] = 'require'

elif get_secret('DATABASE_NAME', required=False):
    DATABASES = {
        'default': {
            'ENGINE':   'django.db.backends.postgresql',
            'NAME':     get_secret('DATABASE_NAME'),
            'USER':     get_secret('DATABASE_USER'),
            'PASSWORD': get_secret('DATABASE_PASSWORD'),
            'HOST':     get_secret('DATABASE_HOST'),
            'PORT':     get_secret('DATABASE_PORT', default='5432'),
        }
    }

else:
    db_url = get_secret('DATABASE_URL', required=False)
    if db_url:
        DATABASES = {'default': dj_database_url.parse(db_url)}
    else:
        raise ImproperlyConfigured("No database configuration found.")

# ==========================================
# 4. STATIC & MEDIA FILES
# ==========================================

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': get_secret('CLOUDINARY_CLOUD_NAME'),
    'API_KEY':    get_secret('CLOUDINARY_API_KEY'),
    'API_SECRET': get_secret('CLOUDINARY_API_SECRET'),
}

STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

# ==========================================
# 5. CORS & SESSION SETTINGS
# ==========================================

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if _frontend_url:
    CORS_ALLOWED_ORIGINS.append(_frontend_url)

CORS_ALLOW_CREDENTIALS = True

SESSION_COOKIE_SAMESITE = 'None' if not DEBUG else 'Lax'
SESSION_COOKIE_SECURE   = not DEBUG

# ==========================================
# 6. JAZZMIN ADMIN THEME
# ==========================================

JAZZMIN_SETTINGS = {
    "site_title":   "MIS Admin",
    "site_header":  "MIS Management",
    "site_brand":   "MIS System",
    "welcome_sign": "Welcome to the MIS Management System",
    "copyright":    "Project-767",
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
