import { getAllMatches } from '@/lib/queries/matches'
import MatchCard from '@/components/MatchCard'

export const revalidate = 60

export default async function MatchesPage() {
  const matches = await getAllMatches()
  const upcoming = matches.filter((m) => m.is_upcoming)
  const played = matches.filter((m) => !m.is_upcoming)

  return (
    <main className="pb-4">
      <div className="relative overflow-hidden px-4 pt-10 pb-6" style={{ background: 'linear-gradient(135deg,#1e1b4b,#2d1b69)' }}>
        <div className="absolute -top-10 right-0 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle,rgba(167,139,250,.3) 0%,transparent 70%)' }} />
        <div className="relative z-10">
          <h1 className="text-3xl font-black">⚽ Partite</h1>
          <div className="text-sm text-white/40 mt-1">{played.length} partite giocate</div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {upcoming.length > 0 && (
          <>
            <div className="text-[10px] tracking-[2px] uppercase text-white/30 mb-2 font-bold">In programma</div>
            <div className="flex flex-col gap-2 mb-5">
              {upcoming.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </>
        )}
        <div className="text-[10px] tracking-[2px] uppercase text-white/30 mb-2 font-bold">Storico</div>
        <div className="flex flex-col gap-2">
          {played.length === 0 && (
            <p className="text-white/25 text-sm py-6 text-center">Nessuna partita ancora.</p>
          )}
          {played.map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      </div>
    </main>
  )
}
