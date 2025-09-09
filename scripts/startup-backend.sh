#!/bin/bash

echo "=== Iniciando Backend (PM2 Dev) ==="

# Ir para o diretório do backend
cd /vagrant/backend

# Instalar dependências (npm i)
echo "Instalando dependências..."
npm install

# Prisma
echo "Executando migrações do banco..."
npx prisma migrate deploy 2>/dev/null || echo "Nenhuma migração pendente"
echo "Gerando cliente Prisma..."
npx prisma generate

# PM2 Start (com watch via polling)
echo "Iniciando serviço do backend com PM2..."
pm2 delete formula-backend 2>/dev/null || true
pm2 start ecosystem.config.cjs --only formula-backend
pm2 save

echo "=== Backend iniciado com PM2. Logs: pm2 logs formula-backend ==="
