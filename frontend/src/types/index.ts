export interface Category {
  id: number
  name: string
  slug: string
  description: string
  order: number
  word_count: number
}

export interface Word {
  id: number
  word: string
  phonetic: string
  part_of_speech: string
  definition: string
  synonym: string
  example_sentence: string
  category: number
  category_name: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  created_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface UserProgress {
  id: number
  word: number
  word_detail: Word
  mastery_level: number
  times_reviewed: number
  last_reviewed: string | null
  next_review: string | null
}

export interface VocabularyStats {
  total_words: number
  words_studied: number
  words_mastered: number
  words_learning: number
  words_due_review: number
  overall_progress: number
  category_progress: CategoryProgress[]
}

export interface CategoryProgress {
  category: string
  slug: string
  total: number
  studied: number
  percentage: number
}
