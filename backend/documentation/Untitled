# Arquitetura e Deploy

## Estrutura do Projeto
O projeto segue o padrão MVT (Model-View-Template) do Django, adaptado para API REST.

* **`backend/Farmacia_core/`**: O "coração" do projeto. Contém as configurações globais (`settings.py`), roteamento raiz (`urls.py`) e interfaces WSGI/ASGI.
* **`backend/gestor_api/`**: O app principal. Contém toda a lógica de negócio, modelos, views e serializers.

## Componentes de Infraestrutura (Produção)

Baseado no arquivo `requirements.txt` e `settings.py`, o ambiente de produção deve ser configurado da seguinte forma:

### 1. Servidor de Aplicação
* **Gunicorn (`gunicorn==23.0.0`):** Servidor WSGI HTTP robusto para UNIX. Deve ser usado para servir a aplicação em produção, substituindo o `runserver`.
    * *Comando sugerido:* `gunicorn Farmacia_core.wsgi:application`

### 2. Arquivos Estáticos
* **WhiteNoise (`whitenoise==6.11.0`):** Configurado no `MIDDLEWARE` em `settings.py`. Permite que o próprio Gunicorn sirva arquivos estáticos otimizados, eliminando a necessidade de uma configuração complexa de Nginx para estáticos em alguns cenários (como Heroku ou Containers).

### 3. Banco de Dados
* **PostgreSQL (`psycopg2-binary`):** O driver de produção. As credenciais são lidas via variáveis de ambiente (`DB_NAME`, `DB_HOST`, etc.), garantindo conformidade com a metodologia *Twelve-Factor App*.

### 4. Segurança e CORS
* **Django CORS Headers:** Configurado para restringir quais domínios podem consumir a API.
* **Variável `CORS_ALLOWED_ORIGINS`:** Deve ser definida no `.env` de produção (ex: `https://meu-frontend-react.com`) para evitar bloqueios de *Cross-Origin*.