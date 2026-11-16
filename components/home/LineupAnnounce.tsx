'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import PlayerCard from '@/components/PlayerCard'
import { formatRomeDay, formatRomeTime, matchPhase } from '@/lib/homeText'
import { announceKey, announceOrder, fanSpacing, roleLabel, shouldAnnounce } from '@/lib/lineupAnnounce'
import { overlayOpened, whenNoOverlay } from '@/lib/overlay'
import type { MatchWithPlayers, Player } from '@/lib/types'

type Props = {
  match: MatchWithPlayers
  /** Cambia a ogni tocco di "Rivedi formazioni": riapre l'annuncio. 0 = mai chiesto. */
  replay: number
}

type Team = { key: 'a' | 'b'; name: string; color: string; players: Player[] }
type Step = 'intro' | 'a' | 'b' | 'final'

// Parte dopo che la home si e' disegnata e dopo l'eventuale momento MOTM (che parte a 500ms)
const START_DELAY_MS = 900
// Colori di presentazione delle due squadre: solo per questo annuncio
const TEAM_COLORS = { a: '#5b9cff', b: '#ff8a4c' } as const
const GOLD = '#f5c451'
// Quanto e' rimpicciolita una card nel ventaglio rispetto alla card grande, e quando si alza
const FAN_SCALE = 0.56
const LIFT_SCALE = 0.74
const EASE = 'cubic-bezier(.2,.8,.25,1)'
// Tempi in ms
const T = { intro: 2400, introOut: 350, teamIn: 700, deal: 110, lift: 200, hold: 260, fly: 380, teamOut: 500 }

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const anim = (el: Element | null | undefined, frames: Keyframe[], duration: number, opts: KeyframeAnimationOptions = {}) =>
  el ? el.animate(frames, { duration, easing: EASE, fill: 'both', ...opts }).finished.then(() => {}, () => {}) : Promise.resolve()

/**
 * Annuncio delle formazioni: quando la prossima partita ha le due squadre, alla prima apertura della home
 * parte una presentazione da diretta TV (sigla, una squadra alla volta a ventaglio, formazioni schierate).
 * Una volta sola per partita e per telefono; tocco per saltare. Deciso nel client: la home e' uguale per tutti.
 */
export default function LineupAnnounce({ match, replay }: Props) {
  const [open, setOpen] = useState<{ n: number; instant: boolean } | null>(null)
  const teams = useMemo<Team[]>(() => (['a', 'b'] as const).map((key) => ({
    key,
    name: key === 'a' ? match.team_a_name : match.team_b_name,
    color: TEAM_COLORS[key],
    players: announceOrder(match.match_players.filter((mp) => mp.team === key).map((mp) => mp.player)),
  })), [match])
  const [countA, countB] = [teams[0].players.length, teams[1].players.length]

  // Prima volta: parte da sola
  useEffect(() => {
    let seen = false
    try { seen = localStorage.getItem(announceKey(match.id)) !== null } catch { /* senza storage: si mostra */ }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const phase = matchPhase({ date: match.played_at, start: match.match_time, end: match.match_end_time }, new Date())
    if (!shouldAnnounce({ teamA: countA, teamB: countB, phase, seen, reducedMotion })) return

    let cancel = () => {}
    const id = setTimeout(() => {
      // Se e' aperto il momento MOTM, l'annuncio aspetta che venga chiuso
      cancel = whenNoOverlay(() => {
        setOpen({ n: 0, instant: false })
        // Segnato subito: anche chi chiude l'app a meta' non lo rivede
        try { localStorage.setItem(announceKey(match.id), '1') } catch {}
      })
    }, START_DELAY_MS)
    return () => { clearTimeout(id); cancel() }
  }, [match.id, match.played_at, match.match_time, match.match_end_time, countA, countB])

  // "Rivedi formazioni": con "riduci movimento" si va dritti alle formazioni schierate
  useEffect(() => {
    if (replay === 0) return
    setOpen({ n: replay, instant: window.matchMedia('(prefers-reduced-motion: reduce)').matches })
  }, [replay])

  if (!open || countA === 0 || countB === 0) return null
  return createPortal(
    <Show key={open.n} match={match} teams={teams} instant={open.instant} onClose={() => setOpen(null)} />,
    document.body,
  )
}

