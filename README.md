# Formula Info

## Visão Geral da Arquitetura

## 🏗️ Arquitetura (Vagrant / Rede Interna)

O projeto é composto por quatro VMs (Vagrant + VirtualBox) em rede privada 192.168.56.0/24:

| VM | Hostname | IP (host-only) | Função | Acesso Externo |
|----|----------|----------------|--------|----------------|
| proxy | formula-proxy | 192.168.56.10 | Nginx / gateway | SIM (NAT) |
| database | formula-db | 192.168.56.11 | PostgreSQL | NÃO (UFW bloqueia) |
| backend | formula-backend | 192.168.56.12 | API Fastify (porta 3001) | NÃO (UFW bloqueia) |
| frontend | formula-frontend | 192.168.56.13 | Next.js (porta 3000) | NÃO (UFW bloqueia) |

Somente a VM proxy tem acesso à Internet (interface NAT padrão). As demais possuem regras UFW (deny outgoing) permitindo apenas tráfego interno (192.168.56.0/24) e, no caso do backend, saída para o proxy.

```
Host (Ubuntu) ──> 192.168.56.10 (proxy/nginx)
          │
   ┌────────────────┴────────────────┐
   │                                 │
 192.168.56.12 (backend)          192.168.56.13 (frontend)
    │
  192.168.56.11 (database)

Firewall (UFW):
  - database/backend/frontend: deny outgoing (exceto rede interna / proxy)
  - proxy: permite saída HTTP/HTTPS
```

1. Proxy (192.168.56.10)
   - Nginx como proxy reverso (porta 80)
   - Encaminha requisições para Frontend e Backend
2. Database (192.168.56.11)
   - PostgreSQL (porta 5432)
3. Backend (192.168.56.12)
   - API Node.js (Fastify + Prisma) (porta 3001)
   - Gerenciado por PM2 em modo desenvolvimento (hot reload via tsx)
4. Frontend (192.168.56.13)
   - Next.js (porta 3000)
   - Gerenciado por PM2 em modo desenvolvimento

Diretórios relevantes no repositório:
```
FormulaInfo/
├── backend/              # API Node.js + Prisma
├── frontend/             # Next.js
├── nginx/                # Configurações do Nginx
└── scripts/              # Provisionamento e startup
```

---

## Como subir o ambiente

1) Subir todas as VMs
```bash
vagrant up
```

2) Verificar status
```bash
vagrant status
```

3) Acessar uma VM
```bash
vagrant ssh <nome-da-vm>   # ex: vagrant ssh backend
```

As VMs de backend e frontend são iniciadas com PM2 (modo dev) pelos scripts de startup durante o provisionamento.

---

## URLs principais (via Proxy)
- Frontend: http://192.168.56.10/
- API: http://192.168.56.10/api/v1
  - Lista de pilotos: http://192.168.56.10/api/v1/drivers

---

## Verificações rápidas

Backend (na VM backend):
```bash
pm2 status
pm2 logs formula-backend --lines 100
curl -sS http://localhost:3001/health
curl -sS http://localhost:3001/api/v1/drivers | head
```

Frontend (na VM frontend):
```bash
pm2 status
pm2 logs formula-frontend --lines 100
curl -sS http://localhost:3000 | head
```

Proxy (na VM proxy):
```bash
# Testar acesso direto aos serviços
curl -sS http://192.168.56.12:3001/health
curl -sS http://192.168.56.13:3000 | head

# Testar via proxy
curl -sS http://localhost/api/v1/drivers | head

# Validar e recarregar Nginx
sudo nginx -t && sudo systemctl reload nginx
```

---

## Banco de Dados (migrations e seed)

As migrations são aplicadas durante o startup do backend (migrate deploy). Para executar manualmente:
```bash
vagrant ssh backend
cd /vagrant/backend

# Aplicar migrations
npx prisma migrate deploy

# Rodar seed (usa o hook prisma.seed definido em package.json)
npx prisma db seed
# ou
npm run db:seed
```

