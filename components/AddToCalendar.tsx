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

    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'calcetto.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={download}
      className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
      style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa' }}
    >
      📆 Aggiungi al calendario
    </button>
  )
}
