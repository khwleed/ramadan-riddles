import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="text-center py-24">
        <h1 className="text-6xl font-bold font-serif text-[#3EB489] mb-4">Ramadan Riddles</h1>
        <p className="text-gray-500 text-lg mb-8">Test your knowledge with daily riddles this Ramadan.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="bg-[#3EB489] hover:bg-[#35a07a] text-white px-6 py-2 rounded font-semibold transition-colors">
            Login
          </Link>
          <Link href="/register" className="border border-[#3EB489] text-[#3EB489] hover:bg-[#3EB489] hover:text-white px-6 py-2 rounded font-semibold transition-colors">
            Register
          </Link>
        </div>
      </div>
    )
  }

  const { data: activeRiddle } = await supabase
    .from('riddles')
    .select('id')
    .eq('is_active', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .single()

  if (activeRiddle) {
    redirect(`/riddles/${activeRiddle.id}`)
  }

  const { data: latestRiddle } = await supabase
    .from('riddles')
    .select('id')
    .order('published_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="text-center py-24">
      <h1 className="text-5xl font-bold font-serif text-[#3EB489] mb-4">No Active Riddle</h1>
      <p className="text-gray-500 mb-6">
        {latestRiddle
          ? 'The current riddle has been closed. Check the leaderboard!'
          : 'No riddles have been posted yet. Check back soon!'}
      </p>
      <div className="flex gap-4 justify-center">
        {latestRiddle && (
          <Link href={`/riddles/${latestRiddle.id}`} className="text-[#3EB489] hover:text-[#35a07a] underline">
            View last riddle
          </Link>
        )}
        <Link href="/leaderboard" className="bg-[#3EB489] hover:bg-[#35a07a] text-white px-6 py-2 rounded font-semibold transition-colors">
          Leaderboard
        </Link>
      </div>
    </div>
  )
}
