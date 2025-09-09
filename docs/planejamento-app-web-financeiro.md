# Planejamento para Desenvolvimento de Aplicativo Web Financeiro

## 📅 Última Atualização: 08/09/2025

## 📊 Status do Projeto: 75% Concluído

## 1. Visão Geral do Projeto

### 1.1 Status Atual
- **Backend**: 85% completo
  - ✅ Modelos de dados implementados
  - ✅ Services principais finalizados
  - ✅ APIs RESTful documentadas
  - 🔄 Testes em andamento

- **Frontend**: 70% completo
  - ✅ Estrutura base concluída
  - ✅ Autenticação implementada
  - ✅ Componentes principais criados
  - 🔄 Integração com APIs em andamento

- **Infraestrutura**: 80% completo
  - ✅ Docker configurado
  - ✅ Ambientes de desenvolvimento/teste
  - 🔄 CI/CD em andamento
  - ❌ Produção a configurar

## 2. Análise de Requisitos Técnicos

### 2.1 Tabelas Principais do Sistema (Implementadas)

O aplicativo web financeiro será construído sobre as seguintes tabelas principais do sistema Locador:

#### 1.1.1 tbl_Empresa
**Descrição**: Tabela central que armazena informações das empresas do sistema.

**Campos Principais**:
- `CodEmpresa` (int, PK): Código único da empresa
- `NomEmpresa` (string): Nome fantasia da empresa
- `RazaoSocial` (string): Razão social da empresa
- `CNPJ` (string): CNPJ da empresa
- `Endereco`, `Bairro`, `CEP`, `Municipio`, `Estado`: Dados de endereço
- `Telefone`, `Email`: Dados de contato
- `FlgPadrao` (bool): Indica se é a empresa padrão do sistema
- `DatCadastro`, `NomUsuario`, `DatAlteracao`, `NomUsuarioAlteracao`: Campos de auditoria

**Relacionamentos**:
- Um para muitos com `tbl_Conta` (uma empresa pode ter várias contas bancárias)
- Um para muitos com `tbl_AccountsPayable` e `tbl_AccountsReceivable`
- Um para muitos com `tbl_FINLancamentos`

#### 1.1.2 tbl_Banco
**Descrição**: Tabela de cadastro de bancos do sistema financeiro nacional.

**Campos Principais**:
- `Codigo` (int, PK): Código do banco (padrão FEBRABAN)
- `Digito` (string): Dígito verificador do banco
- `Nome` (string): Nome do banco

**Relacionamentos**:
- Um para muitos com `tbl_Conta` (um banco pode ter várias contas)
- Um para muitos com `tbl_ClientesContas`

#### 1.1.3 tbl_Conta
**Descrição**: Tabela que armazena as contas bancárias das empresas.

**Campos Principais**:
- `idConta` (int, PK): Identificador único da conta
- `CodEmpresa` (int, FK): Referência à empresa proprietária
- `Banco` (int, FK): Referência ao banco
- `Agencia`, `AgenciaDigito`: Dados da agência
- `Conta`, `ContaDigito`: Dados da conta
- `NomConta` (string): Nome/descrição da conta
- `Saldo` (decimal): Saldo atual da conta
- `FlgContaPadrao` (bool): Indica se é a conta padrão da empresa
- `TipoPix`, `ValorPix`: Dados para PIX
- `EnableAPI` (bool): Habilita integração via API bancária
- `ConfiguracaoAPI` (string): Configurações da API bancária
- `DatCadastro`, `NomUsuario`, `DatAlteracao`, `NomUsuarioAlteracao`: Campos de auditoria

**Relacionamentos**:
- Muitos para um com `tbl_Empresa`
- Muitos para um com `tbl_Banco`
- Um para muitos com `tbl_FINLancamentos`
- Um para muitos com `tbl_AccountsPayable` e `tbl_AccountsReceivable`

#### 1.1.4 tbl_Clientes
**Descrição**: Tabela de cadastro de clientes do sistema.

