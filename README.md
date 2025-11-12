# Formula Info

Portal de informações sobre Fórmula 1 com dados dos pilotos do grid atual da temporada 2025.

## 🚀 Tecnologias

- **Backend**: Node.js, Fastify, TypeScript, Prisma
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Banco de Dados**: PostgreSQL
- **Proxy**: Nginx
- **Containerização**: Docker

## ⚡ Funcionalidades

- Listagem dos pilotos ativos da temporada 2025
- Cards dos pilotos com bandeiras dos países, equipes e biografias
- API REST documentada com Swagger
- Interface responsiva e moderna

## 🛠️ Como executar

### Pré-requisitos
- Docker
- Docker Compose

### Instalação

```bash
# 1. Clone o repositório
git clone <repository-url>
cd formula-info

# 2. Copie os arquivos de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Inicie a aplicação
docker-compose up -d --build

# 4. Execute as migrações e popule o banco
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npm run db:seed
```

### Acesso

- **Aplicação**: http://localhost
- **API**: http://localhost/api/v1
- **Swagger**: http://localhost/docs

### Comandos úteis

```bash
# Ver logs
docker-compose logs -f

# Parar aplicação
docker-compose down

# Reiniciar um serviço
docker-compose restart backend
```

## 📁 Estrutura

```
formula-info/
├── backend/          # API Fastify + Prisma
├── frontend/         # Next.js
└── nginx/            # Proxy Nginx
```

## 🏎️ Sobre

Formula Info é uma plataforma que exibe informações dos pilotos da temporada 2025 de Fórmula 1. O projeto apresenta cards interativos com dados como nacionalidade (com bandeiras emoji), equipes atuais e biografias dos pilotos.

Os dados são servidos através de uma API REST construída com Fastify e TypeScript, utilizando Prisma como ORM para comunicação com o banco PostgreSQL. O frontend é desenvolvido em Next.js com Tailwind CSS para estilização.