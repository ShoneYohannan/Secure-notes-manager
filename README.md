# Secure Notes Manager API

Secure Notes Manager is a REST API that enables users to safely store and manage personal notes. The application implements JWT-based authentication, password hashing, and protected note operations to ensure that only authenticated users can access their data.

Built as a backend-focused project using FastAPI and MongoDB Atlas, the system demonstrates authentication workflows, secure password handling, database integration, and complete CRUD operations for note management.

### Key Highlights

* Implemented secure user registration and login.
* Protected API endpoints using JWT authentication.
* Stored user credentials securely with bcrypt hashing.
* Integrated MongoDB Atlas for cloud database storage.
* Developed complete CRUD functionality for notes.
* Tested and documented APIs using FastAPI Swagger UI.

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd secure-notes-manager
```

### 2. Create a Virtual Environment

```bash
python -m venv venv
```

### 3. Activate the Virtual Environment

Windows:

```bash
venv\Scripts\activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file in the project root and add:

```env
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## Running the Application

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```txt
http://127.0.0.1:8000
```

Swagger Documentation:

```txt
http://127.0.0.1:8000/docs
```

---

## API Endpoints

### Authentication

| Method | Endpoint              | Description                 |
| ------ | --------------------- | --------------------------- |
| POST   | /api/v1/auth/register | Register a new user         |
| POST   | /api/v1/auth/login    | Login and receive JWT token |

### Notes

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| GET    | /api/v1/notes           | Retrieve all notes       |
| POST   | /api/v1/notes           | Create a new note        |
| GET    | /api/v1/notes/{note_id} | Retrieve a specific note |
| PUT    | /api/v1/notes/{note_id} | Update a note            |
| DELETE | /api/v1/notes/{note_id} | Delete a note            |

---

## Security Features

* Password hashing using bcrypt.
* JWT-based authentication and authorization.
* Protected note routes accessible only to authenticated users.
* Secure storage of user credentials.

---


## Screenshots

### Login Page

![Login Page](screenshots/Login.png)

### Registration Page

![Register Page](screenshots/Register.png)

### Notes Dashboard

![Dashboard](screenshots/Dashboard.png)

### API Documentation

![Swagger Docs](screenshots/Swagger-docs.png)

### MongoDB Atlas Integration

![MongoDB Atlas](screenshots/mongodb-atlas-overview.png)


## Author

Developed by **Shone Yohannan**
