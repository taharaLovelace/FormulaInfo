#!/bin/bash

echo "=== Provisionando VM do Frontend (Next.js + PM2) ==="

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
cd /vagrant/frontend
npm install

# .env.local
if [ ! -f /vagrant/frontend/.env.local ]; then
    cat > /vagrant/frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://192.168.56.10
NEXT_PUBLIC_API_BASE_URL=http://192.168.56.10/api/v1
NODE_ENV=development
PORT=3000
EOF
fi

# Firewall
ufw --force reset
ufw default deny incoming
ufw default deny outgoing
ufw allow 22/tcp
ufw allow from 192.168.56.0/24 to any port 3000
ufw allow out to 192.168.56.10
ufw allow out to 192.168.56.0/24
ufw --force enable

systemctl daemon-reload

# PM2 como serviço do usuário vagrant
sudo -u vagrant pm2 startup systemd -u vagrant --hp /home/vagrant >/dev/null 2>&1 || true

echo "=== Frontend provisionado com PM2 ==="
