import { describe, expect, it } from 'vitest'
import {
  diffFingerprints,
  docOwner,
  fingerprintFile,
  patchSearchDocs,
  planRefresh,
  routeFiles,
} from '../../scripts/lib/refresh'
import type { SearchDoc } from '../../shared/search'

const changed = (...keys: string[]) => ({ added: [], removed: [], changed: keys })

describe('fingerprintFile', () => {
  it('splits Markdown into frontmatter and body', () => {
    const a = fingerprintFile('content/x.md', '---\ntitle: A\n---\nbody')
    const b = fingerprintFile('content/x.md', '---\ntitle: A\n---\nother body')
    expect(Object.keys(a)).toEqual(['content/x.md#frontmatter', 'content/x.md#body'])
    expect(a['content/x.md#frontmatter']).toBe(b['content/x.md#frontmatter'])
    expect(a['content/x.md#body']).not.toBe(b['content/x.md#body'])
  })

  it('hashes other files whole', () => {
    expect(Object.keys(fingerprintFile('content/a.yml', 'x: 1'))).toEqual(['content/a.yml'])
  })
})

describe('diffFingerprints', () => {
  it('reports added, removed and changed keys', () => {
    expect(diffFingerprints({ a: '1', b: '1', c: '1' }, { a: '1', b: '2', d: '1' })).toEqual({
      added: ['d'],
      removed: ['c'],
      changed: ['b'],
    })
  })
})

describe('planRefresh', () => {
  it('does nothing when nothing changed', () => {
    expect(planRefresh(changed())).toEqual({ kind: 'none' })
  })

  it('refreshes a card page and the vocabulary for a card or forms edit', () => {
    expect(planRefresh(changed('content/dictionary/stad.yml', 'content/forms/kot.json'))).toEqual({
      kind: 'partial',
      cardIds: ['kot', 'stad'],
      routes: ['/slovo/kot', '/slovo/stad', '/vocabulary'],
      searchOwners: ['card:kot', 'card:stad'],
    })
  })

  it('refreshes one page for a lesson or cheatsheet body', () => {
    expect(
      planRefresh(
        changed('content/lessons/02-sounds/04-nasals.md#body', 'content/cheatsheet.md#body'),
      ),
    ).toEqual({
      kind: 'partial',
      cardIds: [],
      routes: ['/cheatsheet', '/lessons/02-sounds/04-nasals'],
      searchOwners: ['cheatsheet', 'lesson:/lessons/02-sounds/04-nasals'],
    })
  })

  it('refreshes a story with its index, and every book chapter for a book', () => {
    expect(planRefresh(changed('content/stories/kot-i-mysz.yml'))).toMatchObject({
      routes: ['/stories', '/stories/kot-i-mysz'],
      searchOwners: ['story:kot-i-mysz'],
    })
    expect(planRefresh(changed('content/books/b-02.yml'), ['b-01', 'b-02'])).toMatchObject({
      routes: ['/books', '/books/b-01', '/books/b-02'],
      searchOwners: [],
    })
  })

  it('falls back to a full build for anything shared across pages', () => {
    expect(planRefresh(changed('content/lessons/a/b.md#frontmatter'))).toEqual({
      kind: 'full',
      reason: 'content/lessons/a/b.md (frontmatter) changed',
    })
    expect(planRefresh(changed('content/words/nouns.yml'))).toMatchObject({ kind: 'full' })
    expect(planRefresh(changed('app/components/content/Pron.vue'))).toMatchObject({
      kind: 'full',
    })
    expect(
      planRefresh({ added: ['content/dictionary/nowy.yml'], removed: [], changed: [] }),
    ).toEqual({ kind: 'full', reason: 'content/dictionary/nowy.yml was added' })
    expect(planRefresh({ added: [], removed: ['content/stories/a.yml'], changed: [] })).toEqual({
      kind: 'full',
      reason: 'content/stories/a.yml was removed',
    })
  })
})

describe('search patching', () => {
  const doc = (id: string, text = 'old'): SearchDoc => ({
    id,
    type: 'word',
    title: id,
    text,
    url: '/',
  })

  it('finds the source of each document', () => {
    expect(docOwner('lesson:/lessons/a/b:3')).toBe('lesson:/lessons/a/b')
    expect(docOwner('cheatsheet:0')).toBe('cheatsheet')
    expect(docOwner('story:kot-i-mysz:4')).toBe('story:kot-i-mysz')
    expect(docOwner('story:kot-i-mysz')).toBe('story:kot-i-mysz')
    expect(docOwner('card:stad')).toBe('card:stad')
  })

  it('replaces only the given owners, in place, even when the section count changes', () => {
    const existing = [
      doc('lesson:/l/a:0'),
      doc('lesson:/l/b:0'),
      doc('lesson:/l/b:1'),
      doc('card:x'),
    ]
    const fresh = [
      doc('lesson:/l/a:0', 'fresh'),
      doc('lesson:/l/b:0', 'new'),
      doc('lesson:/l/b:1', 'new'),
      doc('lesson:/l/b:2', 'new'),
      doc('card:x', 'fresh'),
    ]
    expect(
      patchSearchDocs(existing, fresh, ['lesson:/l/b']).map((d) => `${d.id}=${d.text}`),
    ).toEqual([
      'lesson:/l/a:0=old',
      'lesson:/l/b:0=new',
      'lesson:/l/b:1=new',
      'lesson:/l/b:2=new',
      'card:x=old',
    ])
  })
})

describe('routeFiles', () => {
  it('maps a route to its HTML and payload', () => {
    expect(routeFiles('/slovo/stad')).toEqual(['slovo/stad/index.html', 'slovo/stad/_payload.json'])
    expect(routeFiles('/')).toEqual(['index.html', '_payload.json'])
  })
})
