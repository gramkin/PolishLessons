# Course depth roadmap

**Goal:** turn the course from a 49-lesson introduction into a complete A1–A2 course
that a learner can finish ready for the Polish state certificate at A2, with room for
a B1 track afterwards.

**Status on 2026-10-10.** 12 chapters, 49 lessons (20 A1, 29 A2). Every lesson now has
section exercises with explanations (13–27 questions), translation or dictation, and 17
have dictionary drills. Wrong answers return in «Ошибки». The dictionary has 5,000
format-2 cards. What is thin:

| Area | Now | A2 needs |
|---|---|---|
| Grammar topics | cases (singular), present/past/future, aspect, adjectives | + plural, numerals, pronouns, motion verbs, *się*, imperative, conditional, subordinate clauses |
| Active vocabulary | 342 lesson words | ~1,500, by topic |
| Reading | 2 stories × 10 sentences (A1), then *Alicja* (B1) | graded A1–A2 texts and dialogues |
| Examples per lesson | median 6 spoken | ~10–15, plus a dialogue |
| Assessment | one final quiz per lesson | chapter reviews, A1 and A2 tests |
| Native check | all 49 lessons marked `review` | reviewed content |

The phases below are ordered by what blocks the A2 goal most. Each phase is
independently shippable, and each lesson keeps the format the course already has:
prose with `:pron` examples, section exercises with explanations, translation,
a final quiz and, where the grammar allows, a drill.

---

## Phase 1 — Complete the A2 grammar (≈ 26 new lessons)

The biggest gap: topics every A2 syllabus has and the course doesn't. New chapters,
placed where the grammar they need has been taught:

| New chapter | Lessons | After |
|---|---|---|
| **Множественное число** | nominative plural (incl. masculine-personal, already partly in 4.4); genitive plural (-ów, zero ending, -i/-y); the other plural cases (-om, -ami, -ach); plural of adjectives | ch. 7 |
| **Местоимения** | personal pronouns in every case (mnie/mi, go/jego/niego); possessives (mój, twój, jego, nasz…); **swój**, and when *jego/jej* would point to someone else; demonstratives and kto/co/który in all cases | ch. 7 |
| **Числа** | cardinals 1–1000; **2–4 vs 5+** with nouns (dwa koty / pięć kotów) and masculine-personal *dwaj/dwóch/pięciu*; ordinals; telling the time (o której? o wpół do…); prices and age | Множественное число |
| **Глаголы движения** | iść / chodzić; jechać / jeździć; prefixed motion verbs (przyjść, wyjść, wejść, dojść, odejść) and their aspect; lecieć / latać, nieść / nosić | ch. 9 (aspect) |
| **Возвратные глаголы** | *się* and its uses (reflexive, reciprocal, intransitive, impersonal *mówi się*); its position in the sentence (clitics) | ch. 5 |
| **Повелительное наклонение** | forming the imperative; aspect in commands and prohibitions (*Zrób to!* / *Nie rób tego!*); *niech* | ch. 9 |
| **Условное наклонение** | *-by* forms and the movable *by*; *gdyby*; *żeby* + past form | Повелительное |
| **Сложное предложение** | że, bo, kiedy, jeśli, chociaż; *który* clauses; word order and clitic placement | Условное |

Each lesson also gets a drill where the paradigm tables allow one (plural cells, pronoun
forms, imperative and conditional cells are all in `content/forms`; aspect pairs come from
`aspectPair` on the cards).

**Content order matters.** Inserting chapters renumbers the labels (2.3, 6.1…) and the
sidebar. The E2E tests reference specific lessons, so they move in the same change.

## Phase 2 — Topic vocabulary (≈ 12 lessons)

342 lesson words is a fraction of A2's ~1,500. The dictionary already holds the words;
what is missing is a path through them. One lesson per topic, each about 40–60 words
linked to their cards (pop-ups, audio, flashcards), introduced through a dialogue and
practised with matching, translation and a topic drill:

семья · дом и квартира · еда и магазин · ресторан · тело и здоровье · одежда · работа и
профессии · город и дорога · транспорт · учёба · свободное время · праздники

Flashcards gain a "by topic" deck that follows these lessons. The words come from
cards already ranked in the top 2,000, so no new dictionary authoring is needed beyond
filling gaps the lessons expose.

## Phase 3 — Reading and listening (≈ 15–20 texts)

Between the 10-sentence A1 stories and the B1 *Alicja* there is nothing. Add graded
texts in the existing story format (sentence-by-sentence, every word linked, a
read-aloud button), two or three per chapter, each:

- built only from grammar and vocabulary taught so far (the validator can check
  this against lesson words);
- 15–40 sentences, A1 early, A2 later, mixing narrative and dialogue;
- followed by comprehension questions and one dictation drawn from the text.

Situational dialogues (в магазине, у врача, на вокзале, в гостинице, по телефону) double
as Phase 2 material.

