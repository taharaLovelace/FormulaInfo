# Formula Info 🏎️

Portal de informações sobre Fórmula 1 com dados de pilotos e equipes da temporada 2025.

## 🚀 Tecnologias

| Backend | Frontend | Infra |
|---------|----------|-------|
| Node.js + Fastify | Next.js + React | Docker + Nginx |
| TypeScript + Prisma | Tailwind CSS | PostgreSQL + Redis |
| Vitest (testes) | | GitHub Actions (CI) |

## ⚡ Funcionalidades

- Listagem de pilotos e equipes da temporada 2025
- Sistema de autenticação (registro/login com JWT)
- Preferências do usuário (equipe e piloto favoritos)
- API REST com validação Zod
- Testes unitários e de integração

## 🛠️ Como executar

```bash
# Clone e configure
git clone https://github.com/taharaLovelace/FormulaInfo.git
cd formula-info
cp backend/.env.example backend/.env

# Inicie com Docker
docker compose up -d --build
```

### Acesso
- **App**: http://localhost
- **API**: http://localhost/api/v1

## 🧪 Testes

```bash
cd backend
npm test              # Executa testes
npm run test:coverage # Com cobertura
```

## 📁 Estrutura

```
formula-info/
├── backend/     # API Fastify + Prisma + Vitest
├── frontend/    # Next.js + Tailwind
├── nginx/       # Proxy reverso
└── .github/     # GitHub Actions (CI)
```

## 🔄 CI/CD

Pipeline automática no GitHub Actions:
- Executa em push/PR para `main` e `development`
- Roda testes unitários e de integração
- Usa PostgreSQL e Redis via Docker Compose