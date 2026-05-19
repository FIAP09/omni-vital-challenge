import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { loginSchema } from '@/lib/validations/auth.schema'
import { useAuthStore } from '@/stores/auth.store'
import { canUseViewAs, useViewAsStore, selectSelectedContext } from '@/stores/view-as.store'
import type { z } from 'zod'

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const selectedContext = useViewAsStore(selectSelectedContext)

  const contextLabel = selectedContext?.roleLabel ?? 'Não selecionado'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values)

      const currentUser = useAuthStore.getState().user
      if (canUseViewAs(currentUser?.role)) {
        toast.info('Login realizado. Selecione o perfil para visualizar como administrador.')
        navigate('/seletor')
        return
      }

      const currentContext = selectSelectedContext(useViewAsStore.getState())
      if (currentContext) {
        toast.success(`Acesso liberado para: ${currentContext.roleLabel}`)
      }
      navigate('/app/dashboard')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao autenticar.'
      toast.error(message)
    }
  })

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-slate-700 dark:text-[#FFE14D]">Omni Vital</h1>
      <p className="mb-1 text-sm text-slate-600 dark:text-slate-200">Acesso restrito para equipes hospitalares.</p>
      <p className="mb-6 text-xs text-slate-500 dark:text-slate-400">Contexto selecionado: {contextLabel}</p>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-200">E-mail</label>
          <input
            type="email"
            {...register('email')}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          {errors.email && <p className="mt-1 text-xs text-error-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-200">Senha</label>
          <input
            type="password"
            {...register('password')}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          {errors.password && <p className="mt-1 text-xs text-error-600">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-[#FFE14D] px-4 py-2 font-medium text-[#27272B] hover:brightness-95 disabled:opacity-70"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <Link
          to="/criar-acesso"
          className="inline-flex w-full justify-center text-xs font-medium text-slate-600 hover:underline dark:text-slate-300"
        >
          Recebi convite por e-mail e quero criar minha senha
        </Link>
      </form>

      <Link to="/seletor" className="mt-4 inline-flex text-xs font-medium text-slate-600 hover:underline dark:text-[#FFE14D]">
        Alterar contexto em /seletor
      </Link>
    </div>
  )
}
