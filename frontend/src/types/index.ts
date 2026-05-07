export interface Category {
  id: number
  name: string
  slug: string
  description: string
  order: number
  word_count: number
}

export interface Phrase {
  id: number
  phrase: string
  translation: string
  order: number
}

export interface ListeningSentence {
  id: number
  sentence: string
  translation: string
  order: number
}

export interface ReadingSentence {
  id: number
  sentence: string
  translation: string
  order: number
}

export interface WritingExercise {
  id: number
  chinese_sentence: string
  reference_answer: string
  order: number
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
  phrases: Phrase[]
  listening_sentences: ListeningSentence[]
  reading_sentences: ReadingSentence[]
  writing_exercises: WritingExercise[]
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

export interface Bookmark {
  id: number
  word: number
  word_detail: Word
  created_at: string
}

export interface WordLearningProgress {
  id: number
  word: number
  module: 'phrases' | 'listening' | 'speaking' | 'reading' | 'writing'
  completed: boolean
  score: number | null
  details: Record<string, unknown>
  updated_at: string
}

export interface PhrasalVerbCategory {
  id: number
  name: string
  slug: string
  description: string
  order: number
  phrase_count: number
}

export interface PhrasalVerb {
  id: number
  phrase: string
  meaning_zh: string
  category: number | null
  category_name: string | null
  category_slug: string | null
  context_en: string
  target_sentence: string
  context_zh: string
  usage_note: string
  created_at: string
}
