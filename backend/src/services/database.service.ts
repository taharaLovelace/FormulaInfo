import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

export function initializePrisma() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    throw new Error('Prisma not initialized. Call initializePrisma() first.');
  }
  return prismaInstance;
}

export async function disconnectPrisma() {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}