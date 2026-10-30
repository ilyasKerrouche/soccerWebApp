// lib/cardFile.ts
const MAX_BYTES = 5 * 1024 * 1024
const EXT_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

// L'estensione deriva dal MIME validato, mai dal nome file scelto dall'utente.
export function cardExtension(type: string): string | null {
  return EXT_BY_TYPE[type] ?? null
}

export function cardFileError(f: { type: string; size: number }): string | null {
  if (f.size === 0) return 'Nessun file selezionato'
  if (!cardExtension(f.type)) return 'Formato non supportato (usa PNG, JPG o WEBP)'
  if (f.size > MAX_BYTES) return 'File troppo grande (max 5 MB)'
  return null
}
