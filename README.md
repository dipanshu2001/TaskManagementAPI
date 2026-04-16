# Task Management API

A backend REST API built with **Node.js**, **Express.js**, **PostgreSQL**, and **MongoDB** for user authentication and task management. The application supports user registration, login with JWT authentication, and full task CRUD operations for authenticated users only. Users can only access and manage their own tasks.

## Github Repository

```text
https://github.com/dipanshu2001/TaskManagementAPI.git
```

## Features

- User registration with unique email validation and hashed password storage.
- User login with JWT generation.
- Protected profile endpoint for authenticated users.
- Create, read, update, and delete tasks for the logged-in user.
- Task ownership enforcement so one user cannot access another user's tasks.
- PostgreSQL used for user data and MongoDB used for task data.
- Request validation using `express-validator`.
- Global error handling for common API errors.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL with `pg`
- MongoDB with `mongoose`
- JWT authentication with `jsonwebtoken`
- Password hashing with `bcryptjs`
- Request validation with `express-validator`
- Security middleware with `helmet` and `cors`

## Project Structure

```text
src/
├── app.js
├── server.js
├── config/
│   ├── mongo.js
│   └── postgres.js
├── controllers/
│   ├── authController.js
│   └── taskController.js
├── middleware/
│   ├── asyncHandler.js
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   ├── notFound.js
│   └── validationMiddleware.js
├── mongodb/
│   └── taskModel.js
├── postgresql/
│   └── userModel.js
├── routes/
│   ├── authRoutes.js
│   └── taskRoutes.js
└── utils/
    ├── appError.js
    └── generateToken.js
```

## Folder Structure Explanation

- `config/` contains database connection setup for PostgreSQL and MongoDB.
- `routes/` defines all API endpoints and validation chains.
- `controllers/` contains the request-handling logic for auth and tasks.
- `middleware/` contains authentication, validation, 404 handling, async error wrapping, and global error handling.
- `postgresql/` contains user-related SQL query functions.
- `mongodb/` contains the Mongoose schema for tasks.
- `utils/` contains reusable helpers like custom errors and JWT generation.
- `app.js` wires middleware and routes, while `server.js` starts the app after connecting both databases.

## Design Decisions

### PostgreSQL for Users

User data is structured and relational, and a SQL database is a good fit for enforcing uniqueness on the `email` column and storing authentication-related user records predictably. This project creates a `users` table with a unique email column and stores hashed passwords there.

### MongoDB for Tasks

Task data is independent per user and fits well as document-based data. MongoDB with Mongoose makes it easy to model fields like `title`, `description`, `dueDate`, `status`, and `userId`, while also supporting automatic timestamps.

### JWT Authentication

JWT provides a stateless authentication mechanism that works well for REST APIs. After login, the API returns a token, and protected routes require `Authorization: Bearer <token>`.

### Separate Routes, Controllers, and Models

This structure improves readability and maintainability by separating routing, business logic, persistence logic, and middleware concerns. It also makes the project easier to extend and test.

## Prerequisites

Make sure you have the following installed:

- Node.js 18+ recommended.
- npm.
- PostgreSQL.
- MongoDB.
- Postman or any API client for testing.

## Local Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/dipanshu2001/TaskManagementAPI.git
cd task-management-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the environment file

Create `.env` in the project root and copy the values from `.env.example`. Update the database credentials if needed.

### 4. Start PostgreSQL

Create a PostgreSQL database named `task_management`, or update the database name in `POSTGRES_URI`.

You can create the database manually using postgreSQL:

```sql
CREATE DATABASE task_management;
```

The application automatically creates the `users` table on startup using the PostgreSQL connection module. The SQL used is:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Start MongoDB

Make sure your local MongoDB server is running. The default connection string used by this project is:

```text
mongodb://127.0.0.1:27017/task_management
```

### 6. Start the application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

When the app starts successfully, it connects to PostgreSQL and MongoDB and runs on the configured port. The default port is `5000`.

## Base URL

```text
http://localhost:5000/api
```

## API Documentation

All task endpoints require a Bearer token obtained from the login endpoint. The protected routes use JWT verification and load the current user from PostgreSQL before continuing.

### Health Check

#### GET `/api/health`

Checks if the API is running.

**Request**

```http
GET /api/health
```

**Success Response**

```json
{
  "success": true,
  "message": "Task Management API is running"
}
```

### Authentication Endpoints

#### POST `/api/auth/register`

Registers a new user.

**Validation Rules**
- `email` must be a valid email.
- `password` must be at least 6 characters long.

**Request Body**

```json
{
  "email": "user1@example.com",
  "password": "123456"
}
```

**Success Response**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user1@example.com",
    "created_at": "2026-04-15T10:00:00.000Z"
  }
}
```

**Possible Errors**

```json
{
  "success": false,
  "message": "Email already registered"
}
```

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

#### POST `/api/auth/login`

Authenticates a user and returns a JWT.

**Validation Rules**
- `email` must be valid.
- `password` is required.

**Request Body**

```json
{
  "email": "user1@example.com",
  "password": "123456"
}
```

**Success Response**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "your_jwt_token_here"
}
```

**Possible Errors**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

