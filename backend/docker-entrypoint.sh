#!/bin/sh

echo "Aguardando o banco de dados..."
# Espera o banco de dados estar disponível
while ! nc -z database 5432; do
  sleep 1
done

echo "Banco de dados disponível. Executando migrations..."
npx prisma migrate deploy

echo "Executando seed..."
npx prisma db seed

echo "Iniciando aplicação..."
exec "$@"