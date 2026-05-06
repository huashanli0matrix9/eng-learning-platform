import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, XCircle, ThumbsUp, ThumbsDown, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDueWords, useRecordReview } from '../hooks/useVocabulary';
import Flashcard from '../components/vocabulary/Flashcard';
import ProgressBar from '../components/vocabulary/ProgressBar';

export default function Review() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<
    { wordId: number; correct: boolean; word: string }[]
  >([]);
  const [sessionComplete, setSessionComplete] = useState(false);

  const { data: words, isLoading, error, refetch } = useDueWords();
  const recordReview = useRecordReview();

  // Reset state when words change
  useEffect(() => {
    setCurrentIndex(0);
    setResults([]);
    setSessionComplete(false);
  }, [words?.length]);

  const currentWord = words?.[currentIndex];

  const handleNext = () => {
    if (words && currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (words && currentIndex === words.length - 1) {
      setSessionComplete(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleAnswer = (correct: boolean) => {
    if (!currentWord) return;

    recordReview.mutate({ wordId: currentWord.word, correct });
    setResults((prev) => [
      ...prev,
      { wordId: currentWord.word, correct, word: currentWord.word_detail?.word ?? '' },
    ]);

    // Auto advance after a brief delay
    setTimeout(() => {
      handleNext();
    }, 600);
  };

  const correctCount = results.filter((r) => r.correct).length;
  const incorrectCount = results.filter((r) => !r.correct).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-48 bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-80 bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-400 text-lg mb-4">Failed to load review words</p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (!words || words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <CheckCircle2 className="w-20 h-20 text-emerald-400 mb-6" />
        <h2 className="text-3xl font-bold text-slate-100 mb-3">
          All Caught Up!
        </h2>
        <p className="text-slate-500 text-lg mb-2">
          No words due for review right now.
        </p>
        <p className="text-slate-600 text-sm mb-8">
          Great job keeping up with your vocabulary practice!
        </p>
        <div className="flex gap-4">
          <Link
            to="/daily"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            Daily Words
          </Link>
          <Link
            to="/vocabulary"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 font-medium transition-colors"
          >
            Browse Vocabulary
          </Link>
        </div>
      </div>
    );
  }

  // Session complete summary
  if (sessionComplete) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center py-10">
          {correctCount === words.length ? (
            <CheckCircle2 className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
          ) : (
            <RefreshCw className="w-20 h-20 text-amber-400 mx-auto mb-6" />
          )}
          <h2 className="text-3xl font-bold text-slate-100 mb-2">
            Review Complete!
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            You reviewed {words.length} word{words.length !== 1 ? 's' : ''}
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
              <ThumbsUp className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-emerald-400">{correctCount}</p>
              <p className="text-xs text-slate-500">Correct</p>
            </div>
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <ThumbsDown className="w-6 h-6 text-red-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-400">{incorrectCount}</p>
              <p className="text-xs text-slate-500">Incorrect</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Check for More
            </button>
            <Link
              to="/daily"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 font-medium transition-colors"
            >
              Daily Words
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-400" />
          Spaced Repetition Review
        </h1>
        <p className="text-slate-500 mt-1">
          {words.length} word{words.length !== 1 ? 's' : ''} due for review
        </p>
      </div>

      {/* Progress */}
      <ProgressBar
        value={results.length}
        max={words.length}
        label={`${results.length}/${words.length} reviewed`}
        barClassName="h-3"
      />

      {/* Card Counter */}
      <div className="text-center text-sm text-slate-500">
        Word {currentIndex + 1} of {words.length}
      </div>

      {/* Flashcard */}
      <Flashcard
        word={currentWord?.word_detail ?? currentWord as any}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={currentIndex < words.length - 1 || results.length > currentIndex}
        hasPrev={currentIndex > 0}
      />

      {/* Correct / Incorrect Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => handleAnswer(true)}
          disabled={recordReview.isPending}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors disabled:opacity-50"
        >
          <ThumbsUp className="w-5 h-5" />
          Correct
        </button>
        <button
          onClick={() => handleAnswer(false)}
          disabled={recordReview.isPending}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-colors disabled:opacity-50"
        >
          <ThumbsDown className="w-5 h-5" />
          Incorrect
        </button>
      </div>

      {/* Live Results Ticker */}
      <div className="flex justify-center gap-6 text-sm">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          {correctCount} correct
        </span>
        <span className="flex items-center gap-1.5 text-red-400">
          <XCircle className="w-4 h-4" />
          {incorrectCount} incorrect
        </span>
      </div>
    </div>
  );
}
