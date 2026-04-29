import { useState, useEffect } from 'react'
import { useWords } from '../hooks/useVocabulary'
import WordCard from '../components/vocabulary/WordCard'
import { Search, BookOpen, X } from 'lucide-react'

export default function WordSearch() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data, isLoading } = useWords(
    debouncedQuery ? { search: debouncedQuery } : undefined
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">
          Search Words
        </h1>
        <p className="text-slate-500">
          Find any IELTS vocabulary word
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Type to search words..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-600/50 text-lg transition-colors"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {!debouncedQuery ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500">Enter a word to search</p>
        </div>
      ) : isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : data?.results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No results for "{debouncedQuery}"</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.results.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      )}
    </div>
  )
}
