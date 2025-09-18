# Manual do Usuário - Locador Financial

## Índice
1. [Visão Geral](#visão-geral)
2. [Instalação](#instalação)
3. [Configuração](#configuração)
4. [Guia de Uso](#guia-de-uso)
5. [Módulos do Sistema](#módulos-do-sistema)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

## Visão Geral

O Locador Financial é um sistema completo de gestão financeira para locadoras, oferecendo:
- Dashboard com métricas em tempo real
- Gestão de lançamentos financeiros
- Relatórios detalhados
- Interface moderna e responsiva
- Autenticação segura

## Instalação

### Pré-requisitos
- Node.js 18+ instalado
- npm ou pnpm
- Banco de dados PostgreSQL (via Supabase)

### Passos de Instalação

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd locador-financial
   ```

2. **Instale as dependências do backend:**
   ```bash
   cd api
   npm install
   ```

3. **Instale as dependências do frontend:**
   ```bash
   cd ../src/frontend
   npm install
   ```

4. **Configure as variáveis de ambiente:**
   - Copie `.env.example` para `.env` em ambas as pastas
   - Configure as credenciais do Supabase

## Configuração

### Configuração do Backend

1. **Arquivo `.env` na pasta `api/`:**
   ```env
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_ANON_KEY=sua_chave_anonima
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
   PORT=8001
   ```

2. **Configuração do Banco de Dados:**
   - Execute as migrações SQL na pasta `supabase/migrations/`
   - Configure as políticas RLS no Supabase

### Configuração do Frontend

1. **Arquivo `.env` na pasta `src/frontend/`:**
   ```env
   REACT_APP_API_URL=http://localhost:8001
   REACT_APP_SUPABASE_URL=sua_url_do_supabase
   REACT_APP_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

## Guia de Uso

### Iniciando o Sistema

1. **Inicie o backend:**
   ```bash
   cd api
   npm run dev
   ```

2. **Inicie o frontend:**
   ```bash
   cd src/frontend
   npm start
   ```

3. **Acesse o sistema:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001

### Primeiro Acesso

1. **Cadastro de Usuário:**
   - Acesse a página de login
   - Clique em "Criar conta"
   - Preencha os dados solicitados
   - Confirme o email (se configurado)

2. **Login:**
   - Use suas credenciais para acessar
   - Será redirecionado para o dashboard

## Módulos do Sistema

### 1. Dashboard
- **Localização:** Página inicial após login
- **Funcionalidades:**
  - Visão geral das métricas financeiras
  - Gráficos de receitas e despesas
  - Resumo de lançamentos recentes
  - Indicadores de performance

### 2. Lançamentos
- **Localização:** Menu "Lançamentos"
- **Funcionalidades:**
  - Cadastro de receitas e despesas
  - Edição de lançamentos existentes
  - Filtros por data, tipo e categoria
  - Exportação de dados

**Como usar:**
1. Clique em "Novo Lançamento"
2. Preencha os campos obrigatórios:
   - Descrição
   - Valor
   - Tipo (Receita/Despesa)
   - Data
   - Categoria
3. Clique em "Salvar"

### 3. Relatórios
- **Localização:** Menu "Relatórios"
- **Funcionalidades:**
  - Relatórios por período
  - Análise de categorias
  - Gráficos comparativos
  - Exportação em PDF/Excel

### 4. Configurações
- **Localização:** Menu do usuário
- **Funcionalidades:**
  - Perfil do usuário
  - Configurações de conta
  - Preferências do sistema

## Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com API
**Sintoma:** Mensagens de erro "Falha na conexão"
**Solução:**
- Verifique se o backend está rodando
- Confirme a URL da API no arquivo `.env`
- Verifique as configurações de CORS

#### 2. Erro de Autenticação
**Sintoma:** Não consegue fazer login
**Solução:**
- Verifique as credenciais do Supabase
- Confirme se o usuário está cadastrado
- Limpe o cache do navegador

#### 3. Dados Não Carregam
**Sintoma:** Telas em branco ou loading infinito
**Solução:**
- Verifique as políticas RLS no Supabase
- Confirme as permissões do usuário
- Verifique os logs do console

#### 4. Erro de Build
**Sintoma:** Falha ao executar `npm run build`
**Solução:**
- Execute `npm install` novamente
- Verifique se todas as dependências estão instaladas
- Limpe o cache: `npm cache clean --force`

### Logs e Debugging

1. **Frontend:**
   - Abra o DevTools do navegador (F12)
   - Verifique a aba Console para erros
   - Monitore a aba Network para requisições

2. **Backend:**
   - Logs aparecem no terminal onde o servidor está rodando
   - Verifique os logs do Supabase no dashboard

## FAQ

### Perguntas Gerais

**Q: Como faço backup dos dados?**
A: Os dados são armazenados no Supabase. Use o dashboard do Supabase para fazer backup do banco de dados.

**Q: Posso usar outro banco de dados?**
A: O sistema foi desenvolvido para Supabase/PostgreSQL. Mudanças requerem alterações no código.

**Q: Como adicionar novos usuários?**
A: Novos usuários podem se cadastrar pela tela de login ou serem adicionados via dashboard do Supabase.

**Q: O sistema funciona offline?**
A: Não, o sistema requer conexão com internet para acessar a API e banco de dados.

### Perguntas Técnicas

**Q: Como personalizar o tema?**
A: Edite as variáveis CSS no arquivo `src/frontend/src/index.css` ou configure o Tailwind.

**Q: Como adicionar novos campos?**
A: 
1. Atualize o schema do banco no Supabase
2. Modifique os tipos TypeScript
3. Atualize os formulários no frontend
4. Ajuste as APIs no backend

**Q: Como fazer deploy em produção?**
A:
1. Configure as variáveis de ambiente de produção
2. Execute `npm run build` no frontend
3. Configure um servidor web (Nginx, Apache)
4. Deploy do backend em um serviço como Heroku ou Vercel

**Q: Como monitorar performance?**
A: Use ferramentas como:
- Google Analytics para frontend
- Logs do Supabase para banco de dados
- Monitoring tools para o servidor

### Suporte

Para suporte adicional:
- Consulte a documentação técnica em `docs/`
- Verifique os logs de erro
- Entre em contato com a equipe de desenvolvimento

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2025  
**Desenvolvido por:** Equipe Locador Financial