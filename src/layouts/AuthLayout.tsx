import { Link, Outlet } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export default function AuthLayout() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'bg-[#030B23]' : 'bg-[#FFFDF5]'
      }`}
    >
      <div className="grid min-h-screen lg:grid-cols-2">
        <div
          className={`relative hidden overflow-hidden lg:block ${
            isDark ? 'border-r border-[#1b2747]' : 'border-r border-[#f3e5a8]'
          }`}
        >
          <img src="/images/auth/medical-bg.svg" alt="Background clínico" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1b35]/70 via-[#0c2347]/55 to-[#07122e]/75" />
          <div className="absolute inset-0 flex items-end p-10">
            <div className="max-w-md rounded-2xl border border-white/15 bg-black/20 p-6 backdrop-blur-sm">
              <p className="text-xs font-semibold tracking-[0.15em] text-[#FFE14D]">OMNI VITAL</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Acompanhamento cirúrgico com precisão e cuidado humano.</h2>
              <p className="mt-2 text-sm text-slate-200">
                Plataforma clínica para equipe médica, paciente e acompanhante, com visões seguras e monitoramento em tempo real.
              </p>
            </div>
          </div>
        </div>

        <div className="flex min-h-screen items-center justify-center px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:p-6 lg:p-10">
          <div className="w-full max-w-md">
            <div className="mb-5 flex items-center justify-between">
              <Link
                to="/"
                className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
              >
                ← Voltar ao início
              </Link>
              <button
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
                  isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-[#fff4c4]'
                }`}
                title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
                onClick={toggleTheme}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>

            <div
              className={`w-full rounded-2xl border p-5 shadow-theme-lg transition-colors duration-200 sm:p-8 ${
                isDark ? 'border-slate-700 bg-slate-900' : 'border-[#f3e5a8] bg-[#fff9e8]'
              }`}
            >
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
