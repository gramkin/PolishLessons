import { describe, expect, it } from 'vitest'
import { pickPolishVoice } from '../../app/utils/speech'

describe('pickPolishVoice', () => {
  it('returns null without Polish voices', () => {
    expect(pickPolishVoice([{ lang: 'ru-RU' }, { lang: 'en-US' }])).toBeNull()
  })

  it('prefers a local pl-PL voice', () => {
    const voices = [
      { lang: 'pl-PL', localService: false, name: 'remote' },
      { lang: 'pl-PL', localService: true, name: 'local' },
    ]
    expect(pickPolishVoice(voices)?.name).toBe('local')
  })

  it('accepts pl_PL and bare pl', () => {
    expect(pickPolishVoice([{ lang: 'en-GB' }, { lang: 'pl_PL' }])?.lang).toBe('pl_PL')
    expect(pickPolishVoice([{ lang: 'PL' }])?.lang).toBe('PL')
  })
})
