# Formula Info 🏎️

Plataforma para fãs de Fórmula 1 com backend Fastify, frontend Next.js e infraestrutura isolada via Vagrant (proxy, backend, frontend e banco de dados) em ambiente de laboratório de Computação em Nuvem.

## 🚀 Tecnologias

### Backend
- **Node.js 24** - Runtime JavaScript moderno e performático
- **Fastify** - Framework web rápido e eficiente com baixo overhead
- **Zod** - Validação de schemas TypeScript-first
- **Fastify Swagger** - Documentação automática da API
- **Prisma** - ORM moderno para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e sessões
- **JWT** - Autenticação segura

### Frontend
- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **Framer Motion** - Animações fluidas
- **React Hook Form** - Gerenciamento de formulários

### Infra / DevOps
- **Vagrant + VirtualBox** - Ambientes isolados por VM
- **Nginx** - Proxy reverso central
- **UFW** - Firewall para bloquear saída direta das VMs internas
- *(Docker Compose listado anteriormente ainda pode ser usado em outro fluxo, mas o foco atual é Vagrant)*

## 🏗️ Arquitetura (Vagrant / Rede Interna)

Ambiente composto por 4 VMs:

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

## 📁 Estrutura do Projeto

```
formula-info/
├── Vagrantfile                # Definição das 4 VMs
├── scripts/                   # Scripts de provisionamento (provision-*.sh)
├── backend/                   # API Fastify
├── frontend/                  # Aplicação Next.js
├── database/                  # Scripts SQL / init
├── nginx/                     # Config Nginx (proxy)
├── EXECUTION_REPORT.md        # Relatório do ambiente Vagrant
└── README.md
```

## 🛠️ Desenvolvimento (Modo Vagrant)

### Pré-requisitos
- VirtualBox
- Vagrant
- ~8 GB RAM disponível
- Git

### Subir ambiente completo
```bash
vagrant up          # Sobe proxy, database, backend, frontend
```

### Subir em ordem (recomendado para debug)
```bash
vagrant up database
vagrant up backend
vagrant up frontend
vagrant up proxy
```

### Acessos (via host)
- App (via proxy): http://192.168.56.10
- Frontend direto: http://192.168.56.13:3000 (interno)
- Backend direto: http://192.168.56.12:3001
- Backend health: http://192.168.56.12:3001/health
- Swagger: http://192.168.56.12:3001/docs (expor via proxy apenas se desejar)

### Validar firewall
```bash
vagrant ssh backend -c "sudo ufw status verbose"
vagrant ssh database -c "sudo ufw status verbose"
```
Esperado: deny outgoing (com regras allow para 192.168.56.0/24).

### Testes rápidos
```bash
curl -I http://192.168.56.10/health
curl -I http://192.168.56.10/api/health
curl -I http://192.168.56.12:3001/health
```

### Logs
```bash
vagrant ssh proxy    -c "sudo tail -f /var/log/nginx/access.log"
vagrant ssh backend  -c "sudo journalctl -u formula-backend -f"
vagrant ssh frontend -c "sudo journalctl -u formula-frontend -f"
vagrant ssh database -c "sudo journalctl -u postgresql -f"
```

### Destruir e recriar
```bash
vagrant destroy -f && vagrant up
```

### (Opcional) Endurecer proxy
Adicionar depois ao UFW da VM proxy:
```bash
sudo ufw allow out 80
sudo ufw allow out 443
sudo ufw deny out any
```

## 🎯 Funcionalidades Planejadas

- [ ] Dashboard com estatísticas atuais da F1
- [ ] Perfis detalhados dos pilotos
- [ ] Histórico de corridas e campeonatos
- [ ] Sistema de perfil de fã
- [ ] Favoritos e preferências
- [ ] Notificações de corridas

## 📊 APIs Utilizadas

- **OpenF1.org**: Dados em tempo real e históricos da F1
- **Endpoints principais**:
  - `/drivers` - Informações dos pilotos
  - `/races` - Dados das corridas
  - `/standings` - Classificações

## 🧪 Troubleshooting Rápido

| Sintoma | Ação |
|---------|------|
| Backend não sobe | `vagrant ssh backend` ➜ `journalctl -u formula-backend -n 50` |
| Sem acesso externo no proxy | Testar `curl https://www.google.com` dentro da VM proxy |
| VM interna acessando Internet | Verificar `sudo ufw status` e se NAT extra foi adicionada no VirtualBox GUI |
| Erro 502 no proxy | `sudo tail -n 50 /var/log/nginx/error.log` |
| Mudança em config Nginx não aplica | `sudo nginx -t && sudo systemctl reload nginx` |

## 📝 Licença

Este projeto está sob a licença MIT.

---
Ambiente multi-VM validado: somente proxy com saída externa; comunicação interna funcional; health endpoints respondendo. Consulte `EXECUTION_REPORT.md` para detalhes de verificação.
