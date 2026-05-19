import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Eye } from 'lucide-react'
import { useViewAs } from '@/hooks/useViewAs'

interface ViewAsControlProps {
  className?: string
}

export default function ViewAsControl({ className }: ViewAsControlProps) {
  const { isAdmin, options, activeViewAs, setActiveViewAs } = useViewAs()

  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredOptions = (() => {
    const term = query.trim().toLowerCase()
    if (!term) return options
    return options.filter((option) => {
      const composed = `${option.name} ${option.roleLabel} ${option.institution} ${option.details}`.toLowerCase()
      return composed.includes(term)
    })
  })()

  const toggle = () => {
    setIsOpen((prev) => !prev)
  }

  const close = () => {
    setIsOpen(false)
  }

  const selectOption = (id: string) => {
    setActiveViewAs(id)
    setQuery('')
    close()
  }

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (!containerRef.current?.contains(target)) {
        close()
      }
    }

    document.addEventListener('click', onDocumentClick)
    return () => {
      document.removeEventListener('click', onDocumentClick)
    }
  }, [])

  if (!isAdmin) return null

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        className="inline-flex h-10 max-w-full items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-600 transition touch-manipulation hover:bg-slate-100 sm:h-9 sm:gap-2 sm:px-3 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        onClick={(e) => {
          e.stopPropagation()
          toggle()
        }}
      >
        <Eye size={15} className="shrink-0" />
        <span className="min-w-0 truncate sm:max-w-[12rem] md:max-w-[16rem]">
          {activeViewAs ? `Ver como: ${activeViewAs.name}` : 'Ver como...'}
        </span>
        <ChevronDown size={15} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="fixed inset-x-3 top-[calc(4.5rem+env(safe-area-inset-top))] z-50 max-h-[min(24rem,70vh)] overflow-hidden rounded-2xl border border-slate-700 bg-[#0f1834] p-3 shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-[min(20rem,60vh)] sm:w-[min(20rem,calc(100vw-2rem))]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Buscar visualização..."
            className="mb-2 h-10 w-full rounded-lg border border-slate-700 bg-[#091228] px-3 text-sm text-slate-100 placeholder:text-slate-400"
          />

          <div className="max-h-[min(12rem,40vh)] overflow-y-auto overscroll-contain rounded-lg border border-slate-700 bg-[#0b1430] sm:max-h-64">
            {filteredOptions.map((option) => (
              <button
                key={option.id}
                className="block w-full border-b border-slate-700 px-3 py-2 text-left last:border-b-0 hover:bg-slate-700/40"
                onClick={() => selectOption(option.id)}
              >
                <p className="text-sm font-semibold text-slate-100">{option.name}</p>
                <p className="text-xs text-slate-400">{option.roleLabel} · {option.institution}</p>
              </button>
            ))}

            {filteredOptions.length === 0 && (
              <p className="px-3 py-4 text-sm text-slate-400">
                Nenhum resultado encontrado.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
