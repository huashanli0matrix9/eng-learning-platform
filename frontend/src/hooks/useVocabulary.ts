import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import type { Category, Word, PaginatedResponse, UserProgress, VocabularyStats, Bookmark, WordLearningProgress } from '../types'

// Categories
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories/')
      return data.results ?? data
    },
  })
}

// Words
export function useWords(params?: { category?: string; search?: string; difficulty?: string; page?: number }) {
  return useQuery<PaginatedResponse<Word>>({
    queryKey: ['words', params],
    queryFn: async () => {
      const { data } = await api.get('/words/', { params })
      return data
    },
  })
}

export function useWord(id: number | string) {
  return useQuery<Word>({
    queryKey: ['word', id],
    queryFn: async () => {
      const { data } = await api.get(`/words/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useDailyWords(count = 10) {
  return useQuery<Word[]>({
    queryKey: ['dailyWords', count],
    queryFn: async () => {
      const { data } = await api.get('/words/daily/', { params: { count } })
      return data.results ?? data
    },
  })
}

export function useRandomWords(count = 10) {
  return useQuery<Word[]>({
    queryKey: ['randomWords', count],
    queryFn: async () => {
      const { data } = await api.get('/words/random/', { params: { count } })
      return data.results ?? data
    },
  })
}

// Vocabulary Stats
export function useVocabularyStats() {
  return useQuery<VocabularyStats>({
    queryKey: ['vocabularyStats'],
    queryFn: async () => {
      const { data } = await api.get('/progress/stats/')
      return data
    },
    retry: 1,
  })
}

// User Progress
export function useUserProgress() {
  return useQuery<PaginatedResponse<UserProgress>>({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const { data } = await api.get('/progress/')
      return data
    },
  })
}

export function useDueWords() {
  return useQuery<UserProgress[]>({
    queryKey: ['dueWords'],
    queryFn: async () => {
      const { data } = await api.get('/progress/due_words/')
      return data.results ?? data
    },
  })
}

export function useMarkReviewed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (wordId: number) => {
      const { data } = await api.post('/progress/mark_reviewed/', { word_id: wordId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dueWords'] })
      queryClient.invalidateQueries({ queryKey: ['vocabularyStats'] })
      queryClient.invalidateQueries({ queryKey: ['userProgress'] })
      queryClient.invalidateQueries({ queryKey: ['dailyWords'] })
    },
  })
}

export function useRecordReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ wordId, correct }: { wordId: number; correct: boolean }) => {
      const { data } = await api.post('/progress/review/', { word_id: wordId, correct })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dueWords'] })
      queryClient.invalidateQueries({ queryKey: ['vocabularyStats'] })
      queryClient.invalidateQueries({ queryKey: ['userProgress'] })
    },
  })
}

export function useReviewWord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ word_id, correct }: { word_id: number; correct: boolean }) => {
      const { data } = await api.post('/progress/review/', { word_id, correct })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dueWords'] })
      queryClient.invalidateQueries({ queryKey: ['vocabularyStats'] })
      queryClient.invalidateQueries({ queryKey: ['userProgress'] })
    },
  })
}

// Bookmarks
export function useBookmarks() {
  return useQuery<Bookmark[]>({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const { data } = await api.get('/bookmarks/')
      return data.results ?? data
    },
  })
}

export function useAddBookmark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (wordId: number) => {
      const { data } = await api.post('/bookmarks/', { word: wordId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })
}

export function useRemoveBookmark() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (bookmarkId: number) => {
      await api.delete(`/bookmarks/${bookmarkId}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })
}

// Word Learning Progress
export function useWordLearningProgress(wordId: number | undefined) {
  return useQuery<WordLearningProgress[]>({
    queryKey: ['learningProgress', wordId],
    queryFn: async () => {
      const { data } = await api.get('/learning-progress/', { params: { word: wordId } })
      return data.results ?? data
    },
    enabled: !!wordId,
  })
}

export function useUpdateLearningProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { word: number; module: string; completed?: boolean; score?: number; details?: Record<string, unknown> }) => {
      // Try to find existing progress and update; otherwise create
      const { data } = await api.post('/learning-progress/', payload)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['learningProgress', data.word] })
    },
  })
}

// AI Speaking
export function useAISpeaking() {
  return useMutation({
    mutationFn: async ({ wordId, message }: { wordId: number; message: string }) => {
      const { data } = await api.post('/ai/speaking/', { word_id: wordId, message })
      return data
    },
  })
}

// AI Writing Correction
export function useAIWritingCorrection() {
  return useMutation({
    mutationFn: async ({ wordId, exerciseId, answer }: { wordId: number; exerciseId: number; answer: string }) => {
      const { data } = await api.post('/ai/writing-correction/', {
        word_id: wordId,
        exercise_id: exerciseId,
        answer,
      })
      return data
    },
  })
}
