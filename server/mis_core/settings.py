import os
import json
from pathlib import Path
from django.core.exceptions import ImproperlyConfigured

# ==========================================
# 1. SECRET LOADING
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent   # → points to /server

SECRETS_FILE = BASE_DIR / 'secrets.json'

try:
    with open(SECRETS_FILE) as f:
        secrets = json.loads(f.read())
except FileNotFoundError:
    raise ImproperlyConfigured(f"Secrets file not found at: {SECRETS_FILE}")
except json.JSONDecodeError:
    raise ImproperlyConfigured(f"Error decoding JSON in: {SECRETS_FILE}")

def get_secret(setting, secrets=secrets):
    try:
        return secrets[setting]
    except KeyError:
        raise ImproperlyConfigured(f"Set the {setting} variable in secrets.json")


# ==========================================
# 2. CORE DJANGO SETTINGS
# ==========================================

SECRET_KEY = 'django-insecure-mis-dashboard-dev-key-12345!'   # move to secrets.json in production

DEBUG = True

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'jazzmin',                              # must be before django.contrib.admin
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
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
# 3. DATABASE CONFIGURATION (Supabase)
# ==========================================

DATABASES = {
    'default': {
        'ENGINE':   'django.db.backends.postgresql',
        'NAME':     secrets['supabase']['database'],
        'USER':     secrets['supabase']['user'],
        'PASSWORD': secrets['supabase']['password'],
        'HOST':     secrets['supabase']['host'],
        'PORT':     str(secrets['supabase']['port']),
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
# 5. STATIC & MEDIA FILES
# ==========================================

STATIC_URL  = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL  = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
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
SESSION_COOKIE_SECURE   = False    # set True in production (HTTPS only)


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