import { getPlayersWithStats } from '@/lib/queries/players'
import PlayersClient from '@/components/PlayersClient'

export const revalidate = 60

export default async function PlayersPage() {
  const players = await getPlayersWithStats()
  return <PlayersClient initialPlayers={players} />
}
