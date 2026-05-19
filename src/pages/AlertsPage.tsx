import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { alertsService } from '@/services/alerts.service'
import type { Alert } from '@/types/alert'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [patientQuery, setPatientQuery] = useState('')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [perPage, setPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    alertsService.list().then(setAlerts)
  }, [])

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert: Alert) => {
      const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter
      const matchesPatient =
        patientQuery.trim().length === 0 ||
        alert.patient_name.toLowerCase().includes(patientQuery.trim().toLowerCase())
      return matchesSeverity && matchesPatient
    })
  }, [alerts, severityFilter, patientQuery])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredAlerts.length / perPage)),
    [filteredAlerts.length, perPage],
  )

  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredAlerts.slice(start, start + perPage)
  }, [filteredAlerts, currentPage, perPage])

  const pageLabel = useMemo(() => {
    if (filteredAlerts.length === 0) return 'Mostrando 0-0 de 0'
    const start = (currentPage - 1) * perPage + 1
    const end = Math.min(filteredAlerts.length, start + perPage - 1)
    return `Mostrando ${start}-${end} de ${filteredAlerts.length}`
  }, [filteredAlerts.length, currentPage, perPage])

  function severityLabel(s: Alert['severity']) {
    return s === 'CRITICAL' ? 'Critico' : 'Aviso'
  }

  function formatAlertTime(iso: string) {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
      new Date(iso),
    )
  }

  const runSearch = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setPatientQuery('')
    setSeverityFilter('ALL')
    setPerPage(10)
    setCurrentPage(1)
  }, [])

  function alertCardClass(alert: Alert) {
    return alert.severity === 'CRITICAL'
      ? 'border-error-200 bg-white dark:border-error-900/50 dark:bg-slate-900'
      : 'border-warning-200 bg-white dark:border-warning-900/40 dark:bg-slate-900'
  }

  function alertBadgeClass(alert: Alert) {
    return alert.severity === 'CRITICAL'
      ? 'bg-error-100 text-error-800 dark:bg-error-900/50 dark:text-error-200'
      : 'bg-warning-100 text-warning-800 dark:bg-warning-900/40 dark:text-warning-100'
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-100">Alertas</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Painel de sinais clinicos e operacionais vinculados aos procedimentos bariatricos.
        </p>
      </div>

      {/* View mode toggle */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-semibold transition ${viewMode === 'grid' ? 'bg-[#FFE14D] text-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-semibold transition ${viewMode === 'list' ? 'bg-[#FFE14D] text-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}`}
            onClick={() => setViewMode('list')}
          >
            Lista
          </button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          A pesquisa usa registros da API ou mock armazenado conforme o ambiente.
        </p>
        <div className="max-w-xl">
          <label className="mb-1 block text-sm font-semibold text-slate-500 dark:text-slate-400">
            Pesquisar
          </label>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              value={patientQuery}
              onChange={(e) => setPatientQuery(e.target.value)}
              type="text"
              placeholder="Nome do paciente"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            />
            <button
              type="button"
              className="rounded-lg bg-[#FFE14D] px-4 py-2 text-sm font-semibold text-slate-700"
              onClick={runSearch}
            >
              Pesquisar
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <span className="inline-flex items-center gap-1">
              Filtros
              {isFiltersOpen ? (
                <ChevronUp className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
              )}
            </span>
          </button>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Refine por severidade e tipo de procedimento; controle a paginacao na visualizacao em lista.
          </p>
        </div>
        {isFiltersOpen && (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-500 dark:text-slate-400">
                Severidade
              </label>
              <select
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value as 'ALL' | 'CRITICAL' | 'WARNING')
                  runSearch()
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="ALL">Todas</option>
                <option value="CRITICAL">Critico</option>
                <option value="WARNING">Aviso</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-500 dark:text-slate-400">
                Itens por pagina
              </label>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  runSearch()
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-end md:col-span-2">
              <button
                type="button"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 sm:w-auto"
                onClick={clearFilters}
              >
                Limpar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {filteredAlerts.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Nenhum alerta encontrado
        </div>
      )}

      {/* Grid view */}
      {filteredAlerts.length > 0 && viewMode === 'grid' && (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredAlerts.map((alert) => (
            <article
              key={alert.id}
              className={`rounded-xl border p-5 dark:bg-slate-900 ${alertCardClass(alert)}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-100">
                    {alert.patient_name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Bariatrica · {formatAlertTime(alert.created_at)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${alertBadgeClass(alert)}`}
                >
                  {severityLabel(alert.severity)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {alert.message}
              </p>
              <div className="mt-4">
                <Link
                  to={`/app/patients/${alert.surgery_id}`}
                  className="inline-flex justify-center rounded-lg bg-[#FFE14D] px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:brightness-95"
                >
                  Ver paciente
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* List view */}
      {filteredAlerts.length > 0 && viewMode === 'list' && (
        <div className="rounded-xl border border-slate-200 bg-white p-0 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                Resultados da pesquisa
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {filteredAlerts.length} alerta(s) encontrado(s).
              </p>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{pageLabel}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th className="p-3 text-left">Paciente</th>
                  <th className="p-3 text-left">Severidade</th>
                  <th className="p-3 text-left">Procedimento</th>
                  <th className="p-3 text-left">Mensagem</th>
                  <th className="p-3 text-left">Registro</th>
                  <th className="p-3 text-left">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAlerts.map((alert) => (
                  <tr
                    key={alert.id}
                    className="border-t border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-100"
                  >
                    <td className="p-3 font-medium">{alert.patient_name}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${alertBadgeClass(alert)}`}
                      >
                        {severityLabel(alert.severity)}
                      </span>
                    </td>
                    <td className="p-3">Bariatrica</td>
                    <td
                      className="max-w-xs truncate p-3 text-slate-600 dark:text-slate-300"
                      title={alert.message}
                    >
                      {alert.message}
                    </td>
                    <td className="whitespace-nowrap p-3 text-slate-500 dark:text-slate-400">
                      {formatAlertTime(alert.created_at)}
                    </td>
                    <td className="p-3">
                      <Link
                        to={`/app/patients/${alert.surgery_id}`}
                        className="text-sm font-semibold text-[#FFE14D] hover:underline"
                      >
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pagina {currentPage} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Anterior
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Proxima
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
