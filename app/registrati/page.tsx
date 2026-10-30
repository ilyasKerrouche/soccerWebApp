import { getClaimablePlayers } from '@/lib/queries/players'
import SignUpForm from './SignUpForm'

export const dynamic = 'force-dynamic'

export default async function RegistratiPage() {
  const players = await getClaimablePlayers()
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#06060f 0%,#0d0d1f 100%)' }}>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(167,139,250,.15) 0%,transparent 70%)' }} />
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⚽</div>
          <h1 className="text-2xl font-black mb-1">Registrati</h1>
          <p className="text-sm text-white/35">Crea il tuo account da giocatore</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <SignUpForm players={players.map(p => ({ id: p.id, name: p.name }))} />
        </div>
      </div>
    </div>
  )
}
