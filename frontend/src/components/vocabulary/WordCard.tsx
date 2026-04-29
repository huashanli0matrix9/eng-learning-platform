import { Link } from 'react-router-dom'
import type { Word } from '../../types'
import { cn, getDifficultyColor } from '../../lib/utils'

interface WordCardProps {
  word: Word
}

export default function WordCard({ word }: WordCardProps) {
  return (
    <Link
      to={`/words/${word.id}`}
      className="block p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-blue-600/50 hover:bg-slate-900 transition-all duration-200 group"
    >
      {/* Word header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
            {word.word}
          </h3>
          <span className="text-sm text-slate-500 italic">{word.part_of_speech}</span>
        </div>
        <span className={cn(
          'text-xs px-2.5 py-1 rounded-full border font-medium whitespace-nowrap',
          getDifficultyColor(word.difficulty)
        )}>
          {word.difficulty}
        </span>
      </div>

      {/* Definition */}
      <p className="text-sm text-slate-400 line-clamp-2 mb-3">
        {word.definition}
      </p>

      {/* Synonym */}
      {word.synonym && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-600">syn:</span>
          <span className="text-emerald-400 font-medium">{word.synonym}</span>
        </div>
      )}

      {/* Example */}
      {word.example_sentence && (
        <p className="mt-2 text-xs text-slate-600 italic line-clamp-1">
          "{word.example_sentence}"
        </p>
      )}
    </Link>
  )
}
