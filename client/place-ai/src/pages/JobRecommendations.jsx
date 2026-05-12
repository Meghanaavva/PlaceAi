import { useState, useEffect } from 'react'
import { api } from '../api/client'
import toast from 'react-hot-toast'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Briefcase, RefreshCw, TrendingUp, DollarSign, Building2, AlertCircle } from 'lucide-react'

const DIFFICULTY_COLORS = { easy: 'green', medium: 'yellow', hard: 'red' }

function JobCard({ job }) {
  const [expanded, setExpanded] = useState(false)
  const matchColor = job.match_percentage >= 85 ? 'text-emerald-400' : job.match_percentage >= 70 ? 'text-amber-400' : 'text-slate-400'
  const barColor   = job.match_percentage >= 85 ? 'bg-emerald-500' : job.match_percentage >= 70 ? 'bg-amber-500' : 'bg-slate-500'

  return (
    <Card
      onClick={() => setExpanded(!expanded)}
      className="cursor-pointer hover:border-slate-600 transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-semibold text-white text-sm">{job.title}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Building2 className="w-3 h-3 text-slate-500" />
            <span className="text-slate-500 text-xs">{(job.company_types || []).join(', ')}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-lg font-display font-bold ${matchColor}`}>{job.match_percentage}%</div>
          <div className="text-slate-600 text-[10px]">match</div>
        </div>
      </div>

      <div className="bg-slate-700 rounded-full h-1.5 mb-3">
        <div className={`h-1.5 rounded-full ${barColor} transition-all duration-700`} style={{ width: `${job.match_percentage}%` }} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3 h-3 text-slate-500" />
          <span className="text-slate-400 text-xs">{job.salary_range}</span>
        </div>
        <Badge variant={DIFFICULTY_COLORS[job.difficulty_to_get] || 'blue'} className="text-[10px]">
          {job.difficulty_to_get} to get
        </Badge>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-700 animate-fade-in">
          <p className="text-slate-400 text-xs leading-relaxed mb-3">{job.why_good_fit}</p>
          {(job.skills_to_add || []).length > 0 && (
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Skills to add for better fit</p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills_to_add.map((s, i) => <Badge key={i} variant="yellow">{s}</Badge>)}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default function JobRecommendations() {
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchJobs = async () => {
    setLoading(true); setError(null)
    try {
      const res = await api.getJobRecommendations()
      setJobs(res.data.jobs || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load recommendations')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchJobs() }, [])

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Job Recommendations</h1>
          <p className="text-slate-400 text-sm mt-1">AI-matched roles based on your resume</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchJobs} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading && <LoadingSpinner text="Finding the best matches for you..." />}

      {error && (
        <Card className="border-red-500/30 bg-red-500/5 text-center py-10">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-medium text-sm mb-1">Could not load recommendations</p>
          <p className="text-slate-500 text-xs mb-4">{error}</p>
          <Button size="sm" onClick={fetchJobs}>Try Again</Button>
        </Card>
      )}

      {!loading && !error && jobs.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400 text-sm">{jobs.length} roles matched · click any card for details</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job, i) => <JobCard key={i} job={job} />)}
          </div>
        </>
      )}
    </div>
  )
}