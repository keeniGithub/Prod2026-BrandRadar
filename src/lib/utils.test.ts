import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cn, generateClientId } from './utils'

// ── cn() ──────────────────────────────────────────────────────────────────────

describe('cn()', () => {
  it('returns an empty string when called with no arguments', () => {
    expect(cn()).toBe('')
  })

  it('concatenates plain class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('ignores falsy values', () => {
    expect(cn('foo', false, null, undefined, 'bar')).toBe('foo bar')
  })

  it('handles conditional objects', () => {
    expect(cn({ active: true, hidden: false })).toBe('active')
  })

  it('merges conflicting Tailwind classes (last one wins)', () => {
    // tailwind-merge resolves p-2 vs p-4 — the later value should win
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('merges arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })
})

// ── generateClientId() ────────────────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const FALLBACK_REGEX = /^fallback-\d+-[0-9a-f]+$/

describe('generateClientId()', () => {
  it('returns a RFC-4122 v4 UUID when crypto.randomUUID is available', () => {
    const id = generateClientId()
    expect(id).toMatch(UUID_REGEX)
  })

  it('returns a valid UUID via getRandomValues when randomUUID is absent', () => {
    const original = globalThis.crypto.randomUUID
    // @ts-expect-error intentionally removing randomUUID
    delete globalThis.crypto.randomUUID

    const id = generateClientId()
    expect(id).toMatch(UUID_REGEX)

    globalThis.crypto.randomUUID = original
  })

  it('returns a fallback id when both crypto methods are unavailable', () => {
    const saved = globalThis.crypto
    Object.defineProperty(globalThis, 'crypto', { value: {}, configurable: true, writable: true })

    const id = generateClientId()
    expect(id).toMatch(FALLBACK_REGEX)

    Object.defineProperty(globalThis, 'crypto', { value: saved, configurable: true, writable: true })
  })

  it('generates unique ids on successive calls', () => {
    const ids = new Set(Array.from({ length: 20 }, generateClientId))
    expect(ids.size).toBe(20)
  })
})
