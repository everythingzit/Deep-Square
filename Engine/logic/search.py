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

        if board.is_game_over():
            return {
                "fen": board.fen(),
                "move": None
            }
        
        ordered_moves = self.move_ordering(board)
        best_move = ordered_moves[0]

        for move in ordered_moves:
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

                # print(f"Move: {move.uci()}, Eval: {evaluation}, Best: {best_evaluation}")

                if evaluation < best_evaluation:
                    best_evaluation = evaluation
                    best_move = move

                beta = min(beta, evaluation)

        engine_move = None

        if best_move:
            board.push(best_move)
            engine_move = {
                "fen": board.fen(),
                "move": best_move.uci()
            }

        else:
            engine_move = {
                "fen": board.fen(),
                "move": None
            }

        return engine_move


    def minimax(self, board: chess.Board, depth, alpha, beta, maximizing_player):
        if board.is_checkmate():
            return -math.inf if maximizing_player else math.inf
        if board.is_stalemate() or board.is_insufficient_material():
            return 0

        if depth == 0:
            return self.quiescence_search(board, alpha, beta, maximizing_player)
        
        ordered_moves = self.move_ordering(board)
        
        if maximizing_player:
            max_evaluation = -math.inf

            for move in ordered_moves:
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

            for move in ordered_moves:
                board.push(move)
                evaluation = self.minimax(board, depth - 1, alpha, beta, True)
                board.pop()

                min_evaluation = min(min_evaluation, evaluation)
                beta = min(beta, evaluation)
                if beta <= alpha:
                    break
            
            return min_evaluation

    def move_ordering(self, board: chess.Board):
        piece_values = {
            chess.PAWN: 1,
            chess.KNIGHT: 3,
            chess.BISHOP: 3,
            chess.ROOK: 5,
            chess.QUEEN: 9,
            chess.KING: 20
        }

        moves = board.legal_moves
        moves_scores = []

        for move in moves:
            score = 0

            if move.promotion:
                score += 100000

            if board.is_capture(move):
                victim = board.piece_at(move.to_square)
                attacker = board.piece_at(move.from_square)

                if victim and attacker:
                    victim_value = piece_values[victim.piece_type]
                    attacker_value = piece_values[attacker.piece_type]

                    score += 10000 + (victim_value * 10) - attacker_value

            moves_scores.append({"move": move, "score": score})
        
        sorted_moves = sorted(moves_scores, key=lambda move: move["score"], reverse=True)
        sorted_moves_list = [graded_move["move"] for graded_move in sorted_moves]

        return sorted_moves_list




    def quiescence_search(self, board: chess.Board, alpha, beta, maximizing_player):
        if board.is_checkmate():
            return -math.inf if maximizing_player else math.inf

        stand_pat = self.evaluator.evaluate(board.fen())

        if board.is_game_over():
            return stand_pat
        
        if maximizing_player:
            if stand_pat >= beta:
                return beta
            
            alpha = max(alpha, stand_pat)
            best = stand_pat
            
            ordered_moves = self.move_ordering(board)
            captures = [move for move in ordered_moves if board.is_capture(move) or move.promotion]
            
            for move in captures:
                board.push(move)
                score = self.quiescence_search(board, alpha, beta, False)
                board.pop()
                
                if score > best:
                    best = score

                alpha = max(alpha, score)

                if alpha >= beta:
                    break
            
            return best
        
        else:
            if stand_pat <= alpha:
                return alpha
            
            beta = min(beta, stand_pat)
            best = stand_pat
            
            ordered_moves = self.move_ordering(board)
            captures = [move for move in ordered_moves if board.is_capture(move) or move.promotion]
            
            for move in captures:
                board.push(move)
                score = self.quiescence_search(board, alpha, beta, True)
                board.pop()
                
                if score < best:
                    best = score

                beta = min(beta, score)

                if alpha >= beta:
                    break
            
            return best