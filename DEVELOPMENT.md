# 🏎️ Formula Info - Guia de Desenvolvimento

Este guia irá te ajudar a configurar e executar o projeto Formula Info localmente.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js 24+** ([Download](https://nodejs.org/))
- **Docker** ([Download](https://www.docker.com/))
- **Docker Compose** (geralmente incluído com Docker Desktop)
- **Git** ([Download](https://git-scm.com/))

## 🚀 Configuração Rápida

### 1. Configuração Automática (Recomendado)

Execute o script de configuração automática:

```bash
# Configurar tudo automaticamente
./dev-setup.sh setup
```

Este comando irá:
- Instalar todas as dependências
- Criar arquivos de configuração
- Inicializar banco de dados
- Subir todos os serviços

### 2. Configuração Manual

Se preferir fazer manualmente:

```bash
# 1. Instalar dependências
./dev-setup.sh install

# 2. Configurar variáveis de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Iniciar serviços
./dev-setup.sh start

# 4. Configurar banco de dados
cd backend
npx prisma migrate dev --name init
npx prisma generate
cd ..
```

## 🌐 Acessar a Aplicação

Após a configuração, você pode acessar:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:3000 | Interface principal da aplicação |
| **Backend API** | http://localhost:3001 | API REST |
| **API Docs** | http://localhost:3001/docs | Documentação Swagger |
| **Nginx Proxy** | http://localhost | Proxy reverso |

## 🛠️ Comandos Úteis

### Scripts de Desenvolvimento

```bash
# Iniciar ambiente de desenvolvimento
./dev-setup.sh start

# Parar todos os serviços
./dev-setup.sh stop

# Ver logs em tempo real
./dev-setup.sh logs

# Limpar containers e volumes
./dev-setup.sh clean
```

### Backend (Node.js + Express)

```bash
cd backend

# Desenvolvimento com hot-reload
npm run dev

# Build para produção
npm run build

# Executar testes
npm test

# Migrações do banco
npx prisma migrate dev
npx prisma studio  # Interface visual do banco
```

### Frontend (Next.js)

```bash
cd frontend

# Desenvolvimento com hot-reload
npm run dev

# Build para produção
npm run build
npm start

# Verificar tipos TypeScript
npm run type-check

# Executar linter
npm run lint
```

## 🗄️ Banco de Dados

### Estrutura Principal

- **users** - Usuários da plataforma
- **drivers** - Pilotos de F1
- **teams** - Equipes
- **races** - Corridas
- **race_results** - Resultados das corridas
- **user_favorites** - Favoritos dos usuários
- **user_predictions** - Previsões dos usuários

### Comandos Prisma

```bash
cd backend

# Gerar cliente Prisma
npx prisma generate

# Aplicar migrações
npx prisma migrate dev

# Reset do banco (CUIDADO: apaga dados)
npx prisma migrate reset

# Interface visual
npx prisma studio
```

## 🔧 Configuração de Ambiente

### Backend (.env)

```env
NODE_ENV=development
DATABASE_URL="postgresql://formula_user:formula_pass@localhost:5432/formula_info"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
OPENF1_API_URL="https://api.openf1.org/v1"
PORT=3001
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_OPENF1_API_URL=https://api.openf1.org/v1
```

## 🐛 Solução de Problemas

### Erro de Porta em Uso

```bash
# Verificar quais processos estão usando as portas
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5432  # PostgreSQL

# Parar serviços Docker
docker-compose down
```

### Problemas com Banco de Dados

```bash
# Recriar banco do zero
./dev-setup.sh clean
./dev-setup.sh setup
```

### Erro de Dependências

```bash
# Limpar cache npm
cd backend && npm ci
cd frontend && npm ci

# Ou reinstalar tudo
./dev-setup.sh install
```

## 📊 Estrutura do Projeto

```
formula-info/
├── backend/              # API Node.js + Express
│   ├── src/
│   │   ├── routes/       # Rotas da API
│   │   ├── controllers/  # Controladores
│   │   ├── services/     # Lógica de negócio
│   │   ├── middleware/   # Middlewares
│   │   └── utils/        # Utilitários
│   ├── prisma/           # Schema do banco
│   └── Dockerfile
├── frontend/             # App Next.js
│   ├── src/
│   │   ├── app/          # App Router (Next.js 14+)
│   │   ├── components/   # Componentes React
│   │   ├── hooks/        # Custom hooks
│   │   ├── store/        # Estado global
│   │   └── utils/        # Utilitários
│   └── Dockerfile
├── nginx/                # Configuração Nginx
├── database/             # Scripts SQL
├── docker-compose.yml    # Orquestração
└── dev-setup.sh         # Script de desenvolvimento
```

## 🎯 Próximos Passos

1. **Implementar Autenticação**
   - JWT tokens
   - Login/Register
   - Proteção de rotas

2. **Integração OpenF1 API**
   - Sincronização de dados
   - Cache Redis
   - Jobs em background

3. **Funcionalidades Principais**
   - Dashboard de estatísticas
   - Perfis de pilotos
   - Histórico de corridas
   - Sistema de favoritos

4. **Interface Completa**
   - Design responsivo
   - Dark mode
   - PWA features
   - Otimizações SEO

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `./dev-setup.sh logs`
2. Consulte este guia de troubleshooting
3. Abra uma issue no repositório

---

**Desenvolvido com ❤️ pela equipe Formula Info**
