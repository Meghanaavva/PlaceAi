export default function Card({ children, className = '', glow = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl border border-slate-700 bg-slate-800/60 p-5
        ${glow ? 'shadow-lg shadow-blue-500/10 border-blue-500/20' : ''}
        ${onClick ? 'cursor-pointer hover:border-slate-600 transition-all duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}