**Campos Principais**:
- `CodCliente` (int, PK): Código único do cliente
- `DesCliente` (string): Nome/descrição do cliente
- `RazaoSocial` (string): Razão social (para PJ)
- `FlgTipoPessoa` (string): Tipo de pessoa (F=Física, J=Jurídica)
- `CPF`, `RG`: Documentos para pessoa física
- `CNPJ`, `IE`, `IM`: Documentos para pessoa jurídica
- `Endereco`, `Bairro`, `CEP`, `Municipio`, `Estado`: Dados de endereço
- `Telefone`, `Email`: Dados de contato (múltiplos)
- `FlgLiberado` (bool): Status de liberação do cliente
- `FlgVIP` (bool): Cliente VIP
- `DatCadastro`, `NomUsuario`, `DatAlteracao`, `NomUsuarioAlteracao`: Campos de auditoria

**Relacionamentos**:
- Um para muitos com `tbl_AccountsReceivable`
- Um para muitos com `tbl_Locacao`
- Um para muitos com `tbl_Orcamento`

### 1.2 Integridade Referencial e Relacionamentos

#### Relacionamentos Principais

**tbl_Empresa (Tabela Central)**
- É referenciada por `tbl_Conta.CodEmpresa`
- É referenciada por `tbl_AccountsPayable.CodEmpresa`
- É referenciada por `tbl_AccountsReceivable.CodEmpresa`
- É referenciada por `tbl_FINLancamentos.CodEmpresa`

**tbl_Banco**
- É referenciada por `tbl_Conta.Banco`
- É referenciada por `tbl_ClientesContas.Banco`

**tbl_Conta**
- Referencia `tbl_Empresa.CodEmpresa`
- Referencia `tbl_Banco.Codigo`
- É referenciada por `tbl_FINLancamentos.idConta`
- É referenciada por `tbl_AccountsPayable.idConta`
- É referenciada por `tbl_AccountsReceivable.idConta`

**tbl_Clientes**
- É referenciada por `tbl_AccountsReceivable.CodCliente`
- É referenciada por `tbl_Locacao.CodCliente`
- É referenciada por `tbl_Orcamento.CodCliente`

#### Regras de Integridade

1. **Exclusão em Cascata**: Não permitida para preservar histórico financeiro
2. **Exclusão Lógica**: Implementar flags de status para "exclusão" de registros
3. **Validações de Referência**:
   - Empresa deve existir antes de criar conta bancária
   - Banco deve existir antes de criar conta
   - Cliente deve existir antes de criar contas a receber
   - Conta deve existir antes de criar lançamentos

4. **Constraints de Negócio**:
   - Uma empresa deve ter pelo menos uma conta bancária ativa
   - Apenas uma empresa pode ser marcada como padrão
   - Apenas uma conta por empresa pode ser marcada como padrão
   - CNPJ deve ser único por empresa
   - CPF/CNPJ deve ser único por cliente

### 2.3 Requisitos Funcionais (Status)

Com base na análise do modelo de dados financeiro existente, o aplicativo web deverá implementar as seguintes funcionalidades:

#### ✅ Sistema de Autenticação (Implementado)
- Login/Logout
- Gerenciamento de sessão
- Controle de acesso baseado em funções
- Refresh token automático
- **Validação de Credenciais**: O sistema deve validar as credenciais dos usuários consultando diretamente os campos `Login` e `Senha` armazenados na tabela `tbl_Funcionarios`.
- **Verificação de Status**: Validar se o funcionário não possui data de demissão (`DatDemissao`) preenchida.
- **Hash de Senha**: Utilizar hash SHA-256 para comparação segura das senhas (compatível com o sistema atual).
- **Auditoria de Login**: Registrar tentativas de login para auditoria e controle de acesso.
- **Geração de Token JWT**: Criar tokens JWT para autenticação stateless nas requisições da API.
- **Controle de Sessão**: Gerenciar sessões ativas e permitir logout seguro.
- **Auditoria de Operações**: Registrar ID do usuário logado nos campos de auditoria das tabelas financeiras (`IdUserCreate`, `IdUserAlter`, `NomUsuario`).

#### Gestão de Empresas
- **Create**: Cadastro de novas empresas com validação de CNPJ
- **Read**: Consulta de empresas com filtros por nome, CNPJ, status
- **Update**: Atualização de dados cadastrais, endereço e configurações
- **Delete**: Exclusão lógica de empresas (verificar dependências)
- Definição de empresa padrão do sistema
- Gestão de configurações específicas por empresa

