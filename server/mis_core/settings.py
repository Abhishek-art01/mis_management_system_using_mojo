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

# Load .env file into os.environ first
load_dotenv(BASE_DIR / '.env')

SECRETS_FILE = BASE_DIR / 'secrets.json'
secrets = {}

# Legacy support for secrets.json
if SECRETS_FILE.exists():
    try:
        with open(SECRETS_FILE) as f:
            secrets = json.load(f)
    except json.JSONDecodeError:
        raise ImproperlyConfigured(f"Error decoding JSON in: {SECRETS_FILE}")

def get_secret(setting_name, required=True, default=None):
    # 1. Check OS Env (includes .env and Render vars)
    if setting_name in os.environ:
        return os.environ[setting_name]
        
    # 2. Check secrets.json
    if setting_name in secrets:
        return secrets[setting_name]
        
    # 3. Fallback to default if provided
    if default is not None:
        return default
        
    # 4. Handle missing
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
DEBUG      = str(get_secret('DEBUG', required=False) or 'false').lower() in ['true', '1', 't']

# On Render RENDER_EXTERNAL_HOSTNAME is auto-set — include it if present
_render_host = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
if _render_host:
    ALLOWED_HOSTS.append(_render_host)


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

# WhiteNoise is already here — do NOT insert it again anywhere
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
# TEMPORARY DEBUG — remove after fixing
import sys
db_url = (
    os.environ.get('DATABASE_URL') or
    secrets.get('DATABASE_URL', '')
)
print(f"DEBUG DATABASE_URL = '{db_url[:30]}...'", file=sys.stderr)


# ==========================================
# 3. DATABASE CONFIGURATION
# ==========================================

# 1. Prioritize Render's Environment
if 'RENDER' in os.environ:
    # Render provides DATABASE_URL automatically
    db_url = os.environ.get('DATABASE_URL')
    DATABASES = {
        'default': dj_database_url.config(
            default=db_url,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
    # Render's managed databases usually require SSL
    DATABASES['default'].setdefault('OPTIONS', {})['sslmode'] = 'require'

# 2. Local Development (Individual Fields)
# This avoids the ParseError caused by special characters in passwords
elif get_secret('DATABASE_NAME', required=False):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME':     get_secret('DATABASE_NAME'),
            'USER':     get_secret('DATABASE_USER'),
            'PASSWORD': get_secret('DATABASE_PASSWORD'),
            'HOST':     get_secret('DATABASE_HOST'),
            'PORT':     get_secret('DATABASE_PORT', default='5432'),
        }
    }

# 3. Fallback (If using a URL locally or other hosted service)
else:
    db_url = get_secret('DATABASE_URL', required=False)
    if db_url:
        DATABASES = {'default': dj_database_url.parse(db_url)}
    else:
        raise ImproperlyConfigured("No Database configuration found.")



# ==========================================
# 5. STATIC & MEDIA FILES
# ==========================================

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': get_secret('CLOUDINARY_CLOUD_NAME'),
    'API_KEY':    get_secret('CLOUDINARY_API_KEY'),
    'API_SECRET': get_secret('CLOUDINARY_API_SECRET'),
}

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

MEDIA_URL  = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

STATIC_URL  = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

STORAGES = {
    "default": {
        "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}


# ==========================================
# 6. CORS & SESSION SETTINGS
# ==========================================

_frontend_url = os.environ.get('FRONTEND_URL', secrets.get('FRONTEND_URL', ''))

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
# 7. JAZZMIN ADMIN THEME
# ==========================================

JAZZMIN_SETTINGS = {
    "site_title":   "MIS Admin",
    "site_header":  "MIS Management",
    "site_brand":   "MIS System",
    "welcome_sign": "Welcome to the MIS Management System",
    "copyright":    "Project-767",
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'