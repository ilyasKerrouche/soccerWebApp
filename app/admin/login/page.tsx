// app/admin/login/page.tsx
import { loginAction } from './actions'

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0f0a' }}>
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-black text-center mb-2">⚽ Calcetto</h1>
        <p className="text-center text-sm text-white/40 mb-8">Accesso admin</p>

        <form action={loginAction} className="space-y-4">
          <input
            name="password"
            type="password"
            placeholder="Password admin"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-brand/50"
          />
          {searchParams.error && (
            <p className="text-red-400 text-sm text-center">Password errata</p>
          )}
          <button
            type="submit"
            className="w-full bg-brand text-black font-bold py-3 rounded-xl hover:bg-green-400 transition-colors"
          >
            Accedi
          </button>
        </form>
      </div>
    </div>
  )
}
