import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import RevealAnswerForm from '@/components/RevealAnswerForm'
import type { Submission } from '@/lib/types'

export const revalidate = 0

export default async function AdminRiddlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: riddle } = await supabase
    .from('riddles')
    .select('*')
    .eq('id', id)
    .single()

  if (!riddle) return notFound()

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, profiles(username)')
    .eq('riddle_id', id)
    .order('submitted_at', { ascending: true })

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold font-serif text-[#3EB489] mb-2">
        {riddle.title ?? 'Untitled Riddle'}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Posted {new Date(riddle.published_at).toLocaleString()}
      </p>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="relative w-full" style={{ minHeight: 250 }}>
          <Image
            src={riddle.image_url}
            alt={riddle.title ?? 'Riddle'}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 672px"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-5 mb-6">
        {riddle.answer_revealed_at ? (
          <div>
            <p className="text-sm text-gray-500 mb-1">Correct Answer</p>
            <p className="text-3xl font-bold font-serif text-[#3EB489]">{riddle.answer}</p>
            <p className="text-sm text-gray-400 mt-1">
              Revealed {new Date(riddle.answer_revealed_at).toLocaleString()}
            </p>
          </div>
        ) : (
          <RevealAnswerForm riddleId={riddle.id} />
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-2xl font-semibold font-serif text-gray-900 mb-4">
          Submissions ({submissions?.length ?? 0})
        </h2>
        {!submissions?.length && (
          <p className="text-gray-500 text-sm">No submissions yet.</p>
        )}
        <div className="flex flex-col gap-2">
          {submissions?.map((sub: Submission & { profiles: { username: string } }) => (
            <div key={sub.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm">
              <div>
                <span className="font-medium text-gray-900">{sub.profiles?.username ?? 'Unknown'}</span>
                <span className="text-gray-500 ml-3">{sub.answer}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{sub.time_taken_seconds}s</span>
                {sub.is_correct === true && <span className="text-green-600 font-medium">Correct</span>}
                {sub.is_correct === false && <span className="text-red-600">Incorrect</span>}
                {sub.is_correct === null && <span className="text-gray-400">Pending</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
