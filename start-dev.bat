@echo off
REM Script de inicialização para desenvolvimento no Windows

echo 🚀 Iniciando Sistema Financeiro Locador...

REM Verificar se Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker não encontrado. Por favor, instale o Docker primeiro.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose não encontrado. Por favor, instale o Docker Compose primeiro.
    pause
    exit /b 1
)

REM Criar arquivos .env se não existirem
if not exist "src\backend\.env" (
    echo 📝 Criando arquivo .env para o backend...
    copy "src\backend\.env.example" "src\backend\.env"
    echo ✅ Arquivo .env criado. Por favor, configure suas variáveis de ambiente.
)

REM Parar containers existentes
echo 🛑 Parando containers existentes...
docker-compose down

REM Construir e iniciar containers
echo 🔨 Construindo e iniciando containers...
docker-compose up --build -d

REM Aguardar serviços subirem
echo ⏳ Aguardando serviços iniciarem...
timeout /t 10 /nobreak >nul

REM Verificar status dos serviços
echo 🔍 Verificando status dos serviços...

REM Verificar backend
curl -f http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend: OK (http://localhost:8000)
) else (
    echo ❌ Backend: Falha ao conectar
)

REM Verificar frontend
curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend: OK (http://localhost:3000)
) else (
    echo ❌ Frontend: Falha ao conectar
)

echo.
echo 🎉 Sistema iniciado!
echo.
echo 📋 URLs úteis:
echo    Frontend: http://localhost:3000
echo    Backend: http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo    Health Check: http://localhost:8000/health
echo.
echo 📊 Para ver logs:
echo    docker-compose logs -f backend
echo    docker-compose logs -f frontend
echo.
echo 🛑 Para parar:
echo    docker-compose down
echo.
pause