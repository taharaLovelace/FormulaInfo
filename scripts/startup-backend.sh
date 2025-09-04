#!/bin/bash

echo "=== Iniciando Backend ==="

# Ir para o diretório do backend
cd /vagrant/backend

# Instalar dependências (npm i)
echo "Instalando dependências..."
npm install

# Fazer build do projeto
echo "Fazendo build do projeto..."
npm run build

# Executar migrações do Prisma se necessário
echo "Executando migrações do banco..."
npx prisma migrate deploy 2>/dev/null || echo "Nenhuma migração pendente"

# Gerar cliente Prisma
echo "Gerando cliente Prisma..."
npx prisma generate

# Iniciar o serviço
echo "Iniciando serviço do backend..."
systemctl start formula-backend

echo "=== Backend iniciado com sucesso! ==="
echo "Status do serviço: $(systemctl is-active formula-backend)"
echo "Para ver logs: journalctl -u formula-backend -f"
