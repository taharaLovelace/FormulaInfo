#!/bin/bash

echo "=== Iniciando Frontend ==="

# Ir para o diretório do frontend
cd /vagrant/frontend

# Instalar dependências (npm i)
echo "Instalando dependências..."
npm install

# Fazer build da aplicação
echo "Fazendo build da aplicação..."
npm run build

# Iniciar o serviço
echo "Iniciando serviço do frontend..."
systemctl start formula-frontend

echo "=== Frontend iniciado com sucesso! ==="
echo "Status do serviço: $(systemctl is-active formula-frontend)"
echo "Para ver logs: journalctl -u formula-frontend -f"
