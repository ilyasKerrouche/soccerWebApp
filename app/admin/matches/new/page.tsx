import { getAllPlayers } from '@/lib/queries/players'
import MatchForm from '@/components/admin/MatchForm'
import { saveNewMatch } from './actions'

export default async function NewMatchPage() {
  const players = await getAllPlayers()
  return (
    <main className="px-4 pb-8">
      <div className="pt-7 pb-5">
        <h1 className="text-2xl font-black">➕ Nuova partita</h1>
      </div>
      <MatchForm players={players} onSave={saveNewMatch} />
    </main>
  )
}
