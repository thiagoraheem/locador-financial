# Especificação de Modernização Frontend - ShadCN UI

## 1. Visão Geral do Projeto

Este documento especifica a modernização completa do frontend do aplicativo Locador Financial, migrando de Material-UI (MUI) para ShadCN UI, mantendo toda a funcionalidade existente e melhorando a experiência do usuário.

**Objetivos:**
- Modernizar a interface utilizando ShadCN UI
- Manter 100% da funcionalidade existente
- Melhorar consistência visual e experiência do usuário
- Otimizar performance e acessibilidade
- Estabelecer um design system robusto

## 2. Análise da Estrutura Atual

### 2.1 Stack Tecnológico Atual
- **Frontend:** React 18 + TypeScript
- **UI Library:** Material-UI (MUI) v6
- **Formulários:** React Hook Form + Yup
- **Estado:** Redux Toolkit
- **Roteamento:** React Router v6
- **Gráficos:** Recharts
- **Internacionalização:** i18next
- **Estilização:** MUI Theme System

### 2.2 Estrutura de Componentes Identificada

#### Componentes de Layout
- `Layout.tsx` - Container principal
- `Sidebar.tsx` - Navegação lateral
- `TopBar.tsx` - Barra superior
- `AuthGuard.tsx` - Proteção de rotas

#### Componentes de Formulário
- `CategoriaForm.tsx`
- `ClienteForm.tsx`
- `ContaBancariaForm.tsx`
- `ContaPagarForm.tsx`
- `ContaReceberForm.tsx`
- `EmpresaForm.tsx`
- `FavorecidoForm.tsx`
- `LancamentoForm.tsx`
- `PagamentoContaPagarForm.tsx`
- `RecebimentoContaReceberForm.tsx`

#### Páginas Principais
- Dashboard com cards estatísticos e gráficos
- Lançamentos
- Categorias
- Contas a Pagar/Receber
- Empresas
- Bancos
- Contas
- Clientes

#### Componentes de UI
- Tabelas (DataGrid)
- Cards de estatísticas
- Dialogs/Modais
- Sistema de notificações
- Botões, inputs, selects

## 3. Especificação do Design System ShadCN

