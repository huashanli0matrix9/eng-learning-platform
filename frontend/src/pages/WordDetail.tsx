import { useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Volume2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  MessageCircle,
  Mic,
  Send,
  Pencil,
  Headphones,
  BookOpen,
  Globe,
} from 'lucide-react'
import {
  useWord,
  useBookmarks,
  useAddBookmark,
  useRemoveBookmark,
  useMarkReviewed,
  useWordLearningProgress,
  useUpdateLearningProgress,
  useAISpeaking,
  useAIWritingCorrection,
} from '../hooks/useVocabulary'
import { cn } from '../lib/utils'

// ─── Difficulty styles ───
const difficultyStyles: Record<string, string> = {
  beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
}

// ─── Collapsible wrapper ───
function CollapsibleSection({
  icon: Icon,
  title,
  isOpen,
  children,
  step,
  isNext,
  onToggle,
}: {
  icon: React.ElementType
  title: string
  isOpen: boolean
  children: React.ReactNode
  step?: number
  isNext?: boolean
  onToggle?: () => void
}) {
  const toggle = () => {
    if (onToggle) onToggle()
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/50 overflow-hidden transition-all">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          {step != null && (
            <span
              className={cn(
                'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border',
                isNext
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-700 text-slate-400 border-slate-600'
              )}
            >
              {step}
            </span>
          )}
          <Icon className="w-5 h-5 text-slate-400" />
          <span className="text-lg font-semibold text-slate-200">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-slate-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-500" />
        )}
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  )
}

// ─── Pronounce button (TTS) ───
function SpeakButton({ text, size = 'default' }: { text: string; size?: 'default' | 'sm' }) {
  const speak = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    speechSynthesis.speak(utterance)
  }, [text])

  return (
    <button
      onClick={speak}
      className={cn(
        'rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors',
        size === 'sm' ? 'p-1.5' : 'p-2'
      )}
      title="Listen to pronunciation"
    >
      <Volume2 className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} />
    </button>
  )
}

// ─── Progress steps bar ───
type ModuleKey = 'phrases' | 'listening' | 'speaking' | 'reading' | 'writing'

const MODULE_STEPS: { key: ModuleKey; label: string; icon: React.ElementType }[] = [
  { key: 'phrases', label: 'Phrases', icon: BookOpen },
  { key: 'listening', label: 'Listening', icon: Headphones },
  { key: 'speaking', label: 'Speaking', icon: Mic },
  { key: 'reading', label: 'Reading', icon: Globe },
  { key: 'writing', label: 'Writing', icon: Pencil },
]