function Show({ match, teams, instant, onClose }: { match: MatchWithPlayers; teams: Team[]; instant: boolean; onClose: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<Step>(instant ? 'final' : 'intro')
  // Giocatore in evidenza nel ventaglio, e quante card sono gia' arrivate nella fila in basso
  const [cur, setCur] = useState(-1)
  const [landed, setLanded] = useState(0)
  // Misure prese una volta all'apertura: il componente esiste solo nel browser
  const [dims] = useState(() => {
    const w = Math.min(window.innerWidth, 430)
    return {
      w,
      card: Math.max(140, Math.min(210, Math.round(window.innerHeight * 0.27))),
      slot: Math.floor((w - 28 - 5 * 8) / 6),
      final: Math.floor((w - 28 - 22 - 5 * 6) / 6),
    }
  })
  const team = step === 'a' ? teams[0] : step === 'b' ? teams[1] : null
  const color = team?.color ?? (step === 'final' ? GOLD : TEAM_COLORS.a)

  // Finche' e' aperto lo segnala: l'avviso record aspetta la chiusura
  useEffect(() => overlayOpened(), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // La sequenza di ogni passo; cambiando passo (o saltando) le animazioni in corso vengono fermate
  useEffect(() => {
    const el = root.current
    if (!el) return
    let alive = true
    const q = (sel: string) => Array.from(el.querySelectorAll<HTMLElement>(sel))
    const next = (s: Step) => { setCur(-1); setLanded(0); setStep(s) }

    const run = async () => {
      if (step === 'intro') {
        anim(q('[data-la="bar"]')[0], [{ width: '0px' }, { width: '120px' }], 500, { delay: 150 })
        q('[data-la="in"]').forEach((x, i) => anim(x, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], 450, { delay: 120 + i * 140 }))
        await sleep(T.intro + T.introOut)
        if (alive) next('a')
        return
      }
      if (step === 'final') {
        if (instant) return
        q('[data-la="fc"]').forEach((x, i) => anim(x, [{ opacity: 0, transform: 'translateY(16px) scale(.9)' }, { opacity: 1, transform: 'none' }], 380, { delay: 150 + i * 60 }))
        return
      }

      // Una squadra: fascia col nome, card distribuite a ventaglio, ognuna si alza a turno, poi tutte in fila in basso
      const bigs = q('[data-la="big"]')
      const n = bigs.length
      const mid = (n - 1) / 2
      const sp = fanSpacing(dims.w, n, dims.card * LIFT_SCALE)
      const base = (i: number) => `translateX(${(i - mid) * sp}px) translateY(${Math.abs(i - mid) * 7}px) rotate(${(i - mid) * 8}deg) scale(${FAN_SCALE})`
      const lifted = (i: number) => `translateX(${(i - mid) * sp}px) translateY(-34px) rotate(0deg) scale(${LIFT_SCALE})`
      const plate = q('[data-la="plate"]')[0]

      anim(q('[data-la="wipe"]')[0], [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 450)
      anim(q('[data-la="tname"]')[0], [{ opacity: 0, transform: 'translateX(-24px)' }, { opacity: 1, transform: 'none' }], 450, { delay: 150 })
      await sleep(T.teamIn); if (!alive) return

      bigs.forEach((b, i) => anim(b, [{ opacity: 0, transform: `translateY(460px) rotate(${(i - mid) * -20}deg) scale(${FAN_SCALE})` }, { opacity: 1, transform: base(i) }], 480, { delay: i * T.deal }))
      await sleep(n * T.deal + 400); if (!alive) return

      for (let i = 0; i < n; i++) {
        setCur(i)
        anim(plate, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], 200)
        bigs[i].style.zIndex = '50'
        await anim(bigs[i], [{ transform: base(i) }, { transform: lifted(i) }], T.lift); if (!alive) return
        await sleep(T.hold); if (!alive) return
        anim(bigs[i], [{ transform: lifted(i) }, { transform: base(i) }], T.lift)
        bigs[i].style.zIndex = String(i)
      }
      anim(plate, [{ opacity: 1 }, { opacity: 0 }], 200)
      await sleep(300); if (!alive) return

      // Dal centro del riquadro grande al proprio posto nella fila
      const spot = q('[data-la="spot"]')[0].getBoundingClientRect()
      const slots = q('[data-la="slot"]')
      await Promise.all(bigs.map((b, i) => {
        const to = slots[i].getBoundingClientRect()
        const dx = to.left + to.width / 2 - (spot.left + spot.width / 2)
        const dy = to.top + to.height / 2 - (spot.top + spot.height / 2)
        return anim(b, [{ transform: base(i) }, { transform: `translate(${dx}px,${dy}px) scale(${to.width / spot.width})` }], T.fly, { delay: i * 40, easing: 'cubic-bezier(.5,0,.2,1)' })
          .then(() => { if (alive) setLanded((c) => Math.max(c, i + 1)) })
      }))
      await sleep(T.teamOut)
      if (alive) next(step === 'a' ? 'b' : 'final')
    }
    run()
    // Solo i movimenti avviati qui sopra: le animazioni CSS (righe di sfondo, dissolvenze) continuano
    return () => { alive = false; el.getAnimations({ subtree: true }).forEach((a) => { if (!(a instanceof CSSAnimation)) a.cancel() }) }
  }, [step, dims, instant])

  const time = formatRomeTime(match.match_time)
  const when = [formatRomeDay(match.played_at), time].filter(Boolean).join(' · ')
  const shown = team && cur >= 0 ? team.players[cur] : null

  return (
    <div
      ref={root}
      className="la"
      role="dialog"
      aria-label={`Formazioni ufficiali: ${match.team_a_name} contro ${match.team_b_name}`}
      style={{ background: `radial-gradient(120% 60% at 50% 0%, ${color}42, transparent 70%), linear-gradient(#0a101b, #0d1420)` }}
      onClick={() => { if (step !== 'final') { setCur(-1); setLanded(0); setStep('final') } }}
    >
      <div className="la-lines" aria-hidden />
      <div className="la-frame" style={{ maxWidth: dims.w }}>
        {step !== 'final' && <div className="la-skip">Tocca per saltare</div>}

        {step === 'intro' && (
          <div className="la-intro numeric">
            <div data-la="in" className="la-kick">FORMAZIONI UFFICIALI</div>
            <div data-la="bar" className="la-bar" />
            <div data-la="in" className="la-tn">{match.team_a_name}</div>
            <div data-la="in" className="la-vs">VS</div>
            <div data-la="in" className="la-tn">{match.team_b_name}</div>
            <div data-la="in" className="la-when">{when}</div>
          </div>
        )}

        {team && (
          <div key={team.key} className="la-team">
            <div className="la-head numeric">
              <div data-la="wipe" className="la-wipe" style={{ background: `linear-gradient(90deg, ${team.color}, ${team.color}59)` }} />
              <div data-la="tname" className="relative">
                <div className="la-lbl">FORMAZIONE</div>
                <div className="la-name">{team.name}</div>
              </div>
            </div>
            <div data-la="spot" className="la-spot" style={{ width: dims.card, height: Math.round(dims.card / 0.72) }}>
              {team.players.map((p, i) => (
                <div key={p.id} data-la="big" className="la-big card-shield" style={{ opacity: 0, zIndex: i, visibility: i < landed ? 'hidden' : undefined }}>
                  <PlayerCard player={p} width={dims.card} eager />
                </div>
              ))}
            </div>
            <div data-la="plate" className="la-plate numeric" style={{ opacity: 0 }}>
              <div className="la-num" style={{ color: team.color }}>
                {shown ? `${String(cur + 1).padStart(2, '0')} / ${String(team.players.length).padStart(2, '0')}` : ' '}
              </div>
              <div className="la-pn">{shown?.name ?? ' '}</div>
              <div className="la-role" style={{ color: team.color, background: `${team.color}33`, visibility: shown && roleLabel(shown.position) ? 'visible' : 'hidden' }}>
                {shown ? roleLabel(shown.position) || '–' : '–'}
              </div>
            </div>
            <div className="la-strip" style={{ gridTemplateColumns: `repeat(6, ${dims.slot}px)` }}>
              {team.players.map((p, i) => (
                <div key={p.id} data-la="slot" className="la-slot card-shield" style={{ width: dims.slot, height: Math.round(dims.slot / 0.72) }}>
                  {i < landed && <PlayerCard player={p} width={dims.slot} eager />}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'final' && (
          <div className="la-final" onClick={(e) => e.stopPropagation()}>
            <div className="la-kick numeric text-center">FORMAZIONI UFFICIALI</div>
            <div className="la-rows">
              {teams.map((t) => (
                <div key={t.key} className="la-trow" style={{ borderTopColor: t.color }}>
                  <div className="la-tname numeric">{t.name}</div>
                  <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(6, ${dims.final}px)` }}>
                    {t.players.map((p) => (
                      <div key={p.id} data-la="fc" className="card-shield" style={{ opacity: instant ? 1 : 0 }}>
                        <PlayerCard player={p} width={dims.final} eager />
                        <div className="la-fnm">{p.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="la-btns">
              <button type="button" className="la-b2" onClick={onClose}>Chiudi</button>
              <Link href={`/matches/${match.id}`} className="la-b1" onClick={onClose}>Vedi sul campo</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
