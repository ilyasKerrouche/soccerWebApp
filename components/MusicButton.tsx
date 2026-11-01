'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MUSIC_PREF_KEY, MUSIC_SRC, MUSIC_VOLUME, parseMusicPref, shouldAutostart, type MusicPref } from '@/lib/music'

function readPref(): MusicPref {
  try { return parseMusicPref(localStorage.getItem(MUSIC_PREF_KEY)) } catch { return 'on' }
}
function writePref(p: MusicPref) {
  try { localStorage.setItem(MUSIC_PREF_KEY, p) } catch { /* senza storage vale solo per questa visita */ }
}

/**
 * Musica di sottofondo in loop. I browser (Safari soprattutto) non fanno partire l'audio senza un gesto:
 * parte al primo tocco ovunque nell'app. Vive nella barra in alto, quindi continua tra una pagina e l'altra.
 */
export default function MusicButton() {
  const pathname = usePathname()
  const pathRef = useRef(pathname)
  pathRef.current = pathname
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [playing, setPlaying] = useState(false)

  // Il file si scarica solo quando serve, non all'apertura
  const audio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio(MUSIC_SRC)
      a.loop = true
      // Su iPhone audio.volume e' ignorato: il volume passa da un GainNode di Web Audio
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (Ctx) {
        const ctx = new Ctx()
        const gain = ctx.createGain()
        gain.gain.value = MUSIC_VOLUME
        ctx.createMediaElementSource(a).connect(gain).connect(ctx.destination)
        ctxRef.current = ctx
      } else {
        a.volume = MUSIC_VOLUME
      }
      a.addEventListener('play', () => setPlaying(true))
      a.addEventListener('pause', () => setPlaying(false))
      audioRef.current = a
    }
    return audioRef.current
  }, [])
  // Il contesto audio nasce sospeso o si sospende in secondo piano: va ripreso a ogni avvio
  const play = useCallback(() => {
    const a = audio()
    ctxRef.current?.resume().catch(() => {})
    return a.play()
  }, [audio])

  useEffect(() => {
    // Gesti che per i browser "attivano" la pagina; pointerdown da touch non basta su iPhone
    const EVENTS = ['click', 'touchend', 'keydown'] as const
    const stop = () => EVENTS.forEach((e) => document.removeEventListener(e, onFirstGesture, true))
    function onFirstGesture(e: Event) {
      // Il tocco sul pulsante lo gestisce il pulsante stesso
      if (buttonRef.current?.contains(e.target as Node)) return stop()
      if (!shouldAutostart(readPref(), pathRef.current)) return
      // Se il browser rifiuta (es. touchend dopo uno scroll) si riprova al gesto successivo
      play().then(stop).catch(() => {})
    }
    EVENTS.forEach((e) => document.addEventListener(e, onFirstGesture, true))
    return stop
  }, [play])

  useEffect(() => {
    // Telefono bloccato o app in secondo piano: silenzio, poi riprende se stava suonando
    let resume = false
    const onVis = () => {
      const a = audioRef.current
      if (!a) return
      if (document.hidden) { resume = !a.paused; a.pause() }
      else if (resume) play().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [play])

  useEffect(() => () => { audioRef.current?.pause() }, [])

  function toggle() {
    const a = audio()
    if (a.paused) {
      writePref('on')
      play().catch(() => {})
    } else {
      writePref('off')
      a.pause()
    }
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggle}
      aria-label={playing ? 'Metti in pausa la musica' : 'Fai partire la musica'}
      aria-pressed={playing}
      className="w-8 h-8 flex items-center justify-center rounded-full text-[15px] transition-opacity hover:opacity-80"
      style={{ color: playing ? '#5b9cff' : '#8a96a8' }}
    >
      <span aria-hidden>{playing ? '🔊' : '🔇'}</span>
    </button>
  )
}
