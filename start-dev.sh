#!/bin/bash

# Script de inicialização para desenvolvimento

echo "🚀 Iniciando Sistema Financeiro Locador..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale o Docker primeiro."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Criar arquivos .env se não existirem
if [ ! -f "src/backend/.env" ]; then
    echo "📝 Criando arquivo .env para o backend..."
    cp src/backend/.env.example src/backend/.env
    echo "✅ Arquivo .env criado. Por favor, configure suas variáveis de ambiente."
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Construir e iniciar containers
echo "🔨 Construindo e iniciando containers..."
docker-compose up --build -d

# Aguardar serviços subirem
echo "⏳ Aguardando serviços iniciarem..."
sleep 10

# Verificar status dos serviços
echo "🔍 Verificando status dos serviços..."

# Verificar backend
if curl -f http://localhost:8000/health &> /dev/null; then
    echo "✅ Backend: OK (http://localhost:8000)"
else
    echo "❌ Backend: Falha ao conectar"
fi

# Verificar frontend
if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Frontend: OK (http://localhost:3000)"
else
    echo "❌ Frontend: Falha ao conectar"
fi

# Verificar banco de dados
if docker-compose exec -T db sqlcmd -S localhost -U sa -P YourStrongPassword123! -Q "SELECT 1" &> /dev/null; then
    echo "✅ Banco de Dados: OK"
else
    echo "❌ Banco de Dados: Falha ao conectar"
fi

echo ""
echo "🎉 Sistema iniciado!"
echo ""
echo "📋 URLs úteis:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo "   Health Check: http://localhost:8000/health"
echo ""
echo "📊 Para ver logs:"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f frontend"
echo ""
echo "🛑 Para parar:"
echo "   docker-compose down"