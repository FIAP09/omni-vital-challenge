import { useCallback, useMemo, useState } from 'react'

type CollaboratorRole = 'medico' | 'enfermeiro' | 'coordenador'

type Collaborator = {
  id: number
  name: string
  email: string
  role: CollaboratorRole
  sector: string
}

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit'>('list')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sectorFilter, setSectorFilter] = useState('ALL')
  const [perPage, setPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: 1,
      name: 'Dr. Lucas Lima',
      email: 'lucas@hospital.com',
      role: 'medico',
      sector: 'Cirurgia bariatrica',
    },
    {
      id: 2,
      name: 'Enf. Paula Mendes',
      email: 'paula@hospital.com',
      role: 'enfermeiro',
      sector: 'Centro cirurgico',
    },
    {
      id: 3,
      name: 'Dr. Vinicius Rocha',
      email: 'vinicius@hospital.com',
      role: 'coordenador',
      sector: 'Coordenacao medica',
    },
  ])

  const availableSectors = useMemo(
    () => [...new Set(collaborators.map((item) => item.sector))],
    [collaborators],
  )

  const filteredCollaborators = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()
    return collaborators.filter((item) => {
      const matchesTerm =
        !term ||
        `${item.name} ${item.email} ${item.sector} ${item.role}`.toLowerCase().includes(term)
      const matchesSector = sectorFilter === 'ALL' || item.sector === sectorFilter
      return matchesTerm && matchesSector
    })
  }, [collaborators, searchQuery, sectorFilter])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredCollaborators.length / perPage)),
    [filteredCollaborators.length, perPage],
  )

  const paginatedCollaborators = useMemo(() => {
    const start = (currentPage - 1) * perPage
    const end = start + perPage
    return filteredCollaborators.slice(start, end)
  }, [filteredCollaborators, currentPage, perPage])

  const pageLabel = useMemo(() => {
    if (filteredCollaborators.length === 0) return 'Mostrando 0-0 de 0'
    const start = (currentPage - 1) * perPage + 1
    const end = Math.min(filteredCollaborators.length, start + perPage - 1)
    return `Mostrando ${start}-${end} de ${filteredCollaborators.length}`
  }, [filteredCollaborators.length, currentPage, perPage])

  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    role: 'medico' as CollaboratorRole,
    sector: '',
  })

  const [editForm, setEditForm] = useState({
    id: 0,
    name: '',
    email: '',
    role: 'medico' as CollaboratorRole,
    sector: '',
  })

  const submitAdd = () => {
    if (!addForm.name || !addForm.email || !addForm.sector) {
      alert('Preencha todos os campos para adicionar colaborador.')
      return
    }

    setCollaborators((prev) => [
      {
        id: Date.now(),
        name: addForm.name,
        email: addForm.email,
        role: addForm.role,
        sector: addForm.sector,
      },
      ...prev,
    ])

    alert(`Colaborador ${addForm.name} adicionado com sucesso.`)
    setAddForm({ name: '', email: '', role: 'medico', sector: '' })
  }

  const openEdit = (collaborator: Collaborator) => {
    setEditingId(collaborator.id)
    setEditForm({ ...collaborator })
    setActiveTab('edit')
  }

  const submitEdit = () => {
    setCollaborators((prev) =>
      prev.map((item) => (item.id === editForm.id ? { ...editForm } : item)),
    )
    alert('Colaborador atualizado com sucesso.')
  }

  const closeEditTab = () => {
    setEditingId(null)
    setActiveTab('list')
  }

  const runSearch = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSectorFilter('ALL')
    setPerPage(10)
    setCurrentPage(1)
  }, [])

  const tabClass = (tab: string) =>
    `border-b-2 px-1 pb-2 text-sm font-semibold transition ${activeTab === tab ? 'border-[#FFE14D] text-slate-700 dark:text-slate-100' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-100">Equipe</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gerencie colaboradores e permissoes da equipe assistencial.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center gap-5">
          <button className={tabClass('list')} onClick={() => setActiveTab('list')}>
            Listagem
          </button>
          <button className={tabClass('add')} onClick={() => setActiveTab('add')}>
            Adicionar colaborador
          </button>
          {editingId && (
            <button className={tabClass('edit')} onClick={() => setActiveTab('edit')}>
              Editar
            </button>
          )}
        </div>
      </div>

      {/* List tab */}
      {activeTab === 'list' && (
        <div className="space-y-3">
          {/* Search panel */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
              A pesquisa usa registros mockados armazenados no navegador.
            </p>
            <div className="max-w-xl">
              <label className="mb-1 block text-sm font-semibold text-slate-500 dark:text-slate-400">
                Pesquisar
              </label>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="text"
                  placeholder="Nome, e-mail ou organizacao"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                />
                <button
                  className="rounded-lg bg-[#FFE14D] px-4 py-2 text-sm font-semibold text-slate-700"
                  onClick={runSearch}
                >
                  Pesquisar
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
              <button
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              >
                Filtros {isFiltersOpen ? '▴' : '▾'}
              </button>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Refine a busca e controle a paginacao com filtros compactos.
              </p>
            </div>
            {isFiltersOpen && (
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Organizacao
                  </label>
                  <select
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                  >
                    <option value="ALL">Todas as organizacoes</option>
                    {availableSectors.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Itens por pagina
                  </label>
                  <select
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    onClick={clearFilters}
                  >
                    Limpar filtros
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 bg-white p-0 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                  Resultados da pesquisa
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {filteredCollaborators.length} usuarios encontrados.
                </p>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{pageLabel}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="p-3 text-left">Usuario</th>
                    <th className="p-3 text-left">E-mail</th>
                    <th className="p-3 text-left">Organizacao</th>
                    <th className="p-3 text-left">Nivel</th>
                    <th className="p-3 text-left">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCollaborators.map((collaborator) => (
                    <tr
                      key={collaborator.id}
                      className="border-t border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-100"
                    >
                      <td className="p-3">{collaborator.name}</td>
                      <td className="p-3">{collaborator.email}</td>
                      <td className="p-3">{collaborator.sector}</td>
                      <td className="p-3">{collaborator.role}</td>
                      <td className="p-3">
                        <button
                          className="text-sm font-semibold text-[#FFE14D] hover:underline"
                          onClick={() => openEdit(collaborator)}
                        >
                          Editar
                        </button>
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
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Anterior
                </button>
                <button
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Proxima
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add tab */}
      {activeTab === 'add' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="mb-4 text-base font-semibold text-slate-700 dark:text-slate-100">
            Adicionar colaborador
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={addForm.name}
              onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
              type="text"
              placeholder="Nome completo"
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-600 dark:bg-slate-800"
            />
            <input
              value={addForm.email}
              onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
              type="email"
              placeholder="Email"
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-600 dark:bg-slate-800"
            />
            <select
              value={addForm.role}
              onChange={(e) =>
                setAddForm((prev) => ({ ...prev, role: e.target.value as CollaboratorRole }))
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="medico">Medico</option>
              <option value="enfermeiro">Enfermeiro</option>
              <option value="coordenador">Coordenador</option>
            </select>
            <input
              value={addForm.sector}
              onChange={(e) => setAddForm((prev) => ({ ...prev, sector: e.target.value }))}
              type="text"
              placeholder="Setor"
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-600 dark:bg-slate-800"
            />
          </div>
          <button
            className="mt-4 rounded-lg bg-[#FFE14D] px-5 py-3 text-base font-semibold text-slate-700 hover:brightness-95"
            onClick={submitAdd}
          >
            Salvar colaborador
          </button>
        </div>
      )}

      {/* Edit tab */}
      {activeTab === 'edit' && editingId && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-100">
              Editar colaborador
            </h3>
            <button
              className="text-sm text-slate-500 hover:underline dark:text-slate-300"
              onClick={closeEditTab}
            >
              Fechar guia
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={editForm.name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              type="text"
              placeholder="Nome completo"
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-600 dark:bg-slate-800"
            />
            <input
              value={editForm.email}
              onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
              type="email"
              placeholder="Email"
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-600 dark:bg-slate-800"
            />
            <select
              value={editForm.role}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, role: e.target.value as CollaboratorRole }))
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="medico">Medico</option>
              <option value="enfermeiro">Enfermeiro</option>
              <option value="coordenador">Coordenador</option>
            </select>
            <input
              value={editForm.sector}
              onChange={(e) => setEditForm((prev) => ({ ...prev, sector: e.target.value }))}
              type="text"
              placeholder="Setor"
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base dark:border-slate-600 dark:bg-slate-800"
            />
          </div>
          <button
            className="mt-4 rounded-lg bg-[#FFE14D] px-5 py-3 text-base font-semibold text-slate-700 hover:brightness-95"
            onClick={submitEdit}
          >
            Salvar edicao
          </button>
        </div>
      )}
    </section>
  )
}
