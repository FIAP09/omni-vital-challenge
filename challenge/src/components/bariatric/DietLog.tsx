import { useMemo } from 'react'
import { Flame } from 'lucide-react'
import type { DietEntry } from '@/types/bariatric'
import { MEAL_TYPE_LABELS } from '@/types/bariatric'

interface DietLogProps {
  entries: DietEntry[]
}

interface DateGroup {
  date: string
  entries: DietEntry[]
  totalCalories: number
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function DietLog({ entries }: DietLogProps) {
  const dateGroups = useMemo<DateGroup[]>(() => {
    const map = new Map<string, DietEntry[]>()
    for (const entry of entries) {
      const list = map.get(entry.date) ?? []
      list.push(entry)
      map.set(entry.date, list)
    }

    return Array.from(map.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([date, items]) => ({
        date,
        entries: items,
        totalCalories: items.reduce((sum, e) => sum + (e.calories ?? 0), 0),
      }))
  }, [entries])

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
        Registro Alimentar
      </h3>

      {dateGroups.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          Nenhum registro alimentar
        </div>
      ) : (
        <div className="space-y-4">
          {dateGroups.map((group) => (
            <div
              key={group.date}
              className="rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {formatDate(group.date)}
                </span>
                {group.totalCalories > 0 && (
                  <span className="flex items-center gap-1 text-xs font-medium text-[#0f2743] dark:text-[#FFE14D]">
                    <Flame className="h-3.5 w-3.5" />
                    {group.totalCalories} kcal
                  </span>
                )}
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {group.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <span className="mr-2 inline-block rounded bg-[#FFE14D]/20 px-1.5 py-0.5 text-xs font-medium text-[#0f2743] dark:bg-[#FFE14D]/10 dark:text-[#FFE14D]">
                        {MEAL_TYPE_LABELS[entry.meal_type]}
                      </span>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {entry.description}
                      </p>
                    </div>
                    {entry.calories && (
                      <span className="shrink-0 text-xs text-gray-400">
                        {entry.calories} kcal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
