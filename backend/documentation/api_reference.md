# Referência da API

A API expõe endpoints RESTful protegidos por autenticação via Token.

## Autenticação
* **Endpoint:** `POST /api/login/`
* **View:** `CustomAuthToken`
* **Retorno:** Token de acesso, ID do usuário, Username e Nível de Acesso.

## Endpoints Principais (ViewSets)

Todas as rotas abaixo exigem o header `Authorization: Token <seu_token>`.

### 1. Medicamentos (`/api/medicamentos/`)
* **View:** `MedicamentoViewSet`
* **Funcionalidades:** CRUD completo de medicamentos.
* **Filtros:** Busca por nome ou dosagem via query param `search`.
* **Permissões:**
    * Leitura: Autenticado.
    * Escrita: Nível `OPERACIONAL` ou superior.

### 2. Movimentações (`/api/movimentacoes/`)
* **View:** `MovimentacaoViewSet`
* **Funcionalidades:** Registro de entradas e saídas.
* **Lógica de Negócio (Triggers):**
    * Ao criar uma `ENTRADA`, o estoque do medicamento associado é incrementado.
    * Ao criar uma `SAIDA`, o estoque é decrementado (valida se há saldo suficiente).
    * Ao deletar ou atualizar uma movimentação, o estoque é revertido/recalculado atomicamente (`@transaction.atomic`).
* **Filtros:** `medicamento_id`, `localidade_id`, `tipo`, `data_inicio`, `responsavel`.

### 3. Usuários (`/api/usuarios/`)
* **View:** `UsuarioViewSet`
* **Regras de Segurança:**
    * Gestores não podem criar/editar Administradores.
    * Gestores não podem elevar o próprio privilégio.

### 4. Localidades (`/api/localidades/`)
* **View:** `LocalidadeViewSet`
* **Permissões:** Apenas `ADMINISTRADOR` pode gerenciar (criar/editar/deletar) localidades.

## Endpoints de Relatórios e Dashboard

### Dashboard de Atividade (`GET /api/movimentacoes/atividade/`)
* Retorna dados agregados para gráficos: total de entradas/saídas e atividade diária dos últimos 5 dias.

### Top Medicamentos (`GET /api/medicamentos/top/`)
* Retorna os 5 medicamentos com maior volume de movimentação.

### Alertas de Validade (`GET /api/alertas/validade/`)
* Lista medicamentos que vencerão nos próximos 30 dias.

### Relatório Geral (`GET /api/relatorios/`)
* Gera listagem filtrada de movimentações.
* **Exportação:** Suporta exportação para CSV via query param `export=csv`.

## Controle de Permissões (`permissions.py`)
A classe `NivelAcessoPermission` intercepta as requisições para verificar se o `nivel_acesso` do usuário corresponde aos níveis permitidos (`allowed_levels`) definidos na View.