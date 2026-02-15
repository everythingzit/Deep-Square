import { Chess } from "chess.js"
import { Chessboard } from "react-chessboard"
import { useState, useCallback } from "react"

function Game() {
  const [game, setGame] = useState(new Chess())
  const [position, setPosition] = useState(game.fen())

  const onDrop = useCallback((moveData) => {
    try {
        const gameCopy = new Chess(game.fen())

        console.log(moveData)

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

  const onClick = useCallback((square, piece) => {
    
  }, [game])

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