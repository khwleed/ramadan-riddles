export type Profile = {
  id: string
  username: string
  is_admin: boolean
  created_at: string
}

export type Riddle = {
  id: string
  title: string | null
  image_url: string
  answer: string | null
  is_active: boolean
  published_at: string
  answer_revealed_at: string | null
  created_at: string
}

export type Submission = {
  id: string
  riddle_id: string
  user_id: string
  answer: string
  submitted_at: string
  is_correct: boolean | null
  time_taken_seconds: number | null
}

export type LeaderboardEntry = {
  user_id: string
  username: string
  correct_count: number
  total_time_seconds: number
}
