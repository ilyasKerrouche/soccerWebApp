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
    <header className="pt-5 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[26px] font-bold tracking-[-0.02em] leading-tight truncate">{title}</h1>
        {eyebrow && <div className="text-[12px] text-muted mt-0.5">{eyebrow}</div>}
      </div>
      {aside && <div className="flex-shrink-0 pb-1">{aside}</div>}
    </header>
  )
}
