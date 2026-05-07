import { useParams, Link } from 'react-router-dom'
import { useWorkPhrase } from '../hooks/useVocabulary'

export default function WorkPhraseDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: phrase, isLoading } = useWorkPhrase(id!)

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading...
      </div>
    )
  }

  if (!phrase) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">Phrase not found.</p>
        <Link to="/work-phrases" className="text-blue-600 hover:underline">← Back to Work Phrases</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/work-phrases" className="text-blue-600 hover:underline text-sm mb-6 inline-block">
        ← Back to Work Phrases
      </Link>

      <div className="bg-white rounded-xl border p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">{phrase.phrase}</h1>
          <p className="text-xl text-gray-600">{phrase.meaning_zh}</p>
        </div>

        {/* Scene */}
        {phrase.scene && (
          <div className="mb-6">
            <span className="text-sm text-gray-500 font-medium">场景 / Scene:</span>
            <span className="ml-2 inline-block px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              {phrase.scene}
            </span>
          </div>
        )}

        {/* Key sentence */}
        <div className="mb-6">
          <h2 className="text-sm text-gray-500 font-medium mb-2">示例句子 / Example Sentence</h2>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-lg text-gray-900 leading-relaxed">{phrase.target_sentence}</p>
          </div>
        </div>

        {/* Full context - English */}
        {phrase.context_en && (
          <div className="mb-6">
            <h2 className="text-sm text-gray-500 font-medium mb-2">英文语境 / English Context</h2>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-gray-700 leading-relaxed">{phrase.context_en}</p>
            </div>
          </div>
        )}

        {/* Full context - Chinese */}
        {phrase.context_zh && (
          <div className="mb-6">
            <h2 className="text-sm text-gray-500 font-medium mb-2">中文语境 / Chinese Context</h2>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-gray-700 leading-relaxed">{phrase.context_zh}</p>
            </div>
          </div>
        )}

        {/* Usage note */}
        {phrase.usage_note && (
          <div>
            <h2 className="text-sm text-gray-500 font-medium mb-2">用法说明 / Usage Note</h2>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
              <p className="text-gray-700">{phrase.usage_note}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
