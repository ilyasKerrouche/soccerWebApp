import Link from 'next/link'
import { getAllPlayers } from '@/lib/queries/players'
import AdminPlayerRow from './AdminPlayerRow'
import NewPlayerForm from './NewPlayerForm'

export default async function AdminPlayersPage() {
  const players = await getAllPlayers()

  return (
    <main className="pb-8">
      <div className="relative overflow-hidden px-4 pt-10 pb-7">
        <div className="relative z-10 flex items-center gap-3">
          <Link href="/admin" className="text-white/50 hover:text-white text-xl transition-colors">‹</Link>
          <div>
            <div className="text-[10px] tracking-[3px] uppercase text-white/40">Admin</div>
            <h1 className="text-2xl font-black">Giocatori</h1>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        <NewPlayerForm />
        <div className="text-[10px] tracking-[2px] uppercase text-white/25 font-bold mt-2">
          {players.length} giocatori
        </div>
        {players.map(p => (
          <AdminPlayerRow key={p.id} player={p} />
        ))}
      </div>
    </main>
  )
}
