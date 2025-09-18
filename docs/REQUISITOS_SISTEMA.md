# Requisitos do Sistema - Locador Financial

## 📋 Visão Geral do Sistema

### Descrição do Produto
O Locador Financial é um sistema web completo de gestão financeira desenvolvido para empresas de locação de equipamentos. O sistema oferece controle total sobre lançamentos financeiros, contas a pagar e receber, gestão de clientes e fornecedores, além de relatórios e dashboards em tempo real.

### Objetivos do Sistema
- Centralizar todas as operações financeiras da empresa
- Automatizar processos de cobrança e pagamento
- Fornecer visibilidade completa do fluxo de caixa
- Facilitar a gestão de clientes e fornecedores
- Gerar relatórios gerenciais para tomada de decisão

## 🎯 Requisitos Funcionais

### 1. Sistema de Autenticação e Usuários

#### 1.1 Autenticação
- **RF001**: Login com usuário e senha
- **RF002**: Validação de credenciais via tabela `tbl_Funcionarios`
- **RF003**: Geração de tokens JWT para sessões
- **RF004**: Logout seguro com invalidação de token
- **RF005**: Controle de sessões ativas
- **RF006**: Auditoria de tentativas de login

#### 1.2 Controle de Acesso
- **RF007**: Verificação de status do funcionário (não demitido)
- **RF008**: Hash SHA-256 para senhas (compatibilidade com sistema atual)
- **RF009**: Refresh token automático
- **RF010**: Middleware de autenticação para rotas protegidas

### 2. Gestão de Empresas

#### 2.1 Cadastro de Empresas
- **RF011**: Cadastro de empresas com dados completos
- **RF012**: Validação de CNPJ único
- **RF013**: Gestão de endereço completo
- **RF014**: Controle de empresa padrão do sistema
- **RF015**: Dados de contato (telefone, email)

#### 2.2 Operações CRUD
- **RF016**: Criação de novas empresas
- **RF017**: Consulta com filtros (nome, CNPJ, status)
- **RF018**: Atualização de dados cadastrais
- **RF019**: Exclusão lógica (preservar histórico)
- **RF020**: Auditoria de alterações

### 3. Gestão Bancária

#### 3.1 Cadastro de Bancos
- **RF021**: Cadastro com código FEBRABAN
- **RF022**: Validação de códigos bancários
- **RF023**: Nome e dígito verificador
- **RF024**: Consulta por código ou nome

#### 3.2 Contas Bancárias
- **RF025**: Vinculação de contas à empresa
- **RF026**: Dados completos (agência, conta, dígitos)
- **RF027**: Controle de saldo atual
- **RF028**: Configuração de conta padrão por empresa
- **RF029**: Dados PIX (tipo e valor)
- **RF030**: Configuração para integração API bancária
- **RF031**: Histórico de movimentações

### 4. Gestão de Clientes

#### 4.1 Cadastro de Clientes
- **RF032**: Cadastro para Pessoa Física e Jurídica
- **RF033**: Validação de CPF/CNPJ
- **RF034**: Dados de endereço completo
- **RF035**: Múltiplos contatos (telefone, email)
- **RF036**: Controle de status (liberado/bloqueado)
- **RF037**: Classificação VIP

#### 4.2 Gestão de Relacionamento
- **RF038**: Histórico financeiro do cliente
- **RF039**: Controle de inadimplência
- **RF040**: Limites de crédito
- **RF041**: Relatórios por cliente

### 5. Sistema Financeiro

#### 5.1 Lançamentos Financeiros
- **RF042**: Registro de receitas e despesas
- **RF043**: Categorização hierárquica
- **RF044**: Vinculação a contas bancárias
- **RF045**: Controle de favorecidos
- **RF046**: Confirmação/estorno de lançamentos
- **RF047**: Cálculo automático de saldos
- **RF048**: Filtros avançados (período, categoria, conta)

