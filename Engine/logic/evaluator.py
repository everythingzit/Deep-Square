import constants.board_constants as bc

class Evaluator:
    def __init__(self):
        pass

    # main function; takes in a FEN/board -> returns an integer score
    # positive score: good for white
    # negative score: good for black
    def evaluate(self, fen):
        matrix = self.fen_to_matrix(fen)
        score = self.material_score(matrix) * 50
        score += self.piece_square_score(matrix)
        score += self.king_safety_score(matrix)

        return score

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
        score = 0
        white_king_position = None
        black_king_position = None

        for r, rank in enumerate(matrix):
            for f, piece in enumerate(rank):
                if piece == 'K':
                    white_king_position = (r, f)
                elif piece == 'k':
                    black_king_position = (r, f)
        
        if not white_king_position or not black_king_position:
            return 0
        
        MAX_DISTANCE = 7
        
        for r, rank in enumerate(matrix):
            for f, piece in enumerate(rank):
                if piece is None or piece.islower():
                    continue
                
                piece_type = piece.lower()
                if piece_type not in bc.PIECE_VALUES:
                    continue
                
                dr = abs(r - black_king_position[0])
                df = abs(f - black_king_position[1])
                distance = max(dr, df)
                
                tropism = (MAX_DISTANCE - distance) * bc.PIECE_VALUES[piece_type]
                score += tropism
        
        for r, rank in enumerate(matrix):
            for f, piece in enumerate(rank):
                if piece is None or piece.isupper():
                    continue
                
                piece_type = piece.lower()
                if piece_type not in bc.PIECE_VALUES:
                    continue
                
                dr = abs(r - white_king_position[0])
                df = abs(f - white_king_position[1])
                distance = max(dr, df)
                
                tropism = (MAX_DISTANCE - distance) * bc.PIECE_VALUES[piece_type]
                score -= tropism
        
        return score

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
        score = 0

        for rank_index, rank in enumerate(matrix):
            for file_index, piece in enumerate(rank):
                if piece is None:
                    continue
                
                is_white = piece.isupper()
                piece = piece.lower()
                
                match piece:
                    case "k":
                        # TODO: implement game phase check
                        pst = bc.KING_MIDDLE_VALUES
                    case "p":
                        pst = bc.PAWN_VALUES
                    case "n":
                        pst = bc.KNIGHT_VALUES
                    case "b":
                        pst = bc.BISHOP_VALUES
                    case "r":
                        pst = bc.ROOK_VALUES
                    case "q":
                        pst = bc.QUEEN_VALUES
                    case _:
                        raise ValueError(f"Invalid piece value: {piece}")
                    
                if is_white:
                    score += pst[rank_index][file_index]
                else:
                    score -= pst[7 - rank_index][file_index]

        return score

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