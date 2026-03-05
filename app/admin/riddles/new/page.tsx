'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { uploadRiddle } from '@/app/actions'
import Image from 'next/image'

export default function NewRiddlePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const applyFile = (f: File) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) applyFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith('image/')) applyFile(f)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) { setError('Please select an image.'); return }

    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.set('image', file)
    formData.set('title', titleRef.current?.value ?? '')

    const result = await uploadRiddle(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/admin/riddles/${result.riddleId}`)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-4xl font-bold font-serif text-[#3EB489] mb-6">New Riddle</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div>
          <label className="block text-sm text-gray-600 mb-1">Title (optional)</label>
          <input
            ref={titleRef}
            type="text"
            name="title"
            placeholder="Riddle #1"
            className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-[#3EB489]"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">Riddle Image</label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-lg border-2 border-dashed transition-colors ${
              dragging
                ? 'border-[#3EB489] bg-[#3EB489]/10'
                : 'border-gray-300 hover:border-[#3EB489] hover:bg-green-50'
            }`}
          >
            {preview ? (
              <div className="relative w-full h-56">
                <Image src={preview} alt="Preview" fill className="object-contain rounded-lg p-2" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <svg className="w-10 h-10 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-500">Drag & drop an image here, or <span className="text-[#3EB489]">click to browse</span></p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, WEBP</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {preview && (
            <button
              type="button"
              onClick={() => { setFile(null); setPreview(null) }}
              className="mt-2 text-xs text-gray-400 hover:text-red-500"
            >
              Remove image
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !file}
          className="bg-[#3EB489] hover:bg-[#35a07a] disabled:opacity-50 text-white font-semibold py-2 rounded transition-colors"
        >
          {loading ? 'Uploading...' : 'Post Riddle'}
        </button>
      </form>
    </div>
  )
}
