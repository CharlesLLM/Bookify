import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const users = [
  {
    email: 'user1@test.com',
    password: 'User123',
    alias: 'UserOne',
    roles: ['user'],
  },
  {
    email: 'user2@test.com',
    password: 'User123',
    alias: 'UserTwo',
    roles: ['user'],
  },
  {
    email: 'admin1@test.com',
    password: 'Admin123',
    alias: 'AdminOne',
    roles: ['admin'],
  },
  {
    email: 'admin2@test.com',
    password: 'Admin123',
    alias: 'AdminTwo',
    roles: ['admin'],
  },
];

const books = [
  {
    title: "Harry Potter and the Philosopher's Stone",
    isbn: '978-0747549559',
    author: 'J.K. Rowling',
    publishedYear: 1997,
    summary: 'A young boy discovers he is a wizard on his 11th birthday.',
    tags: ['Fantasy', 'Adventure'],
  },
  {
    title: 'Harry Potter and the Chamber of Secrets',
    isbn: '978-1338716535',
    author: 'J.K. Rowling',
    publishedYear: 1998,
    tags: ['Fantasy', 'Adventure'],
  },
  {
    title: 'Harry Potter and the Prisoner of Azkaban',
    isbn: '978-1338815283',
    author: 'J.K. Rowling',
    publishedYear: 1999,
    tags: ['Fantasy', 'Adventure'],
  },
  {
    title: 'Harry Potter and the Goblet of Fire',
    isbn: '978-1546154419',
    author: 'J.K. Rowling',
    publishedYear: 2000,
    tags: ['Fantasy', 'Adventure'],
  },
  {
    title: 'Harry Potter and the Order of the Phoenix',
    isbn: '978-0545791434',
    author: 'J.K. Rowling',
    publishedYear: 2003,
    tags: ['Fantasy', 'Adventure'],
  },
  {
    title: 'Harry Potter and the Half-Blood Prince',
    isbn: '978-0545791441',
    author: 'J.K. Rowling',
    publishedYear: 2005,
    tags: ['Fantasy', 'Adventure'],
  },
  {
    title: 'Harry Potter and the Deathly Hallows',
    isbn: '978-0545010221',
    author: 'J.K. Rowling',
    publishedYear: 2007,
    tags: ['Fantasy', 'Adventure'],
  },
];

async function bootstrap() {
  for (const user of users) {
    await createUser(user);
  }

  console.log('Users seeded');

  for (const book of books) {
    await createBook(book);
  }

  console.log('Books seeded');
}

async function createUser(data: any) {
  await prisma.user.upsert({
    where: { email: data.email },
    update: {},
    create: {
      email: data.email,
      passwordHash: await bcrypt.hash(data.password, 10),
      alias: data.alias,
      roles: data.roles,
      isVerified: false,
      twoFactorEnabled: false,
    },
  });

  console.log(`Created user : ${data.email}`);
}

async function createBook(data: any) {
  await prisma.book.upsert({
    where: { isbn: data.isbn },
    update: {},
    create: data,
  });

  console.log(`Created book : ${data.title} (${data.isbn})`);
}

bootstrap()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
