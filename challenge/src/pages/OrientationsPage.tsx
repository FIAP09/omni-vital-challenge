import { useEffect, useState } from 'react'
import { bariatricService } from '@/services/bariatric.service'
import type { OrientationDocument } from '@/types/bariatric'
import OrientationViewer from '@/components/bariatric/OrientationViewer'

export default function OrientationsPage() {
  const [documents, setDocuments] = useState<OrientationDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    bariatricService
      .orientations()
      .then(setDocuments)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-100">
          Orientacoes ao paciente
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Documentos informativos sobre complicacoes, expectativas de perda de peso, dieta e cuidados
          gerais para pacientes bariatricos.
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Carregando orientacoes...
        </div>
      ) : (
        <OrientationViewer documents={documents} />
      )}
    </section>
  )
}
