# Script PowerShell para gerenciar os serviços do Sistema Financeiro Locador
# Autor: Sistema Locador
# Versão: 1.0

param(
    [string]$Action = "start",
    [string]$Service = "all",
    [switch]$Logs,
    [switch]$Status,
    [switch]$Help
)

# Configurações
$BACKEND_DIR = "src\backend"
$FRONTEND_DIR = "src\frontend"
$BACKEND_PORT = 8001
$FRONTEND_PORT = 5600
$LOG_DIR = "logs"
$PID_FILE = "services.pid"

# Cores para output
$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Show-Help {
    Write-ColorOutput "=== Sistema Financeiro Locador - Gerenciador de Serviços ===" "Header"
    Write-Host ""
    Write-Host "USO: .\start-services.ps1 [OPÇÕES]"
    Write-Host ""
    Write-Host "AÇÕES:"
    Write-Host "  -Action start     Inicia os serviços (padrão)"
    Write-Host "  -Action stop      Para todos os serviços"
    Write-Host "  -Action restart   Reinicia os serviços"
    Write-Host "  -Action status    Verifica status dos serviços"
    Write-Host ""
    Write-Host "SERVIÇOS:"
    Write-Host "  -Service all       Todos os serviços (padrão)"
    Write-Host "  -Service backend   Apenas o backend"
    Write-Host "  -Service frontend  Apenas o frontend"
    Write-Host ""
    Write-Host "OPÇÕES:"
    Write-Host "  -Logs             Exibe logs em tempo real"
    Write-Host "  -Status           Verifica apenas o status"
    Write-Host "  -Help             Exibe esta ajuda"
    Write-Host ""
    Write-Host "EXEMPLOS:"
    Write-Host "  .\start-services.ps1                    # Inicia todos os serviços"
    Write-Host "  .\start-services.ps1 -Action stop       # Para todos os serviços"
    Write-Host "  .\start-services.ps1 -Service backend   # Inicia apenas o backend"
    Write-Host "  .\start-services.ps1 -Logs              # Inicia e mostra logs"
    Write-Host "  .\start-services.ps1 -Status            # Verifica status"
}

function Test-Prerequisites {
    Write-ColorOutput "🔍 Verificando pré-requisitos..." "Info"
    
    $errors = @()
    
    # Verificar Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-ColorOutput "✅ Node.js: $nodeVersion" "Success"
        } else {
            $errors += "Node.js não encontrado"
        }
    } catch {
        $errors += "Node.js não encontrado"
    }
    
    # Verificar Python
    try {
        $pythonVersion = python --version 2>$null
        if ($pythonVersion) {
            Write-ColorOutput "✅ Python: $pythonVersion" "Success"
        } else {
            $errors += "Python não encontrado"
        }
    } catch {
        $errors += "Python não encontrado"
    }
    
    # Verificar pip
    try {
        $pipVersion = pip --version 2>$null
        if ($pipVersion) {
            Write-ColorOutput "✅ Pip instalado" "Success"
        } else {
            $errors += "Pip não encontrado"
        }
    } catch {
        $errors += "Pip não encontrado"
    }
    
    # Verificar estrutura do projeto
    if (!(Test-Path $BACKEND_DIR)) {
        $errors += "Diretório do backend não encontrado: $BACKEND_DIR"
    }
    
    if (!(Test-Path $FRONTEND_DIR)) {
        $errors += "Diretório do frontend não encontrado: $FRONTEND_DIR"
    }
    
    if (!(Test-Path "$BACKEND_DIR\requirements.txt")) {
        $errors += "Arquivo requirements.txt não encontrado no backend"
    }
    
    if (!(Test-Path "$FRONTEND_DIR\package.json")) {
        $errors += "Arquivo package.json não encontrado no frontend"
    }
    
    if ($errors.Count -gt 0) {
        Write-ColorOutput "❌ Erros encontrados:" "Error"
        foreach ($error in $errors) {
            Write-ColorOutput "   - $error" "Error"
        }
        return $false
    }
    
    Write-ColorOutput "✅ Todos os pré-requisitos atendidos" "Success"
    return $true
}

