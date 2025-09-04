#!/bin/bash

echo "=== Provisionando VM do Proxy (Nginx) ==="

# Atualizar sistema
apt-get update
apt-get upgrade -y

# Instalar Nginx
apt-get install -y nginx

# Parar o nginx para configuração
systemctl stop nginx

# Copiar configurações do nginx
cp /vagrant/nginx/nginx.conf /etc/nginx/nginx.conf
cp /vagrant/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# Atualizar configuração para usar IPs das VMs ao invés de nomes de containers
sed -i 's/server frontend:3000;/server 192.168.56.13:3000;/' /etc/nginx/conf.d/default.conf
sed -i 's/server backend:3001;/server 192.168.56.12:3001;/' /etc/nginx/conf.d/default.conf

# Criar diretórios de log se não existirem
mkdir -p /var/log/nginx

# Testar configuração do nginx
nginx -t

# Habilitar e iniciar nginx
systemctl enable nginx
systemctl start nginx

# Configurar firewall
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Configurar IP forwarding para funcionar como proxy
echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.conf
sysctl -p

echo "=== Proxy configurado com sucesso! ==="
echo "Nginx rodando na porta 80"
echo "Logs disponíveis em /var/log/nginx/"
