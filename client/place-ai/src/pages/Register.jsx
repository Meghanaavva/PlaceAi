import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import toast from 'react-hot-toast'
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
 
export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
 
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) return toast.error('Passwords do not match')
    if (password.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      const res = await api.register({ full_name: fullName.trim(), email: email.trim(), password })
      login(res.data.user, res.data.access_token)
      toast.success('Account created! Welcome to PlaceAI 🎉')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
      </div>
 
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30 mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1.5">Start your placement journey with PlaceAI</p>
        </div>
 
        <div className="bg-slate-800/70 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
 
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Arjun Kumar"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl
                             text-slate-100 placeholder-slate-600 text-sm
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                             transition-all duration-200"
                />
              </div>
            </div>
 
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
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-11 py-3 bg-slate-900 border border-slate-700 rounded-xl
                             text-slate-100 placeholder-slate-600 text-sm
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                             transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
 
            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl
                             text-slate-100 placeholder-slate-600 text-sm
                             focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                             transition-all duration-200"
                />
              </div>
            </div>
 
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl
                         transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50
                         flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                : <>Create Account <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>
 
          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}