// ─── Main Page ───
export default function WordDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const wordId = Number(id)

  const { data: word, isLoading, error } = useWord(wordId)
  const { data: bookmarks } = useBookmarks()
  const { data: learningProgress } = useWordLearningProgress(wordId)
  const addBookmark = useAddBookmark()
  const removeBookmark = useRemoveBookmark()
  const markReviewed = useMarkReviewed()
  const updateProgress = useUpdateLearningProgress()

  // Current active learning step
  const [activeStep, setActiveStep] = useState<ModuleKey | null>('phrases')

  // Derived state
  const bookmark = bookmarks?.find((b) => b.word === wordId)
  const isBookmarked = !!bookmark

  const progressMap = new Map(
    (learningProgress ?? []).map((p) => [p.module, p])
  )

  const getNextUnfinishedStep = useCallback((): ModuleKey | null => {
    for (const step of MODULE_STEPS) {
      const prog = progressMap.get(step.key)
      if (!prog || !prog.completed) return step.key
    }
    return null
  }, [progressMap])

  const isStepCompleted = (key: ModuleKey) => progressMap.get(key)?.completed ?? false
  const isStepNext = (key: ModuleKey) => getNextUnfinishedStep() === key

  const handleModuleComplete = (module: ModuleKey, extra?: { score?: number; details?: Record<string, unknown> }) => {
    updateProgress.mutate({
      word: wordId,
      module,
      completed: true,
      ...extra,
    })
    // Auto-advance to next uncompleted step
    const next = MODULE_STEPS.find((s) => {
      if (s.key === module) return false
      const prog = progressMap.get(s.key)
      return !prog || !prog.completed
    })
    if (next) setActiveStep(next.key)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-32 bg-slate-800 rounded-lg" />
        <div className="h-64 bg-slate-800 rounded-2xl" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-800 rounded-2xl" />
        ))}
      </div>
    )
  }

  // Error state
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
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* ── Word Header ── */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-slate-100">{word.word}</h1>
              <SpeakButton text={word.word} />
              <button
                onClick={() => {
                  if (isBookmarked && bookmark) {
                    removeBookmark.mutate(bookmark.id)
                  } else {
                    addBookmark.mutate(wordId)
                  }
                }}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isBookmarked
                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-400'
                )}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this word'}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
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
                difficultyStyles[word.difficulty] || 'bg-slate-600 text-slate-300'
              )}
            >
              {word.difficulty}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {word.part_of_speech}
            </span>
          </div>
        </div>

        {/* Category & review button row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Bookmark className="w-4 h-4" />
            <span>{word.category_name}</span>
          </div>
          <button
            onClick={() => markReviewed.mutate(wordId)}
            disabled={markReviewed.isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {markReviewed.isPending ? '...' : 'Reviewed'}
          </button>
        </div>

        {/* Definition */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
            Definition
          </h3>
          <p className="text-lg text-slate-200 leading-relaxed">{word.definition}</p>
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

      {/* ── Learning Progress Steps ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {MODULE_STEPS.map((step, idx) => {
          const completed = isStepCompleted(step.key)
          const next = isStepNext(step.key)
          return (
            <div key={step.key} className="flex items-center gap-2">
              <button
                onClick={() => setActiveStep(step.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap',
                  completed
                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30'
                    : next
                    ? 'bg-blue-600/20 text-blue-400 border-blue-600/30'
                    : activeStep === step.key
                    ? 'bg-blue-600/30 text-blue-300 border-blue-600/40'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                )}
              >
                {completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <step.icon className="w-3.5 h-3.5" />
                )}
                <span>{step.label}</span>
              </button>
              {idx < MODULE_STEPS.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              )}
            </div>
          )
        })}
      </div>

      {/* ── Modules (single expand at a time) ── */}
      {word.phrases.length > 0 && (
        <PhrasesSection
          phrases={word.phrases}
          isOpen={activeStep === 'phrases'}
          isNext={isStepNext('phrases')}
          onComplete={() => handleModuleComplete('phrases')}
          onToggle={() => setActiveStep(activeStep === 'phrases' ? null : 'phrases')}
        />
      )}

      {word.listening_sentences.length > 0 && (
        <ListeningSection
          sentences={word.listening_sentences}
          wordText={word.word}
          isOpen={activeStep === 'listening'}
          isNext={isStepNext('listening')}
          onComplete={(score) => handleModuleComplete('listening', { score })}
          onToggle={() => setActiveStep(activeStep === 'listening' ? null : 'listening')}
        />
      )}

      <SpeakingSection
        wordText={word.word}
        wordId={wordId}
        isOpen={activeStep === 'speaking'}
        isNext={isStepNext('speaking')}
        onComplete={() => handleModuleComplete('speaking')}
        onToggle={() => setActiveStep(activeStep === 'speaking' ? null : 'speaking')}
      />

      {word.reading_sentences.length > 0 && (
        <ReadingSection
          sentences={word.reading_sentences}
          isOpen={activeStep === 'reading'}
          isNext={isStepNext('reading')}
          onComplete={() => handleModuleComplete('reading')}
          onToggle={() => setActiveStep(activeStep === 'reading' ? null : 'reading')}
        />
      )}

      {word.writing_exercises.length > 0 && (
        <WritingSection
          exercises={word.writing_exercises}
          wordId={wordId}
          isOpen={activeStep === 'writing'}
          isNext={isStepNext('writing')}
          onComplete={(score) => handleModuleComplete('writing', { score })}
          onToggle={() => setActiveStep(activeStep === 'writing' ? null : 'writing')}
        />
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
//  Phrases Section
// ──────────────────────────────────────────────
function PhrasesSection({
  phrases,
  isOpen,
  isNext,
  onComplete,
  onToggle,
}: {
  phrases: { id: number; phrase: string; translation: string }[]
  isOpen: boolean
  isNext: boolean
  onComplete: () => void
  onToggle: () => void
}) {
  const [showAll, setShowAll] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const displayed = showAll ? phrases : phrases.slice(0, 3)

  const togglePhrase = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <CollapsibleSection
      icon={BookOpen}
      title="Phrases"
      isOpen={isOpen}
      step={1}
      isNext={isNext}
      onToggle={onToggle}
    >
      <div className="space-y-2">
        {displayed.map((p) => {
          const expanded = expandedIds.has(p.id)
          return (
            <div key={p.id}>
              <button
                onClick={() => togglePhrase(p.id)}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-700/40 border border-slate-600/30 hover:bg-slate-700/60 transition-colors"
              >
                <p className="text-slate-200 font-medium">{p.phrase}</p>
                {expanded && p.translation && (
                  <p className="mt-1.5 text-sm text-slate-400">{p.translation}</p>
                )}
              </button>
            </div>
          )
        })}
      </div>
      {phrases.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showAll ? 'Show less' : `Show all (${phrases.length})`}
        </button>
      )}
      <button
        onClick={onComplete}
        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
      >
        <CheckCircle2 className="w-4 h-4" />
        Mark as Done
      </button>
    </CollapsibleSection>
  )
}

