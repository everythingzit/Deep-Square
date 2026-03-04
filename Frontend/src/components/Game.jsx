import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import { useState, useCallback, useRef, useEffect } from "react"
import "./styles/Game.css"
import Loading from "../components/Loading"

function Game() {
    const [game, setGame] = useState(new Chess())
    const [position, setPosition] = useState(game.fen())
    const [origin, setOrigin] = useState(null)
    const [options, setOptions] = useState({})
    const [thinking, setThinking] = useState(false)
    const [isGameActive, setIsGameActive] = useState(false)
    const [movesPlayed, setMovesPlayed] = useState([])
    const [gameTimer, setGameTimer] = useState(0)
    const [usernameEdit, setUsernameEdit] = useState(false)
    const [gameStatus, setGameStatus] = useState("GAME STATUS")
    const [username, setUsername] = useState("Anonymous")
    const [usernameInput, setUsernameInput] = useState("")
    const [playerColor, setPlayerColor] = useState("w")
    const [loading, setLoading] = useState(true)
    const gameTimerRef = useRef(0)
    const isGameActiveRef = useRef(false)
    const playerColorRef = useRef("w")
    const userId = useRef(null)
    const movesPlayedRef = useRef([])

    const generateRandomUsername = () => {
        const adjectives = ["Silent", "Swift", "Dark", "Iron", "Bold", "Clever", "Fierce", "Petit"]
        const nouns = ["Pawn", "Knight", "Bishop", "Rook", "Queen", "King", "Gambit"]
        const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
        return `${rand(adjectives)}${rand(nouns)}${Math.floor(Math.random() * 100)}`
    }

    useEffect(() => {
        (async () => {
            try {
                const storedId = localStorage.getItem("user_id")

                if (storedId) {
                    userId.current = storedId
                    const response = await fetch(`http://localhost:8000/api/users/${storedId}`)
                    const data = await response.json()
                    if (!data.error) setUsername(data.username)
                } else {
                    const generatedUsername = generateRandomUsername()
                    const response = await fetch("http://localhost:8000/api/users", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username: generatedUsername })
                    })
                    const data = await response.json()
                    localStorage.setItem("user_id", data.user_id)
                    userId.current = data.user_id
                    setUsername(data.username)
                }
            } catch (e) {
                console.error("Error fetching user:", e)
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    const handleEditUsername = useCallback(() => {
        setUsernameInput(username)
        setUsernameEdit(true)
    }, [username])

    const handleSaveUsername = useCallback(async () => {
        if (!usernameInput.trim()) return
        try {
            await fetch(`http://localhost:8000/api/users/${userId.current}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: usernameInput })
            })
            setUsername(usernameInput)
            setUsernameEdit(false)
        } catch (e) {
            console.error("Error updating username:", e)
        }
    }, [usernameInput])

    useEffect(() => {
        if (!isGameActive) return
        if (game.isGameOver()) {
            handleGameOver(
                game.isCheckmate() ? "checkmate" :
                    game.isStalemate() ? "stalemate" :
                        game.isDraw() ? "draw" : "unknown"
            )
        }
    }, [game])

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

    const setIsGameActiveSync = useCallback((value) => {
        isGameActiveRef.current = value
        setIsGameActive(value)
    }, [])

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

    const handleGameOver = useCallback((reason) => {
        setIsGameActiveSync(false)
        setThinking(false)
        setOrigin(null)
        setOptions({})
        setGameStatus(
            reason === "checkmate"
                ? (game.turn() === playerColorRef.current ? "checkmate-loss" : "checkmate-win")
                : reason
        )

        if (reason === "aborted") return

        const gameData = {
            user_id: userId.current,
            result: reason,
            winner: reason === "checkmate"
                ? (game.turn() === "w" ? "black" : "white")
                : null,
            player_color: playerColor,
            duration: gameTimerRef.current,
            total_moves: Math.ceil(movesPlayedRef.current.length / 2),
            pgn: game.pgn({ newlineChar: " " }).replace(/\[.*?\]\s*/g, "").trim(),
            fen: game.fen(),
            date: new Date().toISOString(),
            engine_depth: 3,
            moves: movesPlayedRef.current
        }

        fetch("http://localhost:8000/api/games", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gameData)
        })
    }, [game])

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
                    depth: 3
                })
            })

            if (!response.ok) {
                throw new Error("Failed to fetch next move from engine...")
            }

            const data = await response.json()

            if (!data.engine_move?.move || !isGameActiveRef.current) {
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
            lastMove.rawTime = gameTimerRef.current

            setMovesPlayed(prev => {
                const updated = [...prev, lastMove]
                movesPlayedRef.current = updated
                return updated
            })
        } catch (e) {
            console.error("Error getting next engine move: ", e)
        } finally {
            setThinking(false)
        }
    }, [game])

    const newGame = useCallback(() => {
        const color = Math.random() < 0.5 ? "w" : "b"
        playerColorRef.current = color
        setPlayerColor(color)

        const newBoard = new Chess()
        setGame(newBoard)
        setPosition(newBoard.fen())
        setOrigin(null)
        setOptions({})
        setThinking(false)
        setGameTimer(0)
        setGameStatus("Game Status")
        gameTimerRef.current = 0
        setIsGameActiveSync(true)

        setMovesPlayed([])
        movesPlayedRef.current = []

        if (color === "b") {
            getNextMove(newBoard)
        }
    }, [getNextMove])

    const onDrop = useCallback(async (moveData) => {
        try {
            if (thinking || !isGameActiveRef.current) {
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
                lastMove.rawTime = gameTimerRef.current

                setMovesPlayed(prev => {
                    const updated = [...prev, lastMove]
                    movesPlayedRef.current = updated
                    return updated
                })

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
            const targetPiece = game.get(move.to)

            newSquares[move.to] = targetPiece ? {
                background: "radial-gradient(circle, transparent 58%, rgba(0,0,0,0.25) 58%, rgba(0,0,0,0.25) 72%, transparent 72%)",
            } : {
                background: "radial-gradient(circle, rgba(0,0,0,0.2) 18%, transparent 18%)",
            }
        })


        setOptions(newSquares)

        return true
    }, [game])

    const onClick = useCallback(async (squareData) => {
        if (thinking || !isGameActiveRef.current) {
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
            lastMove.rawTime = gameTimerRef.current
            setOrigin(null)
            setOptions({})

            setMovesPlayed(prev => {
                const updated = [...prev, lastMove]
                movesPlayedRef.current = updated
                return updated
            })

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
            backgroundColor: "#4a5568",
        },
        lightSquareStyle: {
            backgroundColor: "#c8d5e8",
        },
        arePiecesDraggable: !thinking && isGameActive,
        boardOrientation: playerColor === "w" ? "white" : "black"
    }

    if (loading) {
        return <main id="play-main"><Loading /></main>
    }

    return (
        <>
            <section>
                <Chessboard
                    options={boardOptions}
                />
            </section>
            <section id="game-information-section">
                <div id="username-container">
                    <span>
                        {!usernameEdit
                            ? <p>{username}</p>
                            : <input
                                type="text"
                                value={usernameInput}
                                onChange={e => setUsernameInput(e.target.value)}
                            />
                        }
                    </span>
                    <button onClick={!usernameEdit ? handleEditUsername : handleSaveUsername}>
                        {!usernameEdit ? "EDIT" : "CONFIRM"}
                    </button>
                </div>
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
                        <span id="game-status-box" className={
                            !isGameActive ? `status-${gameStatus}` :
                                game.turn() === "w" ? "status-white" : "status-black"
                        }>
                            <p>
                                {isGameActive
                                    ? (game.turn() === "w" ? "WHITE TURN" : "BLACK TURN")
                                    : gameStatus.toUpperCase().replace("-", " ")
                                }
                            </p>
                        </span>
                    </div>
                </div>
                <div id="controls-container">
                    {
                        isGameActive ?
                            <button onClick={() => handleGameOver("aborted")}>
                                ABORT GAME
                            </button> :
                            <button onClick={newGame}>
                                NEW GAME
                            </button>
                    }
                </div>
            </section>
        </>
    )
}

export default Game