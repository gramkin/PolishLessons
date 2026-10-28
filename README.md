# Polski dla Rosjan

A static website that teaches Polish to Russian speakers, from the alphabet to B2. It reads like an
online book in the style of _The Rust Programming Language_ (mdBook): chapters in a sidebar, one
readable column, themes, full-text search. The interface is in Russian.

The course is built around what a Russian speaker already knows. Lessons teach the regular
sound correspondences (_rz_ ↔ «р», _ó_ ↔ «о», _-ość_ ↔ «-ость»), cognates, false friends
(_uroda_ is «красота», not «урод») and side-by-side grammar comparisons, so a learner adds the
differences rather than starting from zero.

## What's inside

- **37 chapters, 169 lessons**: A1–A2 (chapters 1–21), B1 (22–29) and B2 (30–37). Each lesson
  has spoken examples with Cyrillic transcription, a «Типичные ошибки» section and quizzes:
  multiple choice, gap fill, matching, translation, dictation and free writing. Every chapter
  ends with a review lesson, and each level ends with a test scored per skill.
- **A frequency dictionary of 5,300 words** (`/slovo/<id>`): senses, the full inflection table
  with three example sentences for every form, notes on government, stress and false friends,
  etymology, a memory hook, collocations, word family and idioms. Common words play
  Wikimedia Commons recordings.
- **Reading**: 42 graded stories, each readable after a given chapter, and 157 chapters of
  public-domain books in Polish (Carroll, Prus, Wells, Stevenson, London, Wilde, Doyle,
  O. Henry, Dante).
- **Practice**: flashcards with Leitner spaced repetition, a review of your own quiz mistakes,
  35 grammar drills built from dictionary sentences, a placement test and a page of
  idioms ranked by how often they occur in film subtitles.

Progress is kept in the browser's `localStorage`. There are no accounts and no backend.

## Running it

Developed with Node 22 and pnpm.

```sh
pnpm install
pnpm dev          # dev server
pnpm generate     # validate content, then build the static site into .output/public
pnpm preview      # serve the built site at http://localhost:4173
```

The built site is plain static files and can be hosted anywhere. Every push to `main` deploys it to
GitHub Pages (`.github/workflows/pages.yml`).

## Checks

```sh
pnpm validate     # content schema and cross-references (lessons, cards, stories, quizzes)
pnpm lexicon      # every Polish word in lessons and stories is a real form
pnpm test         # unit and component tests (Vitest)
pnpm test:e2e     # Playwright end-to-end and accessibility tests against the built site
pnpm lint
pnpm typecheck
```

`pnpm lexicon` and the dictionary scripts need the source data in `data/sources`, which is not
committed (about 2 GB). `pnpm dict:fetch` downloads the dictionary sources; without them,
`lexicon` is skipped. The OpenSubtitles corpus, used only by the hand-run `pnpm idioms:count`,
is downloaded separately.

## Layout

| Path                                 | Contents                                                  |
| ------------------------------------ | --------------------------------------------------------- |
| `content/lessons/`                   | Lessons in Markdown with quiz and table components        |
| `content/dictionary/`                | One YAML card per word                                    |
| `content/forms/`                     | Generated inflection tables, one JSON file per card       |
| `content/stories/`, `content/books/` | Graded stories and book chapters                          |
| `shared/schemas.ts`                  | Content schema, shared by the site and the validator      |
| `app/`                               | Nuxt 4 app: pages, components, pure logic in `app/utils/` |
| `scripts/`                           | Validation, search index, drills, the dictionary pipeline |
| `data/`                              | Word registries, frequency and idiom data                 |

`CLAUDE.md` documents the architecture and the content conventions in detail; the design specs
are in `docs/superpowers/specs/`.

## Adding a word to the dictionary

```sh
pnpm dict:draft --ids <id>     # draft from the sources: forms and candidate sentences
# write content/dictionary/<id>.yml
pnpm dict:build --ids <id>     # build its forms table
pnpm validate
pnpm dict:status               # record the card in the registries
```

Card ids are ASCII (`ą→a`, `ł→l`, `ż→z` …). The validator enforces the card format, including
three examples for every form.

## Data sources

- [Tatoeba](https://tatoeba.org): Polish–Russian sentence pairs (CC BY 2.0 FR)
- [Wiktionary](https://pl.wiktionary.org) via [kaikki.org](https://kaikki.org): inflection
  tables (CC BY-SA)
- [PoliMorf](http://zil.ipipan.waw.pl/PoliMorf): Polish morphological dictionary
- [OpenSubtitles 2018](https://opus.nlpl.eu/OpenSubtitles.php) and
  [FrequencyWords](https://github.com/hermitdave/FrequencyWords): word and idiom frequency
- [Wikimedia Commons](https://commons.wikimedia.org): pronunciation recordings, each credited
  with its author and licence
- [Wolne Lektury](https://wolnelektury.pl) and [Project Gutenberg](https://www.gutenberg.org):
  public-domain books

The site's «Источники» page (`/sources`) lists them too.
