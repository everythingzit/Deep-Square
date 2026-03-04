import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

const COLORS = {
    Wins: "#22c55e",
    Losses: "#ef4444",
    Draws: "#eab308"
}

function WinLossChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fill: "#8b949e", fontSize: 11, letterSpacing: 2 }} />
                <YAxis tick={{ fill: "#8b949e", fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                    contentStyle={{ background: "#161b22", border: "1px solid #30363d", color: "#e6edf3", fontSize: 12 }}
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                    {data.map((entry) => (
                        <Cell key={entry.name} fill={COLORS[entry.name]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}

export default WinLossChart