#### Gestão de Bancos
- **Create**: Cadastro de novos bancos com código FEBRABAN
- **Read**: Consulta de bancos por código ou nome
- **Update**: Atualização de dados do banco
- **Delete**: Exclusão de bancos (verificar contas vinculadas)
- Validação de códigos FEBRABAN

#### Gestão de Contas Bancárias
- **Create**: Cadastro de novas contas bancárias vinculadas à empresa
- **Read**: Consulta de contas por empresa, banco, status
- **Update**: Atualização de dados da conta, saldo, configurações
- **Delete**: Exclusão de contas (verificar movimentações)
- Definição de conta padrão por empresa
- Configuração de integração com APIs bancárias
- Gestão de dados PIX

#### Gestão de Clientes
- **Create**: Cadastro de novos clientes (PF/PJ) com validação de documentos
- **Read**: Consulta de clientes com filtros avançados
- **Update**: Atualização de dados cadastrais, endereço, contatos
- **Delete**: Exclusão lógica de clientes (verificar dependências)
- Controle de status de liberação
- Gestão de clientes VIP
- Validação de CPF/CNPJ

#### ✅ Gestão de Lançamentos Financeiros
- Cadastro, edição, exclusão e consulta de lançamentos financeiros
- Filtros por data, categoria, favorecido e status
- Confirmação de lançamentos
- Suporte a lançamentos recorrentes
- Visualização de histórico de lançamentos

#### ✅ Contas a Pagar e Receber
- Cadastro, edição, exclusão e consulta de títulos a pagar e receber
- Gestão de parcelas e pagamentos
- Filtros por vencimento, status, cliente/fornecedor
- Baixa de títulos (total ou parcial)
- Geração de relatórios de títulos em aberto, pagos e vencidos

#### ✅ Categorias Financeiras
- Cadastro, edição, exclusão e consulta de categorias
- Organização hierárquica (categorias e subcategorias)
- Classificação por tipo (receita, despesa, transferência)

#### ✅ Favorecidos e Fornecedores
- Cadastro, edição, exclusão e consulta de favorecidos
- Vinculação com clientes existentes
- Dados bancários para pagamentos

#### 🔄 Relatórios e Dashboard (Em Desenvolvimento)
- Visão geral financeira
- Fluxo de caixa
- DRE (Demonstrativo de Resultado)
- Análise de contas a pagar/receber
- Previsão de fluxos
- Dashboard financeiro com indicadores principais
- Fluxo de caixa realizado e projetado
- Relatórios de receitas e despesas por categoria
- Extrato de contas bancárias
- Relatórios de inadimplência

### 1.2 Requisitos Não-Funcionais

#### Desempenho
- Tempo de resposta máximo de 2 segundos para operações comuns
- Suporte a pelo menos 100 usuários simultâneos
- Otimização para conexões de internet móvel

#### Segurança
- Autenticação JWT com refresh tokens e expiração configurável
- Hash SHA-256 para senhas (compatível com sistema atual)
- Autorização baseada em papéis e permissões
- Criptografia de dados sensíveis
- Proteção contra ataques comuns (CSRF, XSS, SQL Injection)
- HTTPS obrigatório para todas as comunicações
- Rate limiting para tentativas de login
- Logs de auditoria para todas as operações de autenticação

#### Usabilidade
- Interface responsiva para dispositivos móveis e desktop
- Design intuitivo seguindo princípios de UX
- Suporte a temas claro e escuro
- Feedback visual para operações em andamento

#### Compatibilidade
- Suporte aos navegadores modernos (Chrome, Firefox, Safari, Edge)
- Funcionamento offline para operações básicas com sincronização posterior

#### Escalabilidade
- Arquitetura que permita escalar horizontalmente
- Separação clara entre frontend e backend

### 1.3 Requisitos Técnicos

#### Backend
- Python 3.10+ com FastAPI
- SQLAlchemy ORM para acesso ao banco de dados
- Pydantic para validação de dados
- Alembic para migrações de banco de dados
- Integração com SQL Server existente

#### Frontend
- React 18+ com TypeScript
- Material-UI ou Chakra UI para componentes de interface
- Redux Toolkit para gerenciamento de estado
- React Query para gerenciamento de estado do servidor
- Axios para requisições HTTP
- Responsividade com CSS Grid e Flexbox

#### DevOps
- Docker para containerização
- CI/CD com GitHub Actions ou Azure DevOps
- Testes automatizados (unitários, integração, e2e)

