import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function CreateAccessPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !confirmPassword || !inviteCode) {
      toast.error('Preencha todos os campos para ativar o acesso.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não conferem.')
      return
    }

    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    setSubmitting(false)

    toast.success('Acesso criado com sucesso. Faça login para continuar.')
    navigate('/login')
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-slate-700 dark:text-[#FFE14D]">Criar acesso</h1>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-200">
        Use o convite enviado por e-mail para definir sua senha de acesso.
      </p>

      <form className="space-y-4" onSubmit={submit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-200">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-200">Código do convite</label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-200">Nova senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-200">Confirmar senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-[#FFE14D] px-4 py-2 font-medium text-[#27272B] hover:brightness-95 disabled:opacity-70"
          disabled={submitting}
        >
          {submitting ? 'Criando acesso...' : 'Criar acesso'}
        </button>
      </form>

      <Link to="/login" className="mt-4 inline-flex text-xs font-medium text-slate-600 hover:underline dark:text-slate-300">
        Voltar para login
      </Link>
    </div>
  )
}
