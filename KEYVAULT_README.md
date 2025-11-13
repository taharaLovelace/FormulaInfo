# Azure Key Vault - Integração Simples

Esta implementação permite que o backend busque as credenciais do banco de dados diretamente do Azure Key Vault, mantendo o resto da configuração no arquivo `.env`.

## 🚀 Setup Rápido

### 1. Instalar dependências
```bash
cd backend
npm install
```

### 2. Configurar Azure Key Vault
```bash
# Execute o script de setup (vai criar Key Vault e secrets)
./setup-keyvault.sh
```

### 3. Usar as credenciais do Key Vault
```bash
# Copiar arquivo de configuração gerado
cp backend/.env.keyvault backend/.env

# Executar aplicação
cd backend
npm run dev
```

## 🔧 Como Funciona

1. **Sem Key Vault**: Aplicação usa `DATABASE_URL` do arquivo `.env` normalmente
2. **Com Key Vault**: Se `AZURE_KEY_VAULT_URL` estiver definida, busca as credenciais do Key Vault e constrói a `DATABASE_URL` automaticamente

## 📋 Secrets Configurados no Key Vault

- `database-host` = "database" 
- `database-port` = "5432"
- `database-name` = "formulainfo"
- `database-username` = "postgres"
- `database-password` = "postgres123"

## 🔑 Autenticação

Para desenvolvimento local, use Azure CLI:
```bash
az login
```

## 📝 Logs da Aplicação

Quando usar Key Vault, você verá:
```
🔐 Buscando credenciais do banco no Azure Key Vault...
✅ Credenciais do banco carregadas do Azure Key Vault
```

Se falhar:
```
⚠️  Falha ao carregar do Key Vault, usando DATABASE_URL do .env
```

## 🐳 Docker

O docker-compose continua funcionando normalmente com as credenciais definidas no próprio compose. Para usar Key Vault com Docker, adicione as variáveis de ambiente no serviço backend:

```yaml
backend:
  # ... outras configurações
  environment:
    - AZURE_KEY_VAULT_URL=https://seu-keyvault.vault.azure.net/
    # ... outras variáveis
```