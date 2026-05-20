import { useMemo } from 'react'
import { Activity, Clock } from 'lucide-react'
import type { ActivityEntry } from '@/types/bariatric'

interface ActivityLogProps {
  entries: ActivityEntry[]
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
}

export default function ActivityLog({ entries }: ActivityLogProps) {
  const sorted = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [entries],
  )

  const weeklyTotal = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return entries
      .filter((e: ActivityEntry) => new Date(e.date) >= weekAgo)
      .reduce((sum: number, e: ActivityEntry) => sum + e.duration_min, 0)
  }, [entries])

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Registro de Atividades
        </h3>
        {sorted.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-[#FFE14D]/15 px-3 py-1.5">
            <Activity className="h-4 w-4 text-[#0f2743] dark:text-[#FFE14D]" />
            <span className="text-sm font-medium text-[#0f2743] dark:text-[#FFE14D]">
              Semana: {weeklyTotal} min
            </span>
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          Nenhuma atividade registrada
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50"
            >
              <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                {formatDate(entry.date)}
              </span>

              <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                {entry.type}
              </span>

              <span className="flex items-center gap-1 rounded-full bg-[#0f2743]/10 px-2 py-0.5 text-xs font-medium text-[#0f2743] dark:bg-white/10 dark:text-white/80">
                <Clock className="h-3 w-3" />
                {entry.duration_min} min
              </span>

              {entry.notes && (
                <span className="min-w-0 truncate text-xs text-gray-400 dark:text-gray-500">
                  {entry.notes}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
