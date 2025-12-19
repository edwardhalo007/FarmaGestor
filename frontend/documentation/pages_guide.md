# Guia de Componentes e Páginas

Cada arquivo em `src/components/` (exceto `Layout` e `Header`) representa uma tela funcional do sistema.

## 1. DashboardPage.js
A tela inicial ("Landing Page" do usuário logado).
* **Fonte de Dados:** `GET /api/movimentacoes/atividade/`.
* **Visualização:** Exibe "Cards" com totais de Entradas/Saídas do dia e um gráfico de atividade semanal.
* **Filtros:** Permite selecionar uma `Localidade` específica para filtrar os indicadores.

## 2. MedicamentosPage.js
O CRUD principal do inventário.
* **Listagem:** Tabela com nome, dosagem, validade e *status* (calculado via campo `vencimento_validade`).
* **Cores de Alerta:** Utiliza o status retornado ('Critico', 'Vencido') para colorir linhas da tabela (CSS condicional).
* **Permissões:** Botões de "Adicionar" ou "Editar" só devem aparecer se o usuário tiver nível `OPERACIONAL` ou superior.

## 3. MovimentacoesPage.js
A tela mais complexa, responsável por alterar o saldo de estoque.
* **Formulário de Entrada/Saída:**
    * Dropdown para selecionar `Medicamento` (busca dinâmica).
    * Radio button para `Tipo` (Entrada/Saída).
    * Input de `Quantidade`.
* **Regra de Negócio:** Ao submeter, o frontend deve tratar erros de validação do backend (ex: tentar dar saída maior que o saldo atual retorna erro 400).
* **Histórico:** Exibe uma tabela das últimas movimentações com filtros por data e responsável.

## 4. AlertasPage.js
Focada em prevenção de perdas.
* **Fonte de Dados:** `GET /api/alertas/validade/`.
* **Função:** Lista apenas medicamentos próximos do vencimento (30 dias) ou vencidos. Útil para o farmacêutico priorizar o uso ou descarte.

## 5. RelatoriosPage.js
A ferramenta de auditoria.
* **Filtros Avançados:** Data Início/Fim, Medicamento, Usuário Responsável.
* **Exportação:** Botão que chama a API com `?export=csv` para baixar a planilha gerada pelo Django.

## 6. UsuariosPage.js & LocalidadesPage.js
Telas administrativas.
* **Acesso Restrito:** Estas rotas devem verificar o nível de acesso. Se um usuário `VISUALIZACAO` tentar entrar via URL direta, deve ver uma mensagem de "Acesso Negado".
* **UsuariosPage:** Permite ao Gestor/Admin criar novos acessos e resetar senhas (via API `PUT`).