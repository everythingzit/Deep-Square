import chess
import random

class Board:
    def __init__(self, fen):
        self.board = chess.Board(fen)

    def get_fen(self):
        return self.board.fen()
    
    def set_fen(self, fen: str):
        self.board = Board(fen)

    def next_move(self):
        legal_moves = self.get_legal_moves()
        moves = list(legal_moves)

        if not moves:
            return self.get_fen()
        else:
            move = random.choice(moves)
            self.board.push(move)
            return self.get_fen()

    def get_legal_moves(self):
        return self.board.legal_moves