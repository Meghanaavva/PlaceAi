import { useState, useEffect } from 'react'
import { api } from '../api/client'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { BookOpen, ChevronDown, ChevronUp, RefreshCw, AlertCircle } from 'lucide-react'

const TAB_CONFIG = [
  { id: 'behavioral',  label: '🧠 Behavioral',   key: 'behavioral'  },
  { id: 'technical',   label: '💻 Technical',    key: 'technical'   },
  { id: 'situational', label: '🎭 Situational',  key: 'situational' },
  { id: 'ask',         label: '🙋 Ask Them',     key: 'questions_to_ask_interviewer' },
]

const DIFFICULTY_COLOR = { easy: 'text-emerald-400', medium: 'text-amber-400', hard: 'text-red-400' }

function QuestionCard({ q, index, type }) {
  const [open, setOpen] = useState(false)

  if (type === 'ask') {
    return (
      <Card className="border-slate-700">
        <p className="text-slate-200 text-sm font-medium">{q}</p>
      </Card>
    )
  }

  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-slate-700/30 transition-all"
      >
        <div className="flex items-start gap-3 flex-1">
          <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {index + 1}
          </span>
          <div>
            <p className="text-slate-200 text-sm leading-relaxed">{q.question}</p>
            {q.difficulty && (
              <span className={`text-[10px] font-semibold mt-1 block ${DIFFICULTY_COLOR[q.difficulty]}`}>
                {q.difficulty?.toUpperCase()}
              </span>
            )}
            {q.focus && (
              <span className="text-[10px] text-slate-500 mt-0.5 block">Focus: {q.focus}</span>
            )}
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />}
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-slate-700/60">
          <div className="mt-3 bg-blue-500/8 border border-blue-500/20 rounded-lg p-3.5">
            <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-widest mb-1.5">💡 Tip</p>
            <p className="text-slate-400 text-xs leading-relaxed">{q.tip}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function InterviewPrep() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [activeTab, setActiveTab] = useState('behavioral')

  const fetchQuestions = async () => {
    setLoading(true); setError(null)
    try {
      const res = await api.getInterviewQuestions()
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate questions')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchQuestions() }, [])

  const activeConfig = TAB_CONFIG.find(t => t.id === activeTab)
  const questions    = data?.[activeConfig?.key] || []

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Interview Preparation</h1>
          <p className="text-slate-400 text-sm mt-1">AI-generated questions tailored to your resume</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchQuestions} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
      </div>

      {loading && <LoadingSpinner text="Generating personalized questions..." />}

      {error && (
        <Card className="border-red-500/30 bg-red-500/5 text-center py-10">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-medium text-sm mb-1">Could not generate questions</p>
          <p className="text-slate-500 text-xs mb-4">{error}</p>
          <Button size="sm" onClick={fetchQuestions}>Try Again</Button>
        </Card>
      )}

      {!loading && !error && data && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-slate-800 p-1 rounded-xl border border-slate-700">
            {TAB_CONFIG.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
                  ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Questions */}
          <div className="space-y-3">
            {questions.map((q, i) => (
              <QuestionCard key={i} q={q} index={i} type={activeTab} />
            ))}
            {questions.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-8">No questions in this category</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}