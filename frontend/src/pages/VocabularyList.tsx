import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWords, useCategories } from '../hooks/useVocabulary'
import WordCard from '../components/vocabulary/WordCard'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'

export default function VocabularyList() {
  const { category } = useParams()
  const { data: categories } = useCategories()
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading } = useWords({
    category,
    search: debouncedSearch || undefined,
    difficulty: difficulty || undefined,
    page,
  })

  const currentCategory = categories?.find((c) => c.slug === category)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">
          {currentCategory ? currentCategory.name : 'Vocabulary'}
        </h1>
        {currentCategory?.description && (
          <p className="text-slate-500 mt-1">{currentCategory.description}</p>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Link
          to="/vocabulary"
          className={cn(
            'whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            !category
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          )}
        >
          All
        </Link>
        {categories?.map((cat) => (
          <Link
            key={cat.slug}
            to={`/vocabulary/${cat.slug}`}
            className={cn(
              'whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              category === cat.slug
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            )}
          >
            {cat.name}
            <span className="ml-1.5 text-xs opacity-60">({cat.word_count})</span>
          </Link>
        ))}
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search words..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-600/50 transition-colors"
          />
        </div>
        <select
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value); setPage(1) }}
          className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:outline-none focus:border-blue-600/50 transition-colors"
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-slate-900/50 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : data?.results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No words found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.results.map((word) => (
              <WordCard key={word.id} word={word} />
            ))}
          </div>

          {/* Pagination */}
          {data && data.count > 20 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={!data.previous}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {page} of {Math.ceil(data.count / 20)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!data.next}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
