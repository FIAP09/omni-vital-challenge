import { useMemo } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { getJourneyLabel } from '@/constants/patient-journey-content'
import { VIEW_AS_OPTIONS, VIEW_CONTEXT_LABELS, type ViewAsOption, type ViewContextType } from '@/constants/view-as'
import { useAuthStore } from '@/stores/auth.store'
import { useViewAsStore } from '@/stores/view-as.store'

export default function LandingPage() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const login = useAuthStore((s) => s.login)
  const setSelectedContext = useViewAsStore((s) => s.setSelectedContext)

  const groupedOptions = useMemo(() => {
    const groups: Record<ViewContextType, ViewAsOption[]> = {
      paciente: [],
      acompanhante: [],
      equipe_cirurgia: [],
    }
    VIEW_AS_OPTIONS.forEach((option) => {
      groups[option.context].push(option)
    })
    return groups
  }, [])

  const selectProfile = async (option: ViewAsOption) => {
    setSelectedContext(option.id)
    const emailByContext: Record<ViewContextType, string> = {
      paciente: 'paciente@hospital.com',
      acompanhante: 'acompanhante@hospital.com',
      equipe_cirurgia: option.roleLabel.toLowerCase().includes('enf') ? 'enfermeiro@hospital.com' : 'medico@hospital.com',
    }
    await login({ email: emailByContext[option.context], password: 'mock' })
    navigate('/app/dashboard')
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
            <a href="#pitch" className="shrink-0 hover:text-[#FFE14D]">Pitch</a>
            <a href="#sobre" className="shrink-0 hover:text-[#FFE14D]">Sobre o projeto</a>
          </nav>

          <button
            type="button"
            className={`inline-flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-lg transition sm:h-9 sm:w-9 ${isDark ? 'text-zinc-300 hover:bg-zinc-800' : 'text-slate-600 hover:bg-[#fff4c4]'}`}
            title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
            onClick={toggleTheme}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
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

      {/* Seletor de perfis (demo) — inline role selector */}
      <section id="jornada" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div
          className={`rounded-3xl border p-6 transition-colors duration-200 lg:p-8 ${isDark ? 'border-[#1b2747] bg-[#0f1a3d]' : 'border-[#f3e5a8] bg-[#fff9e8]'}`}
        >
          <div className="mb-6">
            <h2 className={`text-2xl font-semibold ${isDark ? 'text-[#FFE14D]' : 'text-[#0f2743]'}`}>
              Explore a plataforma
            </h2>
            <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Selecione um perfil para acessar o painel como{' '}
              <strong className={isDark ? 'text-white' : 'text-slate-800'}>paciente, acompanhante ou equipe médica</strong>.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(Object.entries(groupedOptions) as [ViewContextType, ViewAsOption[]][]).map(([context, options]) => (
              <article
                key={context}
                className={`rounded-2xl border p-4 transition-colors duration-200 ${isDark ? 'border-[#FFE14D]/20 bg-[#0E173A]' : 'border-[#f3e5a8] bg-[#fffdf5]'}`}
              >
                <h3 className={`mb-3 text-base font-semibold ${isDark ? 'text-[#FFE14D]' : 'text-[#0f2743]'}`}>
                  {VIEW_CONTEXT_LABELS[context]}
                </h3>
                <div className="space-y-2">
                  {options.map((option) => (
                    <button
                      key={option.id}
                      className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                        isDark
                          ? 'border-zinc-700 hover:border-[#FFE14D]/50 hover:bg-zinc-800/60'
                          : 'border-[#f3e5a8] hover:border-[#d6c36f] hover:bg-[#fff4c4]'
                      }`}
                      onClick={() => selectProfile(option)}
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

      {/* Video Pitch */}
      <section id="pitch" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div
          className={`rounded-3xl border p-6 transition-colors duration-200 lg:p-8 ${isDark ? 'border-[#1b2747] bg-[#0f1a3d]' : 'border-[#f3e5a8] bg-[#fff9e8]'}`}
        >
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-[#FFE14D]' : 'text-[#0f2743]'}`}>
            Video Pitch
          </h2>
          <p className={`mt-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Apresentação do projeto Omni Vital — Challenge FIAP &amp; THM Estatística 2025-26.
          </p>
          <div className="mt-5 aspect-video w-full overflow-hidden rounded-xl">
            {/* TODO: Substituir VIDEO_ID pelo ID real do YouTube */}
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/VIDEO_ID"
              title="Video Pitch — Omni Vital"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Sobre o projeto */}
      <section id="sobre" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div
          className={`rounded-3xl border p-6 transition-colors duration-200 lg:p-8 ${isDark ? 'border-[#1b2747] bg-[#0f1a3d]' : 'border-[#f3e5a8] bg-[#fff9e8]'}`}
        >
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-[#FFE14D]' : 'text-[#0f2743]'}`}>
            Sobre o projeto
          </h2>

          <h3 className={`mt-6 text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
            Integrantes do grupo
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              {
                name: 'Hugo',
                role: 'Desenvolvedor backend com 3 anos de experiência, especializado na criação de sites.',
                photo: '/images/team/hugo.jpg',
              },
              {
                name: 'Ramon',
                role: 'Programador Java e Python desde os 18 anos, iniciando no desenvolvimento HTML, CSS e JavaScript.',
                photo: '/images/team/ramon.jpg',
              },
              {
                name: 'Audibert',
                role: 'Desenvolvedor apaixonado por tecnologia. Experiência com JavaScript e Python, além de atuar em projetos com React e Node.js.',
                photo: '/images/team/audibert.jpg',
                youtube: 'https://www.youtube.com/@audibert',
              },
              {
                name: 'Thiago',
                role: 'Bacharel em Direito. Atualmente, em transição para a área de Tecnologia da Informação.',
                photo: '/images/team/thiago.jpg',
              },
            ].map((member) => (
              <div
                key={member.name}
                className={`flex items-center gap-4 rounded-xl border px-4 py-4 ${isDark ? 'border-slate-700 bg-slate-900/40' : 'border-[#f3e5a8] bg-[#fffdf5]'}`}
              >
                <img
                  src={member.photo}
                  alt={member.name}
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>{member.name}</p>
                  <p className={`mt-1 text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{member.role}</p>
                  {'youtube' in member && member.youtube && (
                    <a
                      href={member.youtube}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-xs font-semibold text-[#FFE14D] hover:underline"
                    >
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <h3 className={`mt-8 text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
            Tecnologias utilizadas
          </h3>
          <div className={`mt-3 space-y-3 text-sm leading-7 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <p>
              O projeto foi desenvolvido utilizando tecnologias abordadas ao longo do curso de Engenharia de Software da FIAP, até a <strong className={isDark ? 'text-white' : 'text-slate-700'}>Fase 7</strong>:
            </p>
            <ul className="list-inside list-disc space-y-1.5">
              <li><strong className={isDark ? 'text-white' : 'text-slate-700'}>HTML5 e CSS3</strong> — estrutura semântica e estilização responsiva (disciplina de Front-End Design).</li>
              <li><strong className={isDark ? 'text-white' : 'text-slate-700'}>JavaScript / TypeScript</strong> — lógica de programação, manipulação de dados e interatividade (disciplinas de Computational Thinking e Software Engineering).</li>
              <li><strong className={isDark ? 'text-white' : 'text-slate-700'}>React 18</strong> — biblioteca para construção de interfaces componentizadas com estado reativo e hooks.</li>
              <li><strong className={isDark ? 'text-white' : 'text-slate-700'}>Tailwind CSS v4</strong> — framework utility-first para design responsivo e acessível, com suporte a dark mode.</li>
              <li><strong className={isDark ? 'text-white' : 'text-slate-700'}>Vite</strong> — bundler e dev server com hot module replacement, utilizado como ambiente de desenvolvimento.</li>
              <li><strong className={isDark ? 'text-white' : 'text-slate-700'}>Zustand</strong> — gerenciamento de estado global leve (alternativa ao Redux/Context API).</li>
              <li><strong className={isDark ? 'text-white' : 'text-slate-700'}>React Hook Form + Zod</strong> — validação de formulários com schemas tipados.</li>
              <li><strong className={isDark ? 'text-white' : 'text-slate-700'}>ApexCharts</strong> — visualização de dados com gráficos interativos (peso, laboratório, atividade).</li>
              <li><strong className={isDark ? 'text-white' : 'text-slate-700'}>JSON Mocks</strong> — simulação de API com arquivos JSON estáticos em <code>/public/mocks/</code>, permitindo execução sem backend (conceitos de API REST e Fetch).</li>
              <li><strong className={isDark ? 'text-white' : 'text-slate-700'}>Git e GitHub</strong> — versionamento de código e colaboração (disciplina de Software Engineering).</li>
              <li><strong className={isDark ? 'text-white' : 'text-slate-700'}>Vercel</strong> — deploy contínuo e hospedagem da aplicação web (conceitos de DevOps e Cloud).</li>
            </ul>
            <p>
              A aplicação aborda o tema <strong className={isDark ? 'text-white' : 'text-slate-700'}>"Saúde Inteligente e Conectada"</strong> proposto pela empresa parceira THM Estatística, focando no monitoramento e prevenção de problemas de saúde em pacientes bariátricos, com visualização de dados de forma clara e acessível em desktops e dispositivos móveis.
            </p>
          </div>
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
              <p>Início</p><p>Solução</p><p>Jornada</p><p>Sobre</p>
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