### 3.1 Paleta de Cores
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --success: 142.1 76.2% 36.3%;
  --warning: 47.9 95.8% 53.1%;
}
```

### 3.2 Tipografia
- **Font Family:** Inter, system-ui, sans-serif
- **Escalas:** text-xs (12px) até text-4xl (36px)
- **Pesos:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### 3.3 Espaçamentos
- **Base:** 4px (0.25rem)
- **Escalas:** 1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64

### 3.4 Breakpoints
```css
sm: '640px'
md: '768px'
lg: '1024px'
xl: '1280px'
2xl: '1536px'
```

## 4. Plano de Migração Detalhado

### Fase 1: Setup Inicial e Componentes Base (Semana 1)

#### 4.1.1 Configuração Inicial
- [ ] Instalar ShadCN UI e dependências
- [ ] Configurar Tailwind CSS
- [ ] Setup do sistema de componentes
- [ ] Configurar tema dark/light

#### 4.1.2 Componentes Base
- [ ] Button
- [ ] Input
- [ ] Label
- [ ] Card
- [ ] Dialog
- [ ] Select
- [ ] Checkbox
- [ ] Radio Group
- [ ] Textarea
- [ ] Badge
- [ ] Alert

**Critérios de Aceitação:**
- Todos os componentes base funcionando
- Tema configurado corretamente
- Compatibilidade com React Hook Form

### Fase 2: Sistema de Layout (Semana 2)

#### 4.2.1 Componentes de Layout
- [ ] Migrar `Layout.tsx`
- [ ] Migrar `Sidebar.tsx` com navegação
- [ ] Migrar `TopBar.tsx`
- [ ] Implementar sistema de navegação responsiva
- [ ] Configurar menu mobile

#### 4.2.2 Componentes Adicionais
- [ ] Sheet (para sidebar mobile)
- [ ] Navigation Menu
- [ ] Breadcrumb
- [ ] Separator

**Critérios de Aceitação:**
- Layout responsivo funcionando
- Navegação mobile operacional
- Sidebar colapsável
- Breadcrumbs funcionais

### Fase 3: Sistema de Formulários (Semana 3-4)

#### 4.3.1 Componentes de Formulário
- [ ] Form (wrapper para React Hook Form)
- [ ] FormField
- [ ] FormItem
- [ ] FormLabel
- [ ] FormControl
- [ ] FormDescription
- [ ] FormMessage

#### 4.3.2 Migração de Formulários
- [ ] `CategoriaForm.tsx`
- [ ] `ClienteForm.tsx`
- [ ] `ContaBancariaForm.tsx`
- [ ] `ContaPagarForm.tsx`
- [ ] `ContaReceberForm.tsx`
- [ ] `EmpresaForm.tsx`
- [ ] `FavorecidoForm.tsx`
- [ ] `LancamentoForm.tsx`
- [ ] `PagamentoContaPagarForm.tsx`
- [ ] `RecebimentoContaReceberForm.tsx`

**Critérios de Aceitação:**
- Todos os formulários funcionando
- Validação com Yup mantida
- Mensagens de erro exibidas corretamente
- Campos condicionais funcionando

### Fase 4: Tabelas e Listas (Semana 5)

#### 4.4.1 Componentes de Tabela
- [ ] Table
- [ ] TableHeader
- [ ] TableBody
- [ ] TableFooter
- [ ] TableHead
- [ ] TableRow
- [ ] TableCell
- [ ] TableCaption

#### 4.4.2 Funcionalidades Avançadas
- [ ] Paginação
- [ ] Ordenação
- [ ] Filtros
- [ ] Busca
- [ ] Seleção múltipla
- [ ] Ações em lote

**Critérios de Aceitação:**
- Todas as tabelas migradas
- Funcionalidades de ordenação e filtro
- Paginação funcionando
- Performance otimizada

### Fase 5: Dashboard e Gráficos (Semana 6)

#### 4.5.1 Componentes do Dashboard
- [ ] Cards de estatísticas
- [ ] Gráficos (manter Recharts)
- [ ] Indicadores de tendência
- [ ] Métricas em tempo real

#### 4.5.2 Componentes Adicionais
- [ ] Progress
- [ ] Skeleton
- [ ] Tooltip
- [ ] Popover

**Critérios de Aceitação:**
- Dashboard totalmente funcional
- Gráficos responsivos
- Carregamento otimizado
- Animações suaves

### Fase 6: Refinamentos e Otimizações (Semana 7)

#### 4.6.1 Polimentos
- [ ] Animações e transições
- [ ] Estados de loading
- [ ] Estados vazios
- [ ] Tratamento de erros
- [ ] Acessibilidade (ARIA)

#### 4.6.2 Performance
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Otimização de bundle
- [ ] Memoização de componentes

**Critérios de Aceitação:**
- Performance otimizada
- Acessibilidade completa
- Experiência de usuário refinada

## 5. Checklist de Verificação Detalhado

### 5.1 Componentes Básicos
- [ ] **Botões**
  - [ ] Primary, Secondary, Outline, Ghost
  - [ ] Estados: Default, Hover, Active, Disabled
  - [ ] Tamanhos: sm, md, lg
  - [ ] Com ícones

- [ ] **Inputs**
  - [ ] Text, Email, Password, Number
  - [ ] Estados de validação
  - [ ] Placeholder e helper text
  - [ ] Ícones internos

- [ ] **Cards**
  - [ ] Header, Content, Footer
  - [ ] Variações de elevação
  - [ ] Cards interativos

### 5.2 Navegação e Layout
- [ ] **Sidebar**
  - [ ] Navegação hierárquica
  - [ ] Estados ativo/inativo
  - [ ] Collapse/expand
  - [ ] Mobile responsive

- [ ] **TopBar**
  - [ ] Menu de usuário
  - [ ] Notificações
  - [ ] Busca global
  - [ ] Breadcrumbs

### 5.3 Telas Principais
- [ ] **Dashboard**
  - [ ] Cards de métricas
  - [ ] Gráficos interativos
  - [ ] Filtros de período
  - [ ] Responsividade

- [ ] **Formulários**
  - [ ] Validação em tempo real
  - [ ] Campos condicionais
  - [ ] Upload de arquivos
  - [ ] Auto-save

- [ ] **Listagens**
  - [ ] Paginação
  - [ ] Ordenação
  - [ ] Filtros avançados
  - [ ] Exportação

### 5.4 Funcionalidades Críticas
- [ ] **Autenticação**
  - [ ] Login/logout
  - [ ] Recuperação de senha
  - [ ] Sessão persistente

- [ ] **Permissões**
  - [ ] Controle de acesso
  - [ ] Rotas protegidas
  - [ ] Funcionalidades condicionais

### 5.5 Responsividade
- [ ] **Mobile (< 768px)**
  - [ ] Menu hambúrguer
  - [ ] Tabelas scrolláveis
  - [ ] Formulários adaptados

- [ ] **Tablet (768px - 1024px)**
  - [ ] Layout híbrido
  - [ ] Navegação otimizada

- [ ] **Desktop (> 1024px)**
  - [ ] Layout completo
  - [ ] Sidebar fixa

## 6. Testes e Validação

### 6.1 Testes Funcionais
- [ ] Todos os fluxos de usuário
- [ ] Formulários e validações
- [ ] Navegação entre páginas
- [ ] Operações CRUD

### 6.2 Testes de Interface
- [ ] Responsividade em todos os breakpoints
- [ ] Estados de loading e erro
- [ ] Animações e transições
- [ ] Acessibilidade (WCAG 2.1)

### 6.3 Testes de Performance
- [ ] Tempo de carregamento inicial
- [ ] Navegação entre páginas
- [ ] Renderização de listas grandes
- [ ] Uso de memória

### 6.4 Testes Cross-browser
- [ ] Chrome (últimas 2 versões)
- [ ] Firefox (últimas 2 versões)
- [ ] Safari (últimas 2 versões)
- [ ] Edge (últimas 2 versões)

## 7. Documentação e Guias

### 7.1 Style Guide
- [ ] Paleta de cores
- [ ] Tipografia
- [ ] Espaçamentos
- [ ] Componentes base
- [ ] Padrões de uso

### 7.2 Guia de Migração
- [ ] Mapeamento MUI → ShadCN
- [ ] Padrões de código
- [ ] Boas práticas
- [ ] Troubleshooting

### 7.3 Documentação Técnica
- [ ] Arquitetura de componentes
- [ ] Sistema de temas
- [ ] Configurações
- [ ] Deploy e build

## 8. Cronograma e Marcos

| Fase | Duração | Marco | Entregáveis |
|------|---------|-------|-------------|
| 1 | Semana 1 | Setup e Base | Componentes base funcionais |
| 2 | Semana 2 | Layout | Sistema de navegação completo |
| 3-4 | Semanas 3-4 | Formulários | Todos os formulários migrados |
| 5 | Semana 5 | Tabelas | Sistema de listagens completo |
| 6 | Semana 6 | Dashboard | Interface principal finalizada |
| 7 | Semana 7 | Refinamentos | Produto final polido |

## 9. Riscos e Mitigações

### 9.1 Riscos Técnicos
- **Incompatibilidade com React Hook Form**
  - *Mitigação:* Criar wrappers de compatibilidade

- **Performance degradada**
  - *Mitigação:* Monitoramento contínuo e otimizações

- **Quebra de funcionalidades**
  - *Mitigação:* Testes extensivos e rollback plan

### 9.2 Riscos de Projeto
- **Prazo apertado**
  - *Mitigação:* Priorização de funcionalidades críticas

- **Resistência dos usuários**
  - *Mitigação:* Treinamento e documentação

## 10. Critérios de Sucesso

- [ ] 100% das funcionalidades mantidas
- [ ] Melhoria na performance (< 3s carregamento inicial)
- [ ] Responsividade completa
- [ ] Acessibilidade WCAG 2.1 AA
- [ ] Satisfação dos usuários > 90%
- [ ] Zero bugs críticos em produção

---

**Status do Projeto:** 🟡 Em Planejamento

**Última Atualização:** Janeiro 2025

**Responsável:** Equipe de Desenvolvimento Frontend