// ──────────────────────────────────────────────
//  Listening Section
// ──────────────────────────────────────────────
function ListeningSection({
  sentences,
  wordText,
  isOpen,
  isNext,
  onComplete,
  onToggle,
}: {
  sentences: { id: number; sentence: string; translation: string }[]
  wordText: string
  isOpen: boolean
  isNext: boolean
  onComplete: (score: number) => void
  onToggle: () => void
}) {
  const [dictationInputs, setDictationInputs] = useState<Record<number, string>>({})
  const [dictationResults, setDictationResults] = useState<Record<number, boolean | null>>({})

  const handleDictationSubmit = (sentenceId: number, original: string) => {
    const userAnswer = dictationInputs[sentenceId]?.trim().toLowerCase() ?? ''
    const correct = original.trim().toLowerCase()
    const isCorrect = userAnswer === correct
    setDictationResults((prev) => ({ ...prev, [sentenceId]: isCorrect }))
  }

  const completedCount = Object.values(dictationResults).filter(Boolean).length
  const totalCount = sentences.length

  return (
    <CollapsibleSection
      icon={Headphones}
      title="Listening"
      isOpen={isOpen}
      step={2}
      isNext={isNext}
      onToggle={onToggle}
    >
      <div className="space-y-4">
        {sentences.map((s) => (
          <div
            key={s.id}
            className="rounded-xl bg-slate-700/40 border border-slate-600/30 p-4 space-y-3"
          >
            {/* Sentence + play */}
            <div className="flex items-start justify-between gap-3">
              <p className="text-slate-200 flex-1">{s.sentence}</p>
              <SpeakButton text={s.sentence} size="sm" />
            </div>

            {/* Translation (always visible for listening) */}
            {s.translation && (
              <p className="text-sm text-slate-400 italic">{s.translation}</p>
            )}

            {/* Dictation */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={dictationInputs[s.id] ?? ''}
                onChange={(e) =>
                  setDictationInputs((prev) => ({
                    ...prev,
                    [s.id]: e.target.value,
                  }))
                }
                placeholder="Type what you hear..."
                className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-600/50"
              />
              <button
                onClick={() => handleDictationSubmit(s.id, s.sentence)}
                className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Dictation result */}
            {dictationResults[s.id] != null && (
              <div
                className={cn(
                  'flex items-center gap-1.5 text-sm font-medium',
                  dictationResults[s.id] ? 'text-emerald-400' : 'text-red-400'
                )}
              >
                {dictationResults[s.id] ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Correct!
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" /> Not quite. Try again.
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {completedCount > 0 && (
        <p className="mt-3 text-sm text-slate-500">
          Dictation: {completedCount}/{totalCount} correct
        </p>
      )}
      <button
        onClick={() => onComplete(completedCount / totalCount)}
        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
      >
        <CheckCircle2 className="w-4 h-4" />
        Mark as Done
      </button>
    </CollapsibleSection>
  )
}

// ──────────────────────────────────────────────
//  Speaking Section (AI placeholder)
// ──────────────────────────────────────────────
function SpeakingSection({
  wordText,
  wordId,
  isOpen,
  isNext,
  onComplete,
  onToggle,
}: {
  wordText: string
  wordId: number
  isOpen: boolean
  isNext: boolean
  onComplete: () => void
  onToggle: () => void
}) {
  const [chatActive, setChatActive] = useState(false)
  const [messages, setMessages] = useState<
    { role: 'ai' | 'user'; text: string }[]
  >([])
  const [input, setInput] = useState('')
  const aiSpeaking = useAISpeaking()

  const startConversation = () => {
    setChatActive(true)
    const greeting = `Let's practice using the word "${wordText}". Can you tell me what ${wordText} means or give me an example sentence?`
    setMessages([{ role: 'ai', text: greeting }])
  }

  const sendMessage = () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }])
    setInput('')

    aiSpeaking.mutate(
      { wordId, message: userMsg },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            { role: 'ai', text: data.reply || '[AI response placeholder]' },
          ])
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'ai',
              text: `Good attempt! (AI speaking not yet configured — set GEMINI_API_KEY in settings)`,
            },
          ])
        },
      }
    )
  }

  return (
    <CollapsibleSection
      icon={Mic}
      title="Speaking"
      isOpen={isOpen}
      step={3}
      isNext={isNext}
      onToggle={onToggle}
    >
      {!chatActive ? (
        <div className="text-center py-6">
          <MessageCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">
            Practice using &ldquo;{wordText}&rdquo; in a real conversation.
          </p>
          <button
            onClick={startConversation}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            <Mic className="w-5 h-5" />
            Start Conversation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'max-w-[85%] px-4 py-2.5 rounded-xl text-sm leading-relaxed',
                  msg.role === 'ai'
                    ? 'bg-slate-700/60 text-slate-200 rounded-tl-sm'
                    : 'bg-blue-600/30 text-blue-200 ml-auto rounded-tr-sm'
                )}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your response..."
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-600/50"
            />
            <button
              onClick={sendMessage}
              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={onComplete}
        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
      >
        <CheckCircle2 className="w-4 h-4" />
        Mark as Done
      </button>
    </CollapsibleSection>
  )
}

