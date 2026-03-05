'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { revealAnswer } from '@/app/actions'

export default function RevealAnswerForm({ riddleId }: { riddleId: string }) {
  const router = useRouter()
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirm(`Reveal answer as "${answer}"? This will grade all submissions and cannot be undone.`)) return

    setLoading(true)
    setError('')

    const result = await revealAnswer(riddleId, answer.trim())

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h2 className="text-2xl font-semibold font-serif text-gray-900">Reveal Correct Answer</h2>
      <p className="text-sm text-gray-500">
        This will close submissions, reveal the answer, and auto-grade all responses.
      </p>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Correct Answer</label>
        <input
          type="text"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          required
          placeholder="Enter the correct answer..."
          className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-[#3EB489]"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading || !answer.trim()}
        className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2 rounded transition-colors"
      >
        {loading ? 'Revealing...' : 'Reveal & Grade'}
      </button>
    </form>
  )
}
