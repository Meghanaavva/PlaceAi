import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import toast from 'react-hot-toast'
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import Button from '../components/ui/Button'

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.login(form)
      login(res.data.user, res.data.access_token)
      toast.success(`Welcome back, ${res.data.user.full_name.split(' ')[0]}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30 mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1.5">Sign in to your PlaceAI account</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/70 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl
                             text-slate-100 placeholder-slate-600 text-sm
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                             transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-slate-900 border border-slate-700 rounded-xl
                             text-slate-100 placeholder-slate-600 text-sm
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                             transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} size="lg" className="w-full">
              {!loading && <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </Button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>

 </div>
  )
}