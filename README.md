# Formula Info 🏎️

Uma plataforma moderna e abrangente para fãs de Fórmula 1, oferecendo informações detalhadas sobre pilotos, equipes, corridas, estatísticas e muito mais.

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

### DevOps
- **Docker & Docker Compose** - Containerização e orquestração
- **Nginx** - Proxy reverso e balanceamento de carga

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Nginx Proxy   │
│   (Next.js)     │◄───┤   (Port 80)     │
│   Port 3000     │    │                 │
└─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   Backend API   │
                       │   (Fastify)     │
                       │   Port 3001     │
                       └─────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │   Swagger UI    │
│   Port 5432     │    │   Port 6379     │    │ /docs endpoint  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Estrutura do Projeto

```
formula-info/
├── frontend/          # Next.js application
├── backend/           # Fastify API
├── nginx/             # Nginx configuration  
├── database/          # PostgreSQL scripts
├── docker-compose.yml # Orquestração dos serviços
└── docs/             # Documentação
```

## 🛠️ Desenvolvimento

### Pré-requisitos
- Node.js 18+
- Docker & Docker Compose
- Git

### Iniciando o projeto
```bash
# Clone o repositório
git clone <repository-url>
cd formula-info

# Inicie todos os serviços
docker-compose up -d

# Acesse:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# API Docs: http://localhost:3001/docs
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

## 📝 Licença

Este projeto está sob a licença MIT.