## 2. Arquitetura Proposta

### 2.1 Visão Geral da Arquitetura

A arquitetura proposta segue o padrão de aplicação web moderna, com separação clara entre frontend e backend, comunicação via API REST, e persistência em banco de dados SQL Server existente.

```
+------------------+       +------------------+       +------------------+
|                  |       |                  |       |                  |
|  Cliente React   | <---> |   API FastAPI    | <---> |   SQL Server     |
|  (SPA)           |       |   (Python)       |       |   (Existente)    |
|                  |       |                  |       |                  |
+------------------+       +------------------+       +------------------+
```

### 2.2 Arquitetura do Backend

O backend será desenvolvido seguindo uma arquitetura em camadas:

```
+------------------+
|     API Layer    |  <- Endpoints FastAPI, autenticação, validação
+------------------+
|   Service Layer  |  <- Lógica de negócio, regras, transações
+------------------+
| Repository Layer |  <- Acesso a dados, queries, ORM
+------------------+
|   Domain Layer   |  <- Entidades, modelos, DTOs
+------------------+
```

#### Componentes Principais

1. **API Layer**
   - Routers FastAPI organizados por domínio (lançamentos, contas, categorias)
   - Middleware para autenticação, logging e tratamento de erros
   - Validação de entrada com Pydantic
   - Documentação automática com Swagger/OpenAPI

2. **Service Layer**
   - Implementação da lógica de negócio
   - Orquestração de operações entre múltiplos repositórios
   - Validações complexas e regras de negócio
   - Transações e consistência de dados

3. **Repository Layer**
   - Abstração do acesso ao banco de dados
   - Implementação de queries e operações CRUD
   - Mapeamento entre entidades de domínio e tabelas
   - Otimização de consultas

4. **Domain Layer**
   - Modelos de domínio (Pydantic)
   - DTOs para transferência de dados
   - Enums e constantes
   - Exceções de domínio

### 2.3 Arquitetura do Frontend

O frontend será desenvolvido como uma Single Page Application (SPA) em React, com a seguinte estrutura:

```
+------------------+
|     UI Layer     |  <- Componentes React, páginas, layouts
+------------------+
|    State Layer   |  <- Redux store, React Query, context
+------------------+
|   Service Layer  |  <- API clients, serviços, utils
+------------------+
```

#### Componentes Principais

1. **UI Layer**
   - Componentes reutilizáveis
   - Páginas e layouts
   - Formulários e validação
   - Temas e estilos

2. **State Layer**
   - Redux store para estado global
   - React Query para estado do servidor
   - Context API para estado local
   - Middleware para side effects

3. **Service Layer**
   - Clientes API para comunicação com backend
   - Serviços para lógica compartilhada
   - Utilitários e helpers
   - Adaptadores para formatos de dados

### 2.4 Integração com Banco de Dados Existente

A integração com o banco de dados SQL Server existente será feita através do SQLAlchemy, com os seguintes componentes:

1. **Mapeamento ORM**
   - Classes Python mapeadas para tabelas existentes
   - Relacionamentos definidos conforme modelo de dados
   - Configuração de chaves primárias e estrangeiras

2. **Migrações**
   - Uso do Alembic para gerenciar alterações no esquema
   - Scripts de migração para ajustes necessários
   - Versionamento de esquema

3. **Otimização**
   - Índices para consultas frequentes
   - Estratégias de carregamento (lazy, eager)
   - Paginação para grandes conjuntos de dados

## 3. Cronograma de Implementação

### Fase 1: Configuração e Estrutura Base (2 semanas)

#### Semana 1: Configuração do Ambiente
- Configuração do ambiente de desenvolvimento
- Setup do projeto FastAPI (backend)
- Setup do projeto React (frontend)
- Configuração de Docker e ambiente de CI/CD
- Integração com SQL Server existente

#### Semana 2: Estrutura Base e Autenticação
- Implementação da estrutura base do backend
- Implementação da estrutura base do frontend
- Sistema de autenticação e autorização
- Testes de integração básicos

### Fase 2: Implementação do Módulo de Lançamentos (3 semanas)

#### Semana 3: Backend de Lançamentos
- Modelos e repositórios para lançamentos financeiros
- Endpoints API para operações CRUD
- Regras de negócio para lançamentos
- Testes unitários e de integração

