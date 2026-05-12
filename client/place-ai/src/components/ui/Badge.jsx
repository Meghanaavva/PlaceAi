export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-700 text-slate-300',
    blue:    'bg-blue-500/20   text-blue-400   border border-blue-500/30',
    green:   'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    yellow:  'bg-amber-500/20  text-amber-400  border border-amber-500/30',
    red:     'bg-red-500/20    text-red-400    border border-red-500/30',
    purple:  'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    cyan:    'bg-cyan-500/20   text-cyan-400   border border-cyan-500/30',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}