#### 5.2 Contas a Pagar
- **RF049**: Registro de obrigações financeiras
- **RF050**: Controle de vencimentos
- **RF051**: Gestão de parcelas
- **RF052**: Cálculo de juros e multas
- **RF053**: Registro de pagamentos
- **RF054**: Baixa automática de contas
- **RF055**: Relatórios de contas em aberto

#### 5.3 Contas a Receber
- **RF056**: Registro de direitos financeiros
- **RF057**: Controle de recebimentos
- **RF058**: Gestão de inadimplência
- **RF059**: Cálculo de juros de mora
- **RF060**: Baixa automática de recebimentos
- **RF061**: Relatórios de aging

### 6. Categorias e Classificações

#### 6.1 Gestão de Categorias
- **RF062**: Estrutura hierárquica de categorias
- **RF063**: Categorias pai e filhas
- **RF064**: Ativação/desativação de categorias
- **RF065**: Movimentação na hierarquia
- **RF066**: Validação de referências circulares
- **RF067**: Relatórios por categoria

#### 6.2 Favorecidos
- **RF068**: Cadastro de fornecedores e prestadores
- **RF069**: Dados bancários para pagamento
- **RF070**: Histórico de transações
- **RF071**: Classificação por tipo

### 7. Dashboard e Relatórios

#### 7.1 Dashboard Executivo
- **RF072**: Visão geral financeira em tempo real
- **RF073**: Indicadores de receitas e despesas
- **RF074**: Fluxo de caixa projetado
- **RF075**: Contas vencidas e a vencer
- **RF076**: Top clientes e fornecedores
- **RF077**: Gráficos interativos

#### 7.2 Relatórios Gerenciais
- **RF078**: Relatório de lançamentos por período
- **RF079**: Demonstrativo de resultados
- **RF080**: Relatório de aging de recebíveis
- **RF081**: Relatório de contas a pagar
- **RF082**: Análise por categorias
- **RF083**: Exportação em PDF e Excel

## 🔧 Requisitos Técnicos

### 1. Arquitetura do Sistema

#### 1.1 Backend
- **RT001**: Framework FastAPI (Python)
- **RT002**: Banco de dados SQL Server
- **RT003**: ORM SQLAlchemy
- **RT004**: Autenticação JWT
- **RT005**: Documentação automática (Swagger/OpenAPI)
- **RT006**: Estrutura modular (models, services, routes)

#### 1.2 Frontend
- **RT007**: React 18 com TypeScript
- **RT008**: ShadCN UI para componentes
- **RT009**: Tailwind CSS para estilização
- **RT010**: Redux Toolkit para estado global
- **RT011**: React Router para navegação
- **RT012**: Axios para comunicação HTTP

#### 1.3 Infraestrutura
- **RT013**: Docker para containerização
- **RT014**: Docker Compose para orquestração
- **RT015**: Configuração para desenvolvimento e produção
- **RT016**: Proxy reverso configurado

### 2. Segurança

#### 2.1 Autenticação e Autorização
- **RT017**: Tokens JWT com expiração
- **RT018**: Refresh tokens para renovação
- **RT019**: Middleware de autenticação
- **RT020**: Validação de permissões por rota
- **RT021**: Hash seguro de senhas (SHA-256)

#### 2.2 Proteção de Dados
- **RT022**: Validação de entrada em todas as APIs
- **RT023**: Sanitização de dados
- **RT024**: Logs de auditoria
- **RT025**: CORS configurado adequadamente

### 3. Performance e Escalabilidade

#### 3.1 Otimizações
- **RT026**: Lazy loading de componentes
- **RT027**: Paginação em listagens
- **RT028**: Cache de dados frequentes
- **RT029**: Otimização de queries SQL
- **RT030**: Bundle splitting no frontend

#### 3.2 Monitoramento
- **RT031**: Logs estruturados
- **RT032**: Métricas de performance
- **RT033**: Health checks
- **RT034**: Tratamento de erros global

## 📊 Modelo de Dados

### Entidades Principais

