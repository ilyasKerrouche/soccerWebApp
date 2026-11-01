// Si rimonta a ogni cambio pagina: il contenuto entra con una breve dissolvenza (vedi .page-enter in globals.css)
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>
}
