from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from logic.board import Board
from logic.search import Search

class Item(BaseModel):
    fen: str
    color: int
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
async def create_item(item: Item):
    # board = Board(item.fen)
    search = Search()
    return {
        "fen": search.get_best_move(item.fen, 3)
    }