# Financial Web Application
Aplicativo web financeiro para o sistema Locador desenvolvido com FastAPI (backend) e React (frontend).

## Requisitos Principais

- **Autenticação**: Integração com tabela `tbl_Funcionarios` existente usando SHA-256 e JWT
- **Localização**: Interface completa em português brasileiro (pt-BR)
- **Módulos Financeiros**: Lançamentos, contas a pagar/receber, categorias
- **Dashboard**: Relatórios e indicadores financeiros
- **Audit Trail**: Rastreamento completo de usuários em todas as operações

## Tecnologias

### Backend
- Python 3.10+ com FastAPI
- SQLAlchemy ORM
- SQL Server (integração com banco existente)
- JWT para autenticação
- Alembic para migrações

### Frontend
- React 18+ com TypeScript
- Material-UI (MUI) para componentes
- Redux Toolkit para estado global
- React Query para estado do servidor
- react-i18next para localização pt-BR
- React Hook Form com validação

## Estrutura do Projeto

```
locador-financial/
├── src/
│   ├── backend/          # API FastAPI
│   │   ├── app/
│   │   │   ├── api/      # Rotas da API
│   │   │   ├── auth/     # Sistema de autenticação
│   │   │   ├── core/     # Configurações centrais
│   │   │   ├── models/   # Modelos SQLAlchemy
│   │   │   ├── schemas/  # Schemas Pydantic
│   │   │   └── services/ # Lógica de negócio
│   │   └── requirements.txt
│   └── frontend/         # SPA React
│       ├── src/
│       │   ├── components/  # Componentes reutilizáveis
│       │   ├── features/    # Módulos por funcionalidade
│       │   ├── hooks/       # Hooks personalizados
│       │   ├── i18n/        # Localização pt-BR
│       │   ├── services/    # Clientes API
│       │   └── store/       # Redux store
│       └── package.json
├── docs/                 # Documentação do projeto
├── docker-compose.yml    # Configuração Docker
└── README.md
```

## Início Rápido

### Desenvolvimento com Docker

1. Clone o repositório
2. Execute: `docker-compose up --build`
3. Acesse:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - Swagger UI: http://localhost:8000/docs

### Desenvolvimento Local

#### Backend
```bash
cd src/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd src/frontend
npm install
npm start
```

## Funcionalidades Principais

### Autenticação
- Login com credenciais da tabela `tbl_Funcionarios`
- Verificação de hash SHA-256 
- Suporte a senha master do sistema
- JWT com renovação automática
- Auditoria de tentativas de login

### Módulos Financeiros
- **Lançamentos**: Cadastro de receitas e despesas
- **Contas a Pagar**: Gestão de fornecedores e pagamentos
- **Contas a Receber**: Gestão de clientes e recebimentos
- **Categorias**: Organização hierárquica de classificações

### Dashboard e Relatórios
- Indicadores financeiros em tempo real
- Fluxo de caixa projetado
- Relatórios de receitas vs despesas
- Contas em aberto e vencimentos

### Recursos Técnicos
- Interface 100% em português brasileiro
- Design responsivo para mobile e desktop
- Validação de dados em tempo real
- Formatação automática de moeda (BRL)
- Datas e horários no formato brasileiro

## Configuração

### Variáveis de Ambiente (Backend)
```env
DATABASE_URI=mssql+pyodbc://user:pass@server/database
SECRET_KEY=your-jwt-secret-key
CORS_ORIGINS=http://localhost:3000
```

### Configuração do Frontend
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_LOCALES=pt-BR
```

## Testes

### Backend
```bash
cd src/backend
pytest tests/ -v --cov=app
```

### Frontend
```bash
cd src/frontend
npm test
```

## Documentação

- [Planejamento Detalhado](docs/planejamento-app-web-financeiro.md)
- [Exemplos de Código](docs/exemplos-codigo-app-web-financeiro.md)
- [API Documentation](http://localhost:8000/docs) (quando executando)

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto é propriedade do sistema Locador.