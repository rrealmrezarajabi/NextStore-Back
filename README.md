# NextStore Backend

NestJS backend for NextStore frontend with Prisma + SQLite (local file DB).

## Stack

- NestJS
- SQLite (local file DB)
- Prisma ORM
- JWT auth (access + refresh)
- Swagger
- File upload (multipart)

## API Base

- Base URL: `http://localhost:4000/api/v1`
- Swagger: `http://localhost:4000/api/docs`
- Static uploads: `http://localhost:4000/uploads/*`

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Run migrations + generate client:

```bash
npm run prisma:migrate
npm run prisma:generate
```

4. Seed database:

```bash
npm run prisma:seed
```

5. Start backend:

```bash
npm run dev
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run prisma:migrate`
- `npm run prisma:seed`
- `npm run test`
- `npm run test:e2e`

## Default Admin Credentials (Seed)

- Email: `admin@nextstore.dev`
- Password: `admin1234`

## Frontend Compatibility

This API is compatible with current frontend calls:

- `GET /products?categoryId=&title=`
- `GET /products/:id`
- `POST /products`
- `DELETE /products/:id`
- `GET /categories`
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`

By default, list endpoints return flat arrays for compatibility.

- `GET /products` => `Product[]`
- `GET /categories` => `Category[]`
- `GET /users` => `User[]`

To get paginated response, send `flat=false`:

- `GET /products?flat=false&offset=0&limit=20`
- `GET /categories?flat=false&offset=0&limit=20`
- `GET /users?flat=false&offset=0&limit=20`

Paginated format:

```json
{
  "data": [],
  "meta": {
    "total": 0,
    "offset": 0,
    "limit": 20,
    "hasNext": false
  }
}
```

## Auth Endpoints

- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/profile` (Bearer token)

## Role Guard Toggle

Env: `AUTH_GUARDS_ENABLED`

- `false` (default): skips admin role checks on protected admin routes
- `true`: enforces admin role checks on protected admin routes

JWT-protected routes still require a valid access token in either the `Authorization: Bearer <token>` header or the `access_token` cookie.

## File Upload

- `POST /files/upload`
- multipart field name: `file`

Response:

```json
{
  "filename": "1700000000000-123456789.png",
  "originalname": "image.png",
  "mimetype": "image/png",
  "size": 12345,
  "location": "/uploads/1700000000000-123456789.png"
}
```

## Frontend BASE_URL

Set frontend base URL to:

```ts
export const BASE_URL = "http://localhost:4000/api/v1";
```

For protected endpoints send:

```http
Authorization: Bearer <access_token>
```
