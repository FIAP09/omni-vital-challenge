import { Moon, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'

export default function LandingPage() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <main
      className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#030B23] text-slate-100' : 'bg-[#FFFDF5] text-slate-700'}`}
    >
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
            <a href="#solucao" className="shrink-0 hover:text-[#FFE14D]">Solução</a>
            <a href="#jornada" className="shrink-0 hover:text-[#FFE14D]">Jornada</a>
            <a href="#equipe" className="shrink-0 hover:text-[#FFE14D]">Equipe multiprofissional</a>
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

      {/* Hero: o problema do paciente bariátrico */}
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span
              className={`inline-flex rounded-full border px-4 py-1 text-xs font-semibold tracking-wider ${isDark ? 'border-[#FFE14D]/60 text-[#FFE14D]' : 'border-[#c8a800] text-[#9e8500]'}`}
            >
              O PROBLEMA
            </span>
            <h1 className={`text-4xl font-semibold leading-tight md:text-5xl ${isDark ? 'text-[#FFE14D]' : 'text-[#0f2743]'}`}>
              Informações Espalhadas Comprometem a Jornada Bariátrica
            </h1>
            <div className={`space-y-4 text-sm leading-7 ${isDark ? 'text-zinc-200' : 'text-slate-600'}`}>
              <p className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-700/50' : 'border-[#f3e5a8] bg-[#fffdf5]'}`}>
                <strong className={`block text-base ${isDark ? 'text-zinc-100' : 'text-slate-700'}`}>Exames de múltiplos especialistas</strong>
                Cardiologista, pneumologista, endocrinologista, nutricionista, psicólogo — cada um solicita exames e gera laudos em sistemas diferentes. O paciente carrega pastas, PDFs e resultados sem um lugar único para organizar tudo.
              </p>
              <p className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-700/50' : 'border-[#f3e5a8] bg-[#fffdf5]'}`}>
                <strong className={`block text-base ${isDark ? 'text-zinc-100' : 'text-slate-700'}`}>Pós-operatório sem acompanhamento estruturado</strong>
                Após a cirurgia, o controle de peso, dieta, sono, atividade física e exames laboratoriais fica disperso entre anotações pessoais e consultas espaçadas. O reganho de peso e complicações nutricionais passam despercebidos.
              </p>
            </div>
            <div className={`space-y-3 text-sm ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
              <p>- Em 2023 foram realizadas <strong className={isDark ? 'text-white' : 'text-slate-700'}>80.441 cirurgias bariátricas</strong> no Brasil.</p>
              <p>- Apenas <strong className={isDark ? 'text-white' : 'text-slate-700'}>0,097%</strong> da população elegível teve acesso ao procedimento.</p>
              <p>- A taxa geral de complicações pós-operatórias é de <strong className={isDark ? 'text-white' : 'text-slate-700'}>16,2%</strong>.</p>
              <p>- Pacientes operados têm <strong className={isDark ? 'text-white' : 'text-slate-700'}>16% menos mortalidade geral</strong>.</p>
            </div>
          </div>

          <div className={`rounded-3xl border p-8 ${isDark ? 'border-zinc-700 bg-zinc-800' : 'border-[#f3e5a8] bg-[#fff9e8]'}`}>
            <h2 id="solucao" className={`text-xl font-semibold ${isDark ? 'text-[#FFE14D]' : 'text-[#0f2743]'}`}>A Solução: Omni Vital</h2>
            <p className={`mt-4 text-sm leading-7 ${isDark ? 'text-zinc-200' : 'text-slate-600'}`}>
              O Omni Vital centraliza toda a jornada do paciente bariátrico em um único lugar.
              Exames pré-operatórios organizados por especialidade, acompanhamento pós-operatório
              de peso, dieta, sono e atividade física, resultados laboratoriais e documentos de
              orientação ao paciente — tudo acessível, seguro e compartilhável com a equipe médica.
            </p>
            <ul className={`mt-5 space-y-3 text-sm ${isDark ? 'text-zinc-200' : 'text-slate-600'}`}>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 block h-2 w-2 shrink-0 rounded-full bg-[#FFE14D]"></span>
                <span><strong className={isDark ? 'text-white' : 'text-slate-700'}>Timeline de exames</strong> — visualize laudos e resultados organizados por especialista e fase do cuidado.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 block h-2 w-2 shrink-0 rounded-full bg-[#FFE14D]"></span>
                <span><strong className={isDark ? 'text-white' : 'text-slate-700'}>Controle de peso e reganho</strong> — gráficos de evolução, metas e alertas automáticos para o paciente e equipe.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 block h-2 w-2 shrink-0 rounded-full bg-[#FFE14D]"></span>
                <span><strong className={isDark ? 'text-white' : 'text-slate-700'}>Acompanhamento completo pós-operatório</strong> — dieta, sono, atividade física e exames laboratoriais em um painel unificado.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 block h-2 w-2 shrink-0 rounded-full bg-[#FFE14D]"></span>
                <span><strong className={isDark ? 'text-white' : 'text-slate-700'}>Documentos de orientação</strong> — materiais educativos para cada fase, acessíveis a qualquer momento pelo paciente.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Seletor de frentes (demo) */}
      <section id="jornada" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div
          className={`rounded-3xl border p-6 transition-colors duration-200 lg:p-8 ${isDark ? 'border-[#1b2747] bg-[#0f1a3d]' : 'border-[#f3e5a8] bg-[#fff9e8]'}`}
        >
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className={`text-2xl font-semibold ${isDark ? 'text-[#FFE14D]' : 'text-[#0f2743]'}`}>
                Seletor de frentes (demo)
              </h2>
              <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Explore o fluxo do <strong className={isDark ? 'text-white' : 'text-slate-800'}>paciente bariátrico</strong>
                {' '}e a visão de <strong className={isDark ? 'text-white' : 'text-slate-800'}>acompanhante e equipe médica</strong>.
              </p>
            </div>
            <Link
              to="/seletor"
              className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition ${isDark ? 'bg-[#FFE14D] text-[#0a1636] hover:brightness-95' : 'bg-[#0a1636] text-white hover:bg-[#10224f]'}`}
            >
              Abrir seletor
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className={`rounded-xl border px-4 py-3 ${isDark ? 'border-slate-700 bg-slate-900/40' : 'border-[#f3e5a8] bg-[#fffdf5]'}`}>
              <p className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>Paciente bariátrico</p>
              <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Timeline de exames pré-operatórios, controle de peso, dieta, sono, atividade física e documentos de orientação.</p>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${isDark ? 'border-slate-700 bg-slate-900/40' : 'border-[#f3e5a8] bg-[#fffdf5]'}`}>
              <p className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>Acompanhante e equipe</p>
              <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Visão do familiar com acesso compartilhado e painel da equipe médica com alertas e evolução do paciente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integração multiprofissional futura */}
      <section id="equipe" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div
          className={`rounded-3xl border p-6 transition-colors duration-200 lg:p-8 ${isDark ? 'border-[#1b2747] bg-[#0f1a3d]' : 'border-[#f3e5a8] bg-[#fff9e8]'}`}
        >
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-[#FFE14D]' : 'text-[#0f2743]'}`}>
            Integração multiprofissional
          </h2>
          <p className={`mt-3 text-sm leading-7 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            O acompanhamento bariátrico envolve uma equipe completa. O Omni Vital está sendo construído para que cada profissional tenha sua própria interface dentro da plataforma, com ferramentas específicas para o seu papel no cuidado do paciente.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className={`rounded-xl border px-4 py-3 ${isDark ? 'border-slate-700 bg-slate-900/40' : 'border-[#f3e5a8] bg-[#fffdf5]'}`}>
              <p className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>Nutricionista</p>
              <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Plano alimentar por fase, registro de ingestão e acompanhamento de deficiências nutricionais.</p>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${isDark ? 'border-slate-700 bg-slate-900/40' : 'border-[#f3e5a8] bg-[#fffdf5]'}`}>
              <p className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>Psicólogo</p>
              <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Avaliação comportamental, registro de sessões e monitoramento de adesão ao tratamento.</p>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${isDark ? 'border-slate-700 bg-slate-900/40' : 'border-[#f3e5a8] bg-[#fffdf5]'}`}>
              <p className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>Educador físico</p>
              <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Prescrição de exercícios adaptados à fase pós-operatória e acompanhamento de atividade física.</p>
            </div>
          </div>
          <p className={`mt-4 text-[11px] leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Funcionalidades multiprofissionais em desenvolvimento. Lançamento previsto em fases futuras da plataforma.
          </p>
        </div>
      </section>

      <footer className={isDark ? 'border-t border-[#1b2747] bg-[#0a1332]' : 'border-t border-[#f3e5a8] bg-[#fff6d6]'}>
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:px-8">
          <div>
            <p className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>Omni Vital</p>
            <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Plataforma para a jornada completa do paciente bariátrico.</p>
          </div>
          <div>
            <p className={`text-sm font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>Navegue</p>
            <div className={`mt-2 space-y-1 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              <p>Início</p><p>Solução</p><p>Jornada</p><p>Entrar</p>
            </div>
          </div>
          <div>
            <p className={`text-sm font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>Diferenciais</p>
            <div className={`mt-2 space-y-1 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              <p>Timeline de exames por especialidade</p><p>Controle de peso e reganho</p><p>Acompanhamento completo pós-operatório</p>
            </div>
          </div>
          <div>
            <p className={`text-sm font-semibold ${isDark ? 'text-zinc-200' : 'text-slate-700'}`}>Equipe médica conectada</p>
            <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Pacientes e acompanhantes recebem acesso por convite e acompanhamento seguro.</p>
          </div>
        </div>
        <div className={`border-t px-4 py-2 text-center text-[11px] transition-colors sm:px-6 ${isDark ? 'border-[#1b2747] text-zinc-500' : 'border-[#f3e5a8] text-slate-500'}`}>
          © 2026 Omni Vital. Todos os direitos reservados.
        </div>
      </footer>
    </main>
  )
}
