import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePhrasalVerbs } from '../hooks/useVocabulary'

const SCENE_COLORS: Record<string, string> = {
  'client communication': 'bg-blue-100 text-blue-800',
  'project tracking': 'bg-green-100 text-green-800',
  'team management': 'bg-purple-100 text-purple-800',
  'team communication': 'bg-indigo-100 text-indigo-800',
  'conference or office visit': 'bg-yellow-100 text-yellow-800',
  'relationship maintenance': 'bg-pink-100 text-pink-800',
  'email communication': 'bg-orange-100 text-orange-800',
  'task switching': 'bg-teal-100 text-teal-800',
  'professional networking': 'bg-cyan-100 text-cyan-800',
  'internal support': 'bg-rose-100 text-rose-800',
  'meeting planning': 'bg-violet-100 text-violet-800',
  'technical work': 'bg-slate-100 text-slate-800',
  'project start': 'bg-emerald-100 text-emerald-800',
  'meeting agenda': 'bg-amber-100 text-amber-800',
}

function getSceneBadge(scene: string) {
  const key = scene.toLowerCase()
  const colorClass = SCENE_COLORS[key] || 'bg-gray-100 text-gray-800'
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      {scene}
    </span>
  )
}

export default function PhrasalVerbs() {
  const [search, setSearch] = useState('')
  const [sceneFilter, setSceneFilter] = useState('')
  const { data, isLoading } = usePhrasalVerbs({ search: search || undefined, scene: sceneFilter || undefined })

  // Collect unique scenes for the filter dropdown
  const scenes = [...new Set(data?.results?.map((p) => p.scene).filter(Boolean) || [])]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Phrasal Verbs</h1>
      <p className="text-gray-600 mb-6">动词短语 · 看语境 学表达</p>

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
          value={sceneFilter}
          onChange={(e) => setSceneFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Scenes</option>
          {scenes.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Phrases grid */}
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
              {phrase.scene && (
                <div className="mb-2">{getSceneBadge(phrase.scene)}</div>
              )}
              <p className="text-gray-700 text-sm leading-relaxed">{phrase.target_sentence}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.count > 20 && (
        <div className="flex justify-center gap-4 mt-8">
          <span className="text-gray-500 text-sm">
            {data.count} phrases total
          </span>
        </div>
      )}
    </div>
  )
}
