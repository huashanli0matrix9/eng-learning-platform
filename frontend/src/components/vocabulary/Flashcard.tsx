import { useState } from 'react'
import type { Word } from '../../types'
import { cn, getDifficultyColor } from '../../lib/utils'
import { RotateCw, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'

interface FlashcardProps {
  word: Word
  onCorrect?: () => void
  onIncorrect?: () => void
  onNext?: () => void
  onPrev?: () => void
  showControls?: boolean
}

export default function Flashcard({ word, onCorrect, onIncorrect, onNext, onPrev, showControls = true }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Card */}
      <div
        onClick={() => setFlipped(!flipped)}
        className={cn(
          'relative min-h-[320px] cursor-pointer rounded-2xl border transition-all duration-500 transform-gpu',
          flipped
            ? 'border-blue-600/50 bg-slate-900'
            : 'border-slate-800 bg-slate-900/80 hover:border-blue-600/30'
        )}
      >
        {/* Flip hint */}
        <button
          onClick={(e) => { e.stopPropagation(); setFlipped(!flipped) }}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors z-10"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Front */}
        {!flipped && (
          <div className="flex flex-col items-center justify-center min-h-[320px] p-8 text-center">
            <p className="text-xs uppercase tracking-wider text-slate-600 mb-4">
              {word.part_of_speech}
            </p>
            <h2 className="text-4xl font-bold text-slate-100 mb-4">
              {word.word}
            </h2>
            {word.phonetic && (
              <p className="text-sm text-slate-500 mb-4">/{word.phonetic}/</p>
            )}
            <span className={cn(
              'text-xs px-3 py-1 rounded-full border font-medium',
              getDifficultyColor(word.difficulty)
            )}>
              {word.difficulty}
            </span>
            <p className="mt-6 text-xs text-slate-600">Tap to reveal</p>
          </div>
        )}

        {/* Back */}
        {flipped && (
          <div className="flex flex-col min-h-[320px] p-8">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-slate-100 mb-1">{word.word}</h2>
              <span className="text-sm text-slate-500 italic">{word.part_of_speech}</span>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-600 mb-1">Definition</p>
                <p className="text-slate-300">{word.definition}</p>
              </div>

              {word.synonym && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-600 mb-1">Synonym</p>
                  <p className="text-emerald-400 font-medium">{word.synonym}</p>
                </div>
              )}

              {word.example_sentence && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-600 mb-1">Example</p>
                  <p className="text-slate-400 italic text-sm">"{word.example_sentence}"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-center gap-4 mt-6">
          {onPrev && (
            <button
              onClick={onPrev}
              className="p-3 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {flipped && onCorrect && (
            <button
              onClick={(e) => { e.stopPropagation(); onCorrect() }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30 transition-colors font-medium"
            >
              <CheckCircle2 className="w-5 h-5" />
              Correct
            </button>
          )}

          {flipped && onIncorrect && (
            <button
              onClick={(e) => { e.stopPropagation(); onIncorrect() }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 transition-colors font-medium"
            >
              <XCircle className="w-5 h-5" />
              Incorrect
            </button>
          )}

          {onNext && (
            <button
              onClick={onNext}
              className="p-3 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