#### 1. tbl_Empresa
- Código único da empresa
- Razão social e nome fantasia
- CNPJ e dados fiscais
- Endereço completo
- Dados de contato
- Flag de empresa padrão
- Campos de auditoria

#### 2. tbl_Banco
- Código FEBRABAN
- Nome do banco
- Dígito verificador

#### 3. tbl_Conta
- Vinculação à empresa
- Dados bancários (agência, conta)
- Saldo atual
- Configurações PIX
- Configurações API bancária
- Flag de conta padrão

#### 4. tbl_Clientes
- Tipo de pessoa (F/J)
- Documentos (CPF/CNPJ, RG/IE)
- Dados pessoais/empresariais
- Endereço e contatos
- Status e classificações

#### 5. Lancamento
- Tipo (receita/despesa)
- Valor e data
- Descrição
- Categoria
- Conta bancária
- Favorecido
- Status de confirmação

#### 6. AccountsPayable
- Dados do fornecedor
- Valor e vencimento
- Parcelas
- Status de pagamento
- Juros e multas

#### 7. AccountsReceivable
- Dados do cliente
- Valor e vencimento
- Status de recebimento
- Controle de inadimplência

### Relacionamentos
- Empresa → Contas (1:N)
- Banco → Contas (1:N)
- Cliente → Contas a Receber (1:N)
- Conta → Lançamentos (1:N)
- Categoria → Lançamentos (1:N)
- Favorecido → Lançamentos (1:N)

## 🎨 Requisitos de Interface

### 1. Design System
- **RI001**: ShadCN UI como biblioteca base
- **RI002**: Tailwind CSS para customizações
- **RI003**: Tema claro e escuro
- **RI004**: Responsividade para desktop e mobile
- **RI005**: Componentes reutilizáveis

### 2. Usabilidade
- **RI006**: Navegação intuitiva
- **RI007**: Breadcrumbs para orientação
- **RI008**: Feedback visual para ações
- **RI009**: Loading states
- **RI010**: Mensagens de erro claras
- **RI011**: Confirmações para ações críticas

### 3. Acessibilidade
- **RI012**: Suporte a leitores de tela
- **RI013**: Navegação por teclado
- **RI014**: Contraste adequado
- **RI015**: Textos alternativos

## 📋 Critérios de Aceitação

### 1. Funcionalidade
- Todos os CRUDs funcionando corretamente
- Validações de negócio implementadas
- Cálculos financeiros precisos
- Relatórios com dados corretos
- Dashboard atualizado em tempo real

### 2. Performance
- Tempo de resposta < 2 segundos
- Carregamento inicial < 5 segundos
- Suporte a 100 usuários simultâneos
- Queries otimizadas

### 3. Qualidade
- Cobertura de testes > 80%
- Zero erros críticos
- Código seguindo padrões estabelecidos
- Documentação completa

### 4. Segurança
- Autenticação obrigatória
- Validação de todas as entradas
- Logs de auditoria
- Dados sensíveis protegidos

## 🔄 Integrações

### 1. Sistema Legado
- Compatibilidade com tabelas existentes
- Migração de dados sem perda
- Manutenção de relacionamentos
- Preservação de histórico

### 2. APIs Externas (Futuro)
- Integração bancária (Open Banking)
- Consulta de CPF/CNPJ
- Envio de emails
- Backup em nuvem

## 📈 Roadmap de Evolução

### Fase 1 - Core System (Concluída)
- Sistema básico funcionando
- CRUDs principais
- Autenticação
- Dashboard básico

### Fase 2 - Melhorias (Atual)
- Relatórios avançados
- Exportações
- Otimizações de performance
- Testes automatizados

### Fase 3 - Expansão (Futuro)
- Módulo de estoque
- Integração com e-commerce
- App mobile
- BI avançado

---

**Documento gerado em:** Janeiro 2025  
**Versão:** 1.0  
**Status:** Aprovado  
**Próxima revisão:** Março 2025