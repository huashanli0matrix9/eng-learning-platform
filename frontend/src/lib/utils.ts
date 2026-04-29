import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'intermediate':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'advanced':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  }
}

export function getMasteryColor(level: number): string {
  switch (level) {
    case 0: return 'bg-slate-600'
    case 1: return 'bg-yellow-500'
    case 2: return 'bg-blue-500'
    case 3: return 'bg-green-500'
    default: return 'bg-slate-600'
  }
}
