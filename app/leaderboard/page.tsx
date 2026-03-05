import { createClient } from '@/lib/supabase/server'
import LeaderboardTable from '@/components/LeaderboardTable'
import type { LeaderboardEntry } from '@/lib/types'

export const revalidate = 0

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: entries } = await supabase.from('leaderboard').select('*')

  return (
    <div>
      <h1 className="text-4xl font-bold font-serif text-[#3EB489] mb-6">Leaderboard</h1>
      <div className="bg-white rounded-lg shadow p-4">
        <LeaderboardTable entries={(entries as LeaderboardEntry[]) ?? []} />
      </div>
    </div>
  )
}
