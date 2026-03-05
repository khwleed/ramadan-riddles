import type { LeaderboardEntry } from '@/lib/types'

function formatTime(seconds: number): string {
  if (seconds === 0) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export default function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-gray-500 text-center py-8">No entries yet.</p>
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-gray-500 border-b border-gray-200">
          <th className="text-left py-2 pr-4">#</th>
          <th className="text-left py-2 pr-4">Username</th>
          <th className="text-right py-2 pr-4">Correct</th>
          <th className="text-right py-2">Total Time</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, i) => (
          <tr key={entry.user_id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="py-3 pr-4 text-gray-400">{i + 1}</td>
            <td className="py-3 pr-4 font-medium text-gray-900">{entry.username}</td>
            <td className="py-3 pr-4 text-right text-green-600 font-medium">{entry.correct_count}</td>
            <td className="py-3 text-right text-gray-500">{formatTime(Number(entry.total_time_seconds))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
