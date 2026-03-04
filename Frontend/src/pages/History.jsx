import { useState, useEffect } from "react"
import "./styles/History.css"
import Loading from "../components/Loading"

function History() {
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState({})

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
            } catch (e) {
                // navigate to error page
            } finally {
                setLoading(false)
            }
        })()
    }, [])

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
            <section id="history-right"></section>
        </main>
    )
}

export default History