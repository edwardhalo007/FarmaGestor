# 💊 FarmaGestor - Backend

Este é o backend do sistema **FarmaGestor Municipal**, uma API robusta desenvolvida com **Django** e **Django REST Framework** para gerenciar medicamentos, controlar o estoque, emitir alertas automáticos de validade e gerar relatórios detalhados em um contexto de gestão pública municipal.

---

## 📌 Resumo

O projeto tem como objetivo fornecer uma **solução eficiente e segura** para o controle de medicamentos em farmácias municipais. O sistema conta com autenticação por níveis de acesso e oferece endpoints organizados para manipulação de dados de medicamentos, movimentações, alertas e relatórios.

---

## 🛠️ Tecnologias Utilizadas

- **Python 3.10+**
- **Django 4.x**
- **Django REST Framework**
- **SQLite (banco de dados padrão)**
- **JWT ou Token Authentication**
- **Docker (opcional)**
- **Psycopg2 (Drivers PostgreSQL)
- **python-decouple (lib de Sec)

---

## ⚙️ Funcionalidades Principais

- 🔐 **Autenticação e Permissões**
  - Usuários com níveis de acesso:
    - Visualização
    - Operacional
    - Administrador

- 💊 **Cadastro e Consulta de Medicamentos**
  - Informações: nome, validade, lote, fabricante, quantidade

- 📦 **Controle de Estoque**
  - Registro de entradas e saídas
  - Histórico rastreável

- 🚨 **Alertas Automáticos**
  - Notificações de medicamentos próximos à data de validade

- 📊 **Relatórios**
  - Relatórios por medicamento, movimentação e período

---

## 🗂️ Modelos de Dados

### 👤 Usuário
- `username`
- `senha`
- `nível_de_acesso`

### 💊 Medicamento
- `nome`
- `validade`
- `quantidade`
- `lote`
- `fabricante`

### 🔁 Movimentação
- `tipo` (entrada/saída)
- `medicamento`
- `quantidade`
- `data`
- `responsável`

---

## 🔗 Principais Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/login/` | Autenticação de usuário |
| `GET` | `/api/medicamentos/` | Listagem de medicamentos |
| `POST` | `/api/medicamentos/` | Cadastro de medicamentos |
| `PUT` | `/api/medicamentos/:id/` | Atualização de medicamentos |
| `DELETE` | `/api/medicamentos/:id/` | Remoção de medicamentos |
| `POST` | `/api/movimentacoes/` | Registro de movimentação de estoque |
| `GET` | `/api/alertas/validade/` | Listagem de medicamentos com validade próxima |
| `GET` | `/api/relatorios/` | Geração de relatórios diversos |

---

## 🔄 Fluxo Funcional

1. O usuário realiza **login** via `/api/login/`.
2. O sistema identifica o **nível de acesso**:
   - 👁️ **Visualização**: pode consultar medicamentos e relatórios.
   - 🛠️ **Operacional**: pode cadastrar medicamentos e registrar movimentações.
   - 🛡️ **Administrador**: pode gerenciar usuários e configurações do sistema.
3. O sistema emite **alertas automáticos** para medicamentos com validade próxima.
4. Usuários podem acessar **relatórios filtráveis** por medicamento, período, tipo de movimentação, etc.

---

## 📅 Cronograma de Desenvolvimento

| Semana | Atividades |
|--------|------------|
| 1️⃣ | Setup do projeto e autenticação |
| 2️⃣ | Módulos de medicamentos e controle de estoque |
| 3️⃣ | Implementação dos alertas e relatórios |
| 4️⃣ | Testes, melhorias e deploy |

---

## 🧪 Testes

> Em desenvolvimento. Testes automatizados serão implementados com `pytest` e `Django Test`.

---
