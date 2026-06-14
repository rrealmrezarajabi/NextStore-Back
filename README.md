# NextStore Backend

NextStore Backend is a NestJS REST API built to support the [NextStore frontend](../NextStore-Front). It provides the ecommerce data, authentication, cart, checkout, address, order, user, category, product, and file-upload endpoints needed by the frontend app.

> **Note:** This backend was created with AI assistance for frontend learning purposes. The main goal of this repository is to provide a realistic local API so the frontend can be built, tested, and demonstrated against real endpoints instead of mocked data.

## Purpose

The backend acts as a fake-store style API for a full ecommerce frontend project. It is intentionally simple enough to run locally, but complete enough to support real frontend workflows:

- Browsing products and categories
- Registering and logging in users
- Persisting auth sessions with cookies
- Managing cart items
- Creating addresses
- Placing orders
- Updating order status from the admin panel
- Uploading product images
- Seeding a local database with demo data

## Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** SQLite
- **ORM:** Prisma
- **Auth:** JWT access and refresh tokens
- **Validation:** class-validator and NestJS ValidationPipe
- **Docs:** Swagger / OpenAPI
- **File uploads:** Multipart upload support
- **Testing:** Jest

## API Base

```txt
http://localhost:4000/api/v1
```

Swagger UI:

```txt
http://localhost:4000/api/docs
```

Static uploads:

```txt
http://localhost:4000/uploads/*
```

## Project Structure

```txt
src/
  addresses/       Customer address endpoints
  auth/            Register, login, refresh, logout, profile
  cart/            Cart item management
  categories/      Category CRUD
  common/          Shared filters, DTOs, types, utilities
  files/           File upload endpoint
  orders/          Customer and admin order flows
  prisma/          Prisma service and module
  products/        Product CRUD and product listing
  users/           User CRUD and admin user management
prisma/
  schema.prisma    Database schema
  seed.ts          Demo data seed script
```

## Features

### Authentication

- User registration
- Login with email and password
- HTTP-only `access_token` and `refresh_token` cookies
- Refresh-token endpoint
- Logout endpoint
- Protected profile endpoint
- Profile update endpoint
- Optional admin role guards through environment configuration

### Products and Categories

- Product listing with query support
- Product detail by id
- Product creation, update, and deletion
- Category listing
- Category creation, update, and deletion
- Product images stored as related records

### Cart and Checkout

- Add product to cart
- Update cart item quantity
- Remove cart item
- Clear cart
- Convert cart items into an order

### Orders

- Customer order history
- Customer order details
- Admin order list
- Admin order details
- Admin order status updates

### Addresses

- Create customer address
- List customer addresses
- Update address
- Delete address
- Default-address support

### Files

- Multipart image upload
- Static file serving from the uploads directory

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create a local `.env` file:

```bash
cp .env.example .env
```

Default local configuration:

```env
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATABASE_URL=file:./prisma/dev.db
JWT_ACCESS_SECRET=access_secret_change_me
JWT_REFRESH_SECRET=refresh_secret_change_me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
AUTH_GUARDS_ENABLED=false
ADMIN_EMAIL=admin@nextstore.dev
ADMIN_PASSWORD=admin1234
```

### Database Setup

Run the Prisma migration:

```bash
npm run prisma:migrate
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

Seed the database:

```bash
npm run prisma:seed
```

### Run the Development Server

```bash
npm run dev
```

The API will be available at:

```txt
http://localhost:4000/api/v1
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start NestJS in watch mode |
| `npm run build` | Build the project |
| `npm run start` | Run the compiled app |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run e2e tests |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run local Prisma migration |
| `npm run prisma:seed` | Seed demo data |

## Default Admin User

The seed script creates an admin account using the values from `.env`:

```txt
Email: admin@nextstore.dev
Password: admin1234
```

## Main Endpoints

### Auth

```txt
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/profile
PATCH  /auth/profile
```

### Products

```txt
GET     /products
GET     /products/:id
POST    /products
PUT     /products/:id
PATCH   /products/:id
DELETE  /products/:id
```

### Categories

```txt
GET     /categories
GET     /categories/:id
GET     /categories/:id/products
POST    /categories
PUT     /categories/:id
PATCH   /categories/:id
DELETE  /categories/:id
```

### Cart

```txt
GET     /cart
POST    /cart/items
PATCH   /cart/items/:id
DELETE  /cart/items/:id
DELETE  /cart
```

### Addresses

```txt
GET     /addresses
POST    /addresses
PATCH   /addresses/:id
DELETE  /addresses/:id
```

### Orders

```txt
GET     /orders
GET     /orders/my
GET     /orders/:id
POST    /orders
PATCH   /orders/:id/status
```

### Users

```txt
GET     /users
GET     /users/:id
POST    /users
PUT     /users/:id
PATCH   /users/:id
DELETE  /users/:id
```

### Files

```txt
POST    /files/upload
```

Multipart field name:

```txt
file
```

Example upload response:

```json
{
  "filename": "1700000000000-123456789.png",
  "originalname": "image.png",
  "mimetype": "image/png",
  "size": 12345,
  "location": "/uploads/1700000000000-123456789.png"
}
```

## Frontend Usage

The frontend should point to:

```ts
export const BASE_URL = "http://localhost:4000/api/v1";
```

Authenticated requests can use the HTTP-only cookies set by the API. The frontend Axios client should send credentials:

```ts
withCredentials: true
```

The API also supports bearer auth for protected endpoints:

```http
Authorization: Bearer <access_token>
```

## AI-Assisted Development Disclaimer

This backend was generated and refined with AI assistance to support frontend development practice. It is useful for learning, portfolio demos, and local full-stack experimentation, but it should not be treated as a production-ready backend without a proper security review, deployment hardening, test coverage, monitoring, and environment-specific configuration.

The frontend is the primary focus of the NextStore project. This API exists so the frontend can interact with realistic data and user flows.

## License

MIT
