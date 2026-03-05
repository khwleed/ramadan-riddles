import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import AnswerForm from '@/components/AnswerForm'

export const revalidate = 0

export default async function RiddlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: riddle } = await supabase
    .from('riddles')
    .select('*')
    .eq('id', id)
    .single()

  if (!riddle) return notFound()

  const { data: submission } = await supabase
    .from('submissions')
    .select('*')
    .eq('riddle_id', id)
    .eq('user_id', user.id)
    .single()

  const answerRevealed = !!riddle.answer_revealed_at

  return (
    <div className="max-w-2xl mx-auto">
      {riddle.title && (
        <h1 className="text-4xl font-bold font-serif text-[#3EB489] mb-4">{riddle.title}</h1>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="relative w-full" style={{ minHeight: 300 }}>
          <Image
            src={riddle.image_url}
            alt={riddle.title ?? 'Riddle'}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-5">
        {!submission && riddle.is_active && (
          <AnswerForm riddleId={riddle.id} />
        )}

        {!submission && !riddle.is_active && !answerRevealed && (
          <p className="text-gray-500">This riddle is no longer accepting submissions.</p>
        )}

        {!submission && answerRevealed && (
          <div>
            <p className="text-gray-500 mb-2">You did not submit an answer.</p>
            <p className="text-lg">
              Correct answer: <span className="text-[#3EB489] font-semibold">{riddle.answer}</span>
            </p>
          </div>
        )}

        {submission && !answerRevealed && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Your answer</p>
            <p className="text-lg font-medium mb-3 text-gray-900">{submission.answer}</p>
            <p className="text-gray-500 italic">Awaiting result...</p>
          </div>
        )}

        {submission && answerRevealed && submission.is_correct && (
          <div>
            <p className="text-green-600 text-lg font-bold mb-2">Correct!</p>
            <p className="text-sm text-gray-500">Your answer: {submission.answer}</p>
            <p className="text-sm text-gray-500">Time taken: {submission.time_taken_seconds}s</p>
          </div>
        )}

        {submission && answerRevealed && !submission.is_correct && (
          <div>
            <p className="text-red-600 text-lg font-bold mb-2">Incorrect</p>
            <p className="text-sm text-gray-500 mb-1">Your answer: {submission.answer}</p>
            <p className="text-sm text-gray-900">
              Correct answer: <span className="text-[#3EB489] font-semibold">{riddle.answer}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
