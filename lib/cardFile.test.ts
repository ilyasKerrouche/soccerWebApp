import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cardFileError, cardExtension } from './cardFile.ts'

test('cardFileError accepts a valid png', () => {
  assert.equal(cardFileError({ type: 'image/png', size: 1024 * 1024 }), null)
})

test('cardFileError rejects unsupported types', () => {
  assert.equal(
    cardFileError({ type: 'image/gif', size: 1000 }),
    'Formato non supportato (usa PNG, JPG o WEBP)'
  )
})

test('cardFileError rejects files over 5 MB', () => {
  assert.equal(
    cardFileError({ type: 'image/jpeg', size: 5 * 1024 * 1024 + 1 }),
    'File troppo grande (max 5 MB)'
  )
})

test('cardFileError rejects empty files', () => {
  assert.equal(cardFileError({ type: 'image/png', size: 0 }), 'Nessun file selezionato')
})

test('cardExtension derives the extension from the MIME type', () => {
  assert.equal(cardExtension('image/png'), 'png')
  assert.equal(cardExtension('image/jpeg'), 'jpg')
  assert.equal(cardExtension('image/webp'), 'webp')
  assert.equal(cardExtension('image/gif'), null)
})
