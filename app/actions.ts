'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitAnswer(riddleId: string, answer: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: riddle, error: riddleError } = await supabase
    .from('riddles')
    .select('published_at, is_active')
    .eq('id', riddleId)
    .single()

  if (riddleError || !riddle) return { error: 'Riddle not found' }
  if (!riddle.is_active) return { error: 'Riddle is no longer accepting submissions' }

  const publishedAt = new Date(riddle.published_at).getTime()
  const now = Date.now()
  const timeTakenSeconds = Math.floor((now - publishedAt) / 1000)

  const { error } = await supabase.from('submissions').insert({
    riddle_id: riddleId,
    user_id: user.id,
    answer: answer.trim(),
    time_taken_seconds: timeTakenSeconds,
  })

  if (error) return { error: error.message }

  revalidatePath(`/riddles/${riddleId}`)
  return { success: true }
}

export async function revealAnswer(riddleId: string, correctAnswer: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return { error: 'Unauthorized' }

  // Update riddle
  const { error: riddleError } = await supabase
    .from('riddles')
    .update({
      answer: correctAnswer,
      answer_revealed_at: new Date().toISOString(),
      is_active: false,
    })
    .eq('id', riddleId)

  if (riddleError) return { error: riddleError.message }

  // Grade all submissions
  const { error: gradeError } = await supabase
    .from('submissions')
    .update({ is_correct: false })
    .eq('riddle_id', riddleId)

  if (gradeError) return { error: gradeError.message }

  const { error: correctError } = await supabase
    .from('submissions')
    .update({ is_correct: true })
    .eq('riddle_id', riddleId)
    .ilike('answer', correctAnswer)

  if (correctError) return { error: correctError.message }

  revalidatePath(`/admin/riddles/${riddleId}`)
  revalidatePath(`/riddles/${riddleId}`)
  revalidatePath('/leaderboard')
  return { success: true }
}

export async function uploadRiddle(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return { error: 'Unauthorized' }

  const file = formData.get('image') as File
  const title = formData.get('title') as string

  if (!file || file.size === 0) return { error: 'No image provided' }

  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('riddle-images')
    .upload(filename, file)

  if (uploadError) return { error: uploadError.message }

  const { data: urlData } = supabase.storage
    .from('riddle-images')
    .getPublicUrl(filename)

  // Deactivate all existing riddles
  await supabase.from('riddles').update({ is_active: false }).eq('is_active', true)

  // Insert new riddle
  const { data: riddle, error: insertError } = await supabase
    .from('riddles')
    .insert({
      title: title || null,
      image_url: urlData.publicUrl,
      published_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (insertError) return { error: insertError.message }

  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true, riddleId: riddle.id }
}
