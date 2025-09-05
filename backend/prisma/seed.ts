import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding drivers...');

  const drivers = [
    {
      driverNumber: 1,
      fullName: 'Max Verstappen',
      firstName: 'Max',
      lastName: 'Verstappen',
      nationality: 'Dutch',
      teamName: 'Red Bull Racing',
      birthDate: new Date('1997-09-30'),
      bio: 'Current Formula 1 World Champion',
      isActive: true
    },
    {
      driverNumber: 11,
      fullName: 'Sergio Pérez',
      firstName: 'Sergio',
      lastName: 'Pérez',
      nationality: 'Mexican',
      teamName: 'Red Bull Racing',
      birthDate: new Date('1990-01-26'),
      bio: 'Experienced driver with multiple podiums',
      isActive: true
    },
    {
      driverNumber: 16,
      fullName: 'Charles Leclerc',
      firstName: 'Charles',
      lastName: 'Leclerc',
      nationality: 'Monegasque',
      teamName: 'Ferrari',
      birthDate: new Date('1997-10-16'),
      bio: 'Ferrari driver known for his speed',
      isActive: true
    },
    {
      driverNumber: 55,
      fullName: 'Carlos Sainz Jr.',
      firstName: 'Carlos',
      lastName: 'Sainz Jr.',
      nationality: 'Spanish',
      teamName: 'Ferrari',
      birthDate: new Date('1994-09-01'),
      bio: 'Experienced Spanish driver',
      isActive: true
    },
    {
      driverNumber: 4,
      fullName: 'Lando Norris',
      firstName: 'Lando',
      lastName: 'Norris',
      nationality: 'British',
      teamName: 'McLaren',
      birthDate: new Date('1999-11-13'),
      bio: 'Young British talent',
      isActive: true
    },
    {
      driverNumber: 81,
      fullName: 'Oscar Piastri',
      firstName: 'Oscar',
      lastName: 'Piastri',
      nationality: 'Australian',
      teamName: 'McLaren',
      birthDate: new Date('2001-04-06'),
      bio: 'Australian rookie driver',
      isActive: true
    },
    {
      driverNumber: 44,
      fullName: 'Lewis Hamilton',
      firstName: 'Lewis',
      lastName: 'Hamilton',
      nationality: 'British',
      teamName: 'Mercedes',
      birthDate: new Date('1985-01-07'),
      bio: '7-time World Champion',
      isActive: true
    },
    {
      driverNumber: 63,
      fullName: 'George Russell',
      firstName: 'George',
      lastName: 'Russell',
      nationality: 'British',
      teamName: 'Mercedes',
      birthDate: new Date('1998-02-15'),
      bio: 'British driver with strong performances',
      isActive: true
    },
    {
      driverNumber: 14,
      fullName: 'Fernando Alonso',
      firstName: 'Fernando',
      lastName: 'Alonso',
      nationality: 'Spanish',
      teamName: 'Aston Martin',
      birthDate: new Date('1981-07-29'),
      bio: '2-time World Champion',
      isActive: true
    },
    {
      driverNumber: 18,
      fullName: 'Lance Stroll',
      firstName: 'Lance',
      lastName: 'Stroll',
      nationality: 'Canadian',
      teamName: 'Aston Martin',
      birthDate: new Date('1998-10-29'),
      bio: 'Canadian driver',
      isActive: true
    },
    {
      driverNumber: 22,
      fullName: 'Yuki Tsunoda',
      firstName: 'Yuki',
      lastName: 'Tsunoda',
      nationality: 'Japanese',
      teamName: 'RB',
      birthDate: new Date('2000-05-11'),
      bio: 'Japanese driver',
      isActive: true
    },
    {
      driverNumber: 30,
      fullName: 'Liam Lawson',
      firstName: 'Liam',
      lastName: 'Lawson',
      nationality: 'New Zealand',
      teamName: 'RB',
      birthDate: new Date('2002-02-11'),
      bio: 'New Zealand driver',
      isActive: true
    },
    {
      driverNumber: 77,
      fullName: 'Valtteri Bottas',
      firstName: 'Valtteri',
      lastName: 'Bottas',
      nationality: 'Finnish',
      teamName: 'Sauber',
      birthDate: new Date('1989-08-28'),
      bio: 'Former Mercedes driver',
      isActive: true
    },
    {
      driverNumber: 24,
      fullName: 'Zhou Guanyu',
      firstName: 'Zhou',
      lastName: 'Guanyu',
      nationality: 'Chinese',
      teamName: 'Sauber',
      birthDate: new Date('1999-05-30'),
      bio: 'Chinese driver',
      isActive: true
    },
    {
      driverNumber: 20,
      fullName: 'Kevin Magnussen',
      firstName: 'Kevin',
      lastName: 'Magnussen',
      nationality: 'Danish',
      teamName: 'Haas',
      birthDate: new Date('1992-10-05'),
      bio: 'Danish driver',
      isActive: true
    },
    {
      driverNumber: 27,
      fullName: 'Nico Hülkenberg',
      firstName: 'Nico',
      lastName: 'Hülkenberg',
      nationality: 'German',
      teamName: 'Haas',
      birthDate: new Date('1987-08-19'),
      bio: 'Experienced German driver',
      isActive: true
    },
    {
      driverNumber: 31,
      fullName: 'Esteban Ocon',
      firstName: 'Esteban',
      lastName: 'Ocon',
      nationality: 'French',
      teamName: 'Alpine',
      birthDate: new Date('1996-09-17'),
      bio: 'French driver',
      isActive: true
    },
    {
      driverNumber: 10,
      fullName: 'Pierre Gasly',
      firstName: 'Pierre',
      lastName: 'Gasly',
      nationality: 'French',
      teamName: 'Alpine',
      birthDate: new Date('1996-02-07'),
      bio: 'French driver',
      isActive: true
    },
    {
      driverNumber: 23,
      fullName: 'Alexander Albon',
      firstName: 'Alexander',
      lastName: 'Albon',
      nationality: 'Thai',
      teamName: 'Williams',
      birthDate: new Date('1996-03-23'),
      bio: 'Thai driver',
      isActive: true
    },
    {
      driverNumber: 43,
      fullName: 'Franco Colapinto',
      firstName: 'Franco',
      lastName: 'Colapinto',
      nationality: 'Argentine',
      teamName: 'Williams',
      birthDate: new Date('2003-05-27'),
      bio: 'Argentine driver',
      isActive: true
    }
  ];

  for (const driver of drivers) {
    await prisma.driver.upsert({
      where: { driverNumber: driver.driverNumber },
      update: driver,
      create: driver
    });
  }

  console.log('Drivers seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
