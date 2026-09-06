import { getAllMatchesWithPlayers } from '@/lib/queries/matches'
import MatchCard from '@/components/MatchCard'
import PageHeader from '@/components/PageHeader'

export const revalidate = 60

export default async function MatchesPage() {
  const matches = await getAllMatchesWithPlayers()
  const upcoming = matches.filter((m) => m.is_upcoming)
  const played = matches.filter((m) => !m.is_upcoming)

  return (
    <main className="pb-6 px-4">
      <PageHeader
        eyebrow="Stagione 2025/26"
        title="Partite"
        aside={<span className="text-[13px] text-white/30">{played.length} giocate</span>}
      />

      <div className="pt-5 flex flex-col gap-6">
        {upcoming.length > 0 && (
          <section>
            <h2 className="text-[13px] font-semibold text-white/45 mb-2">In programma</h2>
            <div className="flex flex-col gap-2">
              {upcoming.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </section>
        )}

        <section>
          {upcoming.length > 0 && <h2 className="text-[13px] font-semibold text-white/45 mb-2">Storico</h2>}
          {played.length === 0 ? (
            <p className="text-white/30 text-[13px] py-8 text-center">
              Nessuna partita registrata. Aggiungine una dall&apos;area admin.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {played.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
