import { useState } from 'react';
import { Sparkles, CheckCircle2, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDailyWords, useMarkReviewed } from '../hooks/useVocabulary';
import Flashcard from '../components/vocabulary/Flashcard';
import ProgressBar from '../components/vocabulary/ProgressBar';

export default function DailyWords() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());

  const { data: words, isLoading, error } = useDailyWords(10);
  const markReviewed = useMarkReviewed();

  const currentWord = words?.[currentIndex];

  const handleNext = () => {
    if (words && currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleMarkReviewed = () => {
    if (currentWord && !reviewedIds.has(currentWord.id)) {
      markReviewed.mutate(currentWord.id);
      setReviewedIds((prev) => new Set(prev).add(currentWord.id));
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-72 bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-80 bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-400 text-lg mb-4">Failed to load daily words</p>
        <Link
          to="/"
          className="text-emerald-400 hover:text-emerald-300"
        >
          Go home
        </Link>
      </div>
    );
  }

  if (!words || words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BookOpen className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-slate-100 mb-2">No Words Available</h2>
        <p className="text-slate-500 mb-6">Come back later for new daily words!</p>
        <Link
          to="/vocabulary"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
        >
          Browse Vocabulary
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-amber-400" />
          Daily Words
        </h1>
        <p className="text-slate-500 mt-1">{today}</p>
      </div>

      {/* Progress */}
      <ProgressBar
        value={reviewedIds.size}
        max={words.length}
        label={`${reviewedIds.size}/${words.length} reviewed`}
        barClassName="h-3"
      />

      {/* Card Counter */}
      <div className="text-center text-sm text-slate-500">
        Word {currentIndex + 1} of {words.length}
      </div>

      {/* Flashcard */}
      <Flashcard
        word={currentWord}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={currentIndex < words.length - 1}
        hasPrev={currentIndex > 0}
      />

      {/* Mark Reviewed Button */}
      <div className="flex justify-center">
        <button
          onClick={handleMarkReviewed}
          disabled={reviewedIds.has(currentWord.id)}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            reviewedIds.has(currentWord.id)
              ? 'bg-emerald-600/20 text-emerald-400 cursor-default'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          {reviewedIds.has(currentWord.id) ? 'Reviewed' : 'Mark as Reviewed'}
        </button>
      </div>

      {/* Done State */}
      {reviewedIds.size === words.length && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-emerald-300 mb-1">
            All done for today!
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Great job reviewing all {words.length} daily words.
          </p>
          <Link
            to="/review"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            Review Due Words
          </Link>
        </div>
      )}
    </div>
  );
}
