import constants.board_constants as bc

class Evaluator:
    def __init__(self):
        pass

    # main function; takes in a FEN/board -> returns an integer score
    # positive score: good for white
    # negative score: good for black
    def evaluate(self, board):
        pass

    def fen_to_matrix(self, fen):
        pieces_string = fen.split()[0]
        board_ranks = pieces_string.split("/")
        board_matrix = [self.string_to_rank(rank_string) for rank_string in board_ranks]

        return board_matrix
    
    def string_to_rank(self, rank_string):
        rank = []
        for character in rank_string:
            if character.isdigit():
                rank += [None] * int(character)
            else:
                rank.append(character)

        return rank

    def get_game_phase(self, matrix):
        pass

    def king_safety_score(self, matrix):
        pass

    def material_score(self, matrix):
        score = 0
        for rank in matrix:
            for piece in rank:
                if piece is None:
                    pass
                elif piece.islower():
                    score -= bc.PIECE_VALUES[piece]
                else:
                    score += bc.PIECE_VALUES[piece.lower()]

        return score


    def piece_square_score(self, matrix):
        pass

    def pawn_structure_score(self, matrix):
        pass

    def threats_score(self, matrix):
        pass

    def mobility_score(self, matrix):
        pass

    def center_control_score(self, matrix):
        pass

    def space_control_score(self, matrix):
        pass

    def pawn_weakness_score(self, matrix):
        pass

    def piece_coordination_score(self, matrix):
        pass

# eval = Evaluator()
# matrix = eval.fen_to_matrix("rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2")