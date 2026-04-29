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

1. Install the dependencies: `npm install`
2. Start the db container: `docker compose up -d`
3. Create and migrate the database: `npx prisma generate && npx prisma migrate dev`
4. Start the application: `npm run start:dev`

### Links

- App : [http://localhost:3000](http://localhost:3000)
- Swagger : [http://localhost:3000/api](http://localhost:3000/api)
- Mailhog : [http://localhost:8025](http://localhost:8025)
- Database : [http://localhost:51212](http://localhost:51212) (requires `npx prisma studio`)

## App flows

### Register process

1. You first have to send a POST request to `http://localhost:3000/users/register` with your login data.
2. Then you will receive a verification email, which will give you a link to verify your email address and give you a JWT token.

### Login process

Only users with verified emails can log in.
You have to send a POST request to `http://localhost:3000/users/login` with your login data.

If you don't have enabled 2FA, you will receive a JWT token if your credentials are valid.
Else, you will receive a 2FA email, which will give you a code to verify your email address and give you a JWT token.

### Enable/Disable 2FA

> For both, you have to be logged in by providing your JWT token in the POST request.

To enable : `http://localhost:3000/users/2fa/enable` ([Swagger](http://localhost:3000/api#/User/UserController_enableTwoFactor))

To disable : `http://localhost:3000/users/2fa/disable` ([Swagger](http://localhost:3000/api#/User/UserController_disableTwoFactor))

## Testing

To test, you can access the Swagger at [http://localhost:3000/api](http://localhost:3000/api)

### Users

| Email             | Password   | Roles |
| ----------------- | ---------- | ----- |
| `user1@test.com`  | `User123`  | user  |
| `user2@test.com`  | `User123`  | user  |
| `admin1@test.com` | `Admin123` | admin |
| `admin2@test.com` | `Admin123` | admin |

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
