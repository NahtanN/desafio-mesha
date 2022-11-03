import { Prisma, PrismaClient } from '@prisma/client';

export const seedTestDataBase = async () => {
  const prisma = new PrismaClient();

  await prisma.client.upsert({
    where: { email: 'test1@test.com' },
    update: {},
    create: {
      email: 'test1@test.com',
      name: 'Test 1',
      password:
        '409a420b2951c00f426405f7d63dcf839b0d72990296a8b939193c844072fcb3eaa00359a00717c84cde623132c8eaa81590cdc380351e3085bd8c54927d9839.1bc085abf3c104ef7e43c73d8aabbf0d5e30a900f209b417dfb5a954b7bbd7da',
    },
  });

  await prisma.employee.upsert({
    where: { email: 'test2@test.com' },
    update: {},
    create: {
      email: 'test2@test.com',
      name: 'Test 2',
      password:
        'abdd666e1debcb29ea2613853463ee036c1bfeb5ea1fb27c9d442f3673e83cf1a8a2146c9b4a17e48202bde8b7648d235595a64d73372b6d743d57c8cd398daa.1efb1e849cbb323964c676fbfd2d403f6532abdd8771f53fd3cf403a9a045f54',
    },
  });
};

export const createServices = async () => {
  const prisma = new PrismaClient();

  const dbServices = [
    {
      name: 'servico 1',
      description: 'Descricao do servico 1',
      estimatedTime: 50,
      value: 12376,
      commissionPercentage: 17,
      commissionValue: 2104,
      timeMeasure: 'MINUTE',
    },
    {
      name: 'servico 2',
      description: 'Descricao do servico 2',
      estimatedTime: 50,
      value: 12376,
      commissionPercentage: 17,
      commissionValue: 2104,
      timeMeasure: 'MINUTE',
    },
  ];

  const servicesIds = [];

  for (let index = 1; index <= dbServices.length; ++index) {
    const data = dbServices[index - 1];

    const newService = await prisma.service.upsert({
      where: {
        id: index,
      },
      update: {},
      create: data as Prisma.ServiceCreateInput,
    });

    servicesIds.push(newService.id);
  }

  return servicesIds;
};

export const createAttendance = async () => {
  const prisma = new PrismaClient();

  const attendance = await prisma.attendance.create({
    data: {
      Client: {
        connectOrCreate: {
          where: {
            email: 'asdf@asdf.com',
          },
          create: {
            email: 'asdf@asdf.com',
            name: 'asdf',
          },
        },
      },
      totalValue: 37976,
      totalCommissionPercentage: 1700,
      totalCommissionValue: 6456,
      AttendanceServices: {
        create: {
          Service: {
            connectOrCreate: {
              where: {
                id: 1,
              },
              create: {
                name: 'servico 1',
                description: 'Descricao do servico 1',
                estimatedTime: 50,
                value: 12376,
                commissionPercentage: 17,
                commissionValue: 2104,
                timeMeasure: 'MINUTE',
              },
            },
          },
        },
      },
    },
  });

  return attendance.id;
};
