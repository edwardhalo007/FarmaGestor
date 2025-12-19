# FarmaGestor - Backend Documentation

## Visão Geral
O backend do FarmaGestor é uma API RESTful construída com **Django** e **Django REST Framework (DRF)**. O sistema gerencia o estoque de uma farmácia, controlando medicamentos, localidades de armazenamento, movimentações de entrada/saída e controle de acesso de usuários com diferentes níveis de permissão.

## Tecnologias Utilizadas
* **Linguagem:** Python 3.x
* **Framework Web:** Django 5.2.x
* **API Framework:** Django REST Framework 3.16.x
* **Banco de Dados:** PostgreSQL (configurado via `settings.py`)
* **Autenticação:** Token Authentication (DRF)

## Instalação e Configuração

1.  **Clone o repositório e navegue até a pasta `backend`:**
    ```bash
    cd backend
    ```

2.  **Crie e ative um ambiente virtual:**
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Linux/Mac
    source venv/bin/activate
    ```

3.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configuração de Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do backend com as seguintes chaves (exemplo):
    ```env
    SECRET_KEY=sua_chave_secreta_aqui
    DEBUG=True
    ALLOWED_HOSTS=localhost,127.0.0.1
    DB_NAME=nome_do_banco
    DB_USER=usuario_do_banco
    DB_PASSWORD=senha_do_banco
    DB_HOST=localhost
    DB_PORT=5432
    CORS_ALLOWED_ORIGINS=http://localhost:3000
    ```

5.  **Migrações e Execução:**
    ```bash
    python manage.py migrate
    python manage.py runserver
    ```