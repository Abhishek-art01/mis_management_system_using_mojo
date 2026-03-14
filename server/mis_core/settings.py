import os
import json
from pathlib import Path
from django.core.exceptions import ImproperlyConfigured
import dj_database_url

# ==========================================
# 1. SECRET LOADING (Vercel + Local Ready)
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent

SECRETS_FILE = BASE_DIR / 'secrets.json'
secrets = {}

# Only try to load the file if it exists (prevents crashes on Vercel)
if os.path.exists(SECRETS_FILE):
    try:
        with open(SECRETS_FILE) as f:
            secrets = json.load(f)
    except json.JSONDecodeError:
        raise ImproperlyConfigured(f"Error decoding JSON in: {SECRETS_FILE}")

def get_secret(setting_name):
    # 1st Check: Vercel / OS Environment Variables
    if setting_name in os.environ:
        return os.environ[setting_name]
    
    # 2nd Check: Local secrets.json file
    if setting_name in secrets:
        return secrets[setting_name]
        
    # If not found anywhere, crash with a helpful message
    raise ImproperlyConfigured(f"Missing secret: {setting_name}. Set it in secrets.json or Vercel Environment Variables.")


# ==========================================
# 2. CORE DJANGO SETTINGS
# ==========================================

# Dynamically load crucial settings
SECRET_KEY = get_secret('SECRET_KEY')
# Converts string "True" from env var into an actual boolean
DEBUG = str(get_secret('DEBUG')).lower() in ['true', '1', 't'] 

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'jazzmin',                              # must be before django.contrib.admin
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'cloudinary_storage',                   # Cloudinary must be before staticfiles
    'django.contrib.staticfiles',
    'cloudinary',                           # Cloudinary app
    'corsheaders',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',        # must be first
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',   # serves static files
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
# 3. DATABASE CONFIGURATION (Supabase/Neon)
# ==========================================

# Safely check for DATABASE_URL (returns an empty string if it doesn't exist)
db_url = os.environ.get('DATABASE_URL', secrets.get('DATABASE_URL', ''))

if db_url.startswith('postgres://') or db_url.startswith('postgresql://'):
    # On Vercel: Let dj_database_url handle the connection string
    DATABASES = {
        'default': dj_database_url.parse(db_url)
    }
else:
    # Locally: Map it manually using the individual fields from secrets.json
    DATABASES = {
        'default': {
            'ENGINE':   'django.db.backends.postgresql',
            'NAME':     secrets.get('DATABASE_NAME', ''),
            'USER':     secrets.get('DATABASE_USER', ''),
            'PASSWORD': secrets.get('DATABASE_PASSWORD', ''),
            'HOST':     secrets.get('DATABASE_HOST', ''),
            'PORT':     secrets.get('DATABASE_PORT', '5432'),
        }
    }
# ==========================================
# 4. PASSWORD VALIDATION & I18N
# ==========================================

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE     = 'UTC'
USE_I18N      = True
USE_TZ        = True


# ==========================================
# 5. STATIC & MEDIA FILES (Cloudinary)
# ==========================================

# Cloudinary Credentials
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': get_secret('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': get_secret('CLOUDINARY_API_KEY'),
    'API_SECRET': get_secret('CLOUDINARY_API_SECRET'),
}

# Route media files to Cloudinary
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

MEDIA_URL  = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Standard Static Files (Handled by WhiteNoise)
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

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True      # required for session cookies cross-origin

SESSION_COOKIE_SAMESITE = 'Lax'    # safe for local dev
SESSION_COOKIE_SECURE   = not DEBUG # Will be True in Prod, False locally


# ==========================================
# 7. JAZZMIN ADMIN THEME
# ==========================================

JAZZMIN_SETTINGS = {
    "site_title":    "MIS Admin",
    "site_header":   "MIS Management",
    "site_brand":    "MIS System",
    "welcome_sign":  "Welcome to the MIS Management System",
    "copyright":     "Project-767",
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'



# Only applies when deployed on Render
if 'RENDER' in os.environ:
    DEBUG = False
    ALLOWED_HOSTS = [os.environ.get('RENDER_EXTERNAL_HOSTNAME')]

    # Database — uses Render's PostgreSQL
    DATABASES = {
        'default': dj_database_url.config(conn_max_age=600)
    }

    # Static files with Whitenoise
    MIDDLEWARE.insert(
        MIDDLEWARE.index('django.middleware.security.SecurityMiddleware') + 1,
        'whitenoise.middleware.WhiteNoiseMiddleware'
    )
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# CORS — allow your Vercel frontend
CORS_ALLOWED_ORIGINS = [
    os.environ.get('FRONTEND_URL', 'http://localhost:5173'),
]