## Phase 4 — Deepen the existing lessons

The existing 49 lessons are correct but brief (median ~270 words of prose). For each:

- **≥ 10 spoken examples**, and one short dialogue that uses the lesson's point naturally;
- a **«Типичные ошибки»** box with the 2–4 mistakes Russian speakers actually make on
  that topic (the course already names many of them in explanations — collect them);
- **drills where missing**: aspect (9.1, 9.3, 9.4, via aspect pairs), gender (4.x, via
  card gender), adjective agreement (10.1, via adjective + noun pairs from examples);
- a quality gate in `pnpm validate`: minimum spoken examples and questions per lesson,
  so thin lessons are reported, not discovered.

## Phase 5 — Review and assessment

- **Chapter review**: a lesson at the end of each chapter mixing its points with earlier
  chapters' (interleaving is what makes grammar stick), 25–30 questions of every type.
- **A1 and A2 tests** modelled on the państwowy egzamin certyfikatowy: reading,
  listening, grammar, writing (translation); scored, with a per-skill result.
- **Placement test** on the home page, so a learner who already knows some Polish starts
  at the right chapter.
- «Ошибки» shows which lessons produce the most mistakes, as a «повторите урок» hint.

## Phase 6 — B1 track ✓ done 2026-10-11

Participles (-ący, -ny/-ty), adverbial participles (-ąc, -wszy), the passive (zostać /
być + participle), the impersonal -no/-to, reported speech, verbal nouns (-anie/-enie),
more prefixes, formal register and letters. *Alicja* becomes the reading companion.

---

## Cross-cutting: native-speaker review

All Polish in the course is marked `<!-- review -->`: nobody fluent has checked it. Scans
have found and fixed dozens of errors, but no scan replaces a native reader, and every
phase above adds more unchecked Polish. Proposed:

- a per-lesson **review status** (frontmatter `reviewed: 2026-…`), shown to the owner in
  dev, and a list of unreviewed lessons ordered by traffic;
- reviewing Phase 1 lessons before building on them (later phases reuse their Polish);
- keeping new content marked until reviewed, as now.

## Order and size

| Phase | New lessons/texts | Depends on | Suggested order |
|---|---|---|---|
| 1. A2 grammar | ~26 lessons | — | first: it blocks the A2 goal |
| 4. Deepen existing | 49 lessons edited | — | alongside 1 (small, parallel) |
| 2. Topic vocabulary | ~12 lessons | 1 (numbers, plurals) | second |
| 3. Reading | 15–20 texts | 1, 2 | third |
| 5. Assessment | ~12 reviews + 3 tests | 1–3 | fourth |
| 6. B1 | 24 lessons | 1–5 | done |

Each phase is built the way the last rounds were: a written outline per chapter, lessons
drafted in parallel, every lesson reviewed before commit, validation and the full test
suite green.

## Decisions (2026-10-10)

1. **B1 is planned alongside A2.** Its chapters are listed in the contents below and built
   after Phase 1.
2. **New chapters go where they belong.** Lesson order and labels come from `chapter` and
   `order` in frontmatter, so existing lessons keep their paths (progress and E2E tests key
   on them) and only their chapter numbers change.
3. **No native reviewer is available.** Every new lesson therefore passes three checks
   before commit: `pnpm lexicon` (every Polish word must exist in PoliMorf or a card's
   paradigm), a review by a second reader who did not write it, and `pnpm validate` with
   the full test suite. `<!-- review -->` markers stay, so a native check can still follow.

## Contents after Phase 1 and the B1 track

Phase 1 (chapters 6, 11–15, 17, 18; 25 lessons) was written on 2026-10-10. Writing it showed
that plurals, pronouns and numbers need the past tense in their examples, so the past and
future chapters moved before them.

| № | Chapter | Level | Status |
|---|---|---|---|
| 1 | Алфавит и произношение | A1 | existing |
| 2 | Звуковые соответствия | A1 | existing |
| 3 | Первые фразы | A1 | existing |
| 4 | Существительные и род | A1 | existing |
| 5 | Глаголы: настоящее время | A1 | existing |
| 6 | Возвратные глаголы и się | A1 | **Phase 1**, 2 lessons |
| 7 | Падежи I | A2 | existing |
| 8 | Падежи II | A2 | existing |
| 9 | Прошедшее время | A2 | existing |
| 10 | Будущее время и вид | A2 | existing |
| 11 | Множественное число | A2 | **Phase 1**, 4 lessons |
| 12 | Местоимения | A2 | **Phase 1**, 4 lessons |
| 13 | Числа и время | A2 | **Phase 1**, 4 lessons |
| 14 | Глаголы движения | A2 | **Phase 1**, 4 lessons |
| 15 | Повелительное наклонение | A2 | **Phase 1**, 2 lessons |
| 16 | Прилагательные и сравнение | A2 | existing |
| 17 | Условное наклонение | A2 | **Phase 1**, 2 lessons |
| 18 | Сложное предложение | A2 | **Phase 1**, 3 lessons |
| 19 | Ложные друзья | A2 | existing |
| 20 | Повседневные темы | A2 | existing 3 + **Phase 2**, 12 topic lessons |
| 21 | Итоги A2 | A2 | **Phase 5**: tests A1 and A2, «Что дальше» |
| 22–27 | Причастия · Деепричастия · Страдательный залог · Косвенная речь · Словообразование · Официальный стиль | B1 | **Phase 6**, 4 lessons each |

