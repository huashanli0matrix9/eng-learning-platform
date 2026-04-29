import { Link } from 'react-router-dom'
import { BookOpen, Sparkles, RefreshCw, BookMarked, TrendingUp } from 'lucide-react'
import { useCategories, useVocabularyStats, useWords } from '../hooks/useVocabulary'
import CategoryCard from '../components/vocabulary/CategoryCard'
import ProgressBar from '../components/vocabulary/ProgressBar'

export default function Home() {
  const { data: categories } = useCategories()
  const { data: stats } = useVocabularyStats()

  const statsCards = [
    {
      label: 'Total Words',
      value: stats?.total_words ?? 0,
      icon: BookMarked,
      color: 'text-blue-400 bg-blue-600/20',
    },
    {
      label: 'Studied',
      value: stats?.words_studied ?? 0,
      icon: BookOpen,
      color: 'text-purple-400 bg-purple-600/20',
    },
    {
      label: 'Mastered',
      value: stats?.words_mastered ?? 0,
      icon: TrendingUp,
      color: 'text-emerald-400 bg-emerald-600/20',
    },
    {
      label: 'Due Review',
      value: stats?.words_due_review ?? 0,
      icon: RefreshCw,
      color: 'text-orange-400 bg-orange-600/20',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 mb-4">
          IELTS <span className="text-blue-500">Vocabulary</span> Lab
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          Master IELTS vocabulary with spaced repetition, categorized word lists, and daily practice.
        </p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-100">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      {stats && (
        <ProgressBar
          value={stats.words_studied}
          max={stats.total_words}
          label="Overall Progress"
          className="px-4"
        />
      )}

      {/* Quick actions */}
      <section>
        <h2 className="text-xl font-semibold text-slate-100 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            to="/daily"
            className="flex items-center gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-blue-600/50 transition-all group"
          >
            <div className="p-3 rounded-xl bg-yellow-600/20">
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                Daily Words
              </h3>
              <p className="text-xs text-slate-500">10 random words every day</p>
            </div>
          </Link>

          <Link
            to="/review"
            className="flex items-center gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-blue-600/50 transition-all group"
          >
            <div className="p-3 rounded-xl bg-orange-600/20">
              <RefreshCw className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                Spaced Review
              </h3>
              <p className="text-xs text-slate-500">Review due words</p>
            </div>
          </Link>

          <Link
            to="/categories"
            className="flex items-center gap-4 p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-blue-600/50 transition-all group"
          >
            <div className="p-3 rounded-xl bg-blue-600/20">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                Categories
              </h3>
              <p className="text-xs text-slate-500">Browse by topic</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Category progress */}
      {stats?.category_progress && stats.category_progress.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Category Progress</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.category_progress.map((cp) => {
              const cat = categories?.find((c) => c.slug === cp.slug)
              if (!cat) return null
              return (
                <CategoryCard
                  key={cp.slug}
                  category={cat}
                  progress={{ studied: cp.studied, percentage: cp.percentage }}
                />
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
