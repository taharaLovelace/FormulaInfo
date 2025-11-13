#!/bin/bash

# Script para limpar recursos do Azure Key Vault se necessário
echo "🧹 Script de limpeza - Azure Key Vault"

# Verificar login
if ! az account show &> /dev/null; then
    echo "❌ Não está logado no Azure. Execute: az login"
    exit 1
fi

echo "🔍 Procurando recursos do Formula Info..."

# Listar Key Vaults no Resource Group
echo "Key Vaults encontrados:"
az keyvault list --resource-group formula-info-rg --query "[].name" -o tsv 2>/dev/null || echo "Nenhum Key Vault encontrado"

echo ""
echo "Resource Groups encontrados:"
az group list --query "[?starts_with(name, 'formula-info')].name" -o tsv

echo ""
read -p "Deseja deletar o Resource Group 'formula-info-rg' e todos os recursos? (y/N): " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    echo "🗑️  Deletando Resource Group..."
    az group delete --name formula-info-rg --yes --no-wait
    echo "✅ Comando de exclusão enviado. A exclusão pode levar alguns minutos."
    echo "   Use 'az group list' para verificar o progresso."
else
    echo "❌ Operação cancelada."
fi