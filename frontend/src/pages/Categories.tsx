import { useState } from 'react';
import { Search } from 'lucide-react';
import { useCategories, useVocabularyStats } from '../hooks/useVocabulary';
import CategoryCard from '../components/vocabulary/CategoryCard';

export default function Categories() {
  const [search, setSearch] = useState('');

  const { data: categories, isLoading, error } = useCategories();
  const { data: stats } = useVocabularyStats();

  const filtered =
    categories?.filter(
      (cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        cat.description.toLowerCase().includes(search.toLowerCase())
    ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-10 bg-slate-800 rounded-lg animate-pulse" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-slate-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
        <p className="text-red-400">
          Failed to load categories. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Categories</h1>
        <p className="text-slate-400 mt-1">
          Browse vocabulary by topic and track your progress
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
        />
      </div>

      {/* Category Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-12 text-center">
          <p className="text-slate-500 text-lg mb-2">No categories found</p>
          <p className="text-slate-600 text-sm">
            Try a different search term
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat) => {
            const catProgress = stats?.category_progress.find(
              (cp) => cp.slug === cat.slug
            );
            return (
              <CategoryCard
                key={cat.id}
                category={cat}
                studied={catProgress?.studied || 0}
                percentage={catProgress?.percentage || 0}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
