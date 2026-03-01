from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from logic.board import Board
from logic.search import Search
from config.database import collection

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
    result = await collection.insert_one(game)
    return { "id": str(result.inserted_id) }

@app.get("/api/games")
async def get_games():
    games = []
    async for game in collection.find():
        game["_id"] = str(game["_id"])
        games.append(game)
    return games