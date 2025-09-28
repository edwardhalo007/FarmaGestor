# Documentação para `views.py`

Este documento explica a finalidade, os endpoints e a lógica de permissão para cada view da API no projeto FarmaGestor.

---

## `CustomAuthToken` (View Baseada em Classe)

* **Finalidade:** Lida com a autenticação e o login do usuário.
* **Endpoint:** `POST /api/login/`
* **Detalhes:** Recebe um `username` e `password` no corpo da requisição. Em caso de login bem-sucedido, retorna o `token` de autenticação, `user_id`, `username` e `nivel_acesso` do usuário.

---

## `MedicamentoViewSet` (ViewSet)

* **Finalidade:** Gerencia todas as operações CRUD (Criar, Ler, Atualizar, Deletar) para o modelo `Medicamento`. Esta é a interface principal para gerenciar o estoque de medicamentos.
* **Endpoint:** `/api/medicamentos/`
* **Permissões:**
    * **Visualizar (GET):** Permitido para qualquer usuário autenticado.
    * **Criar, Atualizar, Deletar (POST, PUT, DELETE):** Restrito a usuários com nível de acesso `OPERACIONAL`, `GESTOR` ou `ADMINISTRADOR`.

---

## `LocalidadeViewSet` (ViewSet)

* **Finalidade:** Gerencia as operações CRUD para o modelo `Localidade`, que representa os locais de armazenamento dentro da farmácia.
* **Endpoint:** `/api/localidades/`
* **Permissões:**
    * **Visualizar (GET):** Permitido para qualquer usuário autenticado.
    * **Criar, Atualizar, Deletar (POST, PUT, DELETE):** Restrito apenas a usuários de nível `ADMINISTRADOR`.

---

## `MovimentacaoViewSet` (ViewSet)

* **Finalidade:** Gerencia a criação e a listagem de registros de `Movimentacao` (movimentação de estoque). Também atualiza automaticamente a `quantidade` (nível de estoque) do `Medicamento` correspondente.
* **Endpoint:** `/api/movimentacoes/`
* **Permissões:**
    * **Visualizar & Criar (GET, POST):** Permitido para usuários com nível de acesso `OPERACIONAL`, `GESTOR` ou `ADMINISTRADOR`.
    * **Atualizar & Deletar (PUT, DELETE):** Restrito apenas a usuários de nível `ADMINISTRADOR`.
* **Lógica Especial:** Quando uma nova `Movimentacao` é criada, esta view adiciona ou subtrai automaticamente a quantidade do estoque do medicamento associado. Retornará um erro se um usuário tentar criar uma 'SAIDA' (retirada) para uma quantidade maior que o estoque disponível.

---

## `UsuarioViewSet` (ViewSet)

* **Finalidade:** Gerencia as operações CRUD para os modelos `Usuario`.
* **Endpoint:** `/api/usuarios/`
* **Permissões:** Todas as ações (visualizar, criar, atualizar, deletar) são restritas a usuários com nível de acesso `GESTOR` ou `ADMINISTRADOR`.
* **Lógica Especial:** Implementa regras de negócio para impedir que usuários de nível `GESTOR` criem ou modifiquem outros usuários com níveis de acesso iguais ou superiores.

---

## `alertas_validade` (View Baseada em Função)

* **Finalidade:** Fornece uma lista de medicamentos que estão próximos da data de validade.
* **Endpoint:** `GET /api/alertas/validade/`
* **Detalhes:** A lógica retorna todos os medicamentos que irão vencer dentro dos próximos 30 dias a partir da data atual. Isso é útil para alertas no dashboard.

---

## `relatorios_movimentacao` (View Baseada em Função)

* **Finalidade:** Gera relatórios filtrados de movimentações de estoque.
* **Endpoint:** `GET /api/relatorios/`
* **Detalhes:** Este endpoint pode ser filtrado usando parâmetros de consulta (query parameters): `medicamento_id`, `data_inicio` (AAAA-MM-DD) e `data_fim` (AAAA-MM-DD) para obter históricos de movimentação específicos.
* **Permissões:** Restrito a usuários com nível de acesso `OPERACIONAL`, `GESTOR` ou `ADMINISTRADOR`.