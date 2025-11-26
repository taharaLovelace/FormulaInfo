import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding teams...');

  const teams = [
    {
      name: 'Red Bull Racing',
      fullName: 'Oracle Red Bull Racing',
      country: 'Austria',
      logoUrl: '/team-logos/2025redbullracinglogowhite.avif',
      carImageUrl: '/team-cars/2025redbullracingcarright.avif',
      teamColor: '#0600EF',
      description: 'A Red Bull Racing é uma das equipes mais dominantes da Fórmula 1 moderna.',
      headquarters: 'Milton Keynes, Reino Unido',
      founded: 2005,
      isActive: true
    },
    {
      name: 'Ferrari',
      fullName: 'Scuderia Ferrari',
      country: 'Italy',
      logoUrl: '/team-logos/2025ferrarilogowhite.avif',
      carImageUrl: '/team-cars/2025ferraricarright.avif',
      teamColor: '#DC0000',
      description: 'A equipe mais icônica e histórica da Fórmula 1.',
      headquarters: 'Maranello, Itália',
      founded: 1950,
      isActive: true
    },
    {
      name: 'Mercedes',
      fullName: 'Mercedes-AMG PETRONAS F1 Team',
      country: 'Germany',
      logoUrl: '/team-logos/2025mercedeslogowhite.avif',
      carImageUrl: '/team-cars/2025mercedescarright.avif',
      teamColor: '#00D2BE',
      description: 'Dominante na era híbrida da Fórmula 1.',
      headquarters: 'Brackley, Reino Unido',
      founded: 2010,
      isActive: true
    },
    {
      name: 'McLaren',
      fullName: 'McLaren Formula 1 Team',
      country: 'United Kingdom',
      logoUrl: '/team-logos/2025mclarenlogowhite.avif',
      carImageUrl: '/team-cars/2025mclarencarright.avif',
      teamColor: '#FF8700',
      description: 'Uma das equipes mais tradicionais e bem-sucedidas da F1.',
      headquarters: 'Woking, Reino Unido',
      founded: 1966,
      isActive: true
    },
    {
      name: 'Aston Martin',
      fullName: 'Aston Martin Aramco Cognizant F1 Team',
      country: 'United Kingdom',
      logoUrl: '/team-logos/2025astonmartinlogowhite.avif',
      carImageUrl: '/team-cars/2025astonmartincarright.avif',
      teamColor: '#006F62',
      description: 'Equipe britânica de luxo com ambições de título.',
      headquarters: 'Silverstone, Reino Unido',
      founded: 2021,
      isActive: true
    },
    {
      name: 'Alpine',
      fullName: 'BWT Alpine F1 Team',
      country: 'France',
      logoUrl: '/team-logos/2025alpinelogowhite.avif',
      carImageUrl: '/team-cars/2025alpinecarright.avif',
      teamColor: '#0090FF',
      description: 'Representante francesa na Fórmula 1.',
      headquarters: 'Enstone, Reino Unido',
      founded: 2021,
      isActive: true
    },
    {
      name: 'Williams',
      fullName: 'Williams Racing',
      country: 'United Kingdom',
      logoUrl: '/team-logos/2025williamslogowhite.avif',
      carImageUrl: '/team-cars/2025williamscarright.avif',
      teamColor: '#005AFF',
      description: 'Equipe histórica com grande tradição na F1.',
      headquarters: 'Grove, Reino Unido',
      founded: 1977,
      isActive: true
    },
    {
      name: 'Racing Bulls',
      fullName: 'Visa Cash App RB Formula One Team',
      country: 'Italy',
      logoUrl: '/team-logos/2025racingbullslogowhite.avif',
      carImageUrl: '/team-cars/2025racingbullscarright.avif',
      teamColor: '#6692FF',
      description: 'Equipe irmã da Red Bull Racing.',
      headquarters: 'Faenza, Itália',
      founded: 2006,
      isActive: true
    },
    {
      name: 'Haas F1 Team',
      fullName: 'MoneyGram Haas F1 Team',
      country: 'United States',
      logoUrl: '/team-logos/2025haasf1teamlogowhite.avif',
      carImageUrl: '/team-cars/2025haasf1teamcarright.avif',
      teamColor: '#FFFFFF',
      description: 'Única equipe americana na Fórmula 1.',
      headquarters: 'Kannapolis, Estados Unidos',
      founded: 2016,
      isActive: true
    },
    {
      name: 'Kick Sauber',
      fullName: 'Stake F1 Team Kick Sauber',
      country: 'Switzerland',
      logoUrl: '/team-logos/2025kicksauberlogowhite.avif',
      carImageUrl: '/team-cars/2025kicksaubercarright.avif',
      teamColor: '#52E252',
      description: 'Equipe suíça com nova identidade em 2025.',
      headquarters: 'Hinwil, Suíça',
      founded: 1993,
      isActive: true
    }
  ];

  // Criar equipes
  for (const teamData of teams) {
    try {
      await prisma.team.upsert({
        where: { name: teamData.name },
        update: teamData,
        create: teamData,
      });
      console.log(`✅ Team ${teamData.name} seeded successfully`);
    } catch (error) {
      console.error(`❌ Error seeding team ${teamData.name}:`, error);
    }
  }

  console.log('Teams seeded successfully');
  console.log('Seeding drivers...');

  const drivers = [
    {
      driverNumber: 1,
      fullName: 'Max Verstappen',
      firstName: 'Max',
      lastName: 'Verstappen',
      nationality: 'NL',
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
      nationality: 'NZ',
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
      nationality: 'MC',
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
      nationality: 'GB',
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
      nationality: 'GB',
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
      nationality: 'AU',
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
      nationality: 'GB',
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
      nationality: 'IT',
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
      nationality: 'ES',
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
      nationality: 'CA',
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
      nationality: 'JP',
      teamName: 'Red Bull Racing',
      birthDate: new Date('2000-05-11'),
      bio: 'Piloto japonês confirmado na RB.',
      isActive: true
    },
    {
      driverNumber: 6,
      fullName: 'Isack Hadjar',
      firstName: 'Isack',
      lastName: 'Hadjar',
      nationality: 'FR',
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
      nationality: 'DE',
      teamName: 'Sauber',
      birthDate: new Date('1987-08-19'),
      bio: 'Piloto alemão experiente se juntando à futura equipe de fábrica da Audi.',
      isActive: true
    },
    {
      driverNumber: 5,
      fullName: 'Gabriel Bortoleto',
      firstName: 'Gabriel',
      lastName: 'Bortoleto',
      nationality: 'BR',
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
      nationality: 'GB',
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
      nationality: 'FR',
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
      nationality: 'AR',
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
      nationality: 'TH',
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
      nationality: 'ES',
      teamName: 'Williams',
      birthDate: new Date('1994-09-01'),
      bio: 'Vencedor de múltiplas corridas se junta à Williams Racing.',
      isActive: true
    },
    {
      driverNumber: 31,
      fullName: 'Esteban Ocon',
      firstName: 'Esteban',
      lastName: 'Ocon',
      nationality: 'FR',
      teamName: 'Alpine',
      birthDate: new Date('1996-09-17'),
      bio: 'Piloto francês experiente continua com a Alpine.',
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
