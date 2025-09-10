# Configuração do Frontend para Produção

Este documento descreve como configurar o frontend da aplicação Locador Financial para ambiente de produção.

## Variáveis de Ambiente

### Arquivos de Configuração

- `.env` - Configurações para desenvolvimento
- `.env.production` - Configurações específicas para produção
- `.env.example` - Modelo com todas as variáveis disponíveis

### Variáveis Principais

| Variável | Descrição | Exemplo Desenvolvimento | Exemplo Produção |
|----------|-----------|------------------------|------------------|
| `REACT_APP_API_URL` | URL do backend da API | `http://localhost:8001` | `https://api.seudominio.com` |
| `PORT` | Porta do servidor de desenvolvimento | `5600` | N/A |
| `GENERATE_SOURCEMAP` | Gerar source maps | `false` | `false` |
| `NODE_ENV` | Ambiente de execução | `development` | `production` |
| `REACT_APP_DISABLE_LOGS` | Desabilitar logs | `false` | `true` |

## Configuração para Produção

### 1. Configurar URL do Backend

Edite o arquivo `.env.production` ou defina a variável de ambiente:

```bash
# Para domínio com HTTPS
REACT_APP_API_URL=https://api.seudominio.com

# Para IP específico
REACT_APP_API_URL=http://192.168.1.100:8000

# Para servidor local em produção
REACT_APP_API_URL=http://localhost:8000
```

### 2. Scripts de Build

```bash
# Build padrão
npm run build

# Build específico para produção
npm run build:prod

# Build para staging
npm run build:staging
```

### 3. Configuração Centralizada

O arquivo `src/config/environment.ts` centraliza todas as configurações:

```typescript
// Configuração automática baseada no ambiente
export const config = {
  apiUrl: process.env.REACT_APP_API_URL || defaultUrl,
  environment: 'production' | 'development' | 'staging',
  enableLogs: boolean,
  apiTimeout: number
};
```

## Deploy em Diferentes Ambientes

### Windows Server com IIS

1. **Build da aplicação:**
   ```powershell
   cd src/frontend
   npm install
   $env:REACT_APP_API_URL="http://seu-servidor:8000"
   npm run build:prod
   ```

2. **Configurar IIS:**
   - Copie o conteúdo da pasta `build` para o diretório do site
   - Configure URL Rewrite para SPA
   - Defina variáveis de ambiente no web.config

### Docker

1. **Build com variáveis de ambiente:**
   ```bash
   docker build --build-arg REACT_APP_API_URL=https://api.seudominio.com -t frontend-prod .
   ```

2. **Executar container:**
   ```bash
   docker run -p 80:80 -e REACT_APP_API_URL=https://api.seudominio.com frontend-prod
   ```

### Servidor Linux (Nginx)

1. **Build e deploy:**
   ```bash
   npm run build:prod
   sudo cp -r build/* /var/www/html/
   sudo systemctl reload nginx
   ```

## Configurações de Segurança

### Headers de Segurança

Configure no servidor web (IIS, Nginx, Apache):

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### HTTPS

- **Desenvolvimento:** HTTP é aceitável
- **Produção:** SEMPRE use HTTPS
- Configure certificados SSL/TLS
- Redirecione HTTP para HTTPS

## Verificação da Configuração

### 1. Verificar Variáveis de Ambiente

```javascript
// No console do navegador
console.log('API URL:', process.env.REACT_APP_API_URL);
console.log('Environment:', process.env.NODE_ENV);
```

### 2. Testar Conectividade

```bash
# Testar se o backend está acessível
curl -X GET "http://seu-backend:8000/api/v1/auth/validate"
```

### 3. Logs de Debug

Em desenvolvimento, verifique os logs no console:

```
[API] API Client configured: { baseURL: "...", timeout: 60000, environment: "production" }
[API] Request: GET /auth/me
[API] Response: 200 /auth/me
```

## Solução de Problemas

### Erro: "Network Error" ou "CORS"

**Causa:** Backend não está acessível ou CORS mal configurado

**Solução:**
1. Verifique se `REACT_APP_API_URL` está correto
2. Teste conectividade: `curl http://seu-backend:8000/health`
3. Configure CORS no backend para aceitar o domínio do frontend

### Erro: "404 Not Found" em rotas

**Causa:** Servidor web não configurado para SPA

**Solução:**
- **IIS:** Configure URL Rewrite
- **Nginx:** Configure `try_files $uri $uri/ /index.html;`
- **Apache:** Configure `.htaccess` com RewriteRule

### Erro: Variáveis de ambiente não carregam

**Causa:** Variáveis não começam com `REACT_APP_`

**Solução:**
1. Todas as variáveis customizadas devem começar com `REACT_APP_`
2. Reinicie o servidor de desenvolvimento após alterar `.env`
3. Para produção, defina as variáveis antes do build

### Performance em Produção

**Otimizações:**
1. `GENERATE_SOURCEMAP=false` - Reduz tamanho do bundle
2. `REACT_APP_DISABLE_LOGS=true` - Remove logs de debug
3. Configure compressão gzip no servidor web
4. Use CDN para assets estáticos
5. Configure cache headers apropriados

## Monitoramento

### Logs de Aplicação

```javascript
// Em produção, logs importantes ainda são mantidos
console.error('Server error occurred. Please try again later.');
```

### Health Check

Configure um endpoint de health check:

```javascript
// Verificar se a aplicação consegue se comunicar com o backend
fetch('/api/v1/health')
  .then(response => console.log('Backend status:', response.status))
  .catch(error => console.error('Backend unreachable:', error));
```

## Checklist de Deploy

- [ ] Configurar `REACT_APP_API_URL` para produção
- [ ] Definir `NODE_ENV=production`
- [ ] Configurar `REACT_APP_DISABLE_LOGS=true`
- [ ] Executar `npm run build:prod`
- [ ] Testar build localmente
- [ ] Configurar servidor web (IIS/Nginx/Apache)
- [ ] Configurar HTTPS e certificados
- [ ] Testar todas as funcionalidades
- [ ] Configurar monitoramento e logs
- [ ] Documentar URLs e credenciais de produção