# Quick Start - Formula Info Vagrant

## Comandos Rápidos

### Iniciar ambiente completo
```bash
./scripts/manage.sh start-dev
```

### Gerenciar VMs individuais
```bash
# Subir banco
vagrant up database

# Subir backend  
vagrant up backend

# Subir frontend
vagrant up frontend

# Subir proxy
vagrant up proxy
```

### Verificar status
```bash
vagrant status
```

### Ver logs
```bash
./scripts/manage.sh logs backend
./scripts/manage.sh logs frontend
./scripts/manage.sh logs proxy
```

### Acessar VMs
```bash
vagrant ssh database
vagrant ssh backend
vagrant ssh frontend
vagrant ssh proxy
```

## URLs de Acesso

- **Aplicação completa**: http://192.168.56.10
- **Frontend direto**: http://192.168.56.13:3000  
- **Backend API**: http://192.168.56.12:3001
- **Banco PostgreSQL**: 192.168.56.11:5432

## IPs das VMs

- Proxy: 192.168.56.10
- Database: 192.168.56.11
- Backend: 192.168.56.12
- Frontend: 192.168.56.13

## Troubleshooting

### Reinstalar dependências
```bash
# Backend
vagrant ssh backend
cd /vagrant/backend && npm install

# Frontend  
vagrant ssh frontend
cd /vagrant/frontend && npm install
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

### Logs detalhados
```bash
# Backend
vagrant ssh backend
sudo journalctl -u formula-backend -f

# Frontend
vagrant ssh frontend
sudo journalctl -u formula-frontend -f

# Nginx
vagrant ssh proxy
sudo tail -f /var/log/nginx/error.log
```
