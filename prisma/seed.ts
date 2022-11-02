import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.client.upsert({
    where: { email: 'nathan@test.com' },
    update: {},
    create: {
      email: 'nathan@test.com',
      name: 'Nathan',
      password:
        '409a420b2951c00f426405f7d63dcf839b0d72990296a8b939193c844072fcb3eaa00359a00717c84cde623132c8eaa81590cdc380351e3085bd8c54927d9839.1bc085abf3c104ef7e43c73d8aabbf0d5e30a900f209b417dfb5a954b7bbd7da',
    },
  });

  await prisma.employee.upsert({
    where: { email: 'gomes@test.com' },
    update: {},
    create: {
      email: 'gomes@test.com',
      name: 'Gomes',
      password:
        'abdd666e1debcb29ea2613853463ee036c1bfeb5ea1fb27c9d442f3673e83cf1a8a2146c9b4a17e48202bde8b7648d235595a64d73372b6d743d57c8cd398daa.1efb1e849cbb323964c676fbfd2d403f6532abdd8771f53fd3cf403a9a045f54',
    },
  });

  await prisma.service.upsert({
    where: {
      id: 1,
    },
    update: {},
    create: {
      name: 'servico 1',
      description: 'Descricao do servico 1',
      estimatedTime: 50,
      value: 12376,
      commissionPercentage: 17,
      commissionValue: 2104,
      timeMeasure: 'MINUTE',
    },
  });

  await prisma.service.upsert({
    where: {
      id: 2,
    },
    update: {},
    create: {
      name: 'servico 2',
      description: 'Descricao do servico 2',
      estimatedTime: 50,
      value: 12376,
      commissionPercentage: 17,
      commissionValue: 2104,
      timeMeasure: 'MINUTE',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
