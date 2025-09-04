#!/bin/bash

echo "=== Provisionando VM do Frontend (Next.js) ==="

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
cd /vagrant/frontend
npm install

# Criar arquivo de ambiente se não existir
if [ ! -f /vagrant/frontend/.env.local ]; then
    cat > /vagrant/frontend/.env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=http://192.168.56.12:3001
NEXT_PUBLIC_API_BASE_URL=http://192.168.56.12:3001/api

# Environment
NODE_ENV=development
EOF
fi

# Build do projeto
npm run build

# Configurar firewall
ufw --force reset
ufw default deny incoming
ufw default deny outgoing
ufw allow 22/tcp
ufw allow from 192.168.56.0/24 to any port 3000
ufw allow out to 192.168.56.10  # Permite acesso apenas ao proxy
ufw allow out to 192.168.56.0/24
ufw --force enable

# Criar serviço systemd para o frontend
cat > /etc/systemd/system/formula-frontend.service << EOF
[Unit]
Description=Formula Info Frontend
After=network.target

[Service]
Type=simple
User=vagrant
WorkingDirectory=/vagrant/frontend
Environment=NODE_ENV=development
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Habilitar serviço
systemctl daemon-reload
systemctl enable formula-frontend

echo "=== Frontend configurado com sucesso! ==="
echo "Node.js $(node --version) instalado"
echo "Serviço disponível em: systemctl start formula-frontend"
echo "Aplicação rodará na porta 3000"
