#!/bin/bash

echo "=== Provisionando VM do Backend (Node.js + PM2) ==="

# Atualizar sistema
apt-get update
apt-get upgrade -y

# Dependências básicas
apt-get install -y curl wget git build-essential

# Node.js 24
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
apt-get install -y nodejs

# PM2
npm install -g pm2

# Projeto
cd /vagrant/backend
npm install

# .env
if [ ! -f /vagrant/backend/.env ]; then
    cat > /vagrant/backend/.env << EOF
# Database
DATABASE_URL="postgresql://postgres:postgres@192.168.56.11:5432/formulainfo"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# API
PORT=3001
NODE_ENV=development
API_PREFIX=/api/v1

# Logs
LOG_LEVEL=info
EOF
fi

# Prisma
npx prisma generate

# Firewall
ufw --force reset
ufw default deny incoming
ufw default deny outgoing
ufw allow 22/tcp
ufw allow from 192.168.56.0/24 to any port 3001
ufw allow out to 192.168.56.10
ufw allow out to 192.168.56.0/24
ufw --force enable

systemctl daemon-reload

# PM2 como serviço do usuário vagrant
sudo -u vagrant pm2 startup systemd -u vagrant --hp /home/vagrant >/dev/null 2>&1 || true

echo "=== Backend provisionado com PM2 ==="
