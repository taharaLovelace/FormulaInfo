import { getPrismaClient } from './database.service';

export type ListDriversParams = {
  active?: boolean;
  team?: string;
};

export async function listDrivers(params: ListDriversParams) {
  const { active, team } = params;
  const prisma = getPrismaClient();
  return prisma.driver.findMany({
    where: {
      ...(active !== undefined ? { isActive: active } : {}),
      ...(team ? { teamName: { contains: team, mode: 'insensitive' } } : {}),
    },
    orderBy: { driverNumber: 'asc' },
  });
}
