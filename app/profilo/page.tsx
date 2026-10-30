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
        <h1 className="text-xl font-black">Nessun profilo collegato</h1>
        <p className="text-sm text-white/40">Questo account non è collegato a nessun giocatore.</p>
        <Link href="/registrati" className="text-brand text-sm block">Registrati come giocatore</Link>
        <SignOutButton />
      </div>
    )
  }

  const approved = account.status === 'approved'
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
        {approved ? (
          <>
            <CardUploadForm />
            <Link href={`/players/${player.id}`} className="block text-center text-sm text-brand py-2">
              Vai al tuo profilo giocatore
            </Link>
          </>
        ) : (
          <div className="glass rounded-2xl p-4 text-center text-sm text-white/60">
            In attesa di conferma dall&apos;admin
          </div>
        )}
        <SignOutButton />
      </div>
    </div>
  )
}
