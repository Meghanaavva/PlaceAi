import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, FileText, Upload, Briefcase,
  MessageSquare, BookOpen, TrendingUp, LogOut, Zap
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/builder',     icon: FileText,        label: 'Resume Builder'  },
  { to: '/analyzer',    icon: Upload,          label: 'Analyzer'        },
  { to: '/skill-gap',   icon: TrendingUp,      label: 'Skill Gap'       },
  { to: '/jobs',        icon: Briefcase,       label: 'Job Matches'     },
  { to: '/interview',   icon: BookOpen,        label: 'Interview Prep'  },
  { to: '/chat',        icon: MessageSquare,   label: 'AI Coach'        },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = user?.full_name
    ?.split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-56 min-w-[224px] h-screen bg-slate-950 border-r border-slate-800 flex flex-col sticky top-0">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm leading-none">PlaceAI</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Placement Assistant</p>
          </div>
        </div>
      </div>

      {/* User chip */}
      <div className="mx-3 mt-4 p-3 rounded-xl bg-slate-800 border border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150
               ${isActive
                 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                 : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
               }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}