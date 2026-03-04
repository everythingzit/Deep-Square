import { useState, useEffect } from "react"
import "./styles/History.css"
import Loading from "../components/Loading"
import WinLossChart from "../components/WinLossChart"
import TimePerPieceChart from "../components/TimePerPieceChart"

function History() {
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState({})
    const [winLossData, setWinLossData] = useState([])
    const [timePerPieceData, setTimePerPieceData] = useState([])

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch("http://localhost:8000/api/games")

                if (!response.ok) throw new Error("Failed to fetch games")
                const gamesData = await response.json()

                const userIds = []
                for (const game of gamesData) {
                    if (!userIds.includes(game.user_id)) {
                        userIds.push(game.user_id)
                    }
                }

                const usersMap = {}
                for (const userId of userIds) {
                    const userResponse = await fetch(`http://localhost:8000/api/users/${userId}`)
                    if (userResponse.ok) {
                        const userData = await userResponse.json()
                        usersMap[userId] = userData.username
                    }
                }

                setUsers(usersMap)
                setGames(gamesData)

                setWinLossData(computeWinLoss(gamesData))
                setTimePerPieceData(computeTimePerPiece(gamesData))
            } catch (e) {
                // navigate to error page
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    const computeWinLoss = (games) => {
        const counts = { wins: 0, losses: 0, draws: 0 }

        for (const game of games) {
            if (game.result === "aborted") {
                continue
            } else if (game.result === "draw" || game.result === "stalemate") {
                counts.draws++
            } else if (game.result === "checkmate") {
                if (game.winner[0] !== game.player_color) {
                    counts.wins++
                } else {
                    counts.losses++
                }
            }
        }

        return [
            { name: "Wins", value: counts.wins },
            { name: "Losses", value: counts.losses },
            { name: "Draws", value: counts.draws },
        ]
    }

    const computeTimePerPiece = (games) => {
        const pieceData = {
            p: { total: 0, count: 0 },
            n: { total: 0, count: 0 },
            b: { total: 0, count: 0 },
            r: { total: 0, count: 0 },
            q: { total: 0, count: 0 },
            k: { total: 0, count: 0 }
        }

        for (const game of games) {
            if (!game.moves || game.moves.length === 0) continue

            for (let i = 0; i < game.moves.length; i++) {
                const move = game.moves[i]
                if (move.color === game.player_color) continue

                const piece = move.piece.toLowerCase()
                if (!pieceData[piece]) continue

                const timeTaken = i === 0
                    ? move.rawTime
                    : move.rawTime - game.moves[i - 1].rawTime

                pieceData[piece].total += timeTaken
                pieceData[piece].count++
            }
        }

        const pieceNames = { p: "Pawn", n: "Knight", b: "Bishop", r: "Rook", q: "Queen", k: "King" }

        return Object.entries(pieceData).map(([piece, data]) => ({
            subject: pieceNames[piece],
            avgTime: data.count > 0 ? Math.round(data.total / data.count) : 0
        }))
    }

    const copyPGN = (pgn) => {
        navigator.clipboard.writeText(pgn)
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const formatResult = (game) => {
        if (game.result === "checkmate") {
            return game.winner[0] === game.player_color ? users[game.user_id] : "DEEP SQUARE"
        } else if (game.result === "stalemate" || game.result === "draw") {
            return "DRAW"
        } else if (game.result === "aborted") {
            return "ABORTED"
        }
        return game.result
    }

    if (loading) {
        return <main id="history-main"><Loading /></main>
    }

    return (
        <main id="history-main">
            <section id="history-left">
                <table>
                    <thead>
                        <tr>
                            <th>DATE</th>
                            <th>USERNAME</th>
                            <th>USER</th>
                            <th>DEEP SQUARE</th>
                            <th>WINNER</th>
                            <th>DURATION</th>
                            <th>MOVES</th>
                            <th>DEPTH</th>
                            <th>PGN</th>
                        </tr>
                    </thead>
                    <tbody>
                        {games.map(game => {
                            const result = game.result

                            const userWon = result === "checkmate" && game.winner[0] === game.player_color

                            const rowClass = result === "aborted" ? "result-aborted"
                                : result === "draw" || result === "stalemate" ? "result-draw"
                                    : userWon ? "result-win" : "result-loss"

                            const winnerText = formatResult(game)

                            const winnerClass = result === "aborted" ? "winner-aborted"
                                : result === "draw" || result === "stalemate" ? "winner-draw"
                                    : userWon ? "winner-user" : "winner-engine"

                            return (
                                <tr key={game._id} className={rowClass}>
                                    <td>{formatDate(game.date)}</td>
                                    <td>{users[game.user_id]}</td>
                                    <td>{game.player_color === "w" ? "WHITE" : "BLACK"}</td>
                                    <td>{game.player_color === "b" ? "WHITE" : "BLACK"}</td>
                                    <td className={winnerClass}>{winnerText}</td>
                                    <td>{formatDuration(game.duration)}</td>
                                    <td>{game.total_moves}</td>
                                    <td>{game.engine_depth}</td>
                                    <td><button onClick={() => copyPGN(game.pgn)}>COPY</button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </section>
            <section id="history-right">
                <h2>
                    DEEP SQUARE WIN/LOSS/DRAW
                </h2>
                <WinLossChart data={winLossData} />
                <h2>
                    AVERAGE TIME PER MOVE BY PIECE (seconds)
                </h2>
                <TimePerPieceChart data={timePerPieceData} />
            </section>
        </main>
    )
}

export default History