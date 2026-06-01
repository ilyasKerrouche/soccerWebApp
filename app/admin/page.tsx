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
    <main className="px-4 pb-8">
      <div className="pt-7 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">⚙️ Admin</h1>
          <div className="text-xs text-white/35 mt-1">
            {played.length} partite · {upcoming.length} in programma
          </div>
        </div>
        <form action={logout}>
          <button className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full">
            Logout
          </button>
        </form>
      </div>

      <Link
        href="/admin/matches/new"
        className="flex items-center justify-center gap-2 w-full bg-brand text-black font-black py-4 rounded-2xl text-base hover:bg-green-400 transition-colors mb-6"
      >
        ➕ Nuova partita
      </Link>

      {upcoming.length > 0 && (
        <>
          <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2 font-bold">
            In programma
          </div>
          <div className="flex flex-col gap-2 mb-5">
            {upcoming.map((m) => {
              const date = new Date(m.played_at).toLocaleDateString('it-IT', {
                day: 'numeric', month: 'long', year: 'numeric',
              })
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 bg-white/4 border border-white/7 rounded-xl px-4 py-3"
                >
                  <div className="flex-1">
                    <span className="text-[10px] bg-white/10 text-white/50 px-2 py-0.5 rounded-full mr-2">
                      📅
                    </span>
                    <span className="text-sm font-semibold">{date}</span>
                  </div>
                  <Link
                    href={`/admin/matches/${m.id}`}
                    className="text-xs text-white/50 hover:text-white border border-white/10 px-3 py-1 rounded-lg"
                  >
                    Modifica
                  </Link>
                </div>
              )
            })}
          </div>
        </>
      )}

      <div className="text-[10px] tracking-widest uppercase text-white/30 mb-2 font-bold">
        Storico partite
      </div>
      <div className="flex flex-col gap-2">
        {played.map((m) => {
          const date = new Date(m.played_at).toLocaleDateString('it-IT', {
            day: 'numeric', month: 'long',
          })
          const aWins = (m.score_a ?? 0) > (m.score_b ?? 0)
          return (
            <div
              key={m.id}
              className="flex items-center gap-3 bg-white/4 border border-white/7 rounded-xl px-4 py-3"
            >
              <div className="flex-1">
                <span className="text-sm font-black">
                  <span className={aWins ? 'text-brand' : 'text-white/60'}>{m.score_a}</span>
                  <span className="text-white/20 mx-1">–</span>
                  <span className={!aWins ? 'text-brand' : 'text-white/60'}>{m.score_b}</span>
                </span>
                <span className="text-xs text-white/35 ml-2">{date}</span>
              </div>
              <Link
                href={`/admin/matches/${m.id}`}
                className="text-xs text-white/50 hover:text-white border border-white/10 px-3 py-1 rounded-lg"
              >
                Modifica
              </Link>
            </div>
          )
        })}
      </div>
    </main>
  )
}
