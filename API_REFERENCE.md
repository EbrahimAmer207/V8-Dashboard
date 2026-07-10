# API Reference

## Base URL
```
http://localhost:3001/api/v1
```

## Authentication

All authenticated endpoints require:
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

---

## Authentication Module

### Register User
```
POST /auth/signup
No authentication required
```

**Request:**
```json
{
  "email": "john@example.com",
  "username": "johndoe",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "john@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  }
}
```

### Sign In
```
POST /auth/signin
No authentication required
```

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response (200):**
Same as signup response

**Response (401):**
```json
{
  "statusCode": 401,
  "error": "UnauthorizedException",
  "message": "Invalid email or password"
}
```

### Refresh Token
```
POST /auth/refresh
No authentication required
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
Same as signup response

---

## Users Module

### Get All Users
```
GET /users?page=1&limit=10&search=&role=ADMIN
Requires: Admin role
```

**Query Parameters:**
- `page` (number): Page number, default 1
- `limit` (number): Items per page, default 10
- `search` (string): Search by email, username, first name, last name
- `role` (string): Filter by role (ADMIN, EDITOR, USER)

**Response (200):**
```json
{
  "data": [
    {
      "id": "user_123",
      "email": "admin@example.com",
      "username": "admin",
      "firstName": "Admin",
      "lastName": "User",
      "avatar": null,
      "role": "ADMIN",
      "isActive": true,
      "lastLogin": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

### Get Current User Profile
```
GET /users/profile
Requires: Authentication
```

**Response (200):**
```json
{
  "id": "user_123",
  "email": "admin@example.com",
  "username": "admin",
  "firstName": "Admin",
  "lastName": "User",
  "role": "ADMIN",
  "permissions": [
    {
      "id": "perm_1",
      "name": "Create User",
      "resource": "users",
      "action": "create"
    }
  ]
}
```

### Get User by ID
```
GET /users/:id
Requires: Admin role
```

**Parameters:**
- `id` (string): User ID

**Response (200):**
Same as profile response

**Response (404):**
```json
{
  "statusCode": 404,
  "error": "NotFoundException",
  "message": "User not found"
}
```

### Create User
```
POST /users
Requires: Admin role
```

**Request:**
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "SecurePass123",
  "firstName": "New",
  "lastName": "User",
  "role": "EDITOR"
}
```

**Response (201):**
Same as get user response

### Update User
```
PUT /users/:id
Requires: Admin role or self
```

**Request:**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response (200):**
User object with updated fields

### Update User Role
```
PUT /users/:id/role
Requires: Admin role
```

**Request:**
```json
{
  "role": "EDITOR"
}
```

**Response (200):**
User object with updated role

### Delete User
```
DELETE /users/:id
Requires: Admin role
```

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

### Get User Statistics
```
GET /users/stats
Requires: Admin role
```

**Response (200):**
```json
{
  "totalUsers": 125,
  "activeUsers": 98,
  "byRole": [
    {
      "role": "ADMIN",
      "count": 5
    },
    {
      "role": "EDITOR",
      "count": 20
    },
    {
      "role": "USER",
      "count": 100
    }
  ]
}
```

---

## Content Module

### Get All Content
```
GET /content?page=1&limit=10&search=&status=published&category=
Requires: Authentication
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search by title or description
- `status` (string): draft, published, archived
- `category` (string): Filter by category

**Response (200):**
```json
{
  "data": [
    {
      "id": "content_1",
      "title": "Article Title",
      "description": "Short description",
      "content": "Full content here...",
      "status": "published",
      "category": "News",
      "tags": ["tag1", "tag2"],
      "authorId": "user_123",
      "author": {
        "id": "user_123",
        "username": "admin",
        "email": "admin@example.com"
      },
      "viewCount": 150,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### Get Content by ID
```
GET /content/:id
Requires: Authentication
```

**Response (200):**
Single content object (same structure as above)

Note: Automatically increments viewCount

### Create Content
```
POST /content
Requires: Editor role or higher
```

**Request:**
```json
{
  "title": "New Article",
  "description": "Brief description",
  "content": "Full content markdown...",
  "status": "draft",
  "category": "News",
  "tags": ["tag1", "tag2"]
}
```

**Response (201):**
Content object with all fields

### Update Content
```
PUT /content/:id
Requires: Editor role or higher
```

**Request:**
```json
{
  "title": "Updated Title",
  "status": "published"
}
```

**Response (200):**
Updated content object

### Delete Content
```
DELETE /content/:id
Requires: Editor role or higher
```

**Response (200):**
```json
{
  "message": "Content deleted successfully"
}
```

### Get Content Statistics
```
GET /content/stats
Requires: Authentication
```

**Response (200):**
```json
{
  "total": 125,
  "byStatus": [
    {
      "status": "published",
      "count": 98
    },
    {
      "status": "draft",
      "count": 25
    },
    {
      "status": "archived",
      "count": 2
    }
  ],
  "byCategory": [
    {
      "category": "News",
      "count": 45
    },
    {
      "category": "Tutorial",
      "count": 80
    }
  ]
}
```

---

## Notifications Module

### Get All Notifications
```
GET /notifications?page=1&limit=10&status=UNREAD
Requires: Authentication
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): UNREAD, READ, ARCHIVED

**Response (200):**
```json
{
  "data": [
    {
      "id": "notif_123",
      "title": "New User Registered",
      "message": "A new user has joined the system",
      "type": "info",
      "status": "UNREAD",
      "userId": "user_123",
      "actionUrl": "/users/new_user_id",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "readAt": null
    }
  ],
  "pagination": {
    "total": 23,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

### Get Unread Count
```
GET /notifications/unread-count
Requires: Authentication
```

**Response (200):**
```json
{
  "unreadCount": 5
}
```

### Mark as Read
```
PUT /notifications/:id/read
Requires: Authentication
```

**Response (200):**
Notification object with status "READ" and readAt timestamp

### Mark All as Read
```
PUT /notifications/mark-all-read
Requires: Authentication
```

**Response (200):**
```json
{
  "message": "All notifications marked as read"
}
```

### Delete Notification
```
DELETE /notifications/:id
Requires: Authentication
```

**Response (200):**
```json
{
  "message": "Notification deleted"
}
```

---

## Activity Logs Module

### Get Activity Logs
```
GET /logs?page=1&limit=20&userId=&type=CREATE&resource=users
Requires: Admin role
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `userId` (string): Filter by user
- `type` (string): CREATE, UPDATE, DELETE, LOGIN, LOGOUT, VIEW
- `resource` (string): Filter by resource type

**Response (200):**
```json
{
  "data": [
    {
      "id": "log_123",
      "type": "CREATE",
      "description": "User created new content",
      "resource": "content",
      "resourceId": "content_456",
      "userId": "user_123",
      "user": {
        "id": "user_123",
        "username": "admin",
        "email": "admin@example.com"
      },
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "changedData": {
        "title": "New Article"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 1250,
    "page": 1,
    "limit": 20,
    "pages": 63
  }
}
```

### Get Log Statistics
```
GET /logs/stats
Requires: Admin role
```

**Response (200):**
```json
{
  "total": 5428,
  "byType": [
    {
      "type": "CREATE",
      "count": 1200
    },
    {
      "type": "UPDATE",
      "count": 2350
    },
    {
      "type": "DELETE",
      "count": 450
    },
    {
      "type": "LOGIN",
      "count": 1428
    }
  ],
  "byResource": [
    {
      "resource": "users",
      "count": 892
    },
    {
      "resource": "content",
      "count": 3200
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "error": "BadRequestException",
  "message": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "error": "UnauthorizedException",
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "error": "ForbiddenException",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "error": "NotFoundException",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "error": "InternalServerErrorException",
  "message": "Internal server error"
}
```

---

## Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Server Error

---

**API is RESTful and follows standard HTTP conventions.**
