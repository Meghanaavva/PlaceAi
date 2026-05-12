import { useState, useRef, useEffect } from 'react'
import { api } from '../api/client'
import Button from '../components/ui/Button'
import { Send, Bot, User, Sparkles } from 'lucide-react'

const INITIAL_MSG = {
  role: 'assistant',
  content: "Hi! I'm your AI career coach powered by GPT-4. I have access to your uploaded resume and can give you personalized guidance. Ask me anything about your resume, career path, interview tips, or job search strategy!"
}

const SUGGESTIONS = [
  "How can I improve my resume score?",
  "What skills should I learn next?",
  "How do I prepare for a Google interview?",
  "Write a cold email to a recruiter for me",
]

export default function Chatbot() {
  const [messages, setMessages] = useState([INITIAL_MSG])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = [...messages, userMsg].map(m => ({
        role: m.role, content: m.content
      }))
      const res = await api.chat(history)
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble connecting. Please try again.'
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-8 py-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3 max-w-3xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-base leading-none">AI Career Coach</h1>
            <p className="text-slate-500 text-xs mt-0.5">Powered by GPT-4 · Personalized to your resume</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${msg.role === 'assistant'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                  : 'bg-slate-700'}`}
              >
                {msg.role === 'assistant'
                  ? <Bot className="w-4 h-4 text-white" />
                  : <User className="w-4 h-4 text-slate-300" />
                }
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'assistant'
                  ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'
                  : 'bg-blue-600 text-white rounded-tr-sm'}`}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggestions (only at start) */}
      {messages.length <= 1 && (
        <div className="px-6 pb-3 max-w-3xl mx-auto w-full">
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i} onClick={() => send(s)}
                className="text-left text-xs p-3 rounded-lg border border-slate-700 text-slate-400
                           hover:border-blue-500/50 hover:text-slate-200 hover:bg-slate-800/60 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 pb-6 pt-3 border-t border-slate-800 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask anything about your career, resume, or interviews..."
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100
                       placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500
                       focus:ring-1 focus:ring-blue-500/30 transition-all"
          />
          <Button onClick={() => send()} disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}