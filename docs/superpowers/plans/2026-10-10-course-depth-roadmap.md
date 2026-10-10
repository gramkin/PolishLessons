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

## Phase 6 — B1 track (later)

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
| 6. B1 | ~20 lessons | 1–5 | later |

Each phase is built the way the last rounds were: a written outline per chapter, lessons
drafted in parallel, every lesson reviewed before commit, validation and the full test
suite green.

## Decisions for the owner

1. **Target:** complete A2 first (Phases 1–5), or plan B1 alongside?
2. **Chapter order:** insert the new grammar chapters where they belong (renumbering
   lessons), or append them after chapter 12 (no renumbering, but the order teaches
   plurals after travel and dates)?
3. **Native review:** is there a native speaker who can review lessons as they land?
   This decides whether Phase 1 lessons are built on reviewed ground.
