import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts"

function TimePerPieceChart({ data }) {
    return (
        <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                <PolarGrid stroke="#30363d" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#8b949e", fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fill: "#484f58", fontSize: 10 }} />
                <Tooltip
                    contentStyle={{ background: "#161b22", border: "1px solid #30363d", color: "#e6edf3", fontSize: 12 }}
                />
                <Radar dataKey="avgTime" stroke="#f0a500" fill="#f0a500" fillOpacity={0.25} />
            </RadarChart>
        </ResponsiveContainer>
    )
}

export default TimePerPieceChart