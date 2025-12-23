# Serializadores e Regras de Validação

Os Serializers no `gestor_api/serializers.py` não apenas convertem dados para JSON, mas atuam como a primeira camada de defesa e lógica de negócio.

## 1. UsuarioSerializer
Gerencia a criação e atualização de contas de usuário com tratamento especial para senhas.

* **Campos:** `id`, `username`, `email`, `nivel_acesso`, `password`.
* **Regras de Negócio:**
    * **Email Único:** Validação customizada em `validate_email` para garantir que não existam duplicatas, excluindo a própria instância durante atualizações.
    * **Segurança de Senha:**
        * O campo `password` é marcado como `write_only` (nunca retorna no JSON de resposta).
        * Os métodos `.create()` e `.update()` interceptam o salvamento para garantir que a senha seja hashada (`set_password()`) antes de ir para o banco. Nunca salvamos texto plano.

## 2. MedicamentoSerializer
Responsável pela representação complexa dos medicamentos.

* **Campos Extras (Read-Only):**
    * `localizacao_detalhe`: Retorna o objeto `Localidade` completo aninhado, não apenas o ID. Facilita a exibição no frontend sem requisições extras.
    * `vencimento_validade`: Campo computado que retorna o status de urgência ('OK', 'Atenção', etc.).
* **Validações:**
    * **Data de Validade:** O método `validate_validade` impede o cadastro de medicamentos já vencidos (`validade < hoje`).
    * **Unicidade Composta:** Utiliza `UniqueTogetherValidator` para impedir duplicidade exata de um lote de medicamento na mesma localização.

## 3. MovimentacaoSerializer
Otimizado para relatórios e listagens.

* **Flattening (Achatamento) de Dados:**
    * Inclui campos `ReadOnlyField` (`medicamento_nome`, `responsavel_username`, `localidade_nome`) para evitar que o frontend precise buscar IDs relacionados manualmente.
    * Isso reduz drasticamente o número de queries (problema N+1) quando combinado com o `select_related` na View.

## 4. LocalidadeSerializer
Serializer padrão (`ModelSerializer`) que expõe todos os campos do modelo `Localidade`.