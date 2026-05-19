import { useMemo } from 'react'
import type { LabEntry } from '@/types/bariatric'

interface LabTrackerProps {
  entries: LabEntry[]
}

interface LabGroup {
  name: string
  latest: LabEntry
  lastThree: LabEntry[]
}

function dotColor(status: LabEntry['status']) {
  const map: Record<LabEntry['status'], string> = {
    normal: 'bg-green-500',
    alterado: 'bg-amber-500',
    critico: 'bg-red-500',
  }
  return map[status]
}

function statusClasses(status: LabEntry['status']) {
  const map: Record<LabEntry['status'], string> = {
    normal: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    alterado: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    critico: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return map[status]
}

function statusLabel(status: LabEntry['status']) {
  const map: Record<LabEntry['status'], string> = {
    normal: 'Normal',
    alterado: 'Alterado',
    critico: 'Critico',
  }
  return map[status]
}

export default function LabTracker({ entries }: LabTrackerProps) {
  const groups = useMemo<LabGroup[]>(() => {
    const map = new Map<string, LabEntry[]>()
    for (const entry of entries) {
      const list = map.get(entry.exam_name) ?? []
      list.push(entry)
      map.set(entry.exam_name, list)
    }

    return Array.from(map.entries()).map(([name, items]) => {
      const sorted = items.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      return {
        name,
        latest: sorted[0],
        lastThree: sorted.slice(0, 3).reverse(),
      }
    })
  }, [entries])

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
        Exames Laboratoriais
      </h3>

      {groups.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          Nenhum exame laboratorial registrado
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group.name}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {group.name}
                  </p>
                  {group.latest.reference_range && (
                    <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                      Ref: {group.latest.reference_range}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {group.lastThree.map((dot, i) => (
                      <span
                        key={i}
                        className={`h-2 w-2 rounded-full ${dotColor(dot.status)}`}
                      />
                    ))}
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                      {group.latest.value}
                    </span>
                    <span className="ml-1 text-xs text-gray-400">{group.latest.unit}</span>
                  </div>

                  <span
                    className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses(group.latest.status)}`}
                  >
                    {statusLabel(group.latest.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
