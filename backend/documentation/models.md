# Modelagem de Dados (Models)

A aplicação `gestor_api` define quatro modelos principais que estruturam a lógica de negócio.

## 1. Usuario (`gestor_api.models.Usuario`)
Estende o `AbstractUser` do Django para incluir controle de acesso granular.

* **Campos Adicionais:**
    * `nivel_acesso`: Enum (`CharField`) que define as permissões do usuário.
        * `VISUALIZACAO`: Apenas leitura.
        * `OPERACIONAL`: Pode realizar movimentações e operações básicas.
        * `GESTOR`: Pode gerenciar usuários operacionais e editar dados sensíveis.
        * `ADMINISTRADOR`: Acesso total ao sistema.

## 2. Localidade (`gestor_api.models.Localidade`)
Representa os locais físicos ou lógicos de armazenamento.

* **Campos:**
    * `nome`: Nome do local (ex: "Prateleira A").
    * `tipo`: Categoria do local (`ATT_BASICA`, `ANTIBIOTICO`, `CONTROLADO`, `HOSPITALAR`).

## 3. Medicamento (`gestor_api.models.Medicamento`)
O núcleo do inventário. Contém lógica de validação de unicidade e cálculo de validade.

* **Campos Principais:**
    * `nome`, `dosagem`, `forma_farmaceutica`, `unidade_medida`.
    * `validade`: Data de expiração.
    * `quantidade`: Estoque atual (atualizado automaticamente via movimentações).
    * `lote`, `fabricante`.
    * `localizacao`: FK para `Localidade`.
* **Propriedades Computadas:**
    * `vencimento_validade`: Retorna o status ('OK', 'Atenção', 'Critico', 'Vencido') baseado na data atual.
* **Constraints:**
    * `UniqueConstraint`: Garante que não existam medicamentos duplicados com a mesma combinação de nome, dosagem, lote, fabricante e localização.

## 4. Movimentacao (`gestor_api.models.Movimentacao`)
Registra o fluxo de entrada e saída de estoque. Implementa o padrão de *snapshot* para integridade histórica.

* **Campos:**
    * `tipo`: `ENTRADA` ou `SAIDA`.
    * `medicamento`: FK para `Medicamento`.
    * `quantidade`: Valor inteiro movimentado.
    * `localidade`: FK para `Localidade`.
    * `responsavel`: FK para `Usuario`.
* **Snapshots:**
    * `medicamento_nome_snapshot` e `responsavel_nome_snapshot`: Armazenam o nome do medicamento e do usuário no momento da movimentação. Isso garante que o histórico permaneça legível mesmo se o medicamento ou usuário forem deletados posteriormente (embora as FKs estejam configuradas como `SET_NULL` ou `PROTECT`).