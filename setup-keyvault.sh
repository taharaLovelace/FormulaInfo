#!/bin/bash

# Script simples para configurar Azure Key Vault
echo "🔐 Configurando Azure Key Vault para Formula Info"

# Verificar se Azure CLI está instalado
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI não encontrado. Instale primeiro: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Verificar login
if ! az account show &> /dev/null; then
    echo "🔑 Fazendo login no Azure..."
    az login
fi

# Registrar Microsoft.KeyVault provider se necessário
echo "📋 Verificando provedor Microsoft.KeyVault..."
PROVIDER_STATUS=$(az provider show -n Microsoft.KeyVault --query "registrationState" -o tsv 2>/dev/null || echo "NotRegistered")

if [ "$PROVIDER_STATUS" != "Registered" ]; then
    echo "🔧 Registrando provedor Microsoft.KeyVault..."
    az provider register --namespace Microsoft.KeyVault
    
    echo "⏳ Aguardando registro do provedor (pode levar alguns minutos)..."
    while [ "$(az provider show -n Microsoft.KeyVault --query registrationState -o tsv)" != "Registered" ]; do
        echo "   Ainda registrando..."
        sleep 30
    done
    echo "✅ Provedor Microsoft.KeyVault registrado!"
fi

# Configurações - Nome mais curto para o Key Vault (max 24 chars)
RESOURCE_GROUP="formula-info-rg"
KEY_VAULT_NAME="formulakv$(date +%s | tail -c 6)"  # Nome curto (max 24 chars)
LOCATION="centralus"  # Região mais compatível com Azure for Students

echo "📝 Criando recursos..."
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Key Vault: $KEY_VAULT_NAME"

# Criar Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION --output none

# Criar Key Vault (sem RBAC para simplificar permissões)
echo "🏗️  Criando Key Vault: $KEY_VAULT_NAME"
az keyvault create \
    --name $KEY_VAULT_NAME \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku standard \
    --enable-rbac-authorization false \
    --output none

if [ $? -ne 0 ]; then
    echo "❌ Erro ao criar Key Vault. Tentando região alternativa..."
    LOCATION="westus2"
    az keyvault create \
        --name $KEY_VAULT_NAME \
        --resource-group $RESOURCE_GROUP \
        --location $LOCATION \
        --sku standard \
        --enable-rbac-authorization false \
        --output none
    
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao criar Key Vault. Verifique as permissões da sua subscription."
        exit 1
    fi
fi

# Obter URL do Key Vault
KEY_VAULT_URL=$(az keyvault show --name $KEY_VAULT_NAME --resource-group $RESOURCE_GROUP --query properties.vaultUri -o tsv)

echo "✅ Key Vault criado: $KEY_VAULT_URL"

echo "🔐 Configurando secrets do banco de dados..."

# Configurar política de acesso para o usuário atual
USER_EMAIL=$(az account show --query user.name -o tsv)
echo "🔑 Configurando permissões para: $USER_EMAIL"

az keyvault set-policy \
    --name $KEY_VAULT_NAME \
    --upn $USER_EMAIL \
    --secret-permissions get list set delete \
    --output none

if [ $? -ne 0 ]; then
    echo "⚠️  Não foi possível configurar policy por UPN. Tentando por object-id..."
    OBJECT_ID=$(az ad signed-in-user show --query id -o tsv)
    az keyvault set-policy \
        --name $KEY_VAULT_NAME \
        --object-id $OBJECT_ID \
        --secret-permissions get list set delete \
        --output none
fi

# Aguardar propagação das permissões
echo "⏳ Aguardando propagação das permissões (10 segundos)..."
sleep 10

# Configurar secrets (usando valores padrão do docker-compose)
echo "📝 Criando secrets..."
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "database-host" --value "database" --output none
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "database-port" --value "5432" --output none
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "database-name" --value "formulainfo" --output none
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "database-username" --value "postgres" --output none
az keyvault secret set --vault-name $KEY_VAULT_NAME --name "database-password" --value "postgres123" --output none

if [ $? -eq 0 ]; then
    echo "✅ Secrets configurados com sucesso!"
else
    echo "❌ Erro ao configurar secrets. Verifique as permissões."
    exit 1
fi

# Criar arquivo .env
cat > backend/.env.keyvault << EOF
# Azure Key Vault Configuration
AZURE_KEY_VAULT_URL=$KEY_VAULT_URL

# Outras configurações (mantidas do .env original)
NODE_ENV=development
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
API_PREFIX=/api/v1
OPENF1_API_URL=https://api.openf1.org/v1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
LOG_FILE=logs/app.log
EOF

echo "📄 Arquivo backend/.env.keyvault criado!"
echo ""
echo "🧪 Testando acesso aos secrets..."
TEST_SECRET=$(az keyvault secret show --vault-name $KEY_VAULT_NAME --name database-host --query value -o tsv 2>/dev/null)

if [ "$TEST_SECRET" = "database" ]; then
    echo "✅ Teste bem-sucedido! Key Vault funcionando corretamente."
else
    echo "⚠️  Aviso: Não foi possível testar o acesso aos secrets imediatamente."
    echo "   Isso é normal e pode levar alguns minutos para as permissões serem aplicadas."
fi

echo ""
echo "🚀 Para usar o Key Vault:"
echo "1. Copie o arquivo: cp backend/.env.keyvault backend/.env"
echo "2. Instale dependências: cd backend && npm install"
echo "3. Execute: npm run dev"
echo ""
echo "📋 Key Vault Info:"
echo "   Nome: $KEY_VAULT_NAME"
echo "   URL: $KEY_VAULT_URL"
echo "   Região: $LOCATION"
echo ""
echo "🧪 Comandos de teste:"
echo "   az keyvault secret list --vault-name $KEY_VAULT_NAME"
echo "   az keyvault secret show --vault-name $KEY_VAULT_NAME --name database-host"
echo ""
echo "🔧 Se houver problemas de permissão, execute:"
echo "   az keyvault set-policy --name $KEY_VAULT_NAME --upn $USER_EMAIL --secret-permissions get list set delete"