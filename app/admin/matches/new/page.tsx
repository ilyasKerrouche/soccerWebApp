import Link from 'next/link'
import { getPlayersWithStats } from '@/lib/queries/players'
import MatchForm from '@/components/admin/MatchForm'
import { saveNewMatch } from './actions'

export default async function NewMatchPage() {
  const players = await getPlayersWithStats()
  return (
    <main className="pb-8">
      <div className="relative overflow-hidden px-4 pt-10 pb-7">
        <div className="relative z-10 flex items-center gap-3">
          <Link href="/admin" className="text-white/50 hover:text-white text-xl transition-colors">‹</Link>
          <div>
            <div className="text-[10px] tracking-[3px] uppercase text-white/40">Admin</div>
            <h1 className="text-2xl font-black">Nuova partita</h1>
          </div>
        </div>
      </div>
      <div className="px-4 pt-5">
        <MatchForm players={players} onSave={saveNewMatch} />
      </div>
    </main>
  )
}
