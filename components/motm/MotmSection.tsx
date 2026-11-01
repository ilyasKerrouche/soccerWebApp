import Link from 'next/link'
import PlayerCard from '@/components/PlayerCard'
import MotmCountdown from './MotmCountdown'
import MotmVoteGrid from './MotmVoteGrid'
import MotmBadge from './MotmBadge'
import { getSessionAccount } from '@/lib/session'
import { getApprovedPlayerIds } from '@/lib/queries/accounts'
import { getMyVote, getVotesForMatch } from '@/lib/queries/motm'
import { motmStatus, tallyMotm } from '@/lib/motm'
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
  const tally = tallyMotm(votes, lineupIds)

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
      </>,
    )
  }

  // Voto aperto
  const approved = await getApprovedPlayerIds(lineupIds)
  // N sulla stessa popolazione di M: solo votanti con account approvato
  const approvedSet = new Set(approved)
  const votersCount = tallyMotm(
    votes.filter(v => approvedSet.has(v.voter_player_id)),
    lineupIds,
  ).votersCount
  const progress = (
    <p className="text-xs text-white/40 mt-3">
      {votersCount} su {approved.length} hanno votato
    </p>
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
