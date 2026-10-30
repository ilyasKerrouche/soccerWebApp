import Link from 'next/link'
import { redirect } from 'next/navigation'
import PlayerCard from '@/components/PlayerCard'
import MotmCounter from '@/components/motm/MotmCounter'
import { getMotmCounts } from '@/lib/queries/motm'
import { getSessionAccount } from '@/lib/session'
import { signOutAction } from '@/app/accedi/actions'
import CardUploadForm from './CardUploadForm'

export const dynamic = 'force-dynamic'

function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button type="submit" className="w-full text-sm text-white/40 hover:text-white/70 py-2 transition-colors">
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
      <div className="max-w-sm mx-auto px-4 pt-20 pb-10 text-center space-y-4">
        <p className="text-sm text-white/60">Nessun profilo collegato. Contatta l&apos;admin.</p>
        <SignOutButton />
      </div>
    )
  }

  // In attesa: la card del giocatore richiesto non e' ancora sua, si mostra solo il nome
  if (account.status !== 'approved') {
    return (
      <div className="max-w-sm mx-auto px-4 pt-20 pb-10 space-y-3">
        <div className="glass rounded-2xl p-4 text-center space-y-1">
          <div className="text-sm text-white/60">In attesa di conferma dall&apos;admin</div>
          <div className="text-xs text-white/40">Richiesta per: <span className="font-bold text-white/70">{player.name}</span></div>
        </div>
        <SignOutButton />
      </div>
    )
  }

  let motmCount = 0
  try {
    motmCount = (await getMotmCounts())[player.id] ?? 0
  } catch (e) {
    console.error('MOTM counts failed', e)
  }

  return (
    <div className="max-w-sm mx-auto px-4 pt-20 pb-10">
      <div className="flex flex-col items-center gap-4">
        <PlayerCard player={player} width={200} />
        <h1 className="text-xl font-black">{player.name}</h1>
        {motmCount >= 1 && <MotmCounter count={motmCount} />}
      </div>

      <div className="mt-6 space-y-3">
        <CardUploadForm />
        <Link href={`/players/${player.id}`} className="block text-center text-sm text-brand py-2">
          Vai al tuo profilo giocatore
        </Link>
        <SignOutButton />
      </div>
    </div>
  )
}
