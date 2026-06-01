import { loginAction } from './actions'

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#06060f 0%,#0d0d1f 100%)' }}>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(167,139,250,.15) 0%,transparent 70%)' }} />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⚽</div>
          <h1 className="text-2xl font-black mb-1">Calcetto Admin</h1>
          <p className="text-sm text-white/35">Inserisci la password per continuare</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <form action={loginAction} className="space-y-4">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-white/40 block mb-2">Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-1 focus:ring-brand/50 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>
            {searchParams.error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center py-2 rounded-xl">
                Password errata
              </div>
            )}
            <button
              type="submit"
              className="w-full font-black py-3 rounded-xl transition-colors text-sm"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', color: 'white' }}
            >
              Accedi
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
