# FarmaGestor - Frontend Documentation

## Visão Geral
O frontend do FarmaGestor é uma Single Page Application (SPA) desenvolvida em **React**. Ele serve como interface para o sistema de gestão farmacêutica, consumindo a API Django para gerenciar estoques, usuários e relatórios.

## Stack Tecnológico
* **Core:** React 18+ (Hooks & Functional Components)
* **Roteamento:** React Router DOM
* **HTTP Client:** Axios (configurado com interceptors para tokens)
* **Estilização:** CSS Modules / CSS padrão (arquivos `.css` por componente)
* **Build Tool:** Create React App (react-scripts)

## Estrutura de Pastas
A organização segue o padrão de separação por responsabilidade dentro de `src/`:

```text
src/
├── assets/          # Imagens estáticas (ex: login-bg.jpg)
├── components/      # Componentes reutilizáveis e Páginas do sistema
│   ├── Layout.js    # Estrutura base (Sidebar/Header) para rotas privadas
│   ├── LoginForm.js # Tela de entrada (pública)
│   └── [Paginas].js # Telas de funcionalidade (Medicamentos, Dashboard, etc.)
├── App.js           # Definição de Rotas e Contexto Principal
├── index.js         # Ponto de entrada (Renderização do DOM)
└── services/        # (Sugerido) Configuração do Axios e Endpoints
```
## Instalação e Execução

Navegue até a pasta do frontend:

```Bash
cd frontend
```
Instale as dependências (Node.js necessário):
```Bash
npm install
```
Configure a URL da API: Crie um arquivo .env na raiz (se não existir) e defina:
```
REACT_APP_API_URL=http://localhost:8000/api
```

Inicie o servidor de desenvolvimento:
Bash

    npm start

O sistema estará acessível em http://localhost:3000.


### Explicação
Este arquivo cobre os pré-requisitos essenciais (Node.js), a estrutura de diretórios para facilitar a navegação de novos desenvolvedores e o passo a passo imperativo para rodar o projeto localmente, incluindo a configuração crítica da variável de ambiente `REACT_APP_API_URL`.

Precisa que eu reenvie algum dos outros arquivos (`architecture` ou `pages_guide`) também?