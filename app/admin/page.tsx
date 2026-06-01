import Link from 'next/link'
import { getAllMatches } from '@/lib/queries/matches'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const matches = await getAllMatches()
  const played = matches.filter((m) => !m.is_upcoming)
  const upcoming = matches.filter((m) => m.is_upcoming)

  async function logout() {
    'use server'
    cookies().delete('calc_admin')
    redirect('/admin/login')
  }

  return (
    <main className="pb-8">
      {/* Header */}
      <div className="relative overflow-hidden px-4 pt-10 pb-7" style={{ background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%)' }}>
        <div className="absolute -top-10 -right-8 w-44 h-44 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(167,139,250,.4) 0%,transparent 70%)' }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[3px] uppercase text-white/40 mb-1">Pannello</div>
            <h1 className="text-2xl font-black">Admin ⚙️</h1>
            <div className="text-xs text-white/40 mt-1">{played.length} partite · {upcoming.length} in programma</div>
          </div>
          <form action={logout}>
            <button className="text-xs font-bold px-4 py-2 rounded-xl border border-red-500/25 text-red-400 transition-colors hover:bg-red-500/10" style={{ background: 'rgba(239,68,68,0.07)' }}>
              Esci
            </button>
          </form>
        </div>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/admin/matches/new"
            className="flex items-center justify-center gap-2 font-black py-4 rounded-2xl text-sm transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6366f1)', color: 'white' }}
          >
            ➕ Nuova partita
          </Link>
          <Link
            href="/admin/players"
            className="flex items-center justify-center gap-2 font-black py-4 rounded-2xl text-sm transition-opacity hover:opacity-90 border border-white/10"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
          >
            👥 Giocatori
          </Link>
        </div>

        {upcoming.length > 0 && (
          <section>
            <div className="text-[10px] tracking-[2px] uppercase text-white/30 mb-2 font-bold">In programma</div>
            <div className="flex flex-col gap-2">
              {upcoming.map((m) => {
                const date = new Date(m.played_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
                return (
                  <div key={m.id} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="flex-1">
                      <span className="inline-block text-[10px] bg-brand/15 text-brand px-2 py-0.5 rounded-full mr-2 font-bold">📅 Upcoming</span>
                      <span className="text-sm font-semibold">{date}</span>
                    </div>
                    <Link href={`/admin/matches/${m.id}`} className="text-xs font-bold px-3 py-1.5 rounded-lg border border-brand/25 text-brand hover:bg-brand/10 transition-colors">
                      Modifica
                    </Link>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <section>
          <div className="text-[10px] tracking-[2px] uppercase text-white/30 mb-2 font-bold">Storico partite</div>
          <div className="flex flex-col gap-2">
            {played.map((m) => {
              const date = new Date(m.played_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })
              const aWins = (m.score_a ?? 0) > (m.score_b ?? 0)
              return (
                <div key={m.id} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-3">
                    <div className="text-sm font-black">
                      <span className={aWins ? 'text-win' : 'text-white/50'}>{m.score_a}</span>
                      <span className="text-white/20 mx-1.5">–</span>
                      <span className={!aWins ? 'text-win' : 'text-white/50'}>{m.score_b}</span>
                    </div>
                    <span className="text-xs text-white/35">{date}</span>
                  </div>
                  <Link href={`/admin/matches/${m.id}`} className="text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/20 transition-colors">
                    Modifica
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