function Install-Dependencies {
    Write-ColorOutput "📦 Verificando e instalando dependências..." "Info"
    
    # Backend dependencies
    if ($Service -eq "all" -or $Service -eq "backend") {
        Write-ColorOutput "📦 Instalando dependências do backend..." "Info"
        Push-Location $BACKEND_DIR
        try {
            if (!(Test-Path "venv")) {
                Write-ColorOutput "🔨 Criando ambiente virtual..." "Info"
                python -m venv venv
            }
            
            Write-ColorOutput "🔨 Ativando ambiente virtual e instalando dependências..." "Info"
            & ".\venv\Scripts\Activate.ps1"
            pip install -r requirements.txt
            
            Write-ColorOutput "✅ Dependências do backend instaladas" "Success"
        } catch {
            $errorMsg = $_.Exception.Message
            Write-ColorOutput "❌ Erro ao instalar dependências do backend: $errorMsg" "Error"
            Pop-Location
            return $false
        }
        Pop-Location
    }
    
    # Frontend dependencies
    if ($Service -eq "all" -or $Service -eq "frontend") {
        Write-ColorOutput "📦 Instalando dependências do frontend..." "Info"
        Push-Location $FRONTEND_DIR
        try {
            if (!(Test-Path "node_modules")) {
                npm install
            } else {
                Write-ColorOutput "✅ Dependências do frontend já instaladas" "Success"
            }
        } catch {
            $errorMsg = $_.Exception.Message
            Write-ColorOutput "❌ Erro ao instalar dependências do frontend: $errorMsg" "Error"
            Pop-Location
            return $false
        }
        Pop-Location
    }
    
    return $true
}

function Test-Port {
    param([int]$Port)
    
    try {
        $connection = Test-NetConnection -ComputerName "localhost" -Port $Port -WarningAction SilentlyContinue
        return $connection.TcpTestSucceeded
    } catch {
        return $false
    }
}

function Wait-ForService {
    param([int]$Port, [string]$ServiceName, [int]$TimeoutSeconds = 60)
    
    Write-ColorOutput "⏳ Aguardando $ServiceName iniciar na porta $Port..." "Info"
    
    $timeout = (Get-Date).AddSeconds($TimeoutSeconds)
    
    while ((Get-Date) -lt $timeout) {
        if (Test-Port $Port) {
            Write-ColorOutput "✅ $ServiceName está rodando na porta $Port" "Success"
            return $true
        }
        Start-Sleep -Seconds 2
    }
    
    Write-ColorOutput "❌ Timeout: $ServiceName não iniciou em $TimeoutSeconds segundos" "Error"
    return $false
}

function Start-BackendService {
    Write-ColorOutput "🚀 Iniciando serviço do backend..." "Info"
    
    if (Test-Port $BACKEND_PORT) {
        Write-ColorOutput "⚠️ Backend já está rodando na porta $BACKEND_PORT" "Warning"
        return $true
    }
    
    try {
        # Criar diretório de logs se não existir
        if (!(Test-Path $LOG_DIR)) {
            New-Item -ItemType Directory -Path $LOG_DIR | Out-Null
        }
        
        # Criar arquivo .env se não existir
        if (!(Test-Path "$BACKEND_DIR\.env")) {
            if (Test-Path "$BACKEND_DIR\.env.example") {
                Copy-Item "$BACKEND_DIR\.env.example" "$BACKEND_DIR\.env"
                Write-ColorOutput "📝 Arquivo .env criado a partir do .env.example" "Info"
            }
        }
        
        Push-Location $BACKEND_DIR
        
        # Iniciar backend em processo separado
        $backendProcess = Start-Process -FilePath "powershell" -ArgumentList @(
            "-Command",
            "& '.\venv\Scripts\Activate.ps1'; uvicorn app.main:app --host 0.0.0.0 --port $BACKEND_PORT --reload"
        ) -WindowStyle Normal -PassThru
        
        Pop-Location
        
        # Salvar PID
        $backendProcess.Id | Out-File -FilePath "$LOG_DIR\backend.pid" -Encoding UTF8
        
        # Aguardar serviço iniciar
        if (Wait-ForService $BACKEND_PORT "Backend" 30) {
            Write-ColorOutput "✅ Backend iniciado com sucesso (PID: $($backendProcess.Id))" "Success"
            return $true
        } else {
            Write-ColorOutput "❌ Falha ao iniciar o backend" "Error"
            return $false
        }
    } catch {
        $errorMsg = $_.Exception.Message
        Write-ColorOutput "❌ Erro ao iniciar backend: $errorMsg" "Error"
        Pop-Location
        return $false
    }
}

