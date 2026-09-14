export interface VoiceLike {
  lang: string
  localService?: boolean
}

function normalizedLang(voice: VoiceLike): string {
  return voice.lang.toLowerCase().replace('_', '-')
}

export function pickPolishVoice<T extends VoiceLike>(voices: readonly T[]): T | null {
  const polish = voices.filter((v) => normalizedLang(v).startsWith('pl'))
  if (polish.length === 0) return null
  const exact = polish.filter((v) => normalizedLang(v) === 'pl-pl')
  return exact.find((v) => v.localService) ?? exact[0] ?? polish[0] ?? null
}
