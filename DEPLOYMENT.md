# Instruções de Desenvolvimento e Produção

## Desenvolvimento Local

### Pré-requisitos
- Python 3.10+
- Node.js 18+
- SQL Server
- Docker (opcional)

### Configuração Backend
```bash
cd src/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Editar .env com configurações do banco
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Configuração Frontend
```bash
cd src/frontend
npm install
npm start
```

### Desenvolvimento com Docker
```bash
# Iniciar todos os serviços
docker-compose up --build

# Apenas backend
docker-compose up backend

# Apenas frontend
docker-compose up frontend
```

## Produção

### Docker Compose (Recomendado)
```bash
# Produção
docker-compose -f docker-compose.prod.yml up -d

# Build e deploy
docker-compose -f docker-compose.prod.yml up --build -d
```

### Configurações de Ambiente

#### Backend (.env)
```
DATABASE_URI=mssql+pyodbc://user:pass@host:1433/database?driver=ODBC+Driver+17+for+SQL+Server
SECRET_KEY=production-secret-key-very-long-and-secure
CORS_ORIGINS=["https://your-domain.com"]
ACCESS_TOKEN_EXPIRE_HOURS=24
```

#### Frontend (.env)
```
REACT_APP_API_URL=https://api.your-domain.com
```

## Migrações de Banco de Dados

```bash
cd src/backend
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Monitoramento

### Logs
```bash
# Ver logs em tempo real
docker-compose logs -f backend
docker-compose logs -f frontend

# Logs específicos
docker-compose logs --tail=100 backend
```

### Health Checks
- Backend: http://localhost:8000/health
- Frontend: http://localhost:3000

## Backup e Restauração

### Banco de Dados
```bash
# Backup
sqlcmd -S localhost -d LocadorDB -E -Q "BACKUP DATABASE LocadorDB TO DISK='backup.bak'"

# Restore
sqlcmd -S localhost -E -Q "RESTORE DATABASE LocadorDB FROM DISK='backup.bak'"
```

## Troubleshooting

### Problemas Comuns
1. **Erro de conexão com banco**: Verificar string de conexão e drivers ODBC
2. **CORS errors**: Configurar CORS_ORIGINS no backend
3. **Token expirado**: Fazer logout/login novamente
4. **Erro de build**: Limpar cache do Docker `docker system prune`

### Performance
- **Backend**: Configurar connection pool, cache Redis
- **Frontend**: Build otimizado, lazy loading
- **Database**: Índices, query optimization