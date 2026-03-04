import datetime
from uuid import uuid4

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from logic.board import Board
from logic.search import Search
from config.database import games_collection, users_collection

class MoveReq(BaseModel):
    fen: str
    depth: int

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/next-move")
async def next_move(game: MoveReq):
    search = Search()
    return {
        "engine_move": search.get_best_move(game.fen, game.depth)
    }

@app.post("/api/games")
async def store_game(game: dict):
    result = await games_collection.insert_one(game)
    
    return { "id": str(result.inserted_id) }

@app.get("/api/games")
async def get_games():
    games = []
    async for game in games_collection.find():
        game["_id"] = str(game["_id"])
        games.append(game)

    return games

@app.get("/api/users/{user_id}")
async def get_user(user_id: str):
    user = await users_collection.find_one({ "user_id": user_id })

    if not user:
        return { "error": "User not found" }
    
    user["_id"] = str(user["_id"])
    return user

@app.post("/api/users")
async def create_user(body: dict):
    user = {
        "user_id": str(uuid4()),
        "username": body["username"]
    }

    await users_collection.insert_one(user)

    return { "user_id": user["user_id"], "username": user["username"] }

@app.put("/api/users/{user_id}")
async def update_username(user_id: str, body: dict):
    result = await users_collection.update_one(
        { "user_id": user_id },
        { "$set": { "username": body["username"] } }
    )

    if result.matched_count == 0:
        return { "error": "User not found" }
    
    return { "message": "Username updated" }