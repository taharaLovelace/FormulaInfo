import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type ListDriversParams = {
  active?: boolean;
  team?: string;
};

export async function listDrivers(params: ListDriversParams) {
  const { active, team } = params;
  return prisma.driver.findMany({
    where: {
      ...(active !== undefined ? { isActive: active } : {}),
      ...(team ? { teamName: { contains: team, mode: 'insensitive' } } : {}),
    },
    orderBy: { driverNumber: 'asc' },
  });
}
