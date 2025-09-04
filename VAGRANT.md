# Formula Info - Ambiente Vagrant

Este documento explica como configurar e usar o ambiente de desenvolvimento com Vagrant para o projeto Formula Info.

## Pré-requisitos

- [VirtualBox](https://www.virtualbox.org/) instalado
- [Vagrant](https://www.vagrantup.com/) instalado
- Pelo menos 8GB de RAM disponível
- Pelo menos 20GB de espaço em disco

## Arquitetura das VMs

O ambiente é composto por 4 VMs:

### 1. VM Proxy (192.168.56.10)
- **Função**: Nginx como proxy reverso
- **Redes**: Host-only + NAT (acesso externo)
- **Porta**: 80
- **Recursos**: 1GB RAM, 1 CPU

### 2. VM Database (192.168.56.11)
- **Função**: PostgreSQL
- **Rede**: Host-only
- **Porta**: 5432
- **Recursos**: 2GB RAM, 2 CPUs
- **Banco**: formulainfo
- **Credenciais**: postgres/postgres

### 3. VM Backend (192.168.56.12)
- **Função**: API Node.js com Fastify
- **Rede**: Host-only
- **Porta**: 3001
- **Recursos**: 2GB RAM, 2 CPUs

### 4. VM Frontend (192.168.56.13)
- **Função**: Aplicação Next.js
- **Rede**: Host-only
- **Porta**: 3000
- **Recursos**: 2GB RAM, 2 CPUs

## Como usar

### 1. Subir todas as VMs
```bash
vagrant up
```

### 2. Subir VMs específicas
```bash
# Subir apenas o banco
vagrant up database

# Subir backend
vagrant up backend

# Subir frontend
vagrant up frontend

# Subir proxy
vagrant up proxy
```

### 3. Verificar status
```bash
vagrant status
```

### 4. Acessar uma VM via SSH
```bash
vagrant ssh proxy
vagrant ssh database
vagrant ssh backend
vagrant ssh frontend
```

### 5. Parar VMs
```bash
# Parar todas
vagrant halt

# Parar uma específica
vagrant halt backend
```

### 6. Destruir VMs
```bash
# Destruir todas
vagrant destroy

# Destruir uma específica
vagrant destroy backend
```

## Ordem recomendada de inicialização

1. **Database** (primeiro)
2. **Backend** (após database estar online)
3. **Frontend** (após backend estar online)
4. **Proxy** (por último)

```bash
vagrant up database
vagrant up backend
vagrant up frontend
vagrant up proxy
```

## Acessando a aplicação

Após todas as VMs estarem rodando:

- **Aplicação completa**: http://192.168.56.10 (via proxy)
- **Frontend direto**: http://192.168.56.13:3000
- **Backend API**: http://192.168.56.12:3001
- **Banco direto**: 192.168.56.11:5432

## Pastas compartilhadas

- `./nginx` → `/vagrant/nginx` (VM proxy)
- `./database` → `/vagrant/database` (VM database)
- `./backend` → `/vagrant/backend` (VM backend)
- `./frontend` → `/vagrant/frontend` (VM frontend)
- `./scripts` → `/vagrant/scripts` (todas as VMs)

## Logs e Troubleshooting

### Verificar logs dos serviços

**Backend:**
```bash
vagrant ssh backend
sudo journalctl -u formula-backend -f
```

**Frontend:**
```bash
vagrant ssh frontend
sudo journalctl -u formula-frontend -f
```

**Proxy:**
```bash
vagrant ssh proxy
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Verificar status dos serviços

```bash
# Em cada VM
sudo systemctl status formula-backend   # VM backend
sudo systemctl status formula-frontend  # VM frontend
sudo systemctl status nginx            # VM proxy
sudo systemctl status postgresql       # VM database
```

### Reinstalar dependências

As dependências são automaticamente instaladas a cada boot, mas se precisar fazer manualmente:

```bash
# Backend
vagrant ssh backend
cd /vagrant/backend
npm install

# Frontend
vagrant ssh frontend
cd /vagrant/frontend
npm install
```

## Comandos úteis

### Re-provisionar uma VM
```bash
vagrant provision backend
```

### Reiniciar serviços
```bash
# Backend
vagrant ssh backend
sudo systemctl restart formula-backend

# Frontend
vagrant ssh frontend
sudo systemctl restart formula-frontend
```

### Verificar conectividade entre VMs
```bash
# Testar do backend para o database
vagrant ssh backend
ping 192.168.56.11

# Testar do proxy para backend
vagrant ssh proxy
curl http://192.168.56.12:3001/health
```

## Configurações de rede

A rede `192.168.56.0/24` é usada para comunicação interna entre as VMs. Certifique-se de que não há conflitos com sua rede local.

## Solução de problemas comuns

### 1. Erro "VBoxManage: error"
```bash
# Reiniciar VirtualBox
sudo systemctl restart vboxdrv
```

### 2. Porta já em uso
```bash
# Verificar processos usando as portas
sudo lsof -i :80,3000,3001,5432
```

### 3. VMs não se comunicam
```bash
# Verificar firewall em cada VM
vagrant ssh <vm>
sudo ufw status
```

### 4. Prisma não conecta ao banco
```bash
vagrant ssh backend
cd /vagrant/backend
npx prisma migrate deploy
```

## Desenvolvimento

Durante o desenvolvimento, as mudanças no código são refletidas automaticamente devido às pastas compartilhadas. Os serviços são reiniciados automaticamente pelo PM2/systemd quando detectam mudanças.

Para desenvolvimento ativo, você pode rodar em modo de desenvolvimento:

```bash
# Backend em modo dev
vagrant ssh backend
cd /vagrant/backend
npm run dev

# Frontend em modo dev
vagrant ssh frontend
cd /vagrant/frontend
npm run dev
```
