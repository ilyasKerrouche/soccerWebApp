import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cardFileError, cardExtension, sniffImageType } from './cardFile.ts'

test('cardFileError accepts a valid png', () => {
  assert.equal(cardFileError({ type: 'image/png', size: 1024 * 1024 }), null)
})

test('cardFileError rejects unsupported types', () => {
  assert.equal(
    cardFileError({ type: 'image/gif', size: 1000 }),
    'Formato non supportato (usa PNG, JPG o WEBP)'
  )
})

test('cardFileError rejects files over 4 MB', () => {
  assert.equal(
    cardFileError({ type: 'image/jpeg', size: 4 * 1024 * 1024 + 1 }),
    'File troppo grande (max 4 MB)'
  )
})

test('cardFileError accepts a file of exactly 4 MB', () => {
  assert.equal(cardFileError({ type: 'image/webp', size: 4 * 1024 * 1024 }), null)
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

const bytes = (...a: number[]) => new Uint8Array(a)

test('sniffImageType recognises png, jpeg and webp signatures', () => {
  assert.equal(sniffImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0)), 'image/png')
  assert.equal(sniffImageType(bytes(0xff, 0xd8, 0xff, 0xe0)), 'image/jpeg')
  assert.equal(
    sniffImageType(bytes(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50)),
    'image/webp'
  )
})

test('sniffImageType rejects other content and detects a mismatch with the declared type', () => {
  assert.equal(sniffImageType(bytes(0x47, 0x49, 0x46, 0x38)), null)
  assert.equal(sniffImageType(bytes()), null)
  assert.equal(sniffImageType(bytes(0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x41, 0x56, 0x45)), null)
  // un JPEG dichiarato come PNG: i tipi non coincidono
  assert.notEqual(sniffImageType(bytes(0xff, 0xd8, 0xff)), 'image/png')
})