#### GET `/api/auth/profile`

Returns the authenticated user's profile.

**Headers**

```http
Authorization: Bearer <jwt_token>
```

**Success Response**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user1@example.com",
    "created_at": "2026-04-15T10:00:00.000Z"
  }
}
```

**Possible Errors**

```json
{
  "success": false,
  "message": "Unauthorized: token missing or invalid"
}
```

```json
{
  "success": false,
  "message": "Unauthorized: invalid token"
}
```

### Task Endpoints

All task endpoints below require:

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### POST `/api/tasks`

Creates a new task for the authenticated user. The controller stores the logged-in user's id in the task document as `userId`.

**Validation Rules**
- `title` is required and cannot be empty.
- `description` is optional but must be a string if provided.
- `dueDate` must be a valid ISO 8601 date.
- `status` is optional and must be either `pending` or `completed`.

**Request Body**

```json
{
  "title": "Complete backend assignment",
  "description": "Build and test all task CRUD APIs",
  "dueDate": "2026-05-20",
  "status": "pending"
}
```

**Success Response**

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "title": "Complete backend assignment",
    "description": "Build and test all task CRUD APIs",
    "dueDate": "2026-05-20T00:00:00.000Z",
    "status": "pending",
    "userId": 1,
    "_id": "661e0d1a4f0b3f0f3f0f3f0f",
    "createdAt": "2026-04-15T10:59:24.667Z",
    "updatedAt": "2026-04-15T10:59:24.667Z",
    "__v": 0
  }
}
```

#### GET `/api/tasks`

Returns all tasks for the authenticated user, sorted by `createdAt` in descending order.

**Success Response**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "661e0d1a4f0b3f0f3f0f3f0f",
      "title": "Complete backend assignment",
      "description": "Build and test all task CRUD APIs",
      "dueDate": "2026-05-20T00:00:00.000Z",
      "status": "pending",
      "userId": 1,
      "createdAt": "2026-04-15T10:59:24.667Z",
      "updatedAt": "2026-04-15T10:59:24.667Z",
      "__v": 0
    }
  ]
}
```

#### GET `/api/tasks/{TASK_ID}`

Returns one task by MongoDB task id if it belongs to the logged-in user.

**Success Response**

```json
{
  "success": true,
  "data": {
    "_id": "661e0d1a4f0b3f0f3f0f3f0f",
    "title": "Complete backend assignment",
    "description": "Build and test all task CRUD APIs",
    "dueDate": "2026-05-20T00:00:00.000Z",
    "status": "pending",
    "userId": 1,
    "createdAt": "2026-04-15T10:59:24.667Z",
    "updatedAt": "2026-04-15T10:59:24.667Z",
    "__v": 0
  }
}
```

**Possible Errors**

```json
{
  "success": false,
  "message": "Task not found"
}
```

```json
{
  "success": false,
  "message": "Invalid resource ID format"
}
```

#### PATCH `/api/tasks/{TASK_ID}`

Partially updates a task if it belongs to the authenticated user.

**Request Body Example**

```json
{
  "status": "completed"
}
```

**Success Response**

```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "_id": "661e0d1a4f0b3f0f3f0f3f0f",
    "title": "Complete backend assignment",
    "description": "Build and test all task CRUD APIs",
    "dueDate": "2026-05-20T00:00:00.000Z",
    "status": "completed",
    "userId": 1,
    "createdAt": "2026-04-15T10:59:24.667Z",
    "updatedAt": "2026-04-15T11:05:00.000Z",
    "__v": 0
  }
}
```

**Possible Errors**

```json
{
  "success": false,
  "message": "Task not found or access denied"
}
```

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "status",
      "message": "Status must be either pending or completed"
    }
  ]
}
```

#### DELETE `/api/tasks/{TASK_ID}`

Deletes a task if it belongs to the authenticated user.

**Success Response**

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Possible Errors**

```json
{
  "success": false,
  "message": "Task not found or access denied"
}
```

## Validation and Error Handling

This project uses route-level validation with `express-validator` and schema-level validation through Mongoose. Validation failures return HTTP 400 with a structured `errors` array showing the invalid field and message.

The global error handler also returns consistent responses for:
- duplicate PostgreSQL email constraint errors,
- invalid JWT tokens,
- expired JWT tokens,
- invalid MongoDB ObjectId format,
- custom application errors like unauthorized access or missing tasks.

Example validation error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "dueDate",
      "message": "Due date must be a valid ISO date"
    }
  ]
}
```

## Security Notes

- Passwords are hashed using `bcryptjs` before being stored in PostgreSQL.
- Protected routes require a JWT in the `Authorization` header.
- A task is always tied to the authenticated user's `id`, preventing cross-user access.
- `helmet` and `cors` are enabled in the Express app.

## Manual Testing

You can test the API using Postman or cURL. Suggested flow:

1. Register a user.
2. Login and copy the JWT token.
3. Access the profile endpoint.
4. Create a task.
5. Get all tasks.
6. Get a task by task_id.
7. Update the task.
8. Delete the task.
9. Try invalid inputs and unauthorized requests to verify validation and error handling.


## License

This project is for assessment and learning purposes.
