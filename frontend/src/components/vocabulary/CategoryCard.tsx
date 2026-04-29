import { Link } from 'react-router-dom'
import type { Category } from '../../types'
import { BookOpen, ChevronRight } from 'lucide-react'

interface CategoryCardProps {
  category: Category
  progress?: { studied: number; percentage: number }
}

export default function CategoryCard({ category, progress }: CategoryCardProps) {
  return (
    <Link
      to={`/vocabulary/${category.slug}`}
      className="block p-6 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-blue-600/50 hover:bg-slate-900 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
              {category.name}
            </h3>
            <p className="text-xs text-slate-500">
              {category.word_count} words
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
      </div>

      {category.description && (
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">
          {category.description}
        </p>
      )}

      {/* Progress bar */}
      {progress && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Progress</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}
    </Link>
  )
}
