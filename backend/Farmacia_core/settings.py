import os
from pathlib import Path
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# --- SEGURANÇA ---
# A chave deve estar no .env. Nunca deixe hardcoded aqui em produção.
SECRET_KEY = os.getenv('SECRET_KEY')

# Debug deve ser False em produção
DEBUG = os.getenv('DEBUG', 'False') == 'True'

# Lê a string do .env e transforma em lista. 
# Ex: "localhost,127.0.0.1" vira ['localhost', '127.0.0.1']
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')


# --- APLICAÇÃO ---

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Bibliotecas de Terceiros
    'corsheaders',                  # Para gerenciar CORS
    'rest_framework',               # Django REST Framework
    'rest_framework.authtoken',     # Autenticação por Token
    
    # Suas Apps
    'gestor_api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware', # <<< IMPORTANTE: O CORS deve vir logo no início
    
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


# --- BANCO DE DADOS ---
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'), # Porta padrão 5432 se não especificado
    }
}


# --- VALIDAÇÃO DE SENHA ---
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', }, 
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', }, 
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]


# --- INTERNACIONALIZAÇÃO ---
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'pt-BR'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# --- ARQUIVOS ESTÁTICOS ---
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Pasta onde o comando 'collectstatic' reunirá os arquivos para produção
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')


# --- MODELO DE CHAVE PRIMÁRIA ---
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# --- CONFIGURAÇÕES PERSONALIZADAS ---

# 1. Usuário Personalizado
AUTH_USER_MODEL = 'gestor_api.Usuario'

# 2. Configurações CORS (Segurança de quem pode acessar a API)
CORS_ALLOW_ALL_ORIGINS = False

# Lista de origens permitidas (Frontend)
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')

# Configuração necessária para Django 4+ para evitar erros de CSRF em domínios confiáveis
CSRF_TRUSTED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')

# 3. Configuração do Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '5/minute',
        'user': '1000/day'
    }
}