#!/bin/bash

echo "=== Provisionando VM do Backend (Node.js) ==="

# Atualizar sistema
apt-get update
apt-get upgrade -y

# Instalar dependências básicas
apt-get install -y curl wget git build-essential

# Instalar Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
apt-get install -y nodejs

# Verificar instalação
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Instalar PM2 globalmente para gerenciar o processo
npm install -g pm2

# Instalar dependências do projeto
cd /vagrant/backend
npm install

# Criar arquivo de ambiente se não existir
if [ ! -f /vagrant/backend/.env ]; then
    cat > /vagrant/backend/.env << EOF
# Database
DATABASE_URL="postgresql://postgres:postgres@192.168.56.11:5432/formulainfo"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# API Keys
F1_API_BASE_URL="https://api.openf1.org/v1"

# Server
PORT=3001
NODE_ENV=development

# Redis (opcional)
REDIS_URL="redis://192.168.56.11:6379"

# Logs
LOG_LEVEL=info
EOF
fi

# Gerar cliente Prisma
npx prisma generate

# Configurar firewall
ufw --force enable
ufw allow 22/tcp
ufw allow from 192.168.56.0/24 to any port 3001

# Criar serviço systemd para o backend
cat > /etc/systemd/system/formula-backend.service << EOF
[Unit]
Description=Formula Info Backend API
After=network.target

[Service]
Type=simple
User=vagrant
WorkingDirectory=/vagrant/backend
Environment=NODE_ENV=development
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Habilitar serviço
systemctl daemon-reload
systemctl enable formula-backend

echo "=== Backend configurado com sucesso! ==="
echo "Node.js $(node --version) instalado"
echo "Serviço disponível em: systemctl start formula-backend"
echo "API rodará na porta 3001"
