import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'
import toast from 'react-hot-toast'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Upload, FileText, Star, Target, Key, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'

function SectionBar({ label, score, feedback }) {
  const [open, setOpen] = useState(false)
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'
  const textColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3.5 hover:bg-slate-700/30 transition-all text-left"
      >
        <span className="text-slate-300 font-medium capitalize text-xs w-20 flex-shrink-0">{label}</span>
        <div className="flex-1 bg-slate-700 rounded-full h-1.5">
          <div className={`h-1.5 rounded-full ${color} transition-all duration-700`} style={{ width: `${score}%` }} />
        </div>
        <span className={`text-xs font-bold w-8 text-right flex-shrink-0 ${textColor}`}>{score}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-3 pt-1 text-xs text-slate-400 border-t border-slate-700/60 leading-relaxed">
          {feedback}
        </div>
      )}
    </div>
  )
}

export default function ResumeAnalyzer() {
  const [file, setFile]       = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [result, setResult]   = useState(null)
  const [tab, setTab]         = useState('upload') // 'upload' | 'paste'
  const [pastedText, setPastedText] = useState('')

  // Load existing resume on mount
  useEffect(() => {
    api.getMyResume()
      .then(r => { if (r.data.id) setResult(r.data) })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.type === 'application/pdf') setFile(dropped)
    else toast.error('Please drop a PDF file')
  }, [])

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a PDF')
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await api.uploadResume(fd)
      setResult(res.data)
      toast.success('✅ Resume analyzed!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally { setLoading(false) }
  }

  const handlePasteAnalyze = async () => {
    if (pastedText.trim().length < 50) return toast.error('Please paste more resume text')
    setLoading(true)
    try {
      const res = await api.analyzeText(pastedText)
      setResult({ score: res.data.score, analysis: res.data.analysis })
      toast.success('✅ Resume analyzed!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed')
    } finally { setLoading(false) }
  }

  const handleDeleteResume = async () => {
    await api.deleteResume()
    setResult(null); setFile(null)
    toast.success('Resume deleted')
  }

  if (fetching) return <div className="p-8"><LoadingSpinner text="Loading your resume..." /></div>

  const analysis   = result?.analysis || {}
  const score      = Math.round(result?.score || 0)
  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Resume Analyzer</h1>
          <p className="text-slate-400 text-sm mt-1">AI-powered scoring, ATS optimization & feedback</p>
        </div>
        {result && (
          <Button variant="ghost" size="sm" onClick={handleDeleteResume}>
            <RefreshCw className="w-3.5 h-3.5" /> Re-upload
          </Button>
        )}
      </div>

      {/* Upload Section — only if no result yet */}
      {!result && (
        <Card className="mb-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-slate-900 p-1 rounded-lg">
            {['upload', 'paste'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-md text-xs font-medium transition-all
                  ${tab === t ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                {t === 'upload' ? '📄 Upload PDF' : '📋 Paste Text'}
              </button>
            ))}
          </div>

          {tab === 'upload' ? (
            <>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('resume-file').click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
                  ${dragging ? 'border-blue-500 bg-blue-500/8' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-700/20'}`}
              >
                <input id="resume-file" type="file" accept=".pdf" className="hidden"
                  onChange={e => setFile(e.target.files[0])} />
                <Upload className={`w-10 h-10 mx-auto mb-3 ${dragging ? 'text-blue-400' : 'text-slate-600'}`} />
                {file ? (
                  <>
                    <p className="text-white font-medium text-sm">{file.name}</p>
                    <p className="text-slate-500 text-xs mt-1">{(file.size / 1024).toFixed(0)} KB — Ready to analyze</p>
                  </>
                ) : (
                  <>
                    <p className="text-slate-300 font-medium text-sm">Drop your PDF resume here</p>
                    <p className="text-slate-600 text-xs mt-1">or click to browse · Max 5MB</p>
                  </>
                )}
              </div>
              <div className="flex justify-center mt-4">
                <Button onClick={handleUpload} loading={loading} disabled={!file}>
                  <FileText className="w-4 h-4" />
                  {loading ? 'Analyzing with AI...' : 'Analyze Resume'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <textarea
                value={pastedText}
                onChange={e => setPastedText(e.target.value)}
                placeholder="Paste your complete resume text here..."
                rows={10}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100
                           placeholder-slate-600 text-xs resize-none focus:outline-none focus:border-blue-500
                           focus:ring-1 focus:ring-blue-500/30 transition-all leading-relaxed"
              />
              <div className="flex justify-center mt-4">
                <Button onClick={handlePasteAnalyze} loading={loading} disabled={pastedText.trim().length < 50}>
                  {loading ? 'Analyzing...' : 'Analyze Text'}
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-5 animate-slide-up">

          {/* Score */}
          <Card glow className="text-center py-7">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">Overall Resume Score</p>
            <div className={`text-7xl font-display font-bold ${scoreColor}`}>{score}</div>
            <p className="text-slate-600 text-xs mt-1">out of 100</p>
            <div className="mt-3">
              <Badge variant={score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'} className="text-xs">
                Grade {analysis.grade}
              </Badge>
            </div>
            {analysis.summary && (
              <p className="text-slate-400 text-xs mt-4 max-w-lg mx-auto leading-relaxed">{analysis.summary}</p>
            )}
            {result.filename && result.filename !== 'pasted_text' && (
              <p className="text-slate-600 text-[10px] mt-2">📄 {result.filename}</p>
            )}
          </Card>

          {/* Section Scores */}
          {analysis.sections && (
            <Card>
              <h2 className="font-semibold text-white text-sm mb-4">Section-wise Analysis</h2>
              <div className="space-y-2">
                {Object.entries(analysis.sections).map(([key, val]) => (
                  <SectionBar key={key} label={key} score={val.score} feedback={val.feedback} />
                ))}
              </div>
            </Card>
          )}

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-emerald-400" />
                <h2 className="font-semibold text-white text-sm">Strengths</h2>
              </div>
              <ul className="space-y-3">
                {(analysis.strengths || []).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-amber-400" />
                <h2 className="font-semibold text-white text-sm">Improvements Needed</h2>
              </div>
              <ul className="space-y-3">
                {(analysis.improvements || []).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="text-amber-400 flex-shrink-0 mt-0.5">→</span> {s}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Keywords */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-blue-400" />
              <h2 className="font-semibold text-white text-sm">ATS Keyword Analysis</h2>
            </div>
            {(analysis.ats_keywords || []).length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">✅ Found in your resume</p>
                <div className="flex flex-wrap gap-1.5">
                  {(analysis.ats_keywords || []).map((kw, i) => <Badge key={i} variant="green">{kw}</Badge>)}
                </div>
              </div>
            )}
            {(analysis.missing_keywords || []).length > 0 && (
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">❌ Missing — Add these!</p>
                <div className="flex flex-wrap gap-1.5">
                  {(analysis.missing_keywords || []).map((kw, i) => <Badge key={i} variant="red">{kw}</Badge>)}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}