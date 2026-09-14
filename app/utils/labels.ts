import type { Word } from '../../shared/schemas'

export const POS_LABELS: Record<Word['pos'], string> = {
  noun: 'сущ.',
  verb: 'глаг.',
  adj: 'прил.',
  adv: 'нареч.',
  pron: 'местоим.',
  num: 'числ.',
  prep: 'предлог',
  conj: 'союз',
  part: 'частица',
  phrase: 'фраза',
}

export const GENDER_LABELS: Record<NonNullable<Word['gender']>, string> = {
  m: 'м. р.',
  f: 'ж. р.',
  n: 'ср. р.',
}
