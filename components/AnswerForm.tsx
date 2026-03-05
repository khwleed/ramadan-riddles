'use client'

import { useState } from 'react'
import { submitAnswer } from '@/app/actions'

export default function AnswerForm({ riddleId }: { riddleId: string }) {
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await submitAnswer(riddleId, answer.trim())

    if (result.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Your Answer</label>
        <input
          type="text"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          required
          placeholder="Type your answer..."
          className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-[#3EB489]"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading || !answer.trim()}
        className="bg-[#3EB489] hover:bg-[#35a07a] disabled:opacity-50 text-white font-semibold py-2 rounded transition-colors"
      >
        {loading ? 'Submitting...' : 'Submit Answer'}
      </button>
    </form>
  )
}
