// lib/plural.ts
/** "1 giocatore", "3 giocatori": il numero con la parola al singolare o al plurale. */
export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}
