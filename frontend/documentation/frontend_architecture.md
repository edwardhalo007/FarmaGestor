# Arquitetura do Frontend

## 1. Fluxo de Autenticação
O sistema utiliza **Token Authentication** (DRF) para manter a sessão do usuário segura.

1.  **Login:**
    * O usuário envia credenciais via `LoginForm.js`.
    * Endpoint: `POST /api/login/`.
2.  **Armazenamento:**
    * O token recebido é salvo no `localStorage` do navegador com a chave `token`.
    * Dados do usuário (ID, nome, nível de acesso) também são persistidos para controle de UI.
3.  **Interceptor (Axios):**
    * Não enviamos o token manualmente em cada requisição.
    * Existe uma configuração global do Axios que intercepta *todas* as saídas HTTP e injeta o header:
        `Authorization: Token <seu_token_aqui>`
4.  **Logout:**
    * Removemos o token do `localStorage` e forçamos um redirecionamento para `/login`.

## 2. Roteamento e Segurança (`App.js`)
O roteamento é gerenciado pelo `react-router-dom` e divide-se em dois tipos de rotas:

### Rotas Públicas
* `/login`: Acessível a qualquer visitante. Se o usuário já tiver um token válido, ele é redirecionado automaticamente para o Dashboard.

### Rotas Privadas (Protected Routes)
* Envolvem componentes como `Dashboard`, `Medicamentos`, `Movimentações`.
* **Verificação:** Antes de renderizar o componente, o sistema verifica se o token existe.
    * *Sucesso:* Renderiza o `Layout.js` (Sidebar + Header) e o conteúdo da página.
    * *Falha:* Redireciona imediatamente para `/login`.

## 3. Integração com Backend
A comunicação segue o padrão RESTful estrito:

* **Listagens (GET):** Usam parâmetros de query (Query Params) para filtrar dados no servidor (ex: `?search=dipirona`), delegando o processamento pesado para o Django.
* **Ações (POST/PUT/DELETE):** Enviam payloads JSON validados pelos Serializers do backend.
* **Tratamento de Erros:**
    * **401 Unauthorized:** O token expirou ou é inválido -> Logout forçado.
    * **403 Forbidden:** O usuário tentou acessar recurso sem permissão -> Exibe alerta (Toast) ou bloqueia ação.