import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePhrasalVerbs, usePhrasalVerbCategories } from '../hooks/useVocabulary'

export default function PhrasalVerbs() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const { data: categories } = usePhrasalVerbCategories()
  const { data, isLoading } = usePhrasalVerbs({
    search: search || undefined,
    category: categoryFilter ? Number(categoryFilter) : undefined,
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Phrasal Verbs</h1>
      <p className="text-gray-600 mb-6">动词短语 · 按分类学表达</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search phrases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.phrase_count})
            </option>
          ))}
        </select>
      </div>

      {/* Category cards */}
      {!categoryFilter && !search && categories && categories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-500 mb-3">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(String(cat.id))}
                className="px-4 py-2 rounded-full border text-sm bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                {cat.name}
                <span className="ml-1.5 text-gray-400 text-xs">{cat.phrase_count}</span>
              </button>
            ))}
            <button
              onClick={() => setCategoryFilter('')}
              className="px-4 py-2 rounded-full border text-sm bg-white hover:bg-blue-50"
            >
              Show All
            </button>
          </div>
        </div>
      )}

      {/* Phrase list */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : !data?.results?.length ? (
        <div className="text-center py-12 text-gray-500">No phrases found.</div>
      ) : (
        <div className="grid gap-4">
          {data.results.map((phrase) => (
            <Link
              key={phrase.id}
              to={`/phrasal-verbs/${phrase.id}`}
              className="block p-5 bg-white rounded-xl border hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-xl font-semibold text-blue-700">{phrase.phrase}</h2>
                <span className="text-lg text-gray-500">{phrase.meaning_zh}</span>
              </div>
              {phrase.category_name && (
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 mb-2">
                  {phrase.category_name}
                </span>
              )}
              <p className="text-gray-700 text-sm leading-relaxed">{phrase.target_sentence}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Count */}
      {data && data.count > 0 && (
        <div className="text-center mt-8">
          <span className="text-gray-500 text-sm">{data.count} phrases total</span>
        </div>
      )}
    </div>
  )
}
