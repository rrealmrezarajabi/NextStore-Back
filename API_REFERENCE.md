# NextStore REST API Reference (Platzi-Style)

Base URL:

```txt
http://localhost:4000/api/v1
```

Swagger UI:

```txt
http://localhost:4000/api/docs
```

This API is designed to feel like Platzi Fake Store API while keeping a stable local backend.

## Data Contracts

### Category

```json
{
  "id": 1,
  "name": "Electronics",
  "image": "https://..."
}
```

### Product

```json
{
  "id": 1,
  "title": "Modern Jacket 1",
  "slug": "modern-jacket-1",
  "price": 220,
  "description": "Generated seed description for Modern Jacket 1.",
  "category": {
    "id": 2,
    "name": "Clothing",
    "image": "https://..."
  },
  "images": ["https://...", "https://..."]
}
```

### User (public response)

```json
{
  "id": 1,
  "firstName": "NextStore",
  "lastName": "Admin",
  "username": "admin",
  "name": "NextStore Admin",
  "role": "admin",
  "email": "admin@nextstore.dev",
  "avatar": "https://...",
  "password": ""
}
```

## Auth

### POST `/auth/register`

Register a new customer account.

Request:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secret123",
  "avatar": "https://example.com/avatar.jpg"
}
```

> `avatar` is optional. If omitted, a default avatar is generated automatically.

Response:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "user": {
    "id": 5,
    "firstName": "John",
    "lastName": "Doe",
    "username": "john_doe",
    "name": "John Doe",
    "role": "customer",
    "email": "john@example.com",
    "avatar": "https://...",
    "password": ""
  }
}
```

Errors:

- `400` — validation error (missing/invalid fields)
- `409` — email or username already registered

---

### POST `/auth/login`

Login with email/password.

Request:

```json
{
  "email": "admin@nextstore.dev",
  "password": "admin1234"
}
```

Response:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "user": {
    "id": 1,
    "firstName": "NextStore",
    "lastName": "Admin",
    "username": "admin",
    "name": "NextStore Admin",
    "role": "admin",
    "email": "admin@nextstore.dev",
    "avatar": "https://...",
    "password": ""
  }
}
```

### POST `/auth/refresh`

Request:

```json
{
  "refresh_token": "..."
}
```

Response:

```json
{
  "access_token": "...",
  "refresh_token": "..."
}
```

### GET `/auth/profile`

Headers:

```txt
Authorization: Bearer <access_token>
```

Response: current user profile.

---

## Products

### GET `/products`

Platzi-style list endpoint.

Query params:

- `title` (partial search)
- `categoryId`
- `price_min`
- `price_max`
- `offset`
- `limit`
- `sortBy` = `id | title | price | createdAt`
- `order` = `asc | desc`
- `flat` = `true | false`

Behavior:

- default (`flat` omitted): returns `Product[]` (frontend-compatible)
- `flat=false`: returns paginated object `{ data, meta }`

Examples:

```txt
GET /products
GET /products?title=jacket
GET /products?categoryId=2
GET /products?price_min=100&price_max=500
GET /products?flat=false&limit=5&offset=0
```

Paginated response example:

```json
{
  "data": [
    {
      "id": 1,
      "title": "Modern Jacket 1",
      "slug": "modern-jacket-1",
      "price": 220,
      "description": "...",
      "category": { "id": 2, "name": "Clothing", "image": "https://..." },
      "images": ["https://..."]
    }
  ],
  "meta": {
    "total": 100,
    "offset": 0,
    "limit": 5,
    "hasNext": true
  }
}
```

### GET `/products/:id`

Get single product by id.

### POST `/products`

Create product.

Request:

```json
{
  "title": "iPhone 16",
  "price": 1200,
  "description": "Latest iPhone",
  "categoryId": 1,
  "images": ["https://example.com/img1.jpg"]
}
```

### PUT `/products/:id`

### PATCH `/products/:id`

Update full/partial product with same fields as create.

### DELETE `/products/:id`

Delete a product.

---

## Categories

### GET `/categories`

Query params:

- `name` (search)
- `offset`
- `limit`
- `flat` (`true|false`)

Behavior:

- default: `Category[]`
- `flat=false`: `{ data, meta }`

Examples:

```txt
GET /categories
GET /categories?name=Elect
GET /categories?flat=false&limit=5&offset=0
```

### GET `/categories/:id`

Get single category.

### GET `/categories/:id/products`

Get products that belong to a category.

### POST `/categories`

```json
{
  "name": "Gaming",
  "image": "https://example.com/gaming.jpg"
}
```

### PUT `/categories/:id`

### PATCH `/categories/:id`

### DELETE `/categories/:id`

---

## Users

### GET `/users`

Query params:

- `search` (by firstName/lastName/username/email)
- `offset`
- `limit`
- `flat` (`true|false`)

Behavior:

- default: `User[]`
- `flat=false`: `{ data, meta }`

Examples:

```txt
GET /users
GET /users?search=admin
GET /users?flat=false&limit=10&offset=0
```

### GET `/users/:id`

Get single user (public shape).

### POST `/users`

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "username": "jane_doe",
  "email": "jane@example.com",
  "password": "1234",
  "avatar": "https://example.com/avatar.png",
  "role": "customer"
}
```

> `avatar` and `role` are optional.

### PUT `/users/:id`

### PATCH `/users/:id`

Update user.

```json
{
  "firstName": "Jane",
  "lastName": "Updated",
  "username": "jane_updated",
  "email": "jane.updated@example.com",
  "avatar": "https://example.com/new.png",
  "password": "newpass1234"
}
```

### DELETE `/users/:id`

Delete user.

---

## Files

### POST `/files/upload`

`multipart/form-data`

- field name: `file`

Response:

```json
{
  "filename": "1700000000000-123456789.png",
  "originalname": "photo.png",
  "mimetype": "image/png",
  "size": 12345,
  "location": "/uploads/1700000000000-123456789.png"
}
```

File URL:

```txt
http://localhost:4000/uploads/<filename>
```

---

## Error Format

All API errors use:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2026-02-17T13:00:00.000Z",
  "path": "/api/v1/products"
}
```

---

## cURL Quick Examples

```bash
# List products (flat array)
curl http://localhost:4000/api/v1/products

# List products (paginated)
curl "http://localhost:4000/api/v1/products?flat=false&limit=5&offset=0"

# Get one product
curl http://localhost:4000/api/v1/products/1

# Register
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","username":"john_doe","email":"john@example.com","password":"secret123"}'

# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nextstore.dev","password":"admin1234"}'

# Profile
curl http://localhost:4000/api/v1/auth/profile \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

## Frontend Usage Note

For your current frontend, keep:

```ts
export const BASE_URL = "http://localhost:4000/api/v1";
```

This keeps Platzi-like endpoint style while using your own local backend.
