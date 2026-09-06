/**
 * Intestazione comune a tutte le schermate: contesto piccolo sopra, titolo
 * grande sotto. Sostituisce gli hero sfumati, che davano a ogni pagina un
 * blocco colorato in cima senza aggiungere informazione.
 */
export default function PageHeader({
  eyebrow,
  title,
  aside,
}: {
  eyebrow?: string
  title: string
  aside?: React.ReactNode
}) {
  return (
    <header className="pt-7 pb-1 flex items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <div className="text-[13px] text-white/35">{eyebrow}</div>}
        <h1 className="text-[30px] font-bold tracking-[-0.02em] leading-none mt-1 truncate">{title}</h1>
      </div>
      {aside && <div className="flex-shrink-0 pb-1">{aside}</div>}
    </header>
  )
}