// ──────────────────────────────────────────────
//  Reading Section
// ──────────────────────────────────────────────
function ReadingSection({
  sentences,
  isOpen,
  isNext,
  onComplete,
  onToggle,
}: {
  sentences: { id: number; sentence: string; translation: string }[]
  isOpen: boolean
  isNext: boolean
  onComplete: () => void
  onToggle: () => void
}) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())

  const toggleSentence = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <CollapsibleSection
      icon={Globe}
      title="Reading"
      isOpen={isOpen}
      step={4}
      isNext={isNext}
      onToggle={onToggle}
    >
      <div className="space-y-3">
        {sentences.map((s) => {
          const expanded = expandedIds.has(s.id)
          return (
            <button
              key={s.id}
              onClick={() => toggleSentence(s.id)}
              className="w-full text-left px-4 py-3 rounded-xl bg-slate-700/40 border border-slate-600/30 hover:bg-slate-700/60 transition-colors"
            >
              <p className="text-slate-200 leading-relaxed">{s.sentence}</p>
              {expanded && s.translation && (
                <p className="mt-2 text-sm text-slate-400">{s.translation}</p>
              )}
            </button>
          )
        })}
      </div>
      <button
        onClick={onComplete}
        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
      >
        <CheckCircle2 className="w-4 h-4" />
        Mark as Done
      </button>
    </CollapsibleSection>
  )
}

