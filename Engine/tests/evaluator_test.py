from logic.evaluator import Evaluator

def test_material_score_zero():
    evaluator = Evaluator()

    # chess starting position
    matrix = evaluator.fen_to_matrix("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    score = evaluator.material_score(matrix)
    assert score == 0

    # just two kings on the board
    matrix = evaluator.fen_to_matrix("4k3/8/8/8/8/8/8/4K3 w - - 0 1")
    score = evaluator.material_score(matrix)
    assert score == 0

    # equal pieces
    matrix = evaluator.fen_to_matrix("r2qk2r/ppp2ppp/2n1bn2/3pp3/3PP3/2N1BN2/PPP2PPP/R2QK2R w KQkq - 0 1")
    score = evaluator.material_score(matrix)
    assert score == 0

def test_material_score():
    evaluator = Evaluator()

    matrix = evaluator.fen_to_matrix("rnbqkbnr/pppp1ppp/8/4P3/8/8/PPP1PPPP/RNBQKBNR w KQkq - 0 1")
    score = evaluator.material_score(matrix)
    assert score == 1

    matrix = evaluator.fen_to_matrix("rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNB1KBNR w KQkq - 0 1")
    score = evaluator.material_score(matrix)
    assert score == -9

    matrix = evaluator.fen_to_matrix("rnbqkbn1/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Qq - 0 1")
    score = evaluator.material_score(matrix)
    assert score == 5

def test_piece_square_score_white():
    evaluator = Evaluator()

    matrix = evaluator.fen_to_matrix("8/8/8/2N5/8/8/P6P/8 w KQkq - 0 1")
    score = evaluator.piece_square_score(matrix)
    assert score == 25

    matrix = evaluator.fen_to_matrix("8/4R3/7B/4Q2P/8/8/8/8 w KQkq - 0 1")
    score = evaluator.piece_square_score(matrix)
    assert score == 10

    matrix = evaluator.fen_to_matrix("8/8/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    score = evaluator.piece_square_score(matrix)
    assert score == -95

def test_piece_square_score_black():
    evaluator = Evaluator()

    matrix = evaluator.fen_to_matrix("8/8/8/2n5/8/8/p6p/8 b KQkq - 0 1")
    score = evaluator.piece_square_score(matrix)
    assert score == -115

    matrix = evaluator.fen_to_matrix("8/4r3/7b/4q2p/8/8/8/8 b KQkq - 0 1")
    score = evaluator.piece_square_score(matrix)
    assert score == 5

    matrix = evaluator.fen_to_matrix("rnbqkbnr/pppppppp/8/8/8/8/8/8 b KQkq - 0 1")
    score = evaluator.piece_square_score(matrix)
    assert score == 95

def test_piece_square_score():
    evaluator = Evaluator()
    
    matrix = evaluator.fen_to_matrix("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    score = evaluator.piece_square_score(matrix)
    assert score == 0

    matrix = evaluator.fen_to_matrix("8/8/8/3N4/8/8/8/7K w - - 0 1")
    score = evaluator.piece_square_score(matrix)
    assert score == 40

    matrix = evaluator.fen_to_matrix("7k/8/8/8/3n4/8/8/7K b - - 0 1")
    score = evaluator.piece_square_score(matrix)
    assert score == -20