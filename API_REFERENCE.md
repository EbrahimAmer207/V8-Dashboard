# 📖 V8 Dashboard — API Reference

This reference details the REST API endpoints provided by the NestJS backend under the base prefix `/api/v1`.

## 📍 Base URL
```
http://localhost:3001/api/v1
```

## 🔒 Authentication Header
All protected endpoints require a valid JWT Access Token passed in the headers:
```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

---

## 🔑 Authentication Module (`/auth`)

### Sign In
*   **Endpoint:** `POST /auth/signin`
*   **Auth Required:** No
*   **Request Body:**
    ```json
    {
      "email": "admin@example.com",
      "password": "adminpassword"
    }
    ```
*   **Response (200):**
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "userId",
        "email": "admin@example.com",
        "username": "admin",
        "fullName": "Admin User",
        "role": "ADMIN"
      }
    }
    ```

### Refresh Token
*   **Endpoint:** `POST /auth/refresh`
*   **Auth Required:** No
*   **Request Body:**
    ```json
    {
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
*   **Response (200):**
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

---

## 👥 Users Module (`/users`)
*Requires authentication.*

### Get All Users
*   **Endpoint:** `GET /users`
*   **Roles Allowed:** `ADMIN`, `EDITOR`, `MODERATOR`, `SUPPORT`
*   **Query Parameters:** `page`, `limit`, `search`, `role`

### Get User Stats
*   **Endpoint:** `GET /users/stats`
*   **Roles Allowed:** `ADMIN`

### Search Users
*   **Endpoint:** `GET /users/search`
*   **Query Parameters:** `q` (search query), `limit` (max number of results)

### Get Current User Profile
*   **Endpoint:** `GET /users/profile`

### Get User by ID
*   **Endpoint:** `GET /users/:id`
*   **Roles Allowed:** `ADMIN`, `MODERATOR`, `SUPPORT`

### Create User
*   **Endpoint:** `POST /users`
*   **Roles Allowed:** `ADMIN`, `MODERATOR`

### Update User
*   **Endpoint:** `PUT /users/:id`
*   **Description:** Users can update their own details. Admins/Moderators can update any user.

### Delete User
*   **Endpoint:** `DELETE /users/:id`
*   **Roles Allowed:** `ADMIN`

---

## 🎧 Podcasts Module (`/podcasts`)
*Requires authentication.*

### Get All Podcasts
*   **Endpoint:** `GET /podcasts`
*   **Query Parameters:** `includeSessions` (boolean)

### Get Podcast by ID
*   **Endpoint:** `GET /podcasts/:id`

### Create Podcast (with file upload)
*   **Endpoint:** `POST /podcasts`
*   **Payload Type:** `multipart/form-data`
*   **Fields:**
    *   `audio` / `File` (audio file attachment)
    *   `cover` / `Cover` (cover image file attachment)
    *   `title` (string)
    *   `description` (string)
    *   `duration` (string)

### Update Podcast Details
*   **Endpoint:** `PUT /podcasts/:id`

### Update Podcast Media
*   **Endpoint:** `PUT /podcasts/:id/with-media`
*   **Payload Type:** `multipart/form-data`

### Delete Podcast
*   **Endpoint:** `DELETE /podcasts/:id`

---

## 📚 Resources Library (`/resources`)

### Get All Resources
*   **Endpoint:** `GET /resources`

### Create Resource (with file attachment)
*   **Endpoint:** `POST /resources` (Multipart/form-data)

### Update Resource
*   **Endpoint:** `PUT /resources/:id` (Multipart/form-data)

### Delete Resource
*   **Endpoint:** `DELETE /resources/:id` / `POST /resources/:id/delete`

---

## 🛠️ Admin Compatibility Layer (`/requests`, `/cases`, `/content`, `/notifications`, `/logs`)
*Allows standard Admin Dashboard clients to interact with custom ASP.NET database tables.*

### 🎫 Requests (`/requests` -> maps to `SupportTickets` table)
*   `GET /requests` — Get all support tickets
*   `GET /requests/search?q=value` — Search tickets
*   `GET /requests/stats` — Stats for open/closed tickets
*   `POST /requests/:id/approve` — Approve a request ticket
*   `POST /requests/:id/reject` — Reject a request ticket
*   `PATCH /requests/:id/status` — Modify ticket status

### 💼 Cases (`/cases` -> maps to `SupportTickets` table)
*   `GET /cases` — Get all cases
*   `GET /cases/stats` — Cases metadata overview
*   `PATCH /cases/:id/status` — Update case status

### 📖 Content (`/content` -> maps to `Knowledge` / resources tables)
*   `GET /content` — List articles
*   `POST /content` — Create new articles
*   `PUT /content/:id` — Update articles
*   `DELETE /content/:id` — Delete articles

### 🔔 System Notifications (`/notifications`)
*   `GET /notifications` — List active notifications
*   `PATCH /notifications/:id/read` — Mark notification read
*   `PATCH /notifications/read-all` — Mark all as read
*   `DELETE /notifications/:id` — Remove notification

### 📜 System Activity Logs (`/logs`)
*   `GET /logs` — Returns paginated history log events mapping from active support tickets.
