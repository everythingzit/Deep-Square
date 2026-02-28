import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import { useState, useCallback, useMemo } from "react"
import "./styles/Game.css"

function Game() {
    const [game, setGame] = useState(new Chess())
    const [position, setPosition] = useState(game.fen())
    const [origin, setOrigin] = useState(null)
    const [options, setOptions] = useState({})
    const [thinking, setThinking] = useState(false)
    const [isGameActive, setIsGameActive] = useState(false)

    const newGame = useCallback(() => {
        const newBoard = new Chess()
        setGame(newBoard)
        setPosition(newBoard.fen())
        setOrigin(null)
        setOptions({})
        setThinking(false)
        setIsGameActive(true)
    }, [])

    const getNextMove = useCallback(async (currentGame) => {
        setThinking(true)

        try {
            const response = await fetch("http://localhost:8000/api/next-move", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fen: currentGame.fen(),
                    color: 1,
                    depth: 0
                })
            })

            if (!response.ok) {
                throw new Error("Failed to fetch next move from engine...")
            }

            const data = await response.json()

            if (!data.engine_move?.move) {
                console.log("GAME OVER")
                setIsGameActive(false)
                return
            }

            const gameAfterMove = new Chess()
            currentGame.history({ verbose: true }).forEach(move => gameAfterMove.move(move))
            gameAfterMove.move(data.engine_move.move)
            setGame(gameAfterMove)
            setPosition(gameAfterMove.fen())
        } catch (e) {
            console.error("Error getting next engine move: ", e)
        } finally {
            setThinking(false)
        }
    }, [game])

    const onDrop = useCallback(async (moveData) => {
        try {
            if (thinking) {
                return false
            }

            const gameCopy = new Chess()
            game.history({ verbose: true }).forEach(move => gameCopy.move(move))

            const move = gameCopy.move({
                from: moveData.sourceSquare,
                to: moveData.targetSquare,
                promotion: "q"
            })

            if (move) {
                setGame(gameCopy)
                setPosition(gameCopy.fen())

                await getNextMove(gameCopy)

                return true
            } else {
                return false
            }

        } catch (e) {
            return false
        }
    }, [game]);

    const getOptions = useCallback((square) => {
        const moves = game.moves({
            square: square,
            verbose: true
        })

        if (moves.length === 0) {
            setOptions({})
            return false
        }

        const newSquares = {}
        moves.forEach(move => {
            newSquares[move.to] = {
                background: 'rgba(0, 255, 0, 0.4)'
            }
        })


        setOptions(newSquares)

        return true
    }, [game])

    const onClick = useCallback(async (squareData) => {
        if (thinking) {
            return false
        }

        if (origin && origin === squareData.square) {
            setOrigin(null)
            setOptions({})
            return
        }

        if (!origin && squareData.piece) {
            const hasMoves = getOptions(squareData.square)
            if (hasMoves) {
                setOrigin(squareData.square)
            }

            return
        }

        const moves = game.moves({
            square: origin,
            verbose: true
        })

        const foundMove = moves.find(m => m.from === origin && m.to === squareData.square)

        if (!foundMove) {
            const hasMoves = getOptions(squareData.square)
            setOrigin(hasMoves ? squareData.square : null)
            return
        }

        try {
            const gameCopy = new Chess()
            game.history({ verbose: true }).forEach(move => gameCopy.move(move))
            gameCopy.move({
                from: origin,
                to: squareData.square,
                promotion: "q"
            })

            setGame(gameCopy)
            setPosition(gameCopy.fen())
            setOrigin(null)
            setOptions({})

            getNextMove(gameCopy)
        } catch (e) {
            const hasMoves = getOptions(squareData.square)
            if (hasMoves) {
                setOrigin(squareData.square)
            }

            return
        }
    }, [origin, game])

    const boardOptions = {
        position: position,
        onPieceDrop: onDrop,
        onSquareClick: onClick,
        squareStyles: options,
        darkSquareStyle: {
            backgroundColor: "#7b7b7b",
        },
        lightSquareStyle: {
            backgroundColor: "#ffffff",
        },
        arePiecesDraggable: !thinking
    }

    return (
        <>
            {
                !isGameActive ? (<section>
                    <button onClick={newGame}>
                        Start Game
                    </button>
                </section>) : (<section>
                    <Chessboard
                        options={boardOptions}
                    />
                </section>)
            }
            <section>
                <div>
                    Move Log
                </div>
                <div>
                    <p>
                        Timer
                    </p>
                    <p>
                        Color Turn
                    </p>
                </div>
                <div>
                    <button>
                        Start Game
                    </button>
                </div>
            </section>
        </>
    )
}

export default Game