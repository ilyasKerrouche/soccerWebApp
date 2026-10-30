'use client'

type Props = {
  date: string // YYYY-MM-DD
  title?: string
}

export default function AddToCalendar({ date, title = 'Calcetto' }: Props) {
  const download = () => {
    const d = date.replace(/-/g, '')
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Calcetto//IT',
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${d}`,
      `DTEND;VALUE=DATE:${d}`,
      `SUMMARY:${title}`,
      `UID:${d}-calcetto@app`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    // data: URI funziona meglio su iOS Safari — apre direttamente l'app Calendario
    window.location.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics)
  }

  return (
    <button
      onClick={download}
      className="flex items-center gap-1.5 text-[12px] font-semibold transition-opacity hover:opacity-80"
      style={{ color: '#5b9cff' }}
    >
      📅 Aggiungi al calendario
    </button>
  )
}
