import { getAllMatches } from '@/lib/queries/matches'
import MatchCard from '@/components/MatchCard'

export const revalidate = 60

export default async function MatchesPage() {
  const matches = await getAllMatches()
  const upcoming = matches.filter((m) => m.is_upcoming)
  const played = matches.filter((m) => !m.is_upcoming)

  return (
    <main className="px-4 pb-4">
      <div className="pt-7 pb-4">
        <h1 className="text-2xl font-black">⚽ Partite</h1>
        <div className="text-xs text-white/35 mt-1">{played.length} partite giocate</div>
      </div>

      {upcoming.length > 0 && (
        <>
          <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2">
            In programma
          </div>
          <div className="flex flex-col gap-2 mb-5">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </>
      )}

      <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2">Storico</div>
      <div className="flex flex-col gap-2">
        {played.length === 0 && (
          <p className="text-white/30 text-sm py-4 text-center">Nessuna partita ancora.</p>
        )}
        {played.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>
    </main>
  )
}
