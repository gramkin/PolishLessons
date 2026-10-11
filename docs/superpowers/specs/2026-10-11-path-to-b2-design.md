# Path to B2 — design

**Date:** 2026-10-11. **Follows:** `docs/superpowers/plans/2026-10-10-course-depth-roadmap.md`
(Phases 1–6 done; the course runs to chapter 27, B1).

## Goal

Take a learner who finished chapter 27 to B2: first close the gaps the grammar-only B1
track left, then add B2 grammar and usage, B2 reading and a certificate-style B2 test.

## Starting point

- B1 (chapters 22–27) is grammar only: ~110 new words, no B1 stories, no B1 test.
- Stories: 7 A1, 15 A2, 0 B1, 1 B2 (`rozmowa-kwalifikacyjna`, chapter 27).
- One public-domain book, *Alicja* (12 chapters, B1), quoted by the B1 lessons.
- `LEVELS` in `shared/schemas.ts` already includes `B2`; lessons and stories accept it.

## Approach

Level by level, each phase shippable alone: **7 → 8 → 9 → 10**. Inside a phase, one
writer agent per chapter, then one reviewer agent per chapter (no native reviewer is
available), everything marked `review`. Each phase ends with `pnpm validate`, `pnpm
lexicon`, `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm generate` and `pnpm test:e2e`,
then a commit and a status line in the roadmap.

All lessons keep the current format: `:pron` examples, section quizzes with
explanations, translation, a final quiz, «Типичные ошибки»; depth gate ≥ 10 `:pron`, ≥ 8
questions. Every chapter ends with `04-review.md` (order 99), ~60 % own chapter, ~40 %
earlier chapters. Chapter numbers come from frontmatter; folders continue from `20-`.

## Phase 7 — finish B1

**Chapter 28 «Темы B1»** (`20-b1-topics`, `level: B1`): six topic-vocabulary lessons in
the Phase 2 format (~50 words each linked to their cards, a dialogue, matching,
translation, a drill where one fits) and a review: работа и карьера · здоровье и
медицина · СМИ и новости · жильё и аренда · природа и экология · общество и государство.

**B1 stories** (8, `level: B1`), one readable after each of chapters 22–28, each using
its chapter's grammar: a news report with participles (22), a narrative with -ąc/-wszy
(23), a police report in the passive (24), a retold conversation (25), a text rich in
derived words (26), an exchange of formal letters (27), a topic story (28), plus one more
for 28.

**Chapter 29 «Итоги B1»** (`21-b1-final`): a B1 test in the A1/A2 format (every question
carries `skill`; result per skill). `content/placement.yml` gains two questions per
chapter 22–29.

Size: ~8 lessons, 8 stories, ~300 words.

## Phase 8 — B2 grammar and usage

**First step: the second book.** Bolesław Prus's short stories (candidates *Kamizelka*,
*Antek*, *Katarynka*) as `content/books/prus-*.yml`, hand-built like *Alicja* (`source`,
`level: B2`, `paragraphs[].clean`, Russian chapter titles). Confirm the licence on
Wolne Lektury first and take the plain public-domain text only, not their CC BY-SA
editorial layer. B2 teaching lessons quote it verbatim as blockquotes, as B1 quotes
*Alicja* (either book may be used).

**Chapters 30–36** (`level: B2`, 3 teaching lessons + review each):

| Ch. | Topic | Lessons |
|---|---|---|
| 30 | Числительные во всех падежах | declension (dwóch, pięciu, z dwoma/dwiema, pięcioma) · collective and masculine-personal (dwoje dzieci, oboje, dwaj/dwóch; pięciu panów przyszło) · półtora, fractions, percentages, dates and amounts |
| 31 | Вид: тонкости | iteratives (bywać, miewać, czytywać) · aspect in negation, imperative, after trzeba/warto · perfective for ability and result (Nie otworzę tego; pić/wypić) |
| 32 | Управление и предлоги | verb government unlike Russian (pytać o, dziękować za, grać w, czekać na, uczyć się czego) · two-case prepositions (za, po, o, na, nad/pod/przed) · bookish prepositions (w ramach, na rzecz, ze względu na, w wyniku, wobec; dzięki vs przez) |
| 33 | Связный текст и аргументация | concession and contrast (mimo że, chociaż, natomiast, zaś, jednak) · cause, result, condition (skoro, o ile, chyba że, w związku z tym) · the opinion essay |
| 34 | Частицы и порядок слов | particles (-że, przecież, chyba, właśnie, aż, dopiero, no) · word order and emphasis · clitics in long sentences (się, by, mi, go; movable -śmy) |
| 35 | Разговорный польский и регистр | spoken forms (spoko, siema, diminutives in speech) · abbreviations and non-standard forms (poszłem) · softening and politeness; swearing only as a register warning, no lists |
| 36 | Фразеология | idioms (from `/idioms` and card `idioms`) · proverbs · collocations unlike Russian (podjąć decyzję, zwrócić uwagę, odnieść sukces) |

Drills: numeral cases (30.1) if the numeral cards' forms tables allow; iteratives (31.1)
if a drill can be built. Chapters 33–36 rely on quizzes.

Size: 28 lessons, ~400 words, 2–3 drills, one book of 3–4 stories.

## Phase 9 — B2 reading

About 9 authored texts in the story format (Russian per sentence, `words` links,
questions, a dictation), one register each, joining `rozmowa-kwalifikacyjna`:

| Text | Register | Chapter |
|---|---|---|
| news piece | press: passive, participles | 30 |
| expert interview | spoken, formal | 31 |
| complaint and reply | official | 32 |
| opinion column | argument | 33 |
| radio conversation | spoken: particles, word order | 34 |
| chat among friends | colloquial | 35 |
| family story with idioms | narrative | 36 |
| review, report, debate (2–3) | mixed | 33–36 |

## Phase 10 — «Итоги B2»

**Chapter 37** (`29-b2-final`): a B2 test in the state-certificate shape — listening,
reading, grammar, writing. `/placement` gains chapters 28–37.

**New quiz type `write`** (the only code change):

```yaml
- type: write
  skill: writing
  q: "Напишите жалобу в магазин (около 150 слов)…"
  model: "Szanowni Państwo, …"          # Polish model answer, shown after writing
  checklist:                              # Russian points the learner ticks
    - Формальное обращение (Szanowni Państwo)
    - Изложена проблема
    - Сформулирована просьба
    - Формальное завершение (Z poważaniem)
```

The learner writes freely, then sees the model and ticks the checklist; the score is the
share of ticked points (self-judged, like an unlisted `translate` answer). Not stored in
«Ошибки». `pnpm lexicon` checks `model`. Touches `quizSchema`, the validator and its
tests, `Quiz.vue` and its tests, `scoreBySkill`, and the quiz-types line of CLAUDE.md.
Lessons 27.2 (letter) and 33.3 (essay) get one `write` task each.

## Out of scope

Native review (still the owner's), audio recordings for texts, C1.
