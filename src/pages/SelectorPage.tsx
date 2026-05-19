import { useMemo } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { getJourneyLabel } from '@/constants/patient-journey-content'
import { VIEW_AS_OPTIONS, VIEW_CONTEXT_LABELS, type ViewAsOption, type ViewContextType } from '@/constants/view-as'
import { useAuthStore } from '@/stores/auth.store'
import { useViewAsStore } from '@/stores/view-as.store'

export default function SelectorPage() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const setSelectedContext = useViewAsStore((s) => s.setSelectedContext)
  const { isDark, toggleTheme } = useTheme()

  const isAuthenticated = Boolean(token)

  const groupedOptions = useMemo(() => {
    const groups: Record<ViewContextType, ViewAsOption[]> = {
      acompanhante: [],
      paciente: [],
      equipe_cirurgia: [],
    }

    VIEW_AS_OPTIONS.forEach((option) => {
      groups[option.context].push(option)
    })

    return groups
  }, [])

  const selectContext = (id: string) => {
    setSelectedContext(id)
    navigate(isAuthenticated ? '/app/dashboard' : '/login')
  }

  const journeyLine = (option: ViewAsOption) => {
    if (option.context === 'paciente' && option.patientJourney) {
      return getJourneyLabel(option.patientJourney)
    }
    if (option.context === 'acompanhante' && option.linkedPatientJourney) {
      return `Paciente: ${getJourneyLabel(option.linkedPatientJourney)}`
    }
    return null
  }

  return (
    <main className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#030B23] text-slate-100' : 'bg-[#FFFDF5] text-slate-700'}`}>
      <header
        className={`sticky top-0 z-50 backdrop-blur transition-colors duration-200 ${isDark ? 'border-b border-[#1b2747] bg-[#07122E]/95' : 'border-b border-[#f3e5a8] bg-[#fff9e8]/95'}`}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-4 pt-[env(safe-area-inset-top)] sm:px-6 lg:px-8">
          <Link to="/" className={`shrink-0 text-sm font-semibold tracking-wide ${isDark ? 'text-white' : 'text-slate-700'}`}>
            Omni Vital
          </Link>

          <nav
            className={`hidden min-w-0 items-center gap-3 overflow-x-auto text-sm sm:flex md:gap-6 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}
          >
            <a href="#" className="shrink-0 hover:text-[#FFE14D]">Início</a>
            <a href="#" className="shrink-0 hover:text-[#FFE14D]">Solução</a>
            <a href="#" className="shrink-0 hover:text-[#FFE14D]">Fluxo clínico</a>
            <a href="#" className="shrink-0 hover:text-[#FFE14D]">Segurança</a>
          </nav>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
            <Link
              to="/login"
              className={`inline-flex h-10 touch-manipulation items-center rounded-lg px-3 text-xs font-semibold transition sm:h-9 ${isDark ? 'text-zinc-100 hover:bg-zinc-800' : 'text-slate-700 hover:bg-[#fff4c4]'}`}
            >
              Entrar
            </Link>
            <span
              className={`inline-flex h-10 items-center rounded-lg px-2.5 text-[10px] font-semibold sm:h-9 sm:px-3 sm:text-xs ${isDark ? 'bg-white text-[#0a1636]' : 'bg-[#0a1636] text-white'}`}
              title="Acesso por convite"
            >
              <span className="sm:hidden">Convite</span>
              <span className="hidden sm:inline">Acesso por convite</span>
            </span>
            <button
              type="button"
              className={`inline-flex h-10 w-10 touch-manipulation items-center justify-center rounded-lg transition sm:h-9 sm:w-9 ${isDark ? 'text-zinc-300 hover:bg-zinc-800' : 'text-slate-600 hover:bg-[#fff4c4]'}`}
              title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
              onClick={toggleTheme}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="mb-8">
          <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-700'}`}>Seleção de perfil (demo)</h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Escolha um perfil para ver a experiência mockada no painel (paciente, acompanhante ou equipe). Administradores também usam esta tela para o fluxo de apresentação.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(Object.entries(groupedOptions) as [ViewContextType, ViewAsOption[]][]).map(([context, options]) => (
            <article
              key={context}
              className={`rounded-2xl border p-4 transition-colors duration-200 ${isDark ? 'border-[#FFE14D]/20 bg-[#0E173A]' : 'border-[#f3e5a8] bg-[#fff9e8]'}`}
            >
              <h2 className={`mb-4 text-lg font-semibold ${isDark ? 'text-[#FFE14D]' : 'text-[#0f2743]'}`}>
                {VIEW_CONTEXT_LABELS[context]}
              </h2>
              <div className="space-y-2">
                {options.map((option) => (
                  <button
                    key={option.id}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                      isDark
                        ? 'border-zinc-700 hover:border-[#FFE14D]/50 hover:bg-zinc-800/60'
                        : 'border-[#f3e5a8] hover:border-[#d6c36f] hover:bg-[#fff4c4]'
                    }`}
                    onClick={() => selectContext(option.id)}
                  >
                    <p className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-slate-700'}`}>{option.name}</p>
                    {journeyLine(option) && (
                      <p
                        className={`mt-0.5 text-[11px] font-semibold uppercase tracking-wide ${isDark ? 'text-[#FFE14D]' : 'text-[#9e8500]'}`}
                      >
                        {journeyLine(option)}
                      </p>
                    )}
                    <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>{option.institution} · {option.details}</p>
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
