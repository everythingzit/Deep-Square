import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import { useState, useCallback } from "react"

function Game() {
  const [game, setGame] = useState(new Chess())
  const [position, setPosition] = useState(game.fen())
  const [origin, setOrigin] = useState(null)
  const [options, setOptions] = useState({})

  const onDrop = useCallback((moveData) => {
    try {
        const gameCopy = new Chess(game.fen())

        const move = gameCopy.move({
            from: moveData.sourceSquare,
            to: moveData.targetSquare,
            promotion: "q"
        })

        if (move) {
            setGame(gameCopy)
            setPosition(gameCopy.fen())
            return true
        } else {
            return false
        }

    } catch(e) {
        return false
    }
  }, [game]);

  const getOptions = useCallback((square) => {
    const moves = game.moves({
        square: square,
        verbose: true
    })

    if (moves.length === 0) {
        setOptions([])
        return false
    }

    const newSquares = {}

    setOptions(newSquares)

    return true
  })

  const onClick = useCallback((squareData) => {
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
        game.move({
            from: origin,
            to: squareData.square,
            promotion: "q"
        })
    } catch (e) {
        const hasMoves = getOptions(squareData.square)
        if (hasMoves) {
            setOrigin(squareData.square)
        }

        return
    }

    setPosition(game.fen())
    setOrigin(null)
    setOptions({})
  }, [origin])

  const boardOptions = {
    position: position,
    onPieceDrop: onDrop,
    onSquareClick: onClick,
    darkSquareStyle: {
        backgroundColor: "#7b7b7b",
    },
    lightSquareStyle: {
        backgroundColor: "#ffffff",
    }
  }

  return (
    <>
      <Chessboard
        options={boardOptions}
    />
    </>
  )
}

export default Game