import math
import chess
from logic.evaluator import Evaluator

class Search:
    def __init__(self):
        self.evaluator = Evaluator()


    def get_best_move(self, fen, depth):
        board = chess.Board(fen)
        best_move = None
        best_evaluation = -math.inf if board.turn == chess.WHITE else math.inf
        alpha = -math.inf
        beta = math.inf
        
        for move in board.legal_moves:
            if board.turn == chess.WHITE:
                board.push(move)
                evaluation = self.minimax(board, depth - 1, alpha, beta, False)
                board.pop()

                if evaluation > best_evaluation:
                    best_evaluation = evaluation
                    best_move = move
                
                alpha = max(alpha, evaluation)

            else:
                board.push(move)
                evaluation = self.minimax(board, depth - 1, alpha, beta, True)
                board.pop()

                if evaluation < best_evaluation:
                    best_evaluation = evaluation
                    best_move = move

                beta = min(beta, evaluation)

        board.push(best_move)
        return board.fen()

    def minimax(self, board: chess.Board, depth, alpha, beta, maximizing_player):
        if depth == 0:
            return self.evaluator.evaluate(board.fen())
        
        if maximizing_player:
            max_evaluation = -math.inf

            for move in board.legal_moves:
                board.push(move)
                evaluation = self.minimax(board, depth - 1, alpha, beta, False)
                board.pop()

                max_evaluation = max(max_evaluation, evaluation)
                alpha = max(alpha, evaluation)
                if beta <= alpha:
                    break

            return max_evaluation
        else:
            min_evaluation = math.inf

            for move in board.legal_moves:
                board.push(move)
                evaluation = self.minimax(board, depth - 1, alpha, beta, True)
                board.pop()

                min_evaluation = min(min_evaluation, evaluation)
                beta = min(beta, evaluation)
                if beta <= alpha:
                    break
            
            return min_evaluation

    def move_ordering(self):
        pass

    def quiescence_search(self):
        pass