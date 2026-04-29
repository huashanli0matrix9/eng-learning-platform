import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Volume2,
  AlertCircle,
} from 'lucide-react';
import { useWord, useMarkReviewed } from '../hooks/useVocabulary';
import { cn } from '../lib/utils';

const difficultyStyles: Record<string, string> = {
  beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function WordDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const wordId = Number(id);

  const { data: word, isLoading, error } = useWord(wordId);
  const markReviewed = useMarkReviewed();

  const handleMarkReviewed = () => {
    if (wordId) {
      markReviewed.mutate(wordId);
    }
  };

  const handleSpeak = () => {
    if (word?.word) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-32 bg-slate-800 rounded-lg" />
        <div className="h-64 bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  if (error || !word) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Word Not Found</h2>
        <p className="text-slate-500 mb-6">
          The word you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/vocabulary"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vocabulary
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Word Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-slate-100">{word.word}</h1>
              <button
                onClick={handleSpeak}
                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                title="Listen to pronunciation"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
            {word.phonetic && (
              <p className="text-lg text-slate-500">{word.phonetic}</p>
            )}
          </div>
          <div className="flex gap-2">
            <span
              className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
                difficultyStyles[word.difficulty] ||
                  'bg-slate-600 text-slate-300'
              )}
            >
              {word.difficulty}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {word.part_of_speech}
            </span>
          </div>
        </div>

        {/* Category */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Bookmark className="w-4 h-4" />
          <span>{word.category_name}</span>
        </div>

        {/* Definition */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
            Definition
          </h3>
          <p className="text-lg text-slate-200 leading-relaxed">
            {word.definition}
          </p>
        </div>

        {/* Synonym */}
        {word.synonym && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
              Synonym
            </h3>
            <span className="inline-block px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 text-sm font-medium border border-emerald-500/20">
              {word.synonym}
            </span>
          </div>
        )}

        {/* Example */}
        {word.example_sentence && (
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
              Example
            </h3>
            <div className="rounded-xl bg-slate-700/50 border border-slate-600/50 p-4">
              <p className="text-slate-300 italic leading-relaxed">
                &ldquo;{word.example_sentence}&rdquo;
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleMarkReviewed}
          disabled={markReviewed.isPending}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          {markReviewed.isPending ? 'Marking...' : 'Mark as Reviewed'}
        </button>
        {markReviewed.isSuccess && (
          <span className="text-sm text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Reviewed!
          </span>
        )}
        <Link
          to="/vocabulary"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </Link>
      </div>
    </div>
  );
}
