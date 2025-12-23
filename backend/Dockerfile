# backend/Dockerfile

FROM python:3.11-slim

# Instala dependências do sistema
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia e instala dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código do backend
COPY . .

# Coleta estáticos (com chave falsa apenas para o build)
RUN SECRET_KEY=build_secret python manage.py collectstatic --noinput --clear

EXPOSE 8000

CMD ["gunicorn", "Farmacia_core.wsgi:application", "--bind", "0.0.0.0:8000"]