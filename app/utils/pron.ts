import type { InjectionKey } from 'vue'

export type PronSetting = 'auto' | 'always' | 'never'

export const AUTO_PRON_MAX_CHAPTER = 3

export const LESSON_CHAPTER_KEY: InjectionKey<number | null> = Symbol('lesson-chapter')

export function shouldShowPron(setting: PronSetting, chapter: number | null): boolean {
  if (setting === 'always') return true
  if (setting === 'never') return false
  return chapter === null || chapter <= AUTO_PRON_MAX_CHAPTER
}
