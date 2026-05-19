import { useState, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'

interface ExpandableDetailRowProps {
  title: string
  badge?: string
  badgeClass?: string
  summary?: string
  criteria?: string[]
  meta?: string
}

export default function ExpandableDetailRow({
  title,
  badge,
  badgeClass,
  summary,
  criteria,
  meta,
}: ExpandableDetailRowProps) {
  const [open, setOpen] = useState(false)
  const hasBody = useMemo(() => Boolean(summary || (criteria?.length ?? 0) > 0), [summary, criteria])

  return (
    <li className="border-b border-slate-200 last:border-b-0 dark:border-slate-700">
      <button
        type="button"
        className={`flex w-full touch-manipulation items-center justify-between gap-2 py-3 text-left transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${hasBody ? '' : 'cursor-default pointer-events-none hover:bg-transparent'}`}
        onClick={() => hasBody && setOpen(!open)}
      >
        <span className="min-w-0 flex-1 text-sm text-slate-700 dark:text-slate-200">{title}</span>
        <div className="flex shrink-0 items-center gap-2">
          {badge && (
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeClass}`}>
              {badge}
            </span>
          )}
          {hasBody && (
            <ChevronDown
              size={18}
              className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </button>
      {hasBody && open && (
        <div className="border-l-2 border-[#FFE14D]/70 pb-3 pl-3">
          {meta && <p className="text-[11px] text-slate-500 dark:text-slate-400">{meta}</p>}
          {summary && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{summary}</p>
          )}
          {criteria && criteria.length > 0 && (
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
              {criteria.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}
