import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import type { Category, Word, PaginatedResponse, UserProgress, VocabularyStats } from '../types'

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
  return useQuery<{ results: Word[] }>({
    queryKey: ['dailyWords', count],
    queryFn: async () => {
      const { data } = await api.get('/words/daily/', { params: { count } })
      return data
    },
  })
}

export function useRandomWords(count = 10) {
  return useQuery<{ results: Word[] }>({
    queryKey: ['randomWords', count],
    queryFn: async () => {
      const { data } = await api.get('/words/random/', { params: { count } })
      return data
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
  return useQuery<PaginatedResponse<UserProgress>>({
    queryKey: ['dueWords'],
    queryFn: async () => {
      const { data } = await api.get('/progress/due_words/')
      return data
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
