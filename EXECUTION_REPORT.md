# Formula Info - Relatório de Execução

## Estrutura do Projeto

O projeto Formula Info é composto por múltiplos serviços executando em máquinas virtuais separadas:

```
FormulaInfo/
├── backend/              # API Node.js com Fastify
├── frontend/            # Frontend Next.js
├── nginx/               # Configurações do proxy reverso
└── scripts/             # Scripts de provisionamento
```

### Máquinas Virtuais

O projeto utiliza quatro VMs com Ubuntu 22.04 LTS:

1. **Proxy (192.168.56.10)**
   - Nginx como proxy reverso
   - Única VM com acesso à internet
   - Gerencia o tráfego entre os serviços

2. **Database (192.168.56.11)**
   - PostgreSQL
   - Sem acesso à internet (apenas rede interna)
   - Porta 5432 para conexões do backend

3. **Backend (192.168.56.12)**
   - Node.js 24.x
   - API Fastify
   - Sem acesso à internet (apenas rede interna)
   - Porta 3001 para a API

4. **Frontend (192.168.56.13)**
   - Next.js
   - Sem acesso à internet (apenas rede interna)
   - Porta 3000 para a aplicação web

## Comandos de Execução

### 1. Iniciar as VMs

Para iniciar todas as VMs:
```bash
vagrant up
```

Para iniciar VMs específicas:
```bash
vagrant up database backend  # Inicia apenas database e backend
```

### 2. Verificar Status das VMs
```bash
vagrant status
```

### 3. Acessar as VMs

Para acessar uma VM específica:
```bash
vagrant ssh <nome-da-vm>  # Ex: vagrant ssh backend
```

### 4. Configuração do Banco de Dados

O banco de dados é configurado automaticamente durante o provisionamento, mas caso seja necessário executar as migrations e seeds manualmente:

```bash
# Acessar a VM do backend
vagrant ssh backend

# Navegar até a pasta do backend
cd /vagrant/backend

# Executar as migrations
npx prisma migrate deploy

# Executar o seed
npx prisma db seed
```

### 5. Verificação do Backend

Para verificar se o backend está respondendo:
```bash
curl http://192.168.56.12:3001/api/v1/drivers
```

### 6. Logs e Monitoramento

Para verificar os logs do backend:
```bash
# Na VM do backend
tail -f /vagrant/backend/logs/app.log
```

Para verificar o status do serviço:
```bash
sudo systemctl status formula-backend
```

## Troubleshooting

### Reiniciar Serviços

Se necessário reiniciar o backend:
```bash
sudo systemctl restart formula-backend
```

Se necessário reiniciar o banco de dados:
```bash
sudo systemctl restart postgresql
```

### Verificar Conectividade

Para testar a conexão entre backend e banco:
```bash
# Na VM do backend
nc -zv 192.168.56.11 5432
```

### Limpar e Recriar o Ambiente

Se necessário limpar todo o ambiente e começar do zero:
```bash
vagrant destroy -f  # Destrói todas as VMs
vagrant up         # Recria todas as VMs
```

## Notas Importantes

1. As VMs de backend e banco de dados não têm acesso à internet por design de segurança
2. Toda comunicação externa deve passar pelo proxy
3. As VMs se comunicam através da rede privada 192.168.56.0/24
4. Os dados do banco são persistidos mesmo que a VM seja reiniciada
5. O frontend e backend são montados como pastas compartilhadas nas VMs, permitindo desenvolvimento local

## Comandos Úteis para Desenvolvimento

### Backend

```bash
# Reinstalar dependências
vagrant ssh backend -c "cd /vagrant/backend && npm install"

# Gerar cliente Prisma
vagrant ssh backend -c "cd /vagrant/backend && npx prisma generate"

# Visualizar banco de dados com Prisma Studio
vagrant ssh backend -c "cd /vagrant/backend && npx prisma studio"
```

### Database

```bash
# Conectar ao PostgreSQL
vagrant ssh database -c "sudo -u postgres psql formulainfo"

# Backup do banco de dados
vagrant ssh database -c "sudo -u postgres pg_dump formulainfo > /vagrant/backup.sql"
```
