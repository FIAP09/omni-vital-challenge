import { useMemo, useState, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import type { OrientationDocument, OrientationCategory } from '@/types/bariatric'
import { ORIENTATION_CATEGORY_LABELS } from '@/types/bariatric'

interface OrientationViewerProps {
  documents: OrientationDocument[]
}

interface CategoryGroup {
  key: OrientationCategory
  docs: OrientationDocument[]
}

function formatParagraph(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

function categoryClasses(category: OrientationCategory) {
  const map: Record<OrientationCategory, string> = {
    expectativas: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dieta: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    geral: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  }
  return map[category]
}

export default function OrientationViewer({ documents }: OrientationViewerProps) {
  const [openCategories, setOpenCategories] = useState<Set<OrientationCategory>>(new Set())

  const toggle = useCallback((category: OrientationCategory) => {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }, [])

  const categories = useMemo<CategoryGroup[]>(() => {
    const map = new Map<OrientationCategory, OrientationDocument[]>()
    for (const doc of documents) {
      const list = map.get(doc.category) ?? []
      list.push(doc)
      map.set(doc.category, list)
    }
    return Array.from(map.entries()).map(([key, docs]) => ({ key, docs }))
  }, [documents])

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
        Orientacoes ao Paciente
      </h3>

      {categories.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          Nenhuma orientacao disponivel
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.key}>
              <button
                onClick={() => toggle(cat.key)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryClasses(cat.key)}`}
                  >
                    {ORIENTATION_CATEGORY_LABELS[cat.key]}
                  </span>
                  <span className="text-xs text-gray-400">{cat.docs.length} documento(s)</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${openCategories.has(cat.key) ? 'rotate-180' : ''}`}
                />
              </button>

              {openCategories.has(cat.key) && (
                <div className="mt-1 space-y-2 pl-2">
                  {cat.docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-lg border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/30"
                    >
                      <h4 className="mb-2 text-sm font-medium text-gray-800 dark:text-white/90">
                        {doc.title}
                      </h4>
                      <div className="space-y-2">
                        {doc.content
                          .split('\n')
                          .filter(Boolean)
                          .map((paragraph, i) => (
                            <p
                              key={i}
                              className="text-sm leading-relaxed text-gray-600 dark:text-gray-300"
                              dangerouslySetInnerHTML={{ __html: formatParagraph(paragraph) }}
                            />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
