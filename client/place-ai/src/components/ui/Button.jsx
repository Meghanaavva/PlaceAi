import { Loader2 } from 'lucide-react'

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  className = '',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary:   'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-95',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600 active:scale-95',
    outline:   'border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 active:scale-95',
    danger:    'bg-red-600 hover:bg-red-700 text-white active:scale-95',
    ghost:     'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 active:scale-95',
    success:   'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  }

  return (
    <button
      disabled={loading || props.disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}