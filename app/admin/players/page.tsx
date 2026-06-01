import Link from 'next/link'
import { getAllPlayers } from '@/lib/queries/players'
import AdminPlayerRow from './AdminPlayerRow'

export default async function AdminPlayersPage() {
  const players = await getAllPlayers()

  return (
    <main className="pb-8">
      <div className="relative overflow-hidden px-4 pt-10 pb-7" style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%)' }}>
        <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(167,139,250,.35) 0%,transparent 70%)' }} />
        <div className="relative z-10 flex items-center gap-3">
          <Link href="/admin" className="text-white/50 hover:text-white text-xl transition-colors">‹</Link>
          <div>
            <div className="text-[10px] tracking-[3px] uppercase text-white/40">Admin</div>
            <h1 className="text-2xl font-black">Giocatori</h1>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {players.map(p => (
          <AdminPlayerRow key={p.id} player={p} />
        ))}
      </div>
    </main>
  )
}
