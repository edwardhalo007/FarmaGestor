# FarmaGestor/backend/Farmacia_core/settings.py
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = os.getenv('SECRET_KEY') 

DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = []#colocar o dominio e o ip do servidor


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',  # <<< Adicionado: Para CORS
    'rest_framework', # <<< Adicionado: Para Django REST Framework
    'rest_framework.authtoken', # <<< Adicionado: Para Token Authentication do DRF
    'gestor_api',   # <<< Adicionado: Sua aplicação personalizada
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware', # <<< Adicionado: Para CORS (DEVE VIR AQUI!)
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'Farmacia_core.urls'

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

WSGI_APPLICATION = 'Farmacia_core.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': '5432',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', }, 
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', }, 
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'pt-BR'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- SUAS CONFIGURAÇÕES PERSONALIZADAS (ADICIONE/VERIFIQUE A PARTIR DAQUI) ---

# Configurações CORS (PARA COMUNICAÇÃO FRONTEND-BACKEND)
CORS_ALLOW_ALL_ORIGINS = True # <<< Adicionado para desenvolvimento (ou CORS_ALLOWED_ORIGINS) mas depois tem que mudar sabosta

# Configuração do Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated', # Exemplo: exige autenticação por padrão para todas as views
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle', # Para quem não está logado
        'rest_framework.throttling.UserRateThrottle'  # Para quem já está logado
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '5/minute',  # Limita tentativas de login/acesso anônimo a 5 por minuto
        'user': '1000/day'   # Usuário logado tem mais liberdade
    }

}

# Configuração para usar seu modelo de usuário personalizado
AUTH_USER_MODEL = 'gestor_api.Usuario' # <<< Aponta para seu modelo de usuário personalizado