import Link from 'next/link'
import PlayerCard from '@/components/PlayerCard'
import MotmCountdown from './MotmCountdown'
import MotmVoteGrid from './MotmVoteGrid'
import MotmBadge from './MotmBadge'
import { getSessionAccount } from '@/lib/session'
import { getApprovedPlayerIds } from '@/lib/queries/accounts'
import { getMyVote, getVotesForMatch } from '@/lib/queries/motm'
import { missingVoters, motmStatus, tallyMotm, winningTeam } from '@/lib/motm'
import { plural } from '@/lib/plural'
import type { MatchWithPlayers } from '@/lib/types'

// Server component: ai client arrivano solo aggregati e il voto dell'utente stesso.
// Un errore nel caricamento non deve mai far cadere la pagina partita.
export default async function MotmSection({ match }: { match: MatchWithPlayers }) {
  try {
    return await renderMotm(match)
  } catch (e) {
    console.error('MotmSection failed', e)
    return (
      <section className="glass rounded-2xl p-4">
        <p className="text-xs text-white/40">Man of the Match non disponibile al momento</p>
      </section>
    )
  }
}

async function renderMotm(match: MatchWithPlayers) {
  const closesAt = match.motm_closes_at
  const status = motmStatus(closesAt, new Date())
  if (closesAt === null || status === 'none') return null

  const lineup = match.match_players.map(mp => mp.player)
  const lineupIds = lineup.map(p => p.id)

  const [session, votes] = await Promise.all([getSessionAccount(), getVotesForMatch(match.id)])
  const entries = match.match_players.map(mp => ({ player_id: mp.player_id, team: mp.team }))
  const winner = winningTeam(match.score_a, match.score_b)
  const tally = tallyMotm(votes, entries, winner)

  const shell = (children: React.ReactNode, header?: React.ReactNode) => (
    <section className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-semibold"><span className="text-gold">★</span> Man of the Match</h2>
        {header}
      </div>
      {children}
    </section>
  )

  if (status === 'closed') {
    const winners = lineup.filter(p => tally.winners.includes(p.id))
    if (winners.length === 0) {
      return shell(<p className="text-xs text-white/40">Nessun MOTM per questa partita</p>)
    }
    // Tutti quelli che hanno preso voti: prima il MOTM, poi per voti e per nome.
    // Chi ha votato chi resta privato: qui arrivano solo i totali.
    const ranking = lineup
      .filter(p => tally.counts[p.id])
      .sort((x, y) =>
        Number(tally.winners.includes(y.id)) - Number(tally.winners.includes(x.id)) ||
        tally.counts[y.id] - tally.counts[x.id] ||
        x.name.localeCompare(y.name, 'it'),
      )
    return shell(
      <>
      <div className="flex justify-center mb-3"><MotmBadge names={winners.map(p => p.name)} /></div>
      <div className="flex flex-wrap justify-center gap-4">
        {winners.map(p => (
          <div key={p.id} className="flex flex-col items-center gap-1.5">
            <div className="rounded-xl p-1 ring-2 ring-gold/70 shadow-[0_0_24px_rgba(245,196,81,.25)]">
              <PlayerCard player={p} width={110} />
            </div>
            <div className="text-sm font-bold">{p.name}</div>
            <span className="bg-gold/15 text-gold text-[11px] font-bold px-2 py-0.5 rounded-full">
              {tally.topVotes} {tally.topVotes === 1 ? 'voto' : 'voti'}
            </span>
          </div>
        ))}
      </div>
      {ranking.length > 1 && (
        <ul className="mt-4 border-t border-white/10 pt-3 space-y-1.5">
          {ranking.map(p => (
            <li key={p.id} className="flex items-center justify-between text-xs">
              <span className={tally.winners.includes(p.id) ? 'font-bold text-gold' : 'text-white/70'}>{p.name}</span>
              <span className="tabular-nums text-white/50">{plural(tally.counts[p.id], 'voto', 'voti')}</span>
            </li>
          ))}
        </ul>
      )}
      </>,
    )
  }

  // Voto aperto
  const approved = await getApprovedPlayerIds(lineupIds)
  // N sulla stessa popolazione di M: solo votanti con account approvato
  const approvedSet = new Set(approved)
  const votersCount = tallyMotm(
    votes.filter(v => approvedSet.has(v.voter_player_id)),
    entries,
    winner,
  ).votersCount
  // Solo i nomi di chi manca: non dice nulla su chi ha votato chi.
  const missing = new Set(missingVoters(votes, approved))
  const missingNames = lineup.filter(p => missing.has(p.id)).map(p => p.name)
  const progress = (
    <div className="text-xs text-white/40 mt-3 space-y-1">
      <p>{votersCount} su {approved.length} {votersCount === 1 ? 'ha' : 'hanno'} votato</p>
      {missingNames.length > 0 && (
        <p>{missingNames.length === 1 ? 'Manca' : 'Mancano'}: <span className="text-white/60">{missingNames.join(', ')}</span></p>
      )}
    </div>
  )
  const header = <MotmCountdown closesAt={closesAt} />

  const account = session?.account ?? null
  const canVote = account?.status === 'approved' && lineupIds.includes(account.player_id)

  if (canVote && account) {
    const myVote = await getMyVote(match.id, account.player_id)
    return shell(
      <>
        <MotmVoteGrid
          matchId={match.id}
          candidates={lineup.filter(p => p.id !== account.player_id)}
          myVote={myVote}
        />
        {progress}
      </>,
      header,
    )
  }

  const reason = !session ? (
    <Link href={`/accedi?next=/matches/${match.id}`} className="text-brand font-bold underline">Accedi per votare</Link>
  ) : account?.status !== 'approved' ? (
    'Il tuo account deve essere approvato per votare'
  ) : (
    'Puoi votare solo le partite in cui hai giocato'
  )
  return shell(
    <>
      <p className="text-xs text-white/50">{reason}</p>
      {progress}
    </>,
    header,
  )
}
