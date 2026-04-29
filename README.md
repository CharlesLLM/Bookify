# Bookify

Bookify is a book management application built with NestJS.
As a visitor, you can register, login and manage books you own.
As an admin, you can also create, update, and delete books.

## Installation and setup

### Quick start

```bash
make boot
```

It will install all dependencies, init and seed the database, and start the application.

### Manual setup

1. Copy the .env.example to .env `cp .env.example .env`
2. Install the dependencies: `npm install`
3. Start the db container: `docker compose up -d`
4. Create and migrate the database: `npx prisma generate && npx prisma migrate dev`
5. Start the application: `npm run start` (`npm run start:dev` for watch mode)

### Links

- App : [localhost:3000](http://localhost:3000)
- Swagger : [localhost:3000/api](http://localhost:3000/api)
- Mailhog : [localhost:8025](http://localhost:8025)
- Database : [localhost:51212](http://localhost:51212) (requires to run `npx prisma studio`)

## Testing

To test, you can access the Swagger at [localhost:3000/api](http://localhost:3000/api)

### Users

| Email             | Password   | Roles |
| ----------------- | ---------- | ----- |
| `user1@test.com`  | `User123`  | user  |
| `user2@test.com`  | `User123`  | user  |
| `admin1@test.com` | `Admin123` | admin |
| `admin2@test.com` | `Admin123` | admin |

### 2FA

To enable or disable 2FA, you can use the following endpoints (need to be authenticated):

To enable : `localhost:3000/users/2fa/enable` ([Swagger](http://localhost:3000/api#/User/UserController_enableTwoFactor))

To disable : `localhost:3000/users/2fa/disable` ([Swagger](http://localhost:3000/api#/User/UserController_disableTwoFactor))

### Manual testing

You can also test manually with curl requests, like :

```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "StrongPass123!",
    "alias": "Test"
  }'
```
