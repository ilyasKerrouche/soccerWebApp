import Link from 'next/link'
import { listPendingAccounts, listApprovedAccounts } from '@/lib/queries/accounts'
import { PendingButtons, LinkedButtons } from './AccountButtons'

export const dynamic = 'force-dynamic'

export default async function AdminAccountsPage() {
  const [pending, approved] = await Promise.all([listPendingAccounts(), listApprovedAccounts()])

  return (
    <main className="pb-8">
      <div className="px-4 pt-10 pb-5">
        <Link href="/admin" className="text-xs text-white/40 hover:text-white">← Admin</Link>
        <h1 className="text-2xl font-black mt-2">Account giocatori 🔑</h1>
      </div>

      <div className="px-4 flex flex-col gap-5">
        <section>
          <div className="text-[10px] tracking-[2px] uppercase text-white/30 mb-2 font-bold">In attesa ({pending.length})</div>
          <div className="flex flex-col gap-2">
            {pending.length === 0 && <div className="text-xs text-white/30">Nessuna richiesta in attesa</div>}
            {pending.map(a => (
              <div key={a.user_id} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {a.player.name}
                    <span className="ml-2 text-[10px] bg-brand/15 text-brand px-2 py-0.5 rounded-full font-bold">
                      {a.is_new_player ? 'Nuovo' : 'Esistente'}
                    </span>
                  </div>
                  <div className="text-xs text-white/40 truncate">{a.email}</div>
                </div>
                <PendingButtons userId={a.user_id} />
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="text-[10px] tracking-[2px] uppercase text-white/30 mb-2 font-bold">Collegati ({approved.length})</div>
          <div className="flex flex-col gap-2">
            {approved.length === 0 && <div className="text-xs text-white/30">Nessun account collegato</div>}
            {approved.map(a => (
              <div key={a.user_id} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{a.player.name}</div>
                  <div className="text-xs text-white/40 truncate">{a.email}</div>
                </div>
                <LinkedButtons userId={a.user_id} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
