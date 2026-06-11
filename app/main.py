from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import UserRegister, UserLogin
from app.auth import hash_password, verify_password, create_access_token
from app.database import users_collection
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.database import users_collection, notes_collection
from bson import ObjectId
from datetime import datetime
import os

app = FastAPI(
    title="Secure Notes Manager API",
    version="1.0.0"
)
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            os.getenv("SECRET_KEY"),
            algorithms=[os.getenv("ALGORITHM")]
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@app.get("/")
def home():
    return {"message": "API is running"}

@app.post("/api/v1/auth/register")
def register(user: UserRegister):

    existing_user = users_collection.find_one(
        {"email": user.email}
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    users_collection.insert_one({
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": "user"
    })

    return {
        "message": "User registered successfully"
    }

@app.post("/api/v1/auth/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "user_id": str(db_user["_id"]),
        "email": db_user["email"],
        "role": db_user["role"]
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@app.post("/api/v1/notes")
def create_note(note: dict, current_user: dict = Depends(get_current_user)):
    new_note = {
        "title": note["title"],
        "content": note["content"],
        "owner_id": current_user["user_id"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = notes_collection.insert_one(new_note)

    return {
        "message": "Note created successfully",
        "note_id": str(result.inserted_id)
    }


@app.get("/api/v1/notes")
def get_my_notes(current_user: dict = Depends(get_current_user)):
    notes = []

    for note in notes_collection.find({"owner_id": current_user["user_id"]}):
        notes.append({
            "id": str(note["_id"]),
            "title": note["title"],
            "content": note["content"],
            "created_at": str(note["created_at"]),
            "updated_at": str(note["updated_at"])
        })

    return notes


@app.get("/api/v1/notes/{note_id}")
def get_note(note_id: str, current_user: dict = Depends(get_current_user)):
    note = notes_collection.find_one({
        "_id": ObjectId(note_id),
        "owner_id": current_user["user_id"]
    })

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    return {
        "id": str(note["_id"]),
        "title": note["title"],
        "content": note["content"]
    }


@app.put("/api/v1/notes/{note_id}")
def update_note(note_id: str, note: dict, current_user: dict = Depends(get_current_user)):
    result = notes_collection.update_one(
        {
            "_id": ObjectId(note_id),
            "owner_id": current_user["user_id"]
        },
        {
            "$set": {
                "title": note["title"],
                "content": note["content"],
                "updated_at": datetime.utcnow()
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")

    return {"message": "Note updated successfully"}


@app.delete("/api/v1/notes/{note_id}")
def delete_note(note_id: str, current_user: dict = Depends(get_current_user)):
    result = notes_collection.delete_one({
        "_id": ObjectId(note_id),
        "owner_id": current_user["user_id"]
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")

    return {"message": "Note deleted successfully"}