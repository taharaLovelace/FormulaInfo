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
      nationality: 'Holandês',
      teamName: 'Red Bull Racing',
      birthDate: new Date('1997-09-30'),
      bio: 'Atual campeão mundial de Fórmula 1, permanece na Red Bull em 2025.',
      isActive: true
    },
    {
      driverNumber: 30,
      fullName: 'Liam Lawson',
      firstName: 'Liam',
      lastName: 'Lawson',
      nationality: 'Neozelandês',
      teamName: 'Racing Bulls', 
      birthDate: new Date('2002-02-11'),
      bio: 'Piloto neozelandês promovido para a equipe principal da Red Bull.',
      isActive: true
    },
    {
      driverNumber: 16,
      fullName: 'Charles Leclerc',
      firstName: 'Charles',
      lastName: 'Leclerc',
      nationality: 'Monegasco',
      teamName: 'Ferrari',
      birthDate: new Date('1997-10-16'),
      bio: 'Piloto estrela da Ferrari, permanece na equipe.',
      isActive: true
    },
    {
      driverNumber: 44,
      fullName: 'Lewis Hamilton',
      firstName: 'Lewis',
      lastName: 'Hamilton',
      nationality: 'Britânico',
      teamName: 'Ferrari',
      birthDate: new Date('1985-01-07'),
      bio: 'Heptacampeão mundial em uma mudança histórica para a Ferrari.',
      isActive: true
    },
    {
      driverNumber: 4,
      fullName: 'Lando Norris',
      firstName: 'Lando',
      lastName: 'Norris',
      nationality: 'Britânico',
      teamName: 'McLaren',
      birthDate: new Date('1999-11-13'),
      bio: 'Piloto chave da McLaren, continua para 2025.',
      isActive: true
    },
    {
      driverNumber: 81,
      fullName: 'Oscar Piastri',
      firstName: 'Oscar',
      lastName: 'Piastri',
      nationality: 'Australiano',
      teamName: 'McLaren',
      birthDate: new Date('2001-04-06'),
      bio: 'Talento australiano continuando sua jornada com a McLaren.',
      isActive: true
    },
    {
      driverNumber: 63,
      fullName: 'George Russell',
      firstName: 'George',
      lastName: 'Russell',
      nationality: 'Britânico',
      teamName: 'Mercedes',
      birthDate: new Date('1998-02-15'),
      bio: 'Lidera a equipe Mercedes em uma nova era.',
      isActive: true
    },
    {
      driverNumber: 12, 
      fullName: 'Andrea Kimi Antonelli',
      firstName: 'Andrea Kimi',
      lastName: 'Antonelli',
      nationality: 'Italiano',
      teamName: 'Mercedes',
      birthDate: new Date('2006-08-25'),
      bio: 'Estreante muito bem avaliado subindo para a Fórmula 1 com a Mercedes.',
      isActive: true
    },
    {
      driverNumber: 14,
      fullName: 'Fernando Alonso',
      firstName: 'Fernando',
      lastName: 'Alonso',
      nationality: 'Espanhol',
      teamName: 'Aston Martin',
      birthDate: new Date('1981-07-29'),
      bio: 'Bicampeão mundial continuando com a Aston Martin.',
      isActive: true
    },
    {
      driverNumber: 18,
      fullName: 'Lance Stroll',
      firstName: 'Lance',
      lastName: 'Stroll',
      nationality: 'Canadense',
      teamName: 'Aston Martin',
      birthDate: new Date('1998-10-29'),
      bio: 'Piloto canadense permanecendo na Aston Martin.',
      isActive: true
    },
    {
      driverNumber: 22,
      fullName: 'Yuki Tsunoda',
      firstName: 'Yuki',
      lastName: 'Tsunoda',
      nationality: 'Japonês',
      teamName: 'Red Bull Racing',
      birthDate: new Date('2000-05-11'),
      bio: 'Piloto japonês confirmado na RB.',
      isActive: true
    },
    {
      driverNumber: 29,
      fullName: 'Isack Hadjar',
      firstName: 'Isack',
      lastName: 'Hadjar',
      nationality: 'Francês',
      teamName: 'Racing Bulls',
      birthDate: new Date('2004-09-28'),
      bio: 'Jovem piloto da academia Red Bull fazendo sua estreia na F1.',
      isActive: true
    },
    {
      driverNumber: 27,
      fullName: 'Nico Hülkenberg',
      firstName: 'Nico',
      lastName: 'Hülkenberg',
      nationality: 'Alemão',
      teamName: 'Sauber',
      birthDate: new Date('1987-08-19'),
      bio: 'Piloto alemão experiente se juntando à futura equipe de fábrica da Audi.',
      isActive: true
    },
    {
      driverNumber: 8,
      fullName: 'Gabriel Bortoleto',
      firstName: 'Gabriel',
      lastName: 'Bortoleto',
      nationality: 'Brasileiro',
      teamName: 'Sauber',
      birthDate: new Date('2004-10-14'),
      bio: 'Campeão de Fórmula 2 fazendo sua estreia na F1. Futuro campeão mundial.',
      isActive: true
    },
    {
      driverNumber: 87,
      fullName: 'Oliver Bearman',
      firstName: 'Oliver',
      lastName: 'Bearman',
      nationality: 'Britânico',
      teamName: 'Haas',
      birthDate: new Date('2005-05-08'),
      bio: 'Estreante promissor da Grã-Bretanha se juntando à Haas F1 Team.',
      isActive: true
    },
    {
      driverNumber: 10,
      fullName: 'Pierre Gasly',
      firstName: 'Pierre',
      lastName: 'Gasly',
      nationality: 'Francês',
      teamName: 'Alpine',
      birthDate: new Date('1996-02-07'),
      bio: 'Piloto francês continuando com a Alpine.',
      isActive: true
    },
    {
      driverNumber: 43,
      fullName: 'Franco Colapinto',
      firstName: 'Franco',
      lastName: 'Colapinto',
      nationality: 'Argentino',
      teamName: 'Alpine',
      birthDate: new Date('2003-05-27'),
      bio: 'Piloto argentino se junta à Alpine para a temporada de 2025.',
      isActive: true
    },
    {
      driverNumber: 23,
      fullName: 'Alexander Albon',
      firstName: 'Alexander',
      lastName: 'Albon',
      nationality: 'Tailandês',
      teamName: 'Williams',
      birthDate: new Date('1996-03-23'),
      bio: 'Piloto tailandês permanece como piloto principal da Williams.',
      isActive: true
    },
    {
      driverNumber: 55,
      fullName: 'Carlos Sainz Jr.',
      firstName: 'Carlos',
      lastName: 'Sainz Jr.',
      nationality: 'Espanhol',
      teamName: 'Williams',
      birthDate: new Date('1994-09-01'),
      bio: 'Vencedor de múltiplas corridas se junta à Williams Racing.',
      isActive: true
    },
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
