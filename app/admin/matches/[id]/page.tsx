import Link from 'next/link'
import { getMatchById } from '@/lib/queries/matches'
import { getPlayersWithStats } from '@/lib/queries/players'
import MatchForm from '@/components/admin/MatchForm'
import MatchActions from '@/components/admin/MatchActions'
import { saveEditMatch, deleteMatchAction, duplicateMatchAction } from './actions'
import { notFound } from 'next/navigation'

export default async function EditMatchPage({ params }: { params: { id: string } }) {
  let match, players
  try {
    ;[match, players] = await Promise.all([
      getMatchById(params.id),
      getPlayersWithStats(),
    ])
  } catch {
    notFound()
  }

  const onSave = async (data: Parameters<typeof saveEditMatch>[1]) => {
    'use server'
    await saveEditMatch(params.id, data)
  }

  const onDelete = async () => {
    'use server'
    await deleteMatchAction(params.id)
  }

  const onDuplicate = async () => {
    'use server'
    await duplicateMatchAction(params.id)
  }

  return (
    <main className="pb-8">
      <div className="relative overflow-hidden px-4 pt-10 pb-7" style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%)' }}>
        <div className="absolute -top-10 -right-8 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(167,139,250,.35) 0%,transparent 70%)' }} />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-white/50 hover:text-white text-xl transition-colors">‹</Link>
            <div>
              <div className="text-[10px] tracking-[3px] uppercase text-white/40">Admin</div>
              <h1 className="text-2xl font-black">Modifica partita</h1>
            </div>
          </div>
          <MatchActions onDelete={onDelete} onDuplicate={onDuplicate} />
        </div>
      </div>
      <div className="px-4 pt-5">
        <MatchForm players={players} existing={match} onSave={onSave} />
      </div>
    </main>
  )
}
