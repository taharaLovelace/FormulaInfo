#!/bin/bash

echo "=== Iniciando Frontend (PM2 Dev) ==="

cd /vagrant/frontend

# Dependências
npm install

# PM2 Start (com watch via polling)
pm2 delete formula-frontend 2>/dev/null || true
pm2 start ecosystem.config.cjs --only formula-frontend
pm2 save

echo "=== Frontend iniciado com PM2. Logs: pm2 logs formula-frontend ==="
