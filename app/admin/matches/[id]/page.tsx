import { getMatchById } from '@/lib/queries/matches'
import { getAllPlayers } from '@/lib/queries/players'
import MatchForm from '@/components/admin/MatchForm'
import { saveEditMatch, deleteMatchAction } from './actions'
import { notFound } from 'next/navigation'

export default async function EditMatchPage({ params }: { params: { id: string } }) {
  let match, players
  try {
    ;[match, players] = await Promise.all([
      getMatchById(params.id),
      getAllPlayers(),
    ])
  } catch {
    notFound()
  }

  const onSave = async (data: Parameters<typeof saveEditMatch>[1]) => {
    'use server'
    await saveEditMatch(params.id, data)
  }

  return (
    <main className="px-4 pb-8">
      <div className="pt-7 pb-5 flex items-center justify-between">
        <h1 className="text-2xl font-black">✏️ Modifica partita</h1>
        <form
          action={async () => {
            'use server'
            await deleteMatchAction(params.id)
          }}
        >
          <button className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full">
            🗑 Elimina
          </button>
        </form>
      </div>
      <MatchForm players={players} existing={match} onSave={onSave} />
    </main>
  )
}