function Start-FrontendService {
    Write-ColorOutput "🚀 Iniciando serviço do frontend..." "Info"
    
    if (Test-Port $FRONTEND_PORT) {
        Write-ColorOutput "⚠️ Frontend já está rodando na porta $FRONTEND_PORT" "Warning"
        return $true
    }
    
    try {
        # Criar diretório de logs se não existir
        if (!(Test-Path $LOG_DIR)) {
            New-Item -ItemType Directory -Path $LOG_DIR | Out-Null
        }
        
        Push-Location $FRONTEND_DIR
        
        # Definir variável de ambiente para a porta
        $env:PORT = $FRONTEND_PORT
        
        # Iniciar frontend em processo separado
        $frontendProcess = Start-Process -FilePath "powershell" -ArgumentList @(
            "-Command",
            "npm start"
        ) -WindowStyle Normal -PassThru
        
        Pop-Location
        
        # Salvar PID
        $frontendProcess.Id | Out-File -FilePath "$LOG_DIR\frontend.pid" -Encoding UTF8
        
        # Aguardar serviço iniciar
        if (Wait-ForService $FRONTEND_PORT "Frontend" 60) {
            Write-ColorOutput "✅ Frontend iniciado com sucesso (PID: $($frontendProcess.Id))" "Success"
            return $true
        } else {
            Write-ColorOutput "❌ Falha ao iniciar o frontend" "Error"
            return $false
        }
    } catch {
        $errorMsg = $_.Exception.Message
        Write-ColorOutput "❌ Erro ao iniciar frontend: $errorMsg" "Error"
        Pop-Location
        return $false
    }
}

function Stop-ServiceByPid {
    param([string]$PidFile, [string]$ServiceName)
    
    if (Test-Path $PidFile) {
        try {
            $processId = Get-Content $PidFile -ErrorAction SilentlyContinue
            if ($processId) {
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    Stop-Process -Id $processId -Force
                    Write-ColorOutput "✅ $ServiceName parado (PID: $processId)" "Success"
                } else {
                    Write-ColorOutput "⚠️ Processo $ServiceName (PID: $processId) não encontrado" "Warning"
                }
            }
            Remove-Item $PidFile -ErrorAction SilentlyContinue
        } catch {
            $errorMsg = $_.Exception.Message
            Write-ColorOutput "[ERRO] Erro ao parar $ServiceName`: $errorMsg" "Error"
        }
    } else {
        Write-ColorOutput "⚠️ Arquivo PID não encontrado para $ServiceName" "Warning"
    }
}

function Stop-Services {
    Write-ColorOutput "🛑 Parando serviços..." "Info"
    
    if ($Service -eq "all" -or $Service -eq "backend") {
        Stop-ServiceByPid "$LOG_DIR\backend.pid" "Backend"
        
        # Tentar parar processos uvicorn restantes
        Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object {
            $_.CommandLine -like "*uvicorn*" -or $_.CommandLine -like "*app.main:app*"
        } | Stop-Process -Force -ErrorAction SilentlyContinue
    }
    
    if ($Service -eq "all" -or $Service -eq "frontend") {
        Stop-ServiceByPid "$LOG_DIR\frontend.pid" "Frontend"
        
        # Tentar parar processos node restantes na porta específica
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
        foreach ($proc in $nodeProcesses) {
            try {
                $connections = netstat -ano | Select-String ":$FRONTEND_PORT"
                if ($connections -match $proc.Id) {
                    Stop-Process -Id $proc.Id -Force
                    Write-ColorOutput "✅ Processo Node.js parado (PID: $($proc.Id))" "Success"
                }
            } catch {
                # Ignorar erros
            }
        }
    }
}

