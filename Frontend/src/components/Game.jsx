import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import { useState, useCallback, useRef, useEffect } from "react"
import "./styles/Game.css"

function Game() {
    const [game, setGame] = useState(new Chess())
    const [position, setPosition] = useState(game.fen())
    const [origin, setOrigin] = useState(null)
    const [options, setOptions] = useState({})
    const [thinking, setThinking] = useState(false)
    const [isGameActive, setIsGameActive] = useState(false)
    const [movesPlayed, setMovesPlayed] = useState([])
    const [gameTimer, setGameTimer] = useState(0)
    const gameTimerRef = useRef(0)

    useEffect(() => {
        if (!isGameActive) {
            return
        }

        const interval = setInterval(() => {
            setGameTimer(time => {
                gameTimerRef.current = time + 1
                return time + 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [isGameActive])

    const formatTimer = useCallback((seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0")
        const s = (seconds % 60).toString().padStart(2, "0")
        return `${m}:${s}`
    }, [])

    const pieces = {
        p: "Pawn",
        n: "Knight",
        b: "Bishop",
        r: "Rook",
        q: "Queen",
        k: "King"
    };

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
            const history = gameAfterMove.history({ verbose: true }).map(move => ({ ...move }))
            const lastMove = history[history.length - 1]
            lastMove.time = formatTimer(gameTimerRef.current)
            setMovesPlayed(prev => [...prev, lastMove]);
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
                const history = gameCopy.history({ verbose: true }).map(move => ({ ...move }))
                const lastMove = history[history.length - 1]
                lastMove.time = formatTimer(gameTimerRef.current)
                setMovesPlayed(prev => [...prev, lastMove]);

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
            const history = gameCopy.history({ verbose: true }).map(move => ({ ...move }))
            const lastMove = history[history.length - 1]
            lastMove.time = formatTimer(gameTimerRef.current)
            setMovesPlayed(prev => [...prev, lastMove]);
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
                !isGameActive ? (<section id="chess-game-disabled">
                    <button onClick={newGame}>
                        Start Game
                    </button>
                </section>) : (<section>
                    <Chessboard
                        options={boardOptions}
                    />
                </section>)
            }
            <section id="game-information-section">
                <div id="move-log-container">
                    <div>
                        {movesPlayed.map((move, index) => (
                            <span key={index} className={move.color === "w" ? "move-white" : "move-black"}>
                                <p>{Math.floor(index / 2) + 1}. {move.lan}</p>
                                <p>{pieces[move.piece.toLowerCase()]}</p>
                                <p>{move.time}</p>
                            </span>
                        ))}
                    </div>
                </div>
                <div id="timer-turn-container">
                    <div>
                        <span>
                            <p>
                                {formatTimer(gameTimer)}
                            </p>
                        </span>
                        <span>
                            <p>
                                {game.turn()}
                            </p>
                        </span>
                    </div>
                </div>
                <div id="controls-container">
                    <button>
                        Abort Game
                    </button>
                </div>
            </section>
        </>
    )
}

export default Game