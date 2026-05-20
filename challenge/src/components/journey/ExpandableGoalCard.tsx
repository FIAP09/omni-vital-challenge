import { useState, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import type { GoalItem } from '@/constants/patient-journey-content'
import { goalEntryRatingBadgeClass, goalEntryRatingLabel } from '@/constants/patient-journey-content'

interface ExpandableGoalCardProps {
  goal: GoalItem
  /** Ex.: "Voce esta em" ou "Esta em" (acompanhante). */
  progressPrefix: string
}

export default function ExpandableGoalCard({ goal, progressPrefix }: ExpandableGoalCardProps) {
  const [open, setOpen] = useState(false)
  const hasDetails = useMemo(() => Boolean(goal.entries?.length), [goal.entries])

  return (
    <article className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <button
        type="button"
        className={`flex w-full touch-manipulation items-start justify-between gap-3 p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/80 ${hasDetails ? '' : 'cursor-default hover:bg-transparent dark:hover:bg-transparent'}`}
        aria-expanded={hasDetails ? open : undefined}
        onClick={() => hasDetails && setOpen(!open)}
      >
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-700 dark:text-slate-100">{goal.title}</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Definido por {goal.professional}</p>
          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">{progressPrefix}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-100">
                {goal.current} / {goal.target} {goal.unit}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-2 rounded-full bg-[#FFE14D] transition-all duration-500"
                style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}
              />
            </div>
          </div>
        </div>
        {hasDetails && (
          <ChevronDown
            size={22}
            className={`mt-1 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {hasDetails && open && (
        <div className="border-t border-slate-200 px-4 pb-4 pt-2 dark:border-slate-700">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Detalhes e avaliacoes
          </p>
          <ul className="space-y-3">
            {goal.entries!.map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-600 dark:bg-slate-800/50"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{entry.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {entry.date} · {entry.evaluator}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${goalEntryRatingBadgeClass(entry.rating)}`}
                  >
                    {goalEntryRatingLabel(entry.rating)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {entry.notes}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}
