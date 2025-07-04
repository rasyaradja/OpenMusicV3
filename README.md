# OpenMusicV3

OpenMusicV3 is a scalable music application backend built with Node.js, PostgreSQL, Redis, RabbitMQ, and Hapi.js. It supports user authentication, playlist management, song and album management, collaboration, activity tracking, and playlist export via email. The system is split into two main services:

-   **OpenMusic-Main**: The main RESTful API backend.
-   **OpenMusic-Customer_Rasya**: A consumer service for processing playlist export requests and sending emails.

---

## Features

-   **User Management**: Register, login, and manage users.
-   **Albums & Songs**: CRUD operations for albums and songs, including album cover uploads.
-   **Playlists**: Create, update, delete playlists, add/remove songs, and track activities.
-   **Collaborations**: Share playlists with other users.
-   **Likes**: Like/unlike albums, with like counts cached in Redis.
-   **Export Playlists**: Export playlists via email using RabbitMQ and a consumer service.
-   **Authentication**: JWT-based authentication for protected routes.
-   **Caching**: Redis caching for performance (e.g., album likes).
-   **Dockerized**: Easy setup with Docker Compose for PostgreSQL, Redis, and RabbitMQ.

---

## Architecture

```mermaid
graph TD;
  Client <--> API[OpenMusic-Main API]
  API <--> DB[(PostgreSQL)]
  API <--> Redis[(Redis)]
  API <--> MQ[(RabbitMQ)]
  MQ --> Consumer[OpenMusic-Customer_Rasya]
  Consumer --> Email[SMTP Server]
```

---

## API Endpoints (Summary)

-   **Albums**: `/albums`, `/albums/{id}`, `/albums/{id}/likes`
-   **Songs**: `/songs`, `/songs/{id}`
-   **Users**: `/users`, `/users/{id}`
-   **Authentications**: `/authentications`
-   **Playlists**: `/playlists`, `/playlists/{id}/songs`, `/playlists/{id}/activities`
-   **Collaborations**: `/collaborations`
-   **Exports**: `/export/playlists/{id}`
-   **Uploads**: `/albums/{id}/covers`, `/uploads/{param*}`

> See each module in `OpenMusic-Main/src/api/` for detailed routes and handlers.

---

## Services

-   **PostgreSQL**: Main data storage for users, albums, songs, playlists, etc.
-   **Redis**: Caching for album likes and potentially other data.
-   **RabbitMQ**: Message queue for exporting playlists.
-   **SMTP**: Used by the consumer service to send playlist exports via email.

---

## Setup & Running

### Prerequisites

-   Node.js v18+
-   Docker & Docker Compose

### 1. Clone the Repository

```sh
git clone https://github.com/rasyaradja/OpenMusicV3.git
cd OpenMusicV3
```

### 2. Start Supporting Services

```sh
docker-compose up -d
```

This will start PostgreSQL, Redis, and RabbitMQ containers.

### 3. Install Dependencies

```sh
cd OpenMusic-Main && npm install
cd ../OpenMusic-Customer_Rasya && npm install
```

### 4. Run Database Migrations

```sh
cd ../OpenMusic-Main
npm run migrate
```

### 5. Configure Environment Variables

Create a `.env` file in both `OpenMusic-Main` and `OpenMusic-Customer_Rasya` with the following variables:

#### OpenMusic-Main/.env

```
PORT=5000
HOST=localhost
PGHOST=localhost
PGUSER=admin
PGPASSWORD=password
PGDATABASE=openmusicdb
PGPORT=5432
REDIS_SERVER=localhost
RABBITMQ_SERVER=amqp://admin:password@localhost:5672
ACCESS_TOKEN_KEY=youraccesstokensecret
ACCESS_TOKEN_AGE=3600
SMTP_HOST=your.smtp.host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
```

#### OpenMusic-Customer_Rasya/.env

```
PGHOST=localhost
PGUSER=admin
PGPASSWORD=password
PGDATABASE=openmusicdb
PGPORT=5432
RABBITMQ_SERVER=amqp://admin:password@localhost:5672
SMTP_HOST=your.smtp.host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
```

### 6. Start the Services

-   **Main API**:
    ```sh
    cd OpenMusic-Main
    npm start
    ```
-   **Consumer Service**:
    ```sh
    cd ../OpenMusic-Customer_Rasya
    npm start
    ```

---

## Folder Structure

```
OpenMusicV3/
├── docker-compose.yml
├── OpenMusic-Main/           # Main API backend
│   ├── src/
│   │   ├── api/              # API modules (albums, songs, users, etc.)
│   │   ├── services/         # Service layer (PostgreSQL, Redis, RabbitMQ, Storage)
│   │   ├── exceptions/       # Custom error classes
│   │   ├── validator/        # Payload validation schemas
│   │   ├── token/            # JWT token manager
│   │   └── server.js         # Hapi server entry point
│   ├── migrations/           # Database migration scripts
│   └── package.json
├── OpenMusic-Customer_Rasya/ # Consumer service for exports
│   ├── src/
│   │   ├── consumer.js       # Main consumer entry
│   │   ├── listener.js       # Message listener
│   │   ├── PlaylistService.js# Playlist data fetcher
│   │   └── MailSender.js     # Email sender
│   └── package.json
```

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[ISC](LICENSE)