#### Semana 4: Frontend de Lançamentos (Parte 1)
- Componentes de listagem e filtros
- Formulários de cadastro e edição
- Integração com API de lançamentos
- Testes de componentes

#### Semana 5: Frontend de Lançamentos (Parte 2)
- Dashboard de lançamentos
- Visualizações e relatórios
- Funcionalidades de lançamentos recorrentes
- Testes e ajustes finais

### Fase 3: Implementação do Módulo de Contas a Pagar/Receber (3 semanas)

#### Semana 6: Backend de Contas
- Modelos e repositórios para contas a pagar/receber
- Endpoints API para operações CRUD
- Regras de negócio para parcelas e pagamentos
- Testes unitários e de integração

#### Semana 7: Frontend de Contas (Parte 1)
- Componentes de listagem e filtros
- Formulários de cadastro e edição
- Integração com API de contas
- Testes de componentes

#### Semana 8: Frontend de Contas (Parte 2)
- Gestão de parcelas e pagamentos
- Relatórios de contas
- Funcionalidades de baixa de títulos
- Testes e ajustes finais

### Fase 4: Implementação dos Módulos de Suporte (2 semanas)

#### Semana 9: Categorias e Favorecidos
- Backend e frontend para categorias financeiras
- Backend e frontend para favorecidos
- Integração entre módulos
- Testes e ajustes

#### Semana 10: Relatórios e Dashboard
- Dashboard financeiro principal
- Relatórios de fluxo de caixa
- Relatórios de receitas e despesas
- Exportação de dados

### Fase 5: Otimização e Finalização (2 semanas)

#### Semana 11: Otimização e Responsividade
- Otimização de desempenho
- Ajustes de responsividade para dispositivos móveis
- Melhorias de UX/UI
- Testes de usabilidade

#### Semana 12: Testes Finais e Implantação
- Testes de integração completos
- Testes de carga e desempenho
- Documentação final
- Preparação para implantação

## 4. Fluxos de Trabalho Recomendados

### 4.1 Fluxo de Desenvolvimento

1. **Planejamento de Sprint**
   - Definição de histórias de usuário
   - Estimativa de esforço
   - Priorização de tarefas

2. **Desenvolvimento**
   - Criação de branch feature/[nome-da-feature]
   - Implementação de testes unitários
   - Implementação da funcionalidade
   - Code review

3. **Integração**
   - Merge para branch de desenvolvimento
   - Testes de integração automatizados
   - Resolução de conflitos

4. **Validação**
   - Testes de aceitação
   - Validação com stakeholders
   - Ajustes finais

5. **Implantação**
   - Merge para branch principal
   - Deploy automatizado
   - Monitoramento pós-implantação

### 4.2 Fluxo de Trabalho com Agentes de IA

1. **Definição de Tarefas**
   - Decomposição de histórias em tarefas técnicas
   - Documentação clara de requisitos
   - Definição de critérios de aceitação

2. **Desenvolvimento Assistido**
   - Uso de prompts para geração de código inicial
   - Revisão e adaptação do código gerado
   - Iteração com agentes para melhorias

3. **Revisão e Testes**
   - Geração de testes unitários com IA
   - Revisão de código com sugestões de IA
   - Identificação de potenciais problemas

4. **Documentação**
   - Geração de documentação técnica
   - Comentários de código
   - Atualização de README e wikis

## 5. Modelos de Prompts para Agentes de IA

### 5.1 Prompts para Desenvolvimento Backend

#### Geração de Modelos e Schemas

```
Crie um modelo SQLAlchemy e schema Pydantic para a entidade [nome_da_entidade] com os seguintes atributos:

[lista_de_atributos_com_tipos]

Considere os seguintes relacionamentos:
[lista_de_relacionamentos]

Adicione validações para:
[lista_de_validações]

O modelo deve mapear para a tabela existente [nome_da_tabela] no banco de dados SQL Server.
```

#### Geração de Endpoints API

```
Crie um router FastAPI para a entidade [nome_da_entidade] com os seguintes endpoints:

1. GET /[entidade] - Listar todos com paginação e filtros para [lista_de_filtros]
2. GET /[entidade]/{id} - Obter por ID
3. POST /[entidade] - Criar novo
4. PUT /[entidade]/{id} - Atualizar existente
5. DELETE /[entidade]/{id} - Remover

Adicione as seguintes regras de negócio:
[lista_de_regras]

Implemente tratamento de erros para:
[lista_de_erros_possíveis]
```