Para abrir o Prisma Studio:
```bash
vagrant ssh backend -c "cd /vagrant/backend && npx prisma studio"
```

---

## Variáveis de ambiente

Backend (`/vagrant/backend/.env`):
```env
DATABASE_URL="postgresql://postgres:postgres@192.168.56.11:5432/formulainfo"
PORT=3001
NODE_ENV=development
API_PREFIX=/api/v1
JWT_SECRET=alterar-em-producao
```

Frontend (`/vagrant/frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://192.168.56.10
NEXT_PUBLIC_API_BASE_URL=http://192.168.56.10/api/v1
NODE_ENV=development
PORT=3000
```
(Um modelo está em `frontend/.env.example`).

---

## Execução e monitoramento com PM2

Backend (na VM backend):
```bash
# Iniciar/reativar
pm2 start /vagrant/backend/ecosystem.config.cjs --only formula-backend

# Reiniciar / recarregar
pm2 restart formula-backend
pm2 reload formula-backend

# Logs e status
pm2 logs formula-backend
pm2 status
```

Frontend (na VM frontend):
```bash
pm2 start /vagrant/frontend/ecosystem.config.cjs --only formula-frontend
pm2 restart formula-frontend
pm2 reload formula-frontend
pm2 logs formula-frontend
pm2 status
```

Arquivos de log:
- Backend (PM2): `backend/logs/pm2-out.log`, `backend/logs/pm2-error.log`
- Backend (aplicação/Pino): `backend/logs/app.log`, `backend/logs/error.log`
- Frontend (PM2): `frontend/pm2-out.log`, `frontend/pm2-error.log`

PM2 como serviço do usuário `vagrant` já é configurado durante o provisionamento.

---

## Nginx (Proxy)

Config ativo: `/etc/nginx/conf.d/default.conf` (na VM proxy). Pontos-chave:
- Upstreams apontam para IPs das VMs:
  - `upstream frontend { server 192.168.56.13:3000; }`
  - `upstream backend  { server 192.168.56.12:3001; }`
- Bloco da API preserva o prefixo:
```nginx
location /api/ {
    proxy_pass http://backend;   # sem barra no final!
    # ...cabeçalhos e CORS...
}
```

Testar e recarregar:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## Troubleshooting

- 502 Bad Gateway ao chamar a API via proxy:
  1) Verifique se o backend está de pé
  ```bash
  vagrant ssh backend -c "pm2 status && curl -sS http://localhost:3001/health"
  ```
  2) Do proxy, teste conexão direta:
  ```bash
  vagrant ssh proxy -c "curl -sS http://192.168.56.12:3001/health"
  ```
  3) Valide o `proxy_pass` em `/etc/nginx/conf.d/default.conf` (sem barra no final) e recarregue o Nginx:
  ```bash
  vagrant ssh proxy -c "sudo nginx -t && sudo systemctl reload nginx"
  ```

- Porta 3001 não abrindo no backend:
  - Veja logs: `pm2 logs formula-backend`
  - Confirme que o processo está online: `pm2 status`
  - Confirme firewall (na VM backend): `sudo ufw status`

- Problemas com Prisma (P1001 / conexão DB):
  - Verifique se a VM `database` está rodando: `vagrant status`
  - Teste porta a partir do backend: `nc -zv 192.168.56.11 5432`

- Reconstruir ambiente do zero:
```bash
vagrant destroy -f && vagrant up
```

---

## Comandos úteis (referência)

Backend:
```bash
vagrant ssh backend -c "cd /vagrant/backend && npm install"
vagrant ssh backend -c "cd /vagrant/backend && npx prisma generate"
```

Database:
```bash
# Acessar o PostgreSQL
vagrant ssh database -c "sudo -u postgres psql formulainfo"

# Backup do banco
vagrant ssh database -c "sudo -u postgres pg_dump formulainfo > /vagrant/backup.sql"
```
