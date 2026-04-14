# Bookify

## Register

```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "StrongPass123!",
    "alias": "alice"
  }'
```

## Login

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "StrongPass123!"
  }'
```