#### Geração de Testes

```
Crie testes unitários para o serviço [nome_do_serviço] que implementa as seguintes funcionalidades:

[lista_de_funcionalidades]

Considere os seguintes cenários de teste:
[lista_de_cenários]

Utilize pytest e implemente mocks para as dependências externas.
```

### 5.2 Prompts para Desenvolvimento Frontend

#### Geração de Componentes React

```
Crie um componente React com TypeScript para [funcionalidade] com as seguintes características:

- Props: [lista_de_props_com_tipos]
- Estado: [lista_de_estados]
- Comportamentos: [lista_de_comportamentos]
- Estilização: Utilize [biblioteca_de_estilo] com tema responsivo

O componente deve ser otimizado para dispositivos móveis e desktop.
```

#### Geração de Formulários

```
Crie um formulário React para [entidade] utilizando React Hook Form com as seguintes características:

- Campos: [lista_de_campos_com_tipos_e_validações]
- Submissão: Integração com API endpoint [endpoint]
- Validação: Yup schema com as seguintes regras [regras_de_validação]
- UI: Componentes de [biblioteca_ui] com layout responsivo
- Estado: Gerenciamento de estados de loading, erro e sucesso
```

#### Geração de Hooks Personalizados

```
Crie um hook React personalizado para [funcionalidade] que:

- Gerencie o estado de [estado_a_gerenciar]
- Implemente as seguintes funções: [lista_de_funções]
- Lide com os seguintes efeitos colaterais: [lista_de_efeitos]
- Otimize o desempenho com memoização quando apropriado
- Inclua tratamento de erros para [cenários_de_erro]
```

### 5.3 Prompts para Integração e Testes

#### Configuração de Ambiente

```
Crie um arquivo docker-compose.yml para um ambiente de desenvolvimento com os seguintes serviços:

- Backend FastAPI em Python 3.10
- Frontend React
- SQL Server (conectando ao banco existente)
- Redis para cache (opcional)

Configurações específicas:
- Hot-reload para desenvolvimento
- Volumes para persistência de código
- Variáveis de ambiente para configuração
- Rede compartilhada entre serviços
```

#### Geração de Testes E2E

```
Crie testes E2E com Cypress para o fluxo de [nome_do_fluxo] que inclui:

1. Login no sistema
2. Navegação para [página]
3. Interação com [componente]
4. Submissão de [dados]
5. Verificação de [resultado_esperado]

Considere os seguintes cenários alternativos:
[lista_de_cenários]

Implemente fixtures para os dados de teste.
```

## 6. Considerações Finais

### 6.1 Desafios Técnicos Previstos

1. **Integração com Banco Existente**
   - Mapeamento de tabelas legadas para modelos ORM
   - Lidar com convenções de nomenclatura inconsistentes
   - Garantir integridade referencial

2. **Otimização para Dispositivos Móveis**
   - Balancear funcionalidades ricas com desempenho em dispositivos móveis
   - Adaptar interfaces complexas para telas pequenas
   - Lidar com conectividade intermitente

3. **Segurança e Permissões**
   - Implementar modelo de permissões compatível com o existente
   - Garantir segurança em APIs expostas
   - Proteger dados sensíveis

### 6.2 Estratégias de Mitigação

1. **Abordagem Incremental**
   - Desenvolvimento em fases com entregas incrementais
   - Validação contínua com stakeholders
   - Adaptação do plano conforme feedback

2. **Automação**
   - Testes automatizados extensivos
   - CI/CD para detecção precoce de problemas
   - Linting e análise estática de código

3. **Documentação**
   - Documentação técnica detalhada
   - Comentários de código claros
   - Guias de desenvolvimento e padrões

### 6.3 Próximos Passos

1. **Validação do Plano**
   - Revisão com equipe técnica
   - Ajustes baseados em feedback
   - Definição de métricas de sucesso

2. **Preparação do Ambiente**
   - Configuração de ambientes de desenvolvimento
   - Acesso ao banco de dados existente
   - Configuração de repositórios e CI/CD

3. **Início do Desenvolvimento**
   - Formação da equipe
   - Sprint inicial de configuração
   - Desenvolvimento do MVP