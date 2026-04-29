import { cn } from '../../lib/utils'

interface ProgressBarProps {
  value: number
  max: number
  label?: string
  showPercent?: boolean
  className?: string
}

export default function ProgressBar({ value, max, label, showPercent = true, className }: ProgressBarProps) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-slate-500">{label}</span>}
          {showPercent && (
            <span className="text-xs font-medium text-slate-400">{percentage}%</span>
          )}
        </div>
      )}
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            percentage >= 80 ? 'bg-green-500' :
            percentage >= 50 ? 'bg-blue-500' :
            percentage >= 20 ? 'bg-yellow-500' :
            'bg-slate-600'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}
