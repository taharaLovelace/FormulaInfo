#!/bin/bash

# Formula Info - Development Setup Script
echo "🏎️  Formula Info - Configurando ambiente de desenvolvimento..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "Verificando dependências..."

# Verificar versão do Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 24 ]; then
        print_warning "Node.js versão $NODE_VERSION encontrada. Recomendamos Node.js 24+ para melhor performance."
        print_warning "Você pode continuar, mas considere atualizar: https://nodejs.org/"
    else
        print_success "Node.js versão $NODE_VERSION detectada ✓"
    fi
else
    print_error "Node.js não está instalado. Por favor, instale Node.js 24+ primeiro."
    exit 1
fi

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

print_success "Docker e Docker Compose encontrados ✓"

# Criar arquivos .env se não existirem
if [ ! -f backend/.env ]; then
    print_status "Criando arquivo .env para o backend..."
    cp backend/.env.example backend/.env
    print_success "Arquivo backend/.env criado!"
fi

if [ ! -f frontend/.env.local ]; then
    print_status "Criando arquivo .env.local para o frontend..."
    cp frontend/.env.example frontend/.env.local
    print_success "Arquivo frontend/.env.local criado!"
fi

# Função para iniciar os serviços
start_services() {
    print_status "Iniciando serviços com Docker Compose..."
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        print_success "Serviços iniciados com sucesso!"
        echo ""
        echo "🚀 Aplicação disponível em:"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend API: http://localhost:3001"
        echo "   API Docs: http://localhost:3001/docs"
        echo "   Nginx Proxy: http://localhost"
        echo ""
        echo "📊 Serviços de infraestrutura:"
        echo "   PostgreSQL: localhost:5432"
        echo "   Redis: localhost:6379"
        echo ""
        echo "Para parar os serviços: docker-compose down"
        echo "Para ver logs: docker-compose logs -f"
    else
        print_error "Falha ao iniciar os serviços."
        exit 1
    fi
}

# Função para instalar dependências de desenvolvimento
install_deps() {
    print_status "Instalando dependências do backend..."
    if [ -d "backend" ]; then
        cd backend
        npm install
        cd ..
        print_success "Dependências do backend instaladas!"
    fi
    
    print_status "Instalando dependências do frontend..."
    if [ -d "frontend" ]; then
        cd frontend
        npm install
        cd ..
        print_success "Dependências do frontend instaladas!"
    fi
}

# Função para configurar o banco de dados
setup_database() {
    print_status "Configurando banco de dados..."
    
    # Aguardar PostgreSQL estar pronto
    print_status "Aguardando PostgreSQL inicializar..."
    sleep 10
    
    # Executar migrações do Prisma
    print_status "Executando migrações do banco de dados..."
    cd backend
    npx prisma migrate dev --name init
    npx prisma generate
    cd ..
    
    print_success "Banco de dados configurado!"
}

# Menu principal
case "$1" in
    "start")
        start_services
        ;;
    "install")
        install_deps
        ;;
    "setup")
        install_deps
        start_services
        setup_database
        ;;
    "stop")
        print_status "Parando serviços..."
        docker-compose down
        print_success "Serviços parados!"
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "clean")
        print_warning "Removendo containers e volumes..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_success "Limpeza concluída!"
        ;;
    *)
        echo "🏎️  Formula Info - Script de Desenvolvimento"
        echo ""
        echo "Uso: $0 {start|install|setup|stop|logs|clean}"
        echo ""
        echo "Comandos:"
        echo "  setup   - Instala dependências e inicia ambiente completo"
        echo "  start   - Inicia apenas os serviços Docker"
        echo "  install - Instala dependências Node.js"
        echo "  stop    - Para todos os serviços"
        echo "  logs    - Mostra logs dos serviços"
        echo "  clean   - Remove containers e limpa sistema"
        echo ""
        exit 1
        ;;
esac
