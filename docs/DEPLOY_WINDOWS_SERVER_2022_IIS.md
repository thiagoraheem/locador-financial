# Deploy em Produção - Windows Server 2022 com IIS

## Índice

1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Configurações do IIS](#configurações-do-iis)
3. [Passo a Passo da Implantação](#passo-a-passo-da-implantação)
4. [Configurações de Segurança](#configurações-de-segurança)
5. [Pós-Implantação e Verificação](#pós-implantação-e-verificação)
6. [Solução de Problemas](#solução-de-problemas)

---

## Requisitos do Sistema

### Hardware Mínimo

- **Processador**: Intel/AMD x64 de 2 núcleos, 2.0 GHz ou superior
- **Memória RAM**: 8 GB (recomendado 16 GB)
- **Armazenamento**: 100 GB de espaço livre em disco SSD
- **Rede**: Conexão de internet estável

### Software Necessário

- **Sistema Operacional**: Windows Server 2022 Standard/Datacenter
- **IIS**: Versão 10.0 ou superior
- **Node.js**: Versão 18.x LTS ou superior
- **Python**: Versão 3.11 ou superior
- **PostgreSQL**: Versão 14 ou superior
- **Git**: Para controle de versão

### Componentes do Windows Server

```powershell
# Habilitar recursos necessários via PowerShell
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer
Enable-WindowsOptionalFeature -Online -FeatureName IIS-CommonHttpFeatures
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpErrors
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpLogging
Enable-WindowsOptionalFeature -Online -FeatureName IIS-Security
Enable-WindowsOptionalFeature -Online -FeatureName IIS-RequestFiltering
Enable-WindowsOptionalFeature -Online -FeatureName IIS-StaticContent
Enable-WindowsOptionalFeature -Online -FeatureName IIS-DefaultDocument
Enable-WindowsOptionalFeature -Online -FeatureName IIS-DirectoryBrowsing
```

---

## Configurações do IIS

### 1. Instalação de Módulos Adicionais

#### URL Rewrite Module
```powershell
# Download e instalação do URL Rewrite Module
Invoke-WebRequest -Uri "https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_en-US.msi" -OutFile "rewrite_amd64.msi"
Start-Process msiexec.exe -Wait -ArgumentList '/i rewrite_amd64.msi /quiet'
```

#### Application Request Routing (ARR)
```powershell
# Download e instalação do ARR
Invoke-WebRequest -Uri "https://download.microsoft.com/download/E/9/8/E9849D6A-020E-47E4-9FD0-A023E99B54EB/requestRouter_amd64.msi" -OutFile "requestRouter_amd64.msi"
Start-Process msiexec.exe -Wait -ArgumentList '/i requestRouter_amd64.msi /quiet'
```

### 2. Configuração de Application Pool

```powershell
# Criar Application Pool para o backend
Import-Module WebAdministration
New-WebAppPool -Name "LocadorFinancialBackend" -Force
Set-ItemProperty -Path "IIS:\AppPools\LocadorFinancialBackend" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"
Set-ItemProperty -Path "IIS:\AppPools\LocadorFinancialBackend" -Name "recycling.periodicRestart.time" -Value "00:00:00"
Set-ItemProperty -Path "IIS:\AppPools\LocadorFinancialBackend" -Name "processModel.idleTimeout" -Value "00:00:00"

# Criar Application Pool para o frontend
New-WebAppPool -Name "LocadorFinancialFrontend" -Force
Set-ItemProperty -Path "IIS:\AppPools\LocadorFinancialFrontend" -Name "processModel.identityType" -Value "ApplicationPoolIdentity"
```

### 3. Configuração de Sites

```powershell
# Remover site padrão
Remove-Website -Name "Default Web Site" -ErrorAction SilentlyContinue

# Criar site para frontend
New-Website -Name "LocadorFinancialFrontend" -Port 80 -PhysicalPath "C:\inetpub\wwwroot\locador-financial\frontend" -ApplicationPool "LocadorFinancialFrontend"

# Criar aplicação para backend
New-WebApplication -Site "LocadorFinancialFrontend" -Name "api" -PhysicalPath "C:\inetpub\wwwroot\locador-financial\backend" -ApplicationPool "LocadorFinancialBackend"
```

---

## Passo a Passo da Implantação

### 1. Preparação do Ambiente

#### Criar Estrutura de Diretórios
```powershell
# Criar diretórios principais
New-Item -ItemType Directory -Path "C:\inetpub\wwwroot\locador-financial" -Force
New-Item -ItemType Directory -Path "C:\inetpub\wwwroot\locador-financial\frontend" -Force
New-Item -ItemType Directory -Path "C:\inetpub\wwwroot\locador-financial\backend" -Force
New-Item -ItemType Directory -Path "C:\logs\locador-financial" -Force
```

#### Configurar Permissões
```powershell
# Conceder permissões ao IIS_IUSRS
icacls "C:\inetpub\wwwroot\locador-financial" /grant "IIS_IUSRS:(OI)(CI)F" /T
icacls "C:\logs\locador-financial" /grant "IIS_IUSRS:(OI)(CI)F" /T
```

### 2. Deploy do Backend

#### Clonar e Preparar o Código
```powershell
# Navegar para o diretório de trabalho
cd C:\temp

# Clonar o repositório
git clone <URL_DO_REPOSITORIO> locador-financial-deploy
cd locador-financial-deploy

# Instalar dependências Python
cd src\backend
pip install -r requirements-prod.txt
```

#### Configurar Variáveis de Ambiente
```powershell
# Criar arquivo .env para produção
@"
DATABASE_URL=postgresql://usuario:senha@localhost:5432/locador_financial
SECRET_KEY=sua_chave_secreta_muito_segura_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production
DEBUG=False
CORS_ORIGINS=["https://seudominio.com"]
"@ | Out-File -FilePath "C:\inetpub\wwwroot\locador-financial\backend\.env" -Encoding UTF8
```

#### Copiar Arquivos do Backend
```powershell
# Copiar arquivos do backend
robocopy "src\backend" "C:\inetpub\wwwroot\locador-financial\backend" /E /XD __pycache__ .pytest_cache venv
```

#### Configurar web.config para FastAPI
```xml
<!-- C:\inetpub\wwwroot\locador-financial\backend\web.config -->
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="PythonHandler" path="*" verb="*" modules="httpPlatformHandler" resourceType="Unspecified" />
    </handlers>
    <httpPlatform processPath="C:\Python311\python.exe"
                  arguments="-m uvicorn app.main:app --host 0.0.0.0 --port %HTTP_PLATFORM_PORT%"
                  stdoutLogEnabled="true"
                  stdoutLogFile="C:\logs\locador-financial\backend.log"
                  startupTimeLimit="60"
                  requestTimeout="00:04:00" />
  </system.webServer>
</configuration>
```

### 3. Deploy do Frontend

#### Build da Aplicação React
```powershell
# Navegar para o frontend
cd C:\temp\locador-financial-deploy\src\frontend

# Instalar dependências
npm ci --production

# Configurar variáveis de ambiente para produção
@"
REACT_APP_API_URL=https://seudominio.com/api
REACT_APP_ENVIRONMENT=production
"@ | Out-File -FilePath ".env.production" -Encoding UTF8

# Build da aplicação
npm run build

# Copiar arquivos buildados
robocopy "build" "C:\inetpub\wwwroot\locador-financial\frontend" /E
```

#### Configurar web.config para React SPA
```xml
<!-- C:\inetpub\wwwroot\locador-financial\frontend\web.config -->
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
    </staticContent>
  </system.webServer>
</configuration>
```

### 4. Configuração do Banco de Dados

```powershell
# Executar migrações (se aplicável)
cd C:\inetpub\wwwroot\locador-financial\backend
python -c "from app.core.database import create_tables; create_tables()"
```

---

## Configurações de Segurança

### 1. Configurações do IIS

#### Remover Headers Desnecessários
```xml
<!-- Adicionar ao web.config do site principal -->
<system.webServer>
  <httpProtocol>
    <customHeaders>
      <remove name="X-Powered-By" />
      <add name="X-Frame-Options" value="DENY" />
      <add name="X-Content-Type-Options" value="nosniff" />
      <add name="X-XSS-Protection" value="1; mode=block" />
      <add name="Strict-Transport-Security" value="max-age=31536000; includeSubDomains" />
    </customHeaders>
  </httpProtocol>
</system.webServer>
```

#### Configurar Request Filtering
```powershell
# Limitar tamanho de requisições
Set-WebConfigurationProperty -Filter "system.webServer/security/requestFiltering/requestLimits" -Name "maxAllowedContentLength" -Value 52428800 -PSPath "IIS:\Sites\LocadorFinancialFrontend"

# Bloquear extensões perigosas
Add-WebConfigurationProperty -Filter "system.webServer/security/requestFiltering/fileExtensions" -Name "." -Value @{fileExtension=".exe"; allowed="false"} -PSPath "IIS:\Sites\LocadorFinancialFrontend"
Add-WebConfigurationProperty -Filter "system.webServer/security/requestFiltering/fileExtensions" -Name "." -Value @{fileExtension=".bat"; allowed="false"} -PSPath "IIS:\Sites\LocadorFinancialFrontend"
```

### 2. Configurações do Windows Server

#### Firewall
```powershell
# Configurar regras de firewall
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# Bloquear portas desnecessárias
New-NetFirewallRule -DisplayName "Block Python Direct" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Block
```

#### Configurar SSL/TLS
```powershell
# Instalar certificado SSL (exemplo com Let's Encrypt)
# Instalar win-acme
Invoke-WebRequest -Uri "https://github.com/win-acme/win-acme/releases/latest/download/win-acme.v2.2.0.1431.x64.pluggable.zip" -OutFile "win-acme.zip"
Expand-Archive -Path "win-acme.zip" -DestinationPath "C:\tools\win-acme"

# Executar para obter certificado
cd C:\tools\win-acme
.\wacs.exe --target iis --siteid 1 --installation iis --emailaddress admin@seudominio.com
```

### 3. Configurações de Usuário e Permissões

```powershell
# Criar usuário específico para a aplicação
New-LocalUser -Name "LocadorFinancialApp" -Password (ConvertTo-SecureString "SenhaSegura123!" -AsPlainText -Force) -Description "Usuario para aplicacao Locador Financial"

# Configurar Application Pool para usar o usuário específico
Set-ItemProperty -Path "IIS:\AppPools\LocadorFinancialBackend" -Name "processModel.identityType" -Value "SpecificUser"
Set-ItemProperty -Path "IIS:\AppPools\LocadorFinancialBackend" -Name "processModel.userName" -Value "LocadorFinancialApp"
Set-ItemProperty -Path "IIS:\AppPools\LocadorFinancialBackend" -Name "processModel.password" -Value "SenhaSegura123!"
```

---

## Pós-Implantação e Verificação

### 1. Testes de Funcionalidade

#### Verificar Status dos Sites
```powershell
# Verificar status dos Application Pools
Get-IISAppPool | Where-Object {$_.Name -like "*LocadorFinancial*"} | Select-Object Name, State

# Verificar status dos Sites
Get-IISSite | Where-Object {$_.Name -like "*LocadorFinancial*"} | Select-Object Name, State
```

#### Testes de Conectividade
```powershell
# Testar frontend
Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing

# Testar backend
Invoke-WebRequest -Uri "http://localhost/api/docs" -UseBasicParsing
```

### 2. Configuração de Monitoramento

#### Logs do IIS
```powershell
# Habilitar logs detalhados
Set-WebConfigurationProperty -Filter "system.webServer/httpLogging" -Name "enabled" -Value $true -PSPath "IIS:\Sites\LocadorFinancialFrontend"
Set-WebConfigurationProperty -Filter "system.webServer/httpLogging" -Name "logExtFileFlags" -Value "Date,Time,ClientIP,UserName,SiteName,ComputerName,ServerIP,Method,UriStem,UriQuery,HttpStatus,Win32Status,BytesSent,BytesRecv,TimeTaken,ServerPort,UserAgent,Cookie,Referer,ProtocolVersion,Host,HttpSubStatus" -PSPath "IIS:\Sites\LocadorFinancialFrontend"
```

#### Configurar Event Viewer
```powershell
# Criar log personalizado
New-EventLog -LogName "LocadorFinancial" -Source "LocadorFinancialApp"
```

### 3. Backup e Recuperação

```powershell
# Script de backup automático
$backupPath = "C:\Backups\LocadorFinancial\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupPath -Force

# Backup dos arquivos da aplicação
robocopy "C:\inetpub\wwwroot\locador-financial" "$backupPath\app" /E

# Backup da configuração do IIS
Backup-WebConfiguration -Name "LocadorFinancial_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# Backup do banco de dados (PostgreSQL)
pg_dump -h localhost -U usuario -d locador_financial > "$backupPath\database.sql"
```

---

## Solução de Problemas

### 1. Problemas Comuns do IIS

#### Erro 500.19 - Configuração Inválida
```powershell
# Verificar sintaxe do web.config
$configPath = "C:\inetpub\wwwroot\locador-financial\frontend\web.config"
Test-Path $configPath

# Validar XML
[xml]$config = Get-Content $configPath
if ($config) { Write-Host "web.config válido" } else { Write-Host "web.config inválido" }
```

#### Erro 502.3 - Bad Gateway
```powershell
# Verificar se o Python está funcionando
cd C:\inetpub\wwwroot\locador-financial\backend
python -c "import app.main; print('OK')"

# Verificar logs do Application Pool
Get-EventLog -LogName Application -Source "Application Error" -Newest 10
```

#### Erro 404 - Não Encontrado
```powershell
# Verificar URL Rewrite
Get-WebConfigurationProperty -Filter "system.webServer/rewrite/rules" -PSPath "IIS:\Sites\LocadorFinancialFrontend"

# Testar regras manualmente
Test-WebConfigurationProperty -Filter "system.webServer/rewrite/rules/rule[@name='React Routes']" -PSPath "IIS:\Sites\LocadorFinancialFrontend"
```

### 2. Problemas de Performance

#### Monitoramento de Recursos
```powershell
# Verificar uso de CPU e memória
Get-Process -Name "w3wp" | Select-Object ProcessName, CPU, WorkingSet

# Verificar conexões ativas
netstat -an | findstr :80
netstat -an | findstr :443
```

#### Otimização do Application Pool
```powershell
# Configurar limites de memória
Set-ItemProperty -Path "IIS:\AppPools\LocadorFinancialBackend" -Name "recycling.periodicRestart.memory" -Value 1048576  # 1GB

# Configurar múltiplos worker processes
Set-ItemProperty -Path "IIS:\AppPools\LocadorFinancialBackend" -Name "processModel.maxProcesses" -Value 2
```

### 3. Problemas de Conectividade

#### Verificar Conectividade com Banco de Dados
```powershell
# Testar conexão PostgreSQL
cd C:\inetpub\wwwroot\locador-financial\backend
python -c "
from app.core.database import engine
try:
    with engine.connect() as conn:
        print('Conexão com banco OK')
except Exception as e:
    print(f'Erro na conexão: {e}')
"
```

#### Verificar Configurações de CORS
```powershell
# Testar CORS via PowerShell
$headers = @{
    'Origin' = 'https://seudominio.com'
    'Access-Control-Request-Method' = 'GET'
}
Invoke-WebRequest -Uri "http://localhost/api/v1/contas-receber/" -Headers $headers -Method OPTIONS
```

### 4. Scripts de Diagnóstico

#### Script Completo de Verificação
```powershell
# Diagnóstico completo do sistema
function Test-LocadorFinancialDeployment {
    Write-Host "=== Diagnóstico do Deploy Locador Financial ===" -ForegroundColor Green
    
    # Verificar serviços
    Write-Host "\n1. Verificando Application Pools..." -ForegroundColor Yellow
    Get-IISAppPool | Where-Object {$_.Name -like "*LocadorFinancial*"} | Format-Table Name, State
    
    # Verificar sites
    Write-Host "\n2. Verificando Sites..." -ForegroundColor Yellow
    Get-IISSite | Where-Object {$_.Name -like "*LocadorFinancial*"} | Format-Table Name, State
    
    # Verificar arquivos
    Write-Host "\n3. Verificando Arquivos..." -ForegroundColor Yellow
    $paths = @(
        "C:\inetpub\wwwroot\locador-financial\frontend\index.html",
        "C:\inetpub\wwwroot\locador-financial\backend\app\main.py",
        "C:\inetpub\wwwroot\locador-financial\backend\.env"
    )
    
    foreach ($path in $paths) {
        if (Test-Path $path) {
            Write-Host "✓ $path" -ForegroundColor Green
        } else {
            Write-Host "✗ $path" -ForegroundColor Red
        }
    }
    
    # Testar conectividade
    Write-Host "\n4. Testando Conectividade..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing -TimeoutSec 10
        Write-Host "✓ Frontend acessível (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "✗ Frontend inacessível: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/api/docs" -UseBasicParsing -TimeoutSec 10
        Write-Host "✓ Backend acessível (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "✗ Backend inacessível: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "\n=== Diagnóstico Concluído ===" -ForegroundColor Green
}

# Executar diagnóstico
Test-LocadorFinancialDeployment
```

---

## Contatos e Suporte

Para suporte técnico ou dúvidas sobre o deploy:

- **Documentação**: Consulte os arquivos na pasta `docs/`
- **Logs**: Verifique `C:\logs\locador-financial\`
- **Configurações**: Revise os arquivos `web.config` e `.env`

---

*Última atualização: $(Get-Date -Format 'dd/MM/yyyy HH:mm')*