import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseMusicPref, shouldAutostart } from './music.ts'

test('preferenza: solo "off" spegne, tutto il resto vale acceso', () => {
  assert.equal(parseMusicPref('off'), 'off')
  assert.equal(parseMusicPref('on'), 'on')
  assert.equal(parseMusicPref(null), 'on')
  assert.equal(parseMusicPref('boh'), 'on')
})

test('parte da sola solo se non spenta e fuori dall admin', () => {
  assert.equal(shouldAutostart('on', '/'), true)
  assert.equal(shouldAutostart('on', '/matches/123'), true)
  assert.equal(shouldAutostart('off', '/'), false)
  assert.equal(shouldAutostart('on', '/admin'), false)
  assert.equal(shouldAutostart('on', '/admin/accounts'), false)
  assert.equal(shouldAutostart('on', '/administrator'), true)
})
