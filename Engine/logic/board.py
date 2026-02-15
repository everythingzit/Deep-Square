import chess

class Board:
    def __init__(self):
        self.board = chess.Board()

    def get_fen(self):
        return self.board.fen()
    
    def set_fen(self, fen: str):
        self.board = Board(fen)

    def next_move(self):
        pass

    def get_legal_moves(self):
        pass