function Get-ServiceStatus {
    Write-ColorOutput "🔍 Verificando status dos serviços..." "Info"
    Write-Host ""
    
    # Status do Backend
    if ($Service -eq "all" -or $Service -eq "backend") {
        Write-ColorOutput "Backend (Porta $BACKEND_PORT):" "Header"
        
        if (Test-Port $BACKEND_PORT) {
            Write-ColorOutput "  Status: ✅ RODANDO" "Success"
            
            # Testar endpoint de health
            try {
                $response = Invoke-RestMethod -Uri "http://localhost:$BACKEND_PORT/health" -TimeoutSec 5
                Write-ColorOutput "  Health Check: ✅ OK" "Success"
                Write-ColorOutput "  Serviço: $($response.service)" "Info"
            } catch {
                Write-ColorOutput "  Health Check: ❌ FALHA" "Error"
            }
            
            # Verificar PID
            if (Test-Path "$LOG_DIR\backend.pid") {
                $processId = Get-Content "$LOG_DIR\backend.pid" -ErrorAction SilentlyContinue
                if ($processId) {
                    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-ColorOutput "  PID: $processId (Ativo)" "Info"
                    } else {
                        Write-ColorOutput "  PID: $processId (Inativo)" "Warning"
                    }
                }
            }
        } else {
            Write-ColorOutput "  Status: ❌ PARADO" "Error"
        }
        Write-Host ""
    }
    
    # Status do Frontend
    if ($Service -eq "all" -or $Service -eq "frontend") {
        Write-ColorOutput "Frontend (Porta $FRONTEND_PORT):" "Header"
        
        if (Test-Port $FRONTEND_PORT) {
            Write-ColorOutput "  Status: ✅ RODANDO" "Success"
            
            # Verificar PID
            if (Test-Path "$LOG_DIR\frontend.pid") {
                $processId = Get-Content "$LOG_DIR\frontend.pid" -ErrorAction SilentlyContinue
                if ($processId) {
                    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-ColorOutput "  PID: $processId (Ativo)" "Info"
                    } else {
                        Write-ColorOutput "  PID: $processId (Inativo)" "Warning"
                    }
                }
            }
        } else {
            Write-ColorOutput "  Status: ❌ PARADO" "Error"
        }
        Write-Host ""
    }
    
    # URLs úteis
    if ($Service -eq "all") {
        Write-ColorOutput "📋 URLs úteis:" "Header"
        Write-Host "  Frontend: http://localhost:$FRONTEND_PORT"
        Write-Host "  Backend API: http://localhost:$BACKEND_PORT"
        Write-Host "  API Docs: http://localhost:$BACKEND_PORT/docs"
        Write-Host "  Health Check: http://localhost:$BACKEND_PORT/health"
        Write-Host ""
    }
}

function Show-Logs {
    Write-ColorOutput "📊 Exibindo logs dos serviços..." "Info"
    Write-ColorOutput "Pressione Ctrl+C para sair" "Warning"
    Write-Host ""
    
    try {
        # Implementar visualização de logs em tempo real
        # Por simplicidade, mostrar apenas os processos ativos
        while ($true) {
            Clear-Host
            Write-ColorOutput "=== LOGS DOS SERVIÇOS - $(Get-Date -Format 'HH:mm:ss') ===" "Header"
            Write-Host ""
            
            Get-ServiceStatus
            
            Start-Sleep -Seconds 5
        }
    } catch {
        Write-ColorOutput "Saindo da visualização de logs..." "Info"
    }
}

# Função principal
function Main {
    # Verificar se é solicitação de ajuda
    if ($Help) {
        Show-Help
        return
    }
    
    # Verificar se é apenas status
    if ($Status) {
        Get-ServiceStatus
        return
    }
    
    # Verificar se é apenas logs
    if ($Logs -and $Action -eq "start") {
        Show-Logs
        return
    }
    
    Write-ColorOutput "=== Sistema Financeiro Locador - Gerenciador de Serviços ===" "Header"
    Write-Host ""
    
    # Executar ação solicitada
    switch ($Action.ToLower()) {
        "start" {
            if (!(Test-Prerequisites)) {
                Write-ColorOutput "❌ Pré-requisitos não atendidos. Execute com -Help para mais informações." "Error"
                return
            }
            
            if (!(Install-Dependencies)) {
                Write-ColorOutput "❌ Falha ao instalar dependências." "Error"
                return
            }
            
            $success = $true
            
            if ($Service -eq "all" -or $Service -eq "backend") {
                $success = $success -and (Start-BackendService)
            }
            
            if ($Service -eq "all" -or $Service -eq "frontend") {
                $success = $success -and (Start-FrontendService)
            }
            
            Write-Host ""
            if ($success) {
                Write-ColorOutput "🎉 Serviços iniciados com sucesso!" "Success"
                Get-ServiceStatus
                
                if ($Logs) {
                    Show-Logs
                }
            } else {
                Write-ColorOutput "❌ Falha ao iniciar alguns serviços." "Error"
                Get-ServiceStatus
            }
        }
        
        "stop" {
            Stop-Services
            Write-Host ""
            Write-ColorOutput "✅ Comando de parada executado." "Success"
        }
        
        "restart" {
            Write-ColorOutput "🔄 Reiniciando serviços..." "Info"
            Stop-Services
            Start-Sleep -Seconds 3
            
            # Chamar recursivamente para iniciar
            & $MyInvocation.MyCommand.Path -Action "start" -Service $Service
        }
        
        "status" {
            Get-ServiceStatus
        }
        
        default {
            Write-ColorOutput "❌ Ação inválida: $Action" "Error"
            Write-ColorOutput "Use -Help para ver as opções disponíveis." "Info"
        }
    }
}

# Executar função principal
Main