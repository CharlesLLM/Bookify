# Bookify

Bookify is a book management application built with NestJS.

## Installation and setup

> Quick start for dev: `make boot`

1. Install the dependencies:

```bash
npm install
```

2. Start the db container:

```bash
docker compose up -d
```

3. Create and migrate the database:

```bash
npx prisma generate
npx prisma migrate dev
```

4. Start the application:

```bash
npm run start:dev
```

## Testing

### Running fixtures

npm run seed

### Register

```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "StrongPass123!",
    "alias": "alice"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "StrongPass123!"
  }'
```
