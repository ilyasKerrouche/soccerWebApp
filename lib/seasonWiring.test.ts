import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// La stagione scelta vale per tutta l'app: anche passando dal dettaglio di una partita
// i link devono portarsi dietro ?stagione= (SeasonLink, non Link).
const SEASON_LINKS: [string, RegExp][] = [
  ['components/MatchCard.tsx', /<SeasonLink href=\{`\/matches\/\$\{match\.id\}`\}/],
  ['components/NextMatchCard.tsx', /<SeasonLink href=\{href\}/],
  ['app/players/[id]/page.tsx', /<SeasonLink key=\{m\.id\} href=\{`\/matches\/\$\{m\.id\}`\}/],
  ['app/matches/[id]/page.tsx', /<SeasonLink\s+key=\{mp\.player_id\}\s+href=\{`\/players\/\$\{mp\.player_id\}`\}/],
]
for (const [file, re] of SEASON_LINKS) {
  test(`${file}: i link portano la stagione`, () => {
    assert.match(readFileSync(file, 'utf8'), re)
  })
}

// Un errore di Supabase non deve diventare "Stagione al via" (e restare in cache 60 secondi):
// le letture che decidono lo stato vuoto devono lanciare l'errore, che unstable_cache non salva.
test('getGlobalStats non ignora gli errori di Supabase', () => {
  const src = readFileSync('lib/queries/stats.ts', 'utf8')
  const fn = src.slice(src.indexOf('export async function getGlobalStats'), src.indexOf('export async function getRecentGoalsPerMatch'))
  assert.match(fn, /error: matchesErr \}[\s\S]*if \(matchesErr\) throw/)
  assert.match(fn, /error: playersErr \}[\s\S]*if \(playersErr\) throw/)
})

test('getPlayerProfile non scambia un errore per "nessuna partita"', () => {
  const src = readFileSync('lib/queries/players.ts', 'utf8')
  const fn = src.slice(src.indexOf('export async function getPlayerProfile'), src.indexOf('export async function getGoalkeeperRanking'))
  assert.match(fn, /error: mpErr \}[\s\S]*if \(mpErr\) throw/)
  assert.match(fn, /error: matchErr \}[\s\S]*if \(matchErr\) throw/)
})

test('la Home non mostra "stagione al via" se i numeri non arrivano', () => {
  assert.match(readFileSync('app/page.tsx', 'utf8'), /cachedGlobalStats\(season\)\.catch\(/)
})

// Come la Home, /profilo mostra la stagione in corso: va detto, e a zero partite va spiegato.
test('/profilo dice di che stagione sono i numeri', () => {
  const src = readFileSync('app/profilo/page.tsx', 'utf8')
  assert.match(src, /`Stagione \$\{season\}`/)
  assert.match(src, /Nessuna partita in questa stagione/)
})
