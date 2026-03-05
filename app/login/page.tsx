'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-4xl font-bold font-serif text-[#3EB489] mb-6 text-center">Sign In</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-[#3EB489]"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-[#3EB489]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#3EB489] hover:bg-[#35a07a] disabled:opacity-50 text-white font-semibold py-2 rounded transition-colors"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p className="text-center text-sm text-gray-500">
          No account?{' '}
          <Link href="/register" className="text-[#3EB489] hover:underline">Register</Link>
        </p>
      </form>
    </div>
  )
}
