import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  FileText, Upload, TrendingUp, Briefcase,
  BookOpen, MessageSquare, ArrowRight, Star,
  Target, Key, Zap
} from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

function ScoreRing({ score }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative w-28 h-28">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="75%" outerRadius="100%"
          data={[{ value: score }]}
          startAngle={90} endAngle={-270}
        >
          <RadialBar
            dataKey="value" cornerRadius={8}
            fill={color}
            background={{ fill: '#1e293b' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-display text-white">{score}</span>
        <span className="text-[10px] text-slate-500">/ 100</span>
      </div>
    </div>
  )
}

const quickActions = [
  { to: '/builder',   icon: FileText,        label: 'Resume Builder',  desc: 'Create a professional PDF',        color: 'blue'   },
  { to: '/analyzer',  icon: Upload,          label: 'Analyze Resume',  desc: 'Upload & get AI score',            color: 'purple' },
  { to: '/skill-gap', icon: TrendingUp,      label: 'Skill Gap',       desc: 'Find what you\'re missing',        color: 'emerald'},
  { to: '/jobs',      icon: Briefcase,       label: 'Job Matches',     desc: 'See recommended roles',            color: 'amber'  },
  { to: '/interview', icon: BookOpen,        label: 'Interview Prep',  desc: 'Practice with AI questions',       color: 'rose'   },
  { to: '/chat',      icon: MessageSquare,   label: 'AI Coach',        desc: 'Get personalized career advice',   color: 'cyan'   },
]

const iconBg = {
  blue:   'bg-blue-500/15 text-blue-400   group-hover:bg-blue-500/25',
  purple: 'bg-purple-500/15 text-purple-400 group-hover:bg-purple-500/25',
  emerald:'bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25',
  amber:  'bg-amber-500/15 text-amber-400  group-hover:bg-amber-500/25',
  rose:   'bg-rose-500/15 text-rose-400    group-hover:bg-rose-500/25',
  cyan:   'bg-cyan-500/15 text-cyan-400    group-hover:bg-cyan-500/25',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [resume, setResume]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getMyResume()
      .then(r => setResume(r.data.resume ? r.data : null))
      .catch(() => setResume(null))
      .finally(() => setLoading(false))
  }, [])

  const firstName = user?.full_name?.split(' ')[0] || 'there'
  const analysis  = resume?.analysis || {}
  const score     = Math.round(resume?.score || 0)

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-xs font-semibold uppercase tracking-widest">PlaceAI Dashboard</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {firstName} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">Here&apos;s your placement readiness overview</p>
      </div>

      {/* Score + Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

        {/* Score Card */}
        <Card glow className="flex flex-col items-center justify-center gap-4 text-center py-6">
          {loading ? (
            <LoadingSpinner text="Loading..." />
          ) : resume ? (
            <>
              <ScoreRing score={score} />
              <div>
                <p className="font-semibold text-white text-sm">Resume Score</p>
                <Badge
                  variant={score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'}
                  className="mt-1.5"
                >
                  Grade {analysis.grade || 'N/A'}
                </Badge>
              </div>
              {analysis.summary && (
                <p className="text-slate-400 text-xs leading-relaxed px-2 line-clamp-3">
                  {analysis.summary}
                </p>
              )}
            </>
          ) : (
            <div className="text-center px-4">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-7 h-7 text-slate-500" />
              </div>
              <p className="text-slate-300 font-semibold text-sm">No Resume Yet</p>
              <p className="text-slate-500 text-xs mt-1 mb-4">Upload your resume to get an AI score</p>
              <Link to="/analyzer">
                <Button size="sm">
                  Upload Resume <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Strengths + Improvements */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {resume && analysis.strengths ? (
            <>
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-emerald-400" />
                  <p className="text-sm font-semibold text-white">Strengths</p>
                </div>
                <ul className="space-y-2">
                  {(analysis.strengths || []).slice(0, 3).map((s, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-amber-400" />
                  <p className="text-sm font-semibold text-white">To Improve</p>
                </div>
                <ul className="space-y-2">
                  {(analysis.improvements || []).slice(0, 3).map((s, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5 flex-shrink-0">→</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <Key className="w-4 h-4 text-blue-400" />
                  <p className="text-sm font-semibold text-white">ATS Keywords Found</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(analysis.ats_keywords || []).slice(0, 14).map((kw, i) => (
                    <Badge key={i} variant="green">{kw}</Badge>
                  ))}
                  {(analysis.missing_keywords || []).slice(0, 5).map((kw, i) => (
                    <Badge key={i} variant="red">{kw} ✗</Badge>
                  ))}
                </div>
              </Card>
            </>
          ) : (
            <div className="col-span-2 flex items-center justify-center">
              <div className="text-center">
                <p className="text-slate-500 text-sm">Upload a resume to see AI insights here</p>
                <Link to="/analyzer" className="text-blue-400 text-xs hover:text-blue-300 mt-2 inline-block">
                  Go to Resume Analyzer →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-display font-semibold text-white text-base mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {quickActions.map(({ to, icon: Icon, label, desc, color }) => (
            <Link
              key={to} to={to}
              className="group p-4 rounded-xl border border-slate-700 bg-slate-800/40
                         hover:border-slate-600 hover:bg-slate-800 transition-all duration-200"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-all ${iconBg[color]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="font-semibold text-slate-200 text-xs mb-0.5">{label}</p>
              <p className="text-[11px] text-slate-500">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}