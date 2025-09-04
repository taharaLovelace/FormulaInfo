#!/bin/bash

echo "=== Provisionando VM do Banco de Dados (PostgreSQL) ==="

# Atualizar sistema
apt-get update
apt-get upgrade -y

# Instalar PostgreSQL
apt-get install -y postgresql postgresql-contrib

# Configurar PostgreSQL
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"

# Criar banco de dados
sudo -u postgres createdb formulainfo

# Configurar PostgreSQL para aceitar conexões da rede interna
echo "listen_addresses = '*'" >> /etc/postgresql/14/main/postgresql.conf
echo "host all all 192.168.56.0/24 md5" >> /etc/postgresql/14/main/pg_hba.conf

# Reiniciar PostgreSQL
systemctl restart postgresql

# Executar script de inicialização se existir
if [ -f /vagrant/database/init.sql ]; then
    echo "Executando script de inicialização do banco..."
    sudo -u postgres psql -d formulainfo -f /vagrant/database/init.sql
fi

# Configurar firewall
ufw --force reset
ufw default deny incoming
ufw default deny outgoing
ufw allow 22/tcp
ufw allow from 192.168.56.0/24 to any port 5432
# Permitir tráfego interno entre VMs
ufw allow out to 192.168.56.0/24
# (Sem permitir saída externa: banco não deve acessar Internet)
ufw --force enable

# Habilitar PostgreSQL no boot
systemctl enable postgresql

echo "=== Banco de dados configurado com sucesso! ==="
echo "PostgreSQL rodando na porta 5432"
echo "Banco: formulainfo"
echo "Usuário: postgres"
echo "Senha: postgres"
echo "Host: 192.168.56.11"