«Что дальше» is now 21.1; it moves to the end of chapter 21 and is rewritten when A2 is complete.

Phase 2 (chapter 20, lessons 20.4–20.15: семья, дом, еда, магазин, ресторан, одежда, здоровье,
город, работа, учёба, свободное время, праздники) was written on 2026-10-10, each lesson with
its own word file `content/words/ch20-*.yml`. Topic drills
(the plan above) are not built yet.

Phase 3 (graded reading) was written on 2026-10-10: 20 new stories for chapters 5–20, one to two
per chapter, 17–33 sentences each, plus questions for the two existing A1 stories. A story now
declares the `chapter` after which it is readable; the validator rejects links to words taught
later, and each text may bring at most six new words of its own (`content/words/stories-*.yml`).
Every story ends with 8–9 questions: comprehension, one form question, one dictation, two
translations. `/stories` is grouped by chapter, and each chapter's last lesson lists its texts.
Chapters 19 and 21 have no text yet.

Phase 4 (deepening) was done on 2026-10-10 for the 48 original lessons (chapters 1–5, 7–10,
16, 19, 20.1–20.3): each now has 21–41 spoken examples (was 0–15), a dialogue (chapters 1–2: a
«Читаем вслух» block), «Типичные ошибки» and a new mixed quiz, 12–32 questions in all. Writers
and reviewers fixed incomplete tables (5.4, 9.1, 9.4, 10.2, 4.3), wrong rules (the *ze* rule in
8.1, *proszę pana* as accusative in 8.4, ą in 9.4, Russian roots in 16.3, *na rowerze* in 20.2)
and translate answers split at commas by unquoted YAML (8.4), which `quizSchema` now rejects.
New drills: `noun-gender` (4.1), `verb-aspect-past` (10.1, 10.4), `adj-agreement` (16.1).
`pnpm validate` warns about thin lessons; only 21.1 «Что дальше» is left, for Phase 5.

Phase 5 (review and assessment) was done on 2026-10-11. Every chapter ends with a review lesson
(«Повторение», 27–30 questions, about 40 % drawn from earlier chapters, a summary table, key
phrases and the chapter's typical mistakes). Chapter 21 holds the A1 and A2 tests (38 questions
each: two reading texts, listening with played Polish, grammar, translation; the result is shown
per skill) before «Что дальше». `/placement` (linked from the home page) asks two questions per
chapter and recommends where to start; «Ошибки» names the lessons with the most stored mistakes.

Phase 6 (the B1 track) was done on 2026-10-11: chapters 22–27 (folders `14-participles` …
`19-formal`), three teaching lessons and a review each. Every teaching lesson quotes one or two
real sentences from *Alicja* with a link to the chapter, and every participle, -ąc, -wszy,
-no/-to and verbal-noun form was checked against the forms tables. Six drills train those forms
from Tatoeba sentences only (`sourcedOnly`): many authored card rows for -ąc mean a completed
action («Dostając list» = «Получив письмо»), which is a dictionary backlog item. All roadmap
phases are done; the native-speaker review below is what remains.

**Phase 7 (finish B1)** was done on 2026-10-11 — chapter 28 «Темы B1», eight B1 stories, chapter 29 «Итоги B1» and placement questions for chapters 22–28. The path on to B2 (Phases 8–10) is designed in `docs/superpowers/specs/2026-10-11-path-to-b2-design.md`.

**Phase 8 (B2 grammar and usage)** was done on 2026-10-11 — chapters 30–36 and the second book, Prus «Nowele» (*Kamizelka*, *Katarynka*); plan `docs/superpowers/plans/2026-10-11-phase8-b2-grammar.md`.

**Phase 9 (B2 reading)** was done on 2026-10-12 — nine authored B2 texts in different registers for chapters 30–36; plan `docs/superpowers/plans/2026-10-12-phase9-b2-reading.md`.

**Phase 10 («Итоги B2»)** was done on 2026-10-12 — the `write` question, chapter 37 with the B2 test, writing tasks in 27.2 and 33.3, and placement questions for chapters 30–36; plan `docs/superpowers/plans/2026-10-12-phase10-b2-test.md`. With it the path to B2 in `docs/superpowers/specs/2026-10-11-path-to-b2-design.md` is complete; what remains is the native review of everything marked `review`.
