// lib/holoLayout.ts
// Modulo puro: dove mettere i giocatori sul campo-ologramma della home.
// Coordinate in percentuale del campo: x da sinistra, y dall'alto. La squadra a gioca nella meta' bassa.

export type Slot = { x: number; y: number }

const GK_RE = /^(gk|por|portiere|p)$/i

export function isGoalkeeper(position: string | null): boolean {
  return position !== null && GK_RE.test(position.trim())
}

/** Uno slot per giocatore, nello stesso ordine dell'input. */
export function holoSlots(positions: (string | null)[], side: 'a' | 'b'): Slot[] {
  const gkIndex = positions.findIndex(isGoalkeeper)
  const outfield = positions.map((_, i) => i).filter((i) => i !== gkIndex)

  // File da due, dalla difesa verso il centrocampo
  const rows = Math.ceil(outfield.length / 2)
  const back = gkIndex >= 0 ? 76 : 86
  const front = 58
  const step = rows > 1 ? (back - front) / (rows - 1) : 0

  const slots: Slot[] = new Array(positions.length)
  if (gkIndex >= 0) slots[gkIndex] = { x: 50, y: 92 }
  outfield.forEach((idx, k) => {
    const row = Math.floor(k / 2)
    const alone = k === outfield.length - 1 && k % 2 === 0
    slots[idx] = { x: alone ? 50 : k % 2 === 0 ? 28 : 72, y: Math.round(back - row * step) }
  })

  return side === 'a' ? slots : slots.map((s) => ({ x: 100 - s.x, y: 100 - s.y }))
}