// ──────────────────────────────────────────────
//  Writing Section
// ──────────────────────────────────────────────
function WritingSection({
  exercises,
  wordId,
  isOpen,
  isNext,
  onComplete,
  onToggle,
}: {
  exercises: { id: number; chinese_sentence: string; reference_answer: string }[]
  wordId: number
  isOpen: boolean
  isNext: boolean
  onComplete: (score: number) => void
  onToggle: () => void
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [results, setResults] = useState<
    Record<number, { reference_answer: string; feedback: string } | null>
  >({})
  const aiCorrection = useAIWritingCorrection()

  const handleSubmit = (exerciseId: number) => {
    const answer = answers[exerciseId] ?? ''
    aiCorrection.mutate(
      { wordId, exerciseId, answer },
      {
        onSuccess: (data) => {
          setResults((prev) => ({
            ...prev,
            [exerciseId]: {
              reference_answer: data.reference_answer ?? '[Reference answer]',
              feedback: data.feedback ?? '[Feedback placeholder]',
            },
          }))
        },
        onError: () => {
          // Fallback: show the reference answer from the model
          const exercise = exercises.find((e) => e.id === exerciseId)
          setResults((prev) => ({
            ...prev,
            [exerciseId]: {
              reference_answer: exercise?.reference_answer || '[Reference answer]',
              feedback: 'AI correction not configured — set OPENAI_API_KEY in settings.',
            },
          }))
        },
      }
    )
  }

  const submittedCount = Object.keys(results).length
  const totalCount = exercises.length

  return (
    <CollapsibleSection
      icon={Pencil}
      title="Writing"
      isOpen={isOpen}
      step={5}
      isNext={isNext}
      onToggle={onToggle}
    >
      <div className="space-y-4">
        {exercises.map((ex) => (
          <div
            key={ex.id}
            className="rounded-xl bg-slate-700/40 border border-slate-600/30 p-4 space-y-3"
          >
            <p className="text-slate-300 font-medium">{ex.chinese_sentence}</p>
            <textarea
              value={answers[ex.id] ?? ''}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [ex.id]: e.target.value }))
              }
              placeholder="Write your English translation here..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-600/50 resize-none"
            />
            <button
              onClick={() => handleSubmit(ex.id)}
              disabled={aiCorrection.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Submit
            </button>
            {results[ex.id] && (
              <div className="space-y-2 rounded-lg bg-slate-800/60 p-3 border border-slate-600/30">
                <p className="text-sm">
                  <span className="text-slate-400 font-medium">Reference: </span>
                  <span className="text-emerald-300">
                    {results[ex.id]!.reference_answer}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-slate-400 font-medium">Feedback: </span>
                  <span className="text-slate-300">{results[ex.id]!.feedback}</span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      {submittedCount > 0 && (
        <p className="mt-3 text-sm text-slate-500">
          Completed: {submittedCount}/{totalCount} exercises
        </p>
      )}
      <button
        onClick={() => onComplete(submittedCount / totalCount)}
        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
      >
        <CheckCircle2 className="w-4 h-4" />
        Mark as Done
      </button>
    </CollapsibleSection>
  )
}
