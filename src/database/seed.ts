import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  await safeCreate(userService, {
    email: 'user1@test.com',
    password: 'user123',
    alias: 'UserOne',
    roles: ['user'],
  });

  await safeCreate(userService, {
    email: 'user2@test.com',
    password: 'user123',
    alias: 'UserTwo',
    roles: ['user'],
  });

  await safeCreate(userService, {
    email: 'user3@test.com',
    password: 'user123',
    alias: 'UserThree',
    roles: ['user'],
  });

  await safeCreate(userService, {
    email: 'admin1@test.com',
    password: 'admin123',
    alias: 'AdminOne',
    roles: ['admin'],
  });

  await safeCreate(userService, {
    email: 'admin2@test.com',
    password: 'admin123',
    alias: 'AdminTwo',
    roles: ['admin'],
  });

  console.log('Seeding done');
  await app.close();
}

async function safeCreate(userService: UserService, data: any) {
  try {
    await userService.create(data);
    console.log(`Created: ${data.email}`);
  } catch (e: any) {
    if (e.status === 409) {
      console.log(`Skipped (already exists): ${data.email}`);
    } else {
      throw e;
    }
  }
}

bootstrap();
