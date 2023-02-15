# Master Backend

[TODO]

### Prereq:
Node - 12.19.0

### Generate Migrations

- Remove volumes
```bash
docker-compose down -v
```

- Update .env file
```bash
DB_HOST=localhost
DB_PORT=5433
```

- Create migrations
```bash
npm run typeorm -- migration:generate -n setup_database
```

- Revert .env file
```bash
DB_HOST=postgres
DB_PORT=5432
```

## Setup

- Run the following command to set-up postgres and run migrations:

```sh
  make set-up-postgres
```

- Start dependencies:

```sh
  make start-dependencies
```

- Start Backend container:

```sh
  make start-backend
```

## Database

- Up postgres container
```bash
docker-compose exec postgres bash
```

- Sign the database
```bash
psql -U postgres
```

- Connect to database
```
\c postgres
```

## Testing

Create a user in database

```sql
INSERT INTO public.users (
      name
    , email
    , password
    , status
    , type
    , created_at
    , updated_at
    , last_login
) VALUES (
    'test',
    'test@postgres.ai',
    '$2a$08$F0yBVt5F2rOKJWMWJxz14uQH8o.EwCEAnnaNFeIQ9oXuRZhc8lSEu',
    true,
    'super_admin',
    now(),
    now(),
    now()
);
```

Get Token:

```bash
curl --location --request POST 'http://localhost:3334/auth/signin' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "test@postgres.ai",
    "password": "test123"
}'
```
