import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Riddle } from '@/lib/types'

export const revalidate = 0

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: riddles } = await supabase
    .from('riddles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold font-serif text-[#3EB489]">Admin Dashboard</h1>
        <Link
          href="/admin/riddles/new"
          className="bg-[#3EB489] hover:bg-[#35a07a] text-white font-semibold px-4 py-2 rounded transition-colors"
        >
          + New Riddle
        </Link>
      </div>

      {!riddles?.length && (
        <p className="text-gray-500">No riddles yet. Post your first one!</p>
      )}

      <div className="flex flex-col gap-3">
        {riddles?.map((riddle: Riddle) => (
          <Link
            key={riddle.id}
            href={`/admin/riddles/${riddle.id}`}
            className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <p className="font-medium text-gray-900">{riddle.title ?? 'Untitled Riddle'}</p>
              <p className="text-sm text-gray-500">
                Posted {new Date(riddle.published_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              {riddle.is_active && (
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">Active</span>
              )}
              {riddle.answer_revealed_at && (
                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Revealed</span>
              )}
              {!riddle.is_active && !riddle.answer_revealed_at && (
                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Closed</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
