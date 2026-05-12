import { useState } from 'react'
import { api } from '../api/client'
import toast from 'react-hot-toast'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { Search, TrendingUp, CheckCircle, XCircle, Map } from 'lucide-react'

const PRIORITY_COLORS = { high: 'red', medium: 'yellow', low: 'blue' }

export default function SkillGap() {
  const [role, setRole]       = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)

  const analyze = async () => {
    if (!role.trim()) return toast.error('Please enter a target role')
    setLoading(true)
    try {
      const res = await api.getSkillGap(role.trim())
      setResult(res.data)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed. Upload your resume first.')
    } finally { setLoading(false) }
  }

  const matchColor = result
    ? result.match_percentage >= 75 ? 'text-emerald-400'
    : result.match_percentage >= 50 ? 'text-amber-400'
    : 'text-red-400'
    : ''

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Skill Gap Detection</h1>
        <p className="text-slate-400 text-sm mt-1">Compare your resume skills against any job role</p>
      </div>

      {/* Input */}
      <Card className="mb-6">
        <h2 className="text-sm font-semibold text-white mb-3">Target Job Role</h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={role}
              onChange={e => setRole(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && analyze()}
              placeholder="e.g. Machine Learning Engineer, Full Stack Developer, Data Scientist..."
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100
                         placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500
                         focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
          </div>
          <Button onClick={analyze} loading={loading}>
            <TrendingUp className="w-4 h-4" />
            {loading ? 'Analyzing...' : 'Analyze Gap'}
          </Button>
        </div>
        <p className="text-slate-600 text-xs mt-2">
          💡 Make sure you&apos;ve uploaded your resume first so we can compare your actual skills.
        </p>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-5 animate-slide-up">

          {/* Match Score */}
          <Card glow className="text-center py-7">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">Role Match</p>
            <div className={`text-7xl font-display font-bold ${matchColor}`}>
              {result.match_percentage}%
            </div>
            <p className="text-slate-400 text-sm mt-1">{role}</p>
            {result.role_summary && (
              <p className="text-slate-500 text-xs mt-3 max-w-md mx-auto">{result.role_summary}</p>
            )}
            <div className="mx-auto mt-4 max-w-xs bg-slate-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{
                  width: `${result.match_percentage}%`,
                  background: result.match_percentage >= 75
                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                    : result.match_percentage >= 50
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : 'linear-gradient(90deg, #ef4444, #f87171)'
                }}
              />
            </div>
            {result.summary && (
              <p className="text-slate-400 text-xs mt-4 max-w-lg mx-auto leading-relaxed">{result.summary}</p>
            )}
          </Card>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <h2 className="font-semibold text-white text-sm">Skills You Have</h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(result.current_skills || []).map((s, i) => (
                  <Badge key={i} variant="green">{s}</Badge>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-4 h-4 text-red-400" />
                <h2 className="font-semibold text-white text-sm">Missing Skills</h2>
              </div>
              <div className="space-y-2.5">
                {(result.missing_skills || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-slate-300 text-xs">{item.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[10px] max-w-[120px] text-right hidden md:block">{item.reason}</span>
                      <Badge variant={PRIORITY_COLORS[item.priority] || 'blue'} className="text-[10px]">
                        {item.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              {(result.nice_to_have || []).length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Nice to have</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.nice_to_have.map((s, i) => <Badge key={i} variant="blue">{s}</Badge>)}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Learning Roadmap */}
          {result.roadmap?.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-5">
                <Map className="w-4 h-4 text-blue-400" />
                <h2 className="font-semibold text-white text-sm">Learning Roadmap</h2>
              </div>
              <div className="space-y-4">
                {result.roadmap.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {step.step}
                      </div>
                      {i < result.roadmap.length - 1 && <div className="w-px flex-1 bg-slate-700 mt-2" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-200 text-sm">{step.skill}</p>
                        <Badge variant={PRIORITY_COLORS[step.priority] || 'blue'} className="text-[10px] flex-shrink-0">
                          {step.priority}
                        </Badge>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">📚 {step.resource} · ⏱ {step.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}