import Link from 'next/link'
import { redirect } from 'next/navigation'
import PlayerCard from '@/components/PlayerCard'
import FormDots from '@/components/FormDots'
import MotmCounter from '@/components/motm/MotmCounter'
import { getMotmCounts } from '@/lib/queries/motm'
import { currentSeason } from '@/lib/season'
import { getPlayerProfile } from '@/lib/queries/players'
import { getSessionAccount } from '@/lib/session'
import { signOutAction } from '@/app/accedi/actions'
import { C, Card, Section, StatTile } from '@/components/ui'
import CardUploadForm from './CardUploadForm'

export const dynamic = 'force-dynamic'
// Dopo una partita o un nuovo caricamento i numeri devono essere subito quelli veri
export const fetchCache = 'force-no-store'

function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button type="submit" className="w-full text-[13px] py-2.5 transition-opacity hover:opacity-80" style={{ color: C.muted }}>
        Esci
      </button>
    </form>
  )
}

export default async function ProfiloPage() {
  const session = await getSessionAccount()
  if (!session) redirect('/accedi?next=/profilo')

  const { account, player } = session

  if (!account || !player) {
    return (
      <main className="px-4 pt-16 pb-10 text-center">
        <p className="text-[13px]" style={{ color: C.muted }}>Nessun profilo collegato. Contatta l&apos;admin.</p>
        <div className="mt-4"><SignOutButton /></div>
      </main>
    )
  }

  // In attesa: la card del giocatore richiesto non e' ancora sua, si mostra solo il nome
  if (account.status !== 'approved') {
    return (
      <main className="px-4 pt-10 pb-10">
        <h1 className="text-[26px] font-bold tracking-[-0.02em]">Il tuo profilo</h1>
        <Card className="p-4 mt-4">
          <div className="text-[11px] font-semibold" style={{ color: C.acc }}>RICHIESTA INVIATA</div>
          <div className="text-[16px] font-semibold mt-1">In attesa di conferma dall&apos;admin</div>
          <div className="text-[13px] mt-1" style={{ color: C.muted }}>
            Richiesta per <span className="font-semibold text-white">{player.name}</span>. Appena viene approvata qui trovi la tua card e le tue statistiche.
          </div>
        </Card>
        <div className="mt-4"><SignOutButton /></div>
      </main>
    )
  }

  // Statistiche e MOTM: se non arrivano la pagina resta usabile (card, caricamento, esci)
  // Come la Home: i tuoi numeri della stagione in corso
  const season = currentSeason(new Date())
  const [profile, motmCount] = await Promise.all([
    getPlayerProfile(player.id, season).catch((e) => { console.error('profile stats failed', e); return null }),
    getMotmCounts(season).then((c) => c[player.id] ?? 0).catch((e) => { console.error('MOTM counts failed', e); return 0 }),
  ])
  const me = profile?.player
  const rec = me?.record
  const tiles = me
    ? [
        { v: me.total_goals, l: 'gol' },
        { v: me.total_appearances, l: 'presenze' },
        { v: rec && rec.played > 0 ? `${Math.round(rec.win_rate * 100)}%` : '—', l: rec && rec.played > 0 ? `vittorie · ${rec.wins}V ${rec.draws}N ${rec.losses}P` : 'vittorie' },
        { v: motmCount, l: 'volte MOTM' },
      ]
    : []

  return (
    <main className="pb-10">
      <div className="text-center px-4 pt-6" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(91,156,255,.14) 0%, transparent 62%)' }}>
        <div className="text-[12px]" style={{ color: C.muted }}>Il tuo profilo</div>
        <div className="inline-block card-shield mt-3" style={{ width: 150, filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.6))' }}>
          <PlayerCard player={player} width={150} eager />
        </div>
        <h1 className="text-[24px] font-bold tracking-[-0.02em] leading-tight mt-2.5 truncate">{player.name}</h1>
        {player.position && <div className="text-[13px]" style={{ color: C.muted }}>{player.position}</div>}
        {motmCount >= 1 && <div className="mt-2"><MotmCounter count={motmCount} /></div>}
        {rec && rec.form.length > 0 && <div className="mt-2.5 flex justify-center"><FormDots form={rec.form} size={7} /></div>}
      </div>

      <div className="px-4 pt-5 flex flex-col gap-6">
        {tiles.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {tiles.map(({ v, l }) => <StatTile key={l} value={v} label={l} />)}
          </div>
        )}

        <Section title="La tua card">
          <Card className="p-3.5">
            <p className="text-[12px] mb-3" style={{ color: C.muted }}>
              Compare sul campo della home, nelle classifiche e nel tuo profilo. Carica un&apos;immagine PNG, JPG o WebP.
            </p>
            <CardUploadForm hasCard={!!player.card_url} />
          </Card>
        </Section>

        <div className="flex flex-col gap-1">
          <Link href={`/players/${player.id}`} className="block text-center text-[13px] font-semibold py-2.5" style={{ color: C.acc }}>
            Statistiche complete e storico partite →
          </Link>
          <SignOutButton />
          <p className="text-center text-[10.5px] mt-2" style={{ color: C.muted }}>Musica: Infraction</p>
        </div>
      </div>
    </main>
  )
}
