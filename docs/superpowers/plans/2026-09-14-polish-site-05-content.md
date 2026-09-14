# Plan 5 — Course Content (Chapters 1–3) and Project Guide

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace sample content with the v1 course: chapters 1–3 (12 lessons with quizzes), 162 words including 33 false friends, 16 sound correspondences, 2 A1 stories, a complete cheat sheet, and a `CLAUDE.md` for future contributors.

**Architecture:** Content only — no application code changes. Every file is checked by `pnpm validate` (schemas and cross-references) and exercised by the existing unit, component and E2E suites.

**Tech Stack:** Markdown + MDC components, YAML.

**Spec:** `docs/superpowers/specs/2026-09-14-polish-for-russians-design.md` (§3, §14)

**Prerequisite:** Plans 1–4 complete.

## Global Constraints

All constraints in `2026-09-14-polish-site-00-overview.md` → "Global Constraints" apply. Content-specific rules:
- **Review markers.** Every lesson and the cheat sheet start their body with `<!-- review -->`; every story and word file starts with `# review`. The project owner removes a marker after checking the Polish in that file.
- **Word ids:** ASCII transliteration (`ą→a ć→c ę→e ł→l ń→n ó→o ś→s ź/ż→z`), homographs disambiguated with a suffix (`czesc` = *cześć*, `czesc-noun` = *część*).
- **Cyrillic transcription (`pron`)**: `sz→ш`, `cz→ч`, `rz/ż→ж`, `ś/si→сь`, `ź/zi→зь`, `ć/ci→ць`, `dź/dzi→дзь`, `ń/ni→нь`, `ł→у`, `y→ы`, `e→э` (after hard consonants), `ó/u→у`, `ą→он` (`ом` before b/p), `ę→эн` (`эм` before b/p, word-final `ę→э`), `ch/h→х`, `w→в` (`ф` after voiceless consonants), final consonants devoiced; stress mark `́` on the stressed vowel of words with two or more syllables.
- **One pattern per word.** When a word shows several correspondences, pick the one the lesson teaches.
- **Words used by E2E tests must stay:** lessons `01-alphabet/01-letters` (title «Буквы», with a description), `01-alphabet/02-stress` (order 2), `02-sounds/01-rz` (final quiz of exactly the 3 questions from Plan 3), story `kot-i-mysz`, word `zab`.
- YAML strings containing `,` `:` `?` `!` `«` or starting with a digit are double-quoted.

---

### Task 1: Chapters, sound patterns and the word list

**Files:**
- Modify: `content/chapters.yml`, `content/patterns.yml`
- Create: `content/words/alphabet.yml`, `content/words/sounds.yml`, `content/words/false-friends.yml`, `content/words/phrases.yml`
- Delete: `content/words/sample.yml`

**Interfaces:**
- Produces: word ids and pattern ids referenced by Tasks 2–5 (all listed below).

- [ ] **Step 1: Write `content/chapters.yml`**

```yaml
chapters:
  - number: 1
    title: Алфавит и произношение
  - number: 2
    title: Звуковые соответствия
  - number: 3
    title: Первые фразы
  - number: 4
    title: Существительные и род
  - number: 5
    title: "Глаголы: настоящее время"
  - number: 6
    title: Падежи I
  - number: 7
    title: Падежи II
  - number: 8
    title: Прошедшее время
  - number: 9
    title: Будущее время и вид
  - number: 10
    title: Прилагательные и сравнение
  - number: 11
    title: Ложные друзья
  - number: 12
    title: Повседневные темы
```

- [ ] **Step 2: Write `content/patterns.yml`**

```yaml
# review
patterns:
  - id: rz-р
    pl: rz
    ru: р
    rule: "Польское rz (читается как «ж») часто стоит там, где в русском «р»: rzeka — река."
  - id: ł-л
    pl: ł
    ru: л
    rule: "Буква ł звучит как краткое «у» (английское w), а соответствует русскому «л»: mały — малый."
  - id: ło-оло
    pl: ło
    ru: оло
    rule: "Русское «оло» между согласными в польском сокращается до «ło»: głowa — голова."
  - id: ro-оро
    pl: ro
    ru: оро
    rule: "Русское «оро» между согласными в польском сокращается до «ro»: droga — дорога."
  - id: le-оло
    pl: le
    ru: оло
    rule: "Иногда русскому «оло» соответствует польское «le»: mleko — молоко."
  - id: ó-о
    pl: ó
    ru: о
    rule: "Буква ó читается как «у», но пишется там, где в русском обычно «о»: stół — стол."
  - id: ą-у
    pl: ą
    ru: у
    rule: "Носовое ą часто стоит на месте русского «у»: ząb — зуб."
  - id: ę-у
    pl: ę
    ru: у
    rule: "Иногда и носовое ę соответствует русскому «у»: ręka — рука."
  - id: ę-я
    pl: ę
    ru: я
    rule: "Носовое ę часто соответствует русскому «я»: mięso — мясо."
  - id: ść-сть
    pl: ść
    ru: сть
    rule: "Польское -ść соответствует русскому -сть: radość — радость."
  - id: ć-ть
    pl: ć
    ru: ть
    rule: "Польские глаголы на -ć соответствуют русским на -ть: być — быть."
  - id: ch-х
    pl: ch
    ru: х
    rule: "Сочетание ch читается как русское «х»: chleb — хлеб."
  - id: sz-ш
    pl: sz
    ru: ш
    rule: "Сочетание sz — это твёрдое «ш»: szkoła — школа."
  - id: cz-ч
    pl: cz
    ru: ч
    rule: "Сочетание cz — это твёрдое «ч»: czarny — чёрный."
  - id: ż-ж
    pl: ż
    ru: ж
    rule: "Буква ż читается как «ж»: żaba — жаба."
  - id: dzi-де
    pl: dzi
    ru: де
    rule: "Сочетание dzi (мягкое «дзь») часто соответствует русскому «де»: dzień — день."
```

- [ ] **Step 3: Write `content/words/alphabet.yml` (chapter 1)**

```yaml
# review
words:
  - { id: dom, pl: dom, ru: дом, pos: noun, gender: m, pron: "дом", topic: дом, chapter: 1 }
  - { id: mama, pl: mama, ru: мама, pos: noun, gender: f, pron: "ма́ма", topic: семья, chapter: 1 }
  - { id: tata, pl: tata, ru: папа, pos: noun, gender: m, pron: "та́та", topic: семья, chapter: 1 }
  - { id: woda, pl: woda, ru: вода, pos: noun, gender: f, pron: "во́да", topic: еда, chapter: 1 }
  - { id: ryba, pl: ryba, ru: рыба, pos: noun, gender: f, pron: "ры́ба", topic: животные, chapter: 1 }
  - { id: noc, pl: noc, ru: ночь, pos: noun, gender: f, pron: "ноц", topic: время, chapter: 1 }
  - { id: ulica, pl: ulica, ru: улица, pos: noun, gender: f, pron: "ули́ца", topic: город, chapter: 1 }
  - { id: ksiazka, pl: książka, ru: книга, pos: noun, gender: f, pron: "ксьо́ншка", topic: учёба, chapter: 1 }
  - { id: jablko, pl: jabłko, ru: яблоко, pos: noun, gender: n, pron: "я́пко", topic: еда, chapter: 1 }
  - { id: kawa, pl: kawa, ru: кофе, pos: noun, gender: f, pron: "ка́ва", topic: еда, chapter: 1 }
  - { id: herbata, pl: herbata, ru: чай, pos: noun, gender: f, pron: "хэрба́та", topic: еда, chapter: 1 }
  - { id: matematyka, pl: matematyka, ru: математика, pos: noun, gender: f, pron: "матэма́тыка", topic: учёба, chapter: 1 }
  - { id: uniwersytet, pl: uniwersytet, ru: университет, pos: noun, gender: m, pron: "унивэ́рсытэт", topic: учёба, chapter: 1 }
  - { id: telefon, pl: telefon, ru: телефон, pos: noun, gender: m, pron: "тэлэ́фон", topic: вещи, chapter: 1 }
  - { id: dziewczyna, pl: dziewczyna, ru: девушка, pos: noun, gender: f, pron: "дзьефчы́на", topic: люди, chapter: 1 }
  - { id: chlopiec, pl: chłopiec, ru: мальчик, pos: noun, gender: m, pron: "хуо́пьец", topic: люди, chapter: 1 }
  - { id: miasto, pl: miasto, ru: город, pos: noun, gender: n, pron: "мья́сто", falseFriend: { ru: место, meaning: "город (а «место» — miejsce)" }, topic: город, chapter: 1 }
```

- [ ] **Step 4: Write `content/words/sounds.yml` (chapter 2 cognates)**

```yaml
# review
words:
  # rz ↔ р
  - { id: rzeka, pl: rzeka, ru: река, pos: noun, gender: f, pron: "жэ́ка", pattern: rz-р, topic: природа, chapter: 2 }
  - { id: brzeg, pl: brzeg, ru: берег, pos: noun, gender: m, pron: "бжэк", pattern: rz-р, topic: природа, chapter: 2 }
  - { id: morze, pl: morze, ru: море, pos: noun, gender: n, pron: "мо́жэ", pattern: rz-р, topic: природа, chapter: 2 }
  - { id: trzy, pl: trzy, ru: три, pos: num, pron: "тшы", pattern: rz-р, topic: числа, chapter: 2 }
  - { id: krzyk, pl: krzyk, ru: крик, pos: noun, gender: m, pron: "кшык", pattern: rz-р, topic: действия, chapter: 2 }
  - { id: gorzki, pl: gorzki, ru: горький, pos: adj, pron: "го́шки", pattern: rz-р, topic: еда, chapter: 2 }
  - { id: burza, pl: burza, ru: буря, pos: noun, gender: f, pron: "бу́жа", pattern: rz-р, topic: природа, chapter: 2 }
  - { id: przed, pl: przed, ru: перед, pos: prep, pron: "пшэт", pattern: rz-р, topic: место, chapter: 2 }
  # ło ↔ оло, ro ↔ оро, le ↔ оло
  - { id: glowa, pl: głowa, ru: голова, pos: noun, gender: f, pron: "гуо́ва", pattern: ło-оло, topic: тело, chapter: 2 }
  - { id: zloto, pl: złoto, ru: золото, pos: noun, gender: n, pron: "зуо́то", pattern: ło-оло, topic: вещи, chapter: 2 }
  - { id: mlody, pl: młody, ru: молодой, pos: adj, pron: "муо́ды", pattern: ło-оло, topic: люди, chapter: 2 }
  - { id: bloto, pl: błoto, ru: "болото, грязь", pos: noun, gender: n, pron: "буо́то", pattern: ło-оло, topic: природа, chapter: 2 }
  - { id: droga, pl: droga, ru: дорога, pos: noun, gender: f, pron: "дро́га", pattern: ro-оро, topic: город, chapter: 2 }
  - { id: krowa, pl: krowa, ru: корова, pos: noun, gender: f, pron: "кро́ва", pattern: ro-оро, topic: животные, chapter: 2 }
  - { id: broda, pl: broda, ru: борода, pos: noun, gender: f, pron: "бро́да", pattern: ro-оро, topic: тело, chapter: 2 }
  - { id: wrona, pl: wrona, ru: ворона, pos: noun, gender: f, pron: "вро́на", pattern: ro-оро, topic: животные, chapter: 2 }
  - { id: mleko, pl: mleko, ru: молоко, pos: noun, gender: n, pron: "млэ́ко", pattern: le-оло, topic: еда, chapter: 2 }
  # ł ↔ л, ó ↔ о
  - { id: lyzka, pl: łyżka, ru: ложка, pos: noun, gender: f, pron: "уы́шка", pattern: ł-л, topic: дом, chapter: 2 }
  - { id: maly, pl: mały, ru: "малый, маленький", pos: adj, pron: "ма́уы", pattern: ł-л, topic: качества, chapter: 2 }
  - { id: bialy, pl: biały, ru: белый, pos: adj, pron: "бья́уы", pattern: ł-л, topic: качества, chapter: 2 }
  - { id: pelny, pl: pełny, ru: полный, pos: adj, pron: "пэ́уны", pattern: ł-л, topic: качества, chapter: 2 }
  - { id: lza, pl: łza, ru: слеза, pos: noun, gender: f, pron: "уза", pattern: ł-л, topic: тело, chapter: 2 }
  - { id: sila, pl: siła, ru: сила, pos: noun, gender: f, pron: "сьи́уа", pattern: ł-л, topic: качества, chapter: 2 }
  - { id: stol, pl: stół, ru: стол, pos: noun, gender: m, pron: "стуу", pattern: ó-о, topic: дом, chapter: 2 }
  - { id: woz, pl: wóz, ru: "воз, телега", pos: noun, gender: m, pron: "вус", pattern: ó-о, topic: город, chapter: 2 }
  - { id: noz, pl: nóż, ru: нож, pos: noun, gender: m, pron: "нуш", pattern: ó-о, topic: дом, chapter: 2 }
  - { id: krol, pl: król, ru: король, pos: noun, gender: m, pron: "круль", pattern: ó-о, topic: люди, chapter: 2 }
  - { id: mroz, pl: mróz, ru: мороз, pos: noun, gender: m, pron: "мрус", pattern: ó-о, topic: природа, chapter: 2 }
  # nasal vowels
  - { id: zab, pl: ząb, ru: зуб, pos: noun, gender: m, pron: "зомп", pattern: ą-у, topic: тело, chapter: 2 }
  - { id: dab, pl: dąb, ru: дуб, pos: noun, gender: m, pron: "домп", pattern: ą-у, topic: природа, chapter: 2 }
  - { id: maka, pl: mąka, ru: мука, pos: noun, gender: f, pron: "мо́нка", pattern: ą-у, topic: еда, chapter: 2 }
  - { id: maz, pl: mąż, ru: муж, pos: noun, gender: m, pron: "монш", pattern: ą-у, topic: семья, chapter: 2 }
  - { id: pajak, pl: pająk, ru: паук, pos: noun, gender: m, pron: "па́йонк", pattern: ą-у, topic: животные, chapter: 2 }
  - { id: was, pl: wąs, ru: ус, pos: noun, gender: m, pron: "вонс", pattern: ą-у, topic: тело, chapter: 2 }
  - { id: reka, pl: ręka, ru: рука, pos: noun, gender: f, pron: "рэ́нка", pattern: ę-у, topic: тело, chapter: 2 }
  - { id: ges, pl: gęś, ru: гусь, pos: noun, gender: f, pron: "гэньсь", pattern: ę-у, topic: животные, chapter: 2 }
  - { id: pepek, pl: pępek, ru: пупок, pos: noun, gender: m, pron: "пэ́мпэк", pattern: ę-у, topic: тело, chapter: 2 }
  - { id: mieso, pl: mięso, ru: мясо, pos: noun, gender: n, pron: "мье́нсо", pattern: ę-я, topic: еда, chapter: 2 }
  - { id: piec, pl: pięć, ru: пять, pos: num, pron: "пьеньць", pattern: ę-я, topic: числа, chapter: 2 }
  - { id: swiety, pl: święty, ru: святой, pos: adj, pron: "сьфье́нты", pattern: ę-я, topic: люди, chapter: 2 }
  - { id: imie, pl: imię, ru: имя, pos: noun, gender: n, pron: "и́мье", pattern: ę-я, topic: знакомство, chapter: 2 }
  - { id: pamiec, pl: pamięć, ru: память, pos: noun, gender: f, pron: "па́мьеньць", pattern: ę-я, topic: учёба, chapter: 2 }
  - { id: dziesiec, pl: dziesięć, ru: десять, pos: num, pron: "дзье́сьеньць", pattern: ę-я, topic: числа, chapter: 2 }
  - { id: jezyk, pl: język, ru: язык, pos: noun, gender: m, pron: "е́нзык", pattern: ę-я, topic: учёба, chapter: 2 }
  # sibilants and ch
  - { id: chleb, pl: chleb, ru: хлеб, pos: noun, gender: m, pron: "хлэп", pattern: ch-х, topic: еда, chapter: 2 }
  - { id: ucho, pl: ucho, ru: ухо, pos: noun, gender: n, pron: "у́хо", pattern: ch-х, topic: тело, chapter: 2 }
  - { id: mucha, pl: mucha, ru: муха, pos: noun, gender: f, pron: "му́ха", pattern: ch-х, topic: животные, chapter: 2 }
  - { id: duch, pl: duch, ru: дух, pos: noun, gender: m, pron: "дух", pattern: ch-х, topic: люди, chapter: 2 }
  - { id: chata, pl: chata, ru: хата, pos: noun, gender: f, pron: "ха́та", pattern: ch-х, topic: дом, chapter: 2 }
  - { id: szkola, pl: szkoła, ru: школа, pos: noun, gender: f, pron: "шко́уа", pattern: sz-ш, topic: учёба, chapter: 2 }
  - { id: szum, pl: szum, ru: шум, pos: noun, gender: m, pron: "шум", pattern: sz-ш, topic: город, chapter: 2 }
  - { id: kasza, pl: kasza, ru: каша, pos: noun, gender: f, pron: "ка́ша", pattern: sz-ш, topic: еда, chapter: 2 }
  - { id: mysz, pl: mysz, ru: мышь, pos: noun, gender: f, pron: "мыш", pattern: sz-ш, topic: животные, chapter: 2 }
  - { id: szyja, pl: szyja, ru: шея, pos: noun, gender: f, pron: "шы́я", pattern: sz-ш, topic: тело, chapter: 2 }
  - { id: czarny, pl: czarny, ru: чёрный, pos: adj, pron: "ча́рны", pattern: cz-ч, topic: качества, chapter: 2 }
  - { id: czlowiek, pl: człowiek, ru: человек, pos: noun, gender: m, pron: "чуо́вьек", pattern: cz-ч, topic: люди, chapter: 2 }
  - { id: czysty, pl: czysty, ru: чистый, pos: adj, pron: "чы́сты", pattern: cz-ч, topic: качества, chapter: 2 }
  - { id: cztery, pl: cztery, ru: четыре, pos: num, pron: "чтэ́ры", pattern: cz-ч, topic: числа, chapter: 2 }
  - { id: zaba, pl: żaba, ru: "лягушка, жаба", pos: noun, gender: f, pron: "жа́ба", pattern: ż-ж, topic: животные, chapter: 2 }
  - { id: zona, pl: żona, ru: жена, pos: noun, gender: f, pron: "жо́на", pattern: ż-ж, topic: семья, chapter: 2 }
  - { id: zolty, pl: żółty, ru: жёлтый, pos: adj, pron: "жу́уты", pattern: ż-ж, topic: качества, chapter: 2 }
  - { id: zyc, pl: żyć, ru: жить, pos: verb, pron: "жыць", pattern: ż-ж, topic: действия, chapter: 2 }
  # endings
  - { id: radosc, pl: radość, ru: радость, pos: noun, gender: f, pron: "ра́досьць", pattern: ść-сть, topic: чувства, chapter: 2 }
  - { id: gosc, pl: gość, ru: гость, pos: noun, gender: m, pron: "госьць", pattern: ść-сть, topic: люди, chapter: 2 }
  - { id: kosc, pl: kość, ru: кость, pos: noun, gender: f, pron: "косьць", pattern: ść-сть, topic: тело, chapter: 2 }
  - { id: czesc-noun, pl: część, ru: часть, pos: noun, gender: f, pron: "чэньсьць", pattern: ść-сть, topic: вещи, chapter: 2 }
  - { id: mlodosc, pl: młodość, ru: молодость, pos: noun, gender: f, pron: "муо́досьць", pattern: ść-сть, topic: люди, chapter: 2 }
  - { id: byc, pl: być, ru: быть, pos: verb, pron: "быць", pattern: ć-ть, topic: действия, chapter: 2 }
  - { id: pic, pl: pić, ru: пить, pos: verb, pron: "пиць", pattern: ć-ть, topic: действия, chapter: 2 }
  - { id: bic, pl: bić, ru: бить, pos: verb, pron: "биць", pattern: ć-ть, topic: действия, chapter: 2 }
  - { id: myc, pl: myć, ru: мыть, pos: verb, pron: "мыць", pattern: ć-ть, topic: действия, chapter: 2 }
  - { id: miec, pl: mieć, ru: иметь, pos: verb, pron: "мьець", pattern: ć-ть, topic: действия, chapter: 2 }
  - { id: dzien, pl: dzień, ru: день, pos: noun, gender: m, pron: "дзьень", pattern: dzi-де, topic: время, chapter: 2 }
  - { id: dzieci, pl: dzieci, ru: дети, pos: noun, pron: "дзье́ци", pattern: dzi-де, topic: семья, chapter: 2 }
  - { id: dziewiec, pl: dziewięć, ru: девять, pos: num, pron: "дзье́вьеньць", pattern: dzi-де, topic: числа, chapter: 2 }
```

For *błoto*, *mały*, *wóz* and *żaba* the `ru` field lists the cognate first and the everyday meaning second, because the validator checks that the pattern's Russian letters occur in `ru`.

- [ ] **Step 5: Write `content/words/false-friends.yml` (chapter 2)**

```yaml
# review
words:
  - { id: uroda, pl: uroda, ru: красота, pos: noun, gender: f, pron: "уро́да", falseFriend: { ru: урод, meaning: "красота, привлекательность" }, topic: люди, chapter: 2 }
  - { id: sklep, pl: sklep, ru: магазин, pos: noun, gender: m, pron: "склэп", falseFriend: { ru: склеп, meaning: магазин }, topic: город, chapter: 2 }
  - { id: dywan, pl: dywan, ru: ковёр, pos: noun, gender: m, pron: "ды́ван", falseFriend: { ru: диван, meaning: "ковёр (а диван — kanapa)" }, topic: дом, chapter: 2 }
  - { id: zapomniec, pl: zapomnieć, ru: забыть, pos: verb, pron: "запо́мньець", falseFriend: { ru: запомнить, meaning: "забыть — ровно наоборот!" }, topic: действия, chapter: 2 }
  - { id: owoc, pl: owoc, ru: фрукт, pos: noun, gender: m, pron: "о́воц", falseFriend: { ru: овощ, meaning: "фрукт (а овощ — warzywo)" }, topic: еда, chapter: 2 }
  - { id: zakaz, pl: zakaz, ru: запрет, pos: noun, gender: m, pron: "за́кас", falseFriend: { ru: заказ, meaning: "запрет (а заказ — zamówienie)" }, topic: город, chapter: 2 }
  - { id: czas, pl: czas, ru: время, pos: noun, gender: m, pron: "час", falseFriend: { ru: час, meaning: "время (а час — godzina)" }, topic: время, chapter: 2 }
  - { id: list, pl: list, ru: письмо, pos: noun, gender: m, pron: "лист", falseFriend: { ru: лист, meaning: "письмо (а лист дерева — liść)" }, topic: вещи, chapter: 2 }
  - { id: dworzec, pl: dworzec, ru: вокзал, pos: noun, gender: m, pron: "дво́жэц", falseFriend: { ru: дворец, meaning: "вокзал (а дворец — pałac)" }, topic: город, chapter: 2 }
  - { id: zachod, pl: zachód, ru: запад, pos: noun, gender: m, pron: "за́хут", falseFriend: { ru: заход, meaning: "запад; zachód słońca — закат" }, topic: место, chapter: 2 }
  - { id: rodzina, pl: rodzina, ru: семья, pos: noun, gender: f, pron: "родзи́на", falseFriend: { ru: родина, meaning: "семья (а родина — ojczyzna)" }, topic: семья, chapter: 2 }
  - { id: zawod, pl: zawód, ru: профессия, pos: noun, gender: m, pron: "за́вут", falseFriend: { ru: завод, meaning: "профессия (а завод — fabryka)" }, topic: люди, chapter: 2 }
  - { id: pytac, pl: pytać, ru: спрашивать, pos: verb, pron: "пы́таць", falseFriend: { ru: пытать, meaning: спрашивать }, topic: действия, chapter: 2 }
  - { id: brak, pl: brak, ru: "нехватка, отсутствие", pos: noun, gender: m, pron: "брак", falseFriend: { ru: брак, meaning: "нехватка (а брак — małżeństwo)" }, topic: вещи, chapter: 2 }
  - { id: jutro, pl: jutro, ru: завтра, pos: adv, pron: "ю́тро", falseFriend: { ru: утро, meaning: "завтра (а утро — rano)" }, topic: время, chapter: 2 }
  - { id: dynia, pl: dynia, ru: тыква, pos: noun, gender: f, pron: "ды́ня", falseFriend: { ru: дыня, meaning: "тыква (а дыня — melon)" }, topic: еда, chapter: 2 }
  - { id: pokoj, pl: pokój, ru: "комната; мир", pos: noun, gender: m, pron: "по́куй", falseFriend: { ru: покой, meaning: "комната; мир (не война)" }, topic: дом, chapter: 2 }
  - { id: nagle, pl: nagle, ru: внезапно, pos: adv, pron: "на́глэ", falseFriend: { ru: нагло, meaning: внезапно }, topic: время, chapter: 2 }
  - { id: rok, pl: rok, ru: год, pos: noun, gender: m, pron: "рок", falseFriend: { ru: рок, meaning: год }, topic: время, chapter: 2 }
  - { id: lustro, pl: lustro, ru: зеркало, pos: noun, gender: n, pron: "лю́стро", falseFriend: { ru: люстра, meaning: "зеркало (а люстра — żyrandol)" }, topic: дом, chapter: 2 }
  - { id: wesele, pl: wesele, ru: свадьба, pos: noun, gender: n, pron: "вэсэ́лэ", falseFriend: { ru: веселье, meaning: свадьба }, topic: семья, chapter: 2 }
  - { id: krzeslo, pl: krzesło, ru: стул, pos: noun, gender: n, pron: "кшэ́суо", falseFriend: { ru: кресло, meaning: "стул (а кресло — fotel)" }, topic: дом, chapter: 2 }
  - { id: obraz, pl: obraz, ru: картина, pos: noun, gender: m, pron: "о́брас", falseFriend: { ru: образ, meaning: "картина, изображение" }, topic: вещи, chapter: 2 }
  - { id: czaszka, pl: czaszka, ru: череп, pos: noun, gender: f, pron: "ча́шка", falseFriend: { ru: чашка, meaning: "череп (а чашка — filiżanka)" }, topic: тело, chapter: 2 }
  - { id: zdanie, pl: zdanie, ru: "предложение; мнение", pos: noun, gender: n, pron: "зда́нье", falseFriend: { ru: здание, meaning: "предложение (фраза); мнение (а здание — budynek)" }, topic: учёба, chapter: 2 }
  - { id: sprawa, pl: sprawa, ru: дело, pos: noun, gender: f, pron: "спра́ва", falseFriend: { ru: справа, meaning: "дело, вопрос" }, topic: вещи, chapter: 2 }
  - { id: powiesc, pl: powieść, ru: роман, pos: noun, gender: f, pron: "по́вьесьць", falseFriend: { ru: повесть, meaning: "роман (книга)" }, topic: учёба, chapter: 2 }
  - { id: stac, pl: stać, ru: стоять, pos: verb, pron: "стаць", falseFriend: { ru: стать, meaning: "стоять (а стать — stać się)" }, topic: действия, chapter: 2 }
  - { id: zalowac, pl: żałować, ru: "жалеть, сожалеть", pos: verb, pron: "жауо́ваць", falseFriend: { ru: жаловаться, meaning: "жалеть, сожалеть (а жаловаться — skarżyć się)" }, topic: чувства, chapter: 2 }
  - { id: won, pl: woń, ru: аромат, pos: noun, gender: f, pron: "вонь", falseFriend: { ru: вонь, meaning: "запах, чаще приятный" }, topic: чувства, chapter: 2 }
  - { id: duma, pl: duma, ru: гордость, pos: noun, gender: f, pron: "ду́ма", falseFriend: { ru: дума, meaning: гордость }, topic: чувства, chapter: 2 }
  - { id: wies, pl: wieś, ru: деревня, pos: noun, gender: f, pron: "вьесь", falseFriend: { ru: весь, meaning: деревня }, topic: место, chapter: 2 }
```

Together with `miasto` (chapter 1) this gives 33 false friends.

- [ ] **Step 6: Write `content/words/phrases.yml` (chapter 3)**

```yaml
# review
words:
  - { id: dzien-dobry, pl: dzień dobry, ru: "добрый день, здравствуйте", pos: phrase, pron: "дзьень до́бры", topic: приветствия, chapter: 3 }
  - { id: dobry-wieczor, pl: dobry wieczór, ru: добрый вечер, pos: phrase, pron: "до́бры вье́чур", topic: приветствия, chapter: 3 }
  - { id: czesc, pl: cześć, ru: "привет; пока", pos: phrase, pron: "чэсьць", topic: приветствия, chapter: 3 }
  - { id: do-widzenia, pl: do widzenia, ru: до свидания, pos: phrase, pron: "до видзэ́нья", topic: приветствия, chapter: 3 }
  - { id: dobranoc, pl: dobranoc, ru: спокойной ночи, pos: phrase, pron: "добра́ноц", topic: приветствия, chapter: 3 }
  - { id: dziekuje, pl: dziękuję, ru: спасибо, pos: phrase, pron: "дзьенку́е", topic: приветствия, chapter: 3 }
  - { id: prosze, pl: proszę, ru: пожалуйста, pos: phrase, pron: "про́шэ", topic: приветствия, chapter: 3 }
  - { id: przepraszam, pl: przepraszam, ru: извините, pos: phrase, pron: "пшэпра́шам", topic: приветствия, chapter: 3 }
  - { id: milo-mi, pl: miło mi, ru: очень приятно, pos: phrase, pron: "ми́уо ми", topic: знакомство, chapter: 3 }
  - { id: jak-sie-masz, pl: "jak się masz?", ru: "как дела?", pos: phrase, pron: "як сье маш", topic: знакомство, chapter: 3 }
  - { id: tak, pl: tak, ru: да, pos: part, pron: "так", topic: знакомство, chapter: 3 }
  - { id: nie, pl: nie, ru: "нет; не", pos: part, pron: "нье", topic: знакомство, chapter: 3 }
  - { id: pan, pl: pan, ru: "господин; вы (мужчине)", pos: noun, gender: m, pron: "пан", topic: знакомство, chapter: 3 }
  - { id: pani, pl: pani, ru: "госпожа; вы (женщине)", pos: noun, gender: f, pron: "па́ни", topic: знакомство, chapter: 3 }
  - { id: ja, pl: ja, ru: я, pos: pron, pron: "я", topic: знакомство, chapter: 3 }
  - { id: ty, pl: ty, ru: ты, pos: pron, pron: "ты", topic: знакомство, chapter: 3 }
  - { id: "on", pl: "on", ru: он, pos: pron, pron: "он", topic: знакомство, chapter: 3 }
  - { id: ona, pl: ona, ru: она, pos: pron, pron: "о́на", topic: знакомство, chapter: 3 }
  - { id: my, pl: my, ru: мы, pos: pron, pron: "мы", topic: знакомство, chapter: 3 }
  - { id: wy, pl: wy, ru: "вы (много людей)", pos: pron, pron: "вы", topic: знакомство, chapter: 3 }
  - { id: oni, pl: oni, ru: "они (есть мужчины)", pos: pron, pron: "о́ни", topic: знакомство, chapter: 3 }
  - { id: one, pl: one, ru: "они (без мужчин)", pos: pron, pron: "о́нэ", topic: знакомство, chapter: 3 }
  - { id: jak, pl: jak, ru: как, pos: adv, pron: "як", topic: знакомство, chapter: 3 }
  - { id: skad, pl: skąd, ru: откуда, pos: adv, pron: "сконт", topic: знакомство, chapter: 3 }
  - { id: gdzie, pl: gdzie, ru: где, pos: adv, pron: "гдзье", topic: знакомство, chapter: 3 }
  - { id: kto, pl: kto, ru: кто, pos: pron, pron: "кто", topic: знакомство, chapter: 3 }
  - { id: co, pl: co, ru: что, pos: pron, pron: "цо", topic: знакомство, chapter: 3 }
  - { id: mieszkac, pl: mieszkać, ru: "жить, проживать", pos: verb, pron: "мье́шкаць", topic: действия, chapter: 3 }
  - { id: mowic, pl: mówić, ru: говорить, pos: verb, pron: "му́виць", topic: действия, chapter: 3 }
  - { id: rozumiec, pl: rozumieć, ru: понимать, pos: verb, pron: "розу́мьець", topic: действия, chapter: 3 }
  - { id: polski, pl: polski, ru: польский, pos: adj, pron: "по́льски", topic: знакомство, chapter: 3 }
  - { id: rosyjski, pl: rosyjski, ru: "русский (язык), российский", pos: adj, pron: "росы́йски", topic: знакомство, chapter: 3 }
  - { id: polska, pl: Polska, ru: Польша, pos: noun, gender: f, pron: "По́льска", topic: знакомство, chapter: 3 }
  - { id: rosja, pl: Rosja, ru: Россия, pos: noun, gender: f, pron: "Ро́сья", topic: знакомство, chapter: 3 }
  - { id: dobrze, pl: dobrze, ru: хорошо, pos: adv, pron: "до́бжэ", topic: знакомство, chapter: 3 }
  - { id: zle, pl: źle, ru: плохо, pos: adv, pron: "зьле", topic: знакомство, chapter: 3 }
  - { id: przyjaciel, pl: przyjaciel, ru: друг, pos: noun, gender: m, pron: "пшыя́цьель", topic: люди, chapter: 3 }
  - { id: bardzo, pl: bardzo, ru: очень, pos: adv, pron: "ба́рдзо", topic: знакомство, chapter: 3 }
```

- [ ] **Step 7: Remove the sample file and validate**

Run:
```bash
git rm content/words/sample.yml
pnpm validate
```
Expected: sample lessons from earlier plans still reference `rzeka`, `brzeg`, `glowa`, `uroda`, `zab` — all present — so the output is `✓ content is valid`. Fix any reported typo in the YAML (not in the validator).

Run: `node -e "const y=require('yaml'),fs=require('fs');let n=0,f=0;for(const x of fs.readdirSync('content/words')){const w=y.parse(fs.readFileSync('content/words/'+x,'utf8')).words;n+=w.length;f+=w.filter(v=>v.falseFriend).length}console.log(n,f)"`
Expected: `162 33`.

- [ ] **Step 8: Run tests and commit**

Run: `pnpm test`
Expected: PASS (component tests use fixtures, not content).

```bash
git add content
git commit -m "content: add chapters, sound patterns and 162-word vocabulary

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---
### Task 2: Chapter 1 — Алфавит и произношение

**Files:**
- Modify: `content/lessons/01-alphabet/01-letters.md`, `content/lessons/01-alphabet/02-stress.md`
- Create: `content/lessons/01-alphabet/03-digraphs.md`

**Interfaces:**
- Consumes: word ids from Task 1 (`dom mama tata woda ryba noc ulica ksiazka jablko kawa herbata matematyka uniwersytet telefon dziewczyna chlopiec miasto`).
- Produces: lessons 1.1 «Буквы», 1.2 «Ударение», 1.3 «Сочетания букв и мягкие звуки».

- [ ] **Step 1: Write `content/lessons/01-alphabet/01-letters.md`**

```md
---
title: Буквы
description: Польский алфавит и чем он отличается от русского.
chapter: 1
order: 1
level: A1
words: [dom, mama, tata, woda, ryba, noc, ulica, ksiazka, jablko, kawa, herbata]
---

<!-- review -->

Польский пишется латиницей, но звучит удивительно близко к русскому. Многие слова вы узнаете сразу: :pl-word{id="dom"}, :pl-word{id="mama"}, :pl-word{id="woda"}, :pl-word{id="ryba"}.

Нажмите на польское слово, чтобы увидеть перевод и произношение, а кнопка 🔊 произнесёт его вслух.

## Буквы, которые читаются иначе

::compare-table
---
headers: [Буква, Звук, Пример, Перевод]
plColumns: [0, 2]
rows:
  - [c, ц, noc, ночь]
  - [h, х, herbata, чай]
  - [j, й, jabłko, яблоко]
  - [w, в, woda, вода]
  - [y, ы, ryba, рыба]
  - [e, э, telefon, телефон]
  - [i, "и (смягчает предыдущую согласную)", miasto, город]
---
::

Буквы **q**, **v** и **x** встречаются только в иностранных словах.

## Особые буквы

::compare-table
---
headers: [Буква, Звук, Пример, Перевод]
plColumns: [0, 2]
rows:
  - [ą, "носовое «он»", ząb, зуб]
  - [ę, "носовое «эн»", ręka, рука]
  - [ł, "краткое «у», как английское w", głowa, голова]
  - [ó, "у", stół, стол]
  - [ś, "мягкое «сь»", gęś, гусь]
  - [ć, "мягкое «ць»", pięć, пять]
  - [ź, "мягкое «зь»", źle, плохо]
  - [ż, ж, żona, жена]
  - [ń, нь, dzień, день]
---
::

Попробуйте произнести: :pron{id="ksiazka"}, :pron{id="jablko"}, :pron{id="ulica"}.

::quiz
---
final: true
questions:
  - type: choice
    q: Как читается польская буква w?
    options: [в, у, ш]
    answer: 0
  - type: choice
    q: Какая буква звучит как русское «ы»?
    options: [i, y, j]
    answer: 1
  - type: input
    q: Напишите по-польски «вода».
    answer: woda
  - type: match
    q: Соедините слова
    pairs:
      - [dom, дом]
      - [ryba, рыба]
      - [noc, ночь]
      - [ulica, улица]
---
::
```

- [ ] **Step 2: Write `content/lessons/01-alphabet/02-stress.md`**

```md
---
title: Ударение
description: Где ставить ударение в польских словах.
chapter: 1
order: 2
level: A1
words: [telefon, matematyka, uniwersytet]
---

<!-- review -->

Хорошая новость: в польском ударение почти всегда падает на **предпоследний слог**. Запоминать его для каждого слова, как в русском, не нужно.

::compare-table
---
headers: [Слово, Слоги, Произношение]
plColumns: [0]
rows:
  - [mama, "MA-ma", "ма́ма"]
  - [ulica, "u-LI-ca", "ули́ца"]
  - [telefon, "te-LE-fon", "тэлэ́фон"]
  - [dziewczyna, "dziew-CZY-na", "дзьефчы́на"]
---
::

Сравните с русским: *молоко́*, но :pl-word{id="mleko"} — *мле́ко*; *голова́*, но :pl-word{id="glowa"} — *гуо́ва*.

## Исключения

Некоторые слова из греческого и латыни ставят ударение на **третий слог с конца**:

::compare-table
---
headers: [Слово, Произношение, Перевод]
plColumns: [0]
rows:
  - ["!matematyka", "матэма́тыка", математика]
  - ["!uniwersytet", "унивэ́рсытэт", университет]
---
::

::quiz
---
final: true
questions:
  - type: choice
    q: На какой слог падает ударение в слове ulica?
    options: [u, li, ca]
    answer: 1
  - type: choice
    q: Где ударение в слове telefon?
    options: [te, le, fon]
    answer: 1
  - type: choice
    q: В слове matematyka ударение падает на…
    options: [предпоследний слог, третий слог с конца]
    answer: 1
---
::
```

- [ ] **Step 3: Write `content/lessons/01-alphabet/03-digraphs.md`**

```md
---
title: Сочетания букв и мягкие звуки
description: Как читать sz, cz, rz, ch и мягкие ś, ć, ź, ń.
chapter: 1
order: 3
level: A1
words: [dziewczyna, chlopiec, miasto, kawa]
---

<!-- review -->

Там, где в русском одна буква, польский часто пишет две.

## Твёрдые шипящие

::compare-table
---
headers: [Сочетание, Звук, Пример, Перевод]
plColumns: [0, 2]
rows:
  - [sz, ш, szkoła, школа]
  - [cz, ч (твёрдое), czarny, чёрный]
  - [rz, ж, rzeka, река]
  - [ż, ж, żona, жена]
  - [ch, х, chleb, хлеб]
  - [szcz, шч, szczęście, счастье]
  - [dż, дж, dżem, джем]
---
::

**rz** и **ż** звучат одинаково — это просто разное написание одного звука. После k, p, t, ch **rz** оглушается: :pron{pl="trzy" ru="тшы"}.

## Мягкие звуки

Мягкость пишется двумя способами: чёрточкой над буквой в конце слога или буквой **i** перед гласной.

::compare-table
---
headers: [Перед согласной или в конце, Перед гласной, Звук, Пример]
plColumns: [0, 1, 3]
rows:
  - [ś, si, сь, "gęś, siła"]
  - [ć, ci, ць, "pięć, ciocia"]
  - [ź, zi, зь, "źle, zima"]
  - [ń, ni, нь, "dzień, niebo"]
  - [dź, dzi, дзь, "dźwięk, dziewczyna"]
---
::

Послушайте: :pron{id="dziewczyna"}, :pron{id="chlopiec"}, :pron{id="miasto"}.

::quiz
---
final: true
questions:
  - type: choice
    q: Как читается rz в слове rzeka?
    options: [р, ж, рж]
    answer: 1
  - type: choice
    q: Как читается ch?
    options: [ч, х, ш]
    answer: 1
  - type: input
    q: Какими буквами пишется звук «ш»?
    answer: sz
  - type: match
    q: Соедините написание и звук
    pairs:
      - [sz, ш]
      - [cz, ч]
      - [ch, х]
      - [ń, нь]
---
::
```

- [ ] **Step 4: Validate, generate and check**

Run: `pnpm validate && pnpm generate`
Expected: `✓ content is valid`; generate exit 0 with `/lessons/01-alphabet/03-digraphs` prerendered.

Manual (`pnpm preview`): open 1.1–1.3; every table renders, highlighted rows appear in 1.2, the quiz in each lesson reaches «N из N», and ← → move through 1.1 → 1.2 → 1.3.

- [ ] **Step 5: Commit**

```bash
git add content/lessons/01-alphabet
git commit -m "content: write chapter 1 lessons (alphabet, stress, digraphs)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Chapter 2, part 1 — rz, polnoglasie, ł and ó

**Files:**
- Modify: `content/lessons/02-sounds/01-rz.md`
- Create: `content/lessons/02-sounds/02-polnoglasie.md`, `content/lessons/02-sounds/03-l-o.md`

**Interfaces:**
- Consumes: pattern ids `rz-р ro-оро ło-оло le-оло ł-л ó-о`; word ids for those patterns (Task 1).
- Produces: lessons 2.1 «rz и р», 2.2 «Полногласие: оро и оло», 2.3 «ł и ó».

- [ ] **Step 1: Write `content/lessons/02-sounds/01-rz.md`**

The final quiz must stay exactly as below (three questions) — `tests/e2e/quiz.spec.ts` answers it.

```md
---
title: rz и р
description: Как по польскому rz угадать русское слово с «р».
chapter: 2
order: 1
level: A1
words: [rzeka, brzeg, morze, trzy, krzyk, gorzki, burza, przed]
---

<!-- review -->

Польский и русский — родственные славянские языки. За тысячу лет звуки в них менялись, но **закономерно**. Зная несколько правил, вы сможете угадывать сотни слов.

Первое правило: там, где в русском **р** перед гласной, в польском часто **rz** (читается «ж»).

::cognate-list{pattern="rz-р"}
::

Сравните :pl-word{id="rzeka"} и «река», :pl-word{id="morze"} и «море». Не забывайте про оглушение: :pron{id="trzy"}, :pron{id="przed"}.

Будьте внимательны: :pl-word{id="burza"} — это прежде всего «гроза», хотя родственно русскому «буря».

::quiz
---
final: true
questions:
  - type: choice
    q: Как по-польски «река»?
    options: [reka, rzeka, żeka]
    answer: 1
  - type: pattern
    q: Русское «берег» → по-польски?
    pattern: rz-р
    answer: brzeg
  - type: match
    q: Соедините слова
    pairs:
      - [rzeka, река]
      - [brzeg, берег]
---
::
```

- [ ] **Step 2: Write `content/lessons/02-sounds/02-polnoglasie.md`**

```md
---
title: "Полногласие: оро и оло"
description: Почему «голова» по-польски głowa, а «дорога» — droga.
chapter: 2
order: 2
level: A1
words: [glowa, zloto, mlody, bloto, droga, krowa, broda, wrona, mleko]
---

<!-- review -->

В русском между согласными часто стоят сочетания **оро**, **оло**, **ере** («полногласие»). В польском на их месте одна гласная: **ro**, **ło**, **le**.

::cognate-list{pattern="ro-оро"}
::

::cognate-list{pattern="ło-оло"}
::

::cognate-list{pattern="le-оло"}
::

Значения иногда разошлись: :pl-word{id="bloto"} — это чаще «грязь», чем «болото», а :pl-word{id="mlody"} — «молодой».

::quiz
---
final: true
questions:
  - type: pattern
    q: Русское «ворона» → по-польски?
    pattern: ro-оро
    answer: wrona
  - type: pattern
    q: Русское «золото» → по-польски?
    pattern: ło-оло
    answer: złoto
  - type: choice
    q: Как по-польски «молоко»?
    options: [młoko, mleko, moloko]
    answer: 1
  - type: match
    q: Соедините слова
    pairs:
      - [głowa, голова]
      - [droga, дорога]
      - [broda, борода]
      - [krowa, корова]
---
::
```

- [ ] **Step 3: Write `content/lessons/02-sounds/03-l-o.md`**

```md
---
title: ł и ó
description: Буква ł на месте «л» и буква ó на месте «о».
chapter: 2
order: 3
level: A1
words: [lyzka, maly, bialy, pelny, lza, sila, stol, woz, noz, krol, mroz]
---

<!-- review -->

## ł вместо л

Буква **ł** когда-то звучала как твёрдое русское «л». Сегодня она произносится как краткое «у», но в словах стоит там же, где русское **л**.

::cognate-list{pattern="ł-л"}
::

## ó вместо о

Буква **ó** читается как «у», но пишется там, где в русском обычно **о**. Поэтому :pl-word{id="stol"} звучит «стуу», а пишется почти как «стол».

::cognate-list{pattern="ó-о"}
::

::quiz
---
final: true
questions:
  - type: pattern
    q: Русское «стол» → по-польски?
    pattern: ó-о
    answer: stół
  - type: pattern
    q: Русское «белый» → по-польски?
    pattern: ł-л
    answer: biały
  - type: choice
    q: Как читается буква ó?
    options: [о, у]
    answer: 1
  - type: input
    q: Напишите по-польски «нож».
    answer: nóż
---
::
```

- [ ] **Step 4: Validate, run E2E quiz spec, commit**

Run: `pnpm validate && pnpm test:e2e tests/e2e/quiz.spec.ts`
Expected: `✓ content is valid`; the quiz spec PASSES.

```bash
git add content/lessons/02-sounds
git commit -m "content: write chapter 2 lessons on rz, polnoglasie, ł and ó

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---
### Task 4: Chapter 2, part 2 — nasal vowels, sibilants and endings, false friends

**Files:**
- Create: `content/lessons/02-sounds/04-nasals.md`, `content/lessons/02-sounds/05-sibilants.md`, `content/lessons/02-sounds/06-false-friends.md`

**Interfaces:**
- Consumes: pattern ids `ą-у ę-у ę-я ch-х sz-ш cz-ч ż-ж ść-сть ć-ть dzi-де`; all false-friend word ids (Task 1).
- Produces: lessons 2.4 «Носовые ą и ę», 2.5 «Шипящие и окончания», 2.6 «Ложные друзья».

- [ ] **Step 1: Write `content/lessons/02-sounds/04-nasals.md`**

```md
---
title: Носовые ą и ę
description: Носовые гласные на месте русских «у» и «я».
chapter: 2
order: 4
level: A1
words: [zab, dab, maka, maz, pajak, was, reka, ges, pepek, mieso, piec, swiety, imie, pamiec, dziesiec, jezyk]
---

<!-- review -->

В польском сохранились **носовые гласные**, которые русский давно утратил.

- **ą** звучит как «он» (перед b, p — «ом»): :pron{id="zab"}
- **ę** звучит как «эн» (перед b, p — «эм»), а в конце слова — просто «э»: :pron{id="imie"}

## ą — русское у

::cognate-list{pattern="ą-у"}
::

## ę — русское я

::cognate-list{pattern="ę-я"}
::

## ę — иногда тоже у

::cognate-list{pattern="ę-у"}
::

::quiz
---
final: true
questions:
  - type: pattern
    q: Русское «зуб» → по-польски?
    pattern: ą-у
    answer: ząb
  - type: pattern
    q: Русское «мясо» → по-польски?
    pattern: ę-я
    answer: mięso
  - type: pattern
    q: Русское «рука» → по-польски?
    pattern: ę-у
    answer: ręka
  - type: choice
    q: Как по-польски «пять»?
    options: [pięć, pyć, piąć]
    answer: 0
---
::
```

- [ ] **Step 2: Write `content/lessons/02-sounds/05-sibilants.md`**

```md
---
title: Шипящие и окончания
description: sz, cz, ż, ch и окончания -ść, -ć, dzi.
chapter: 2
order: 5
level: A1
words: [chleb, ucho, mucha, duch, chata, szkola, szum, kasza, mysz, szyja, czarny, czlowiek, czysty, cztery, zaba, zona, zolty, zyc, radosc, gosc, kosc, czesc-noun, mlodosc, byc, pic, bic, myc, miec, dzien, dzieci, dziewiec]
---

<!-- review -->

Эти соответствия почти не требуют запоминания: польское написание просто передаёт знакомые русские звуки.

## Шипящие и ch

::cognate-list{pattern="sz-ш"}
::

::cognate-list{pattern="cz-ч"}
::

::cognate-list{pattern="ż-ж"}
::

::cognate-list{pattern="ch-х"}
::

## Окончания

Существительные на **-ść** соответствуют русским на **-сть**:

::cognate-list{pattern="ść-сть"}
::

Неопределённая форма глагола оканчивается на **-ć**, как русская на **-ть**:

::cognate-list{pattern="ć-ть"}
::

Мягкое **dzi** часто стоит на месте русского **де**:

::cognate-list{pattern="dzi-де"}
::

::quiz
---
final: true
questions:
  - type: pattern
    q: Русское «радость» → по-польски?
    pattern: ść-сть
    answer: radość
  - type: pattern
    q: Русское «пить» → по-польски?
    pattern: ć-ть
    answer: pić
  - type: pattern
    q: Русское «день» → по-польски?
    pattern: dzi-де
    answer: dzień
  - type: match
    q: Соедините слова
    pairs:
      - [szkoła, школа]
      - [czarny, чёрный]
      - [żona, жена]
      - [chleb, хлеб]
---
::
```

- [ ] **Step 3: Write `content/lessons/02-sounds/06-false-friends.md`**

```md
---
title: Ложные друзья
description: Слова, которые похожи на русские, но значат совсем другое.
chapter: 2
order: 6
level: A1
words: [miasto, uroda, sklep, dywan, zapomniec, owoc, zakaz, czas, list, dworzec, zachod, rodzina, zawod, pytac, brak, jutro, dynia, pokoj, nagle, rok, lustro, wesele, krzeslo, obraz, czaszka, zdanie, sprawa, powiesc, stac, zalowac, won, duma, wies]
---

<!-- review -->

Сходство языков помогает, но иногда подводит. **Ложные друзья** — слова, похожие на русские, но с другим значением. Их лучше выучить сразу. В тексте они подчёркнуты красным пунктиром.

## Самые коварные

:false-friend{id="zapomniec"}

:false-friend{id="uroda"}

:false-friend{id="sklep"}

:false-friend{id="dywan"}

:false-friend{id="owoc"}

:false-friend{id="czas"}

:false-friend{id="jutro"}

:false-friend{id="rodzina"}

:false-friend{id="miasto"}

:false-friend{id="krzeslo"}

:false-friend{id="lustro"}

:false-friend{id="zawod"}

## В быту и в городе

:pl-word{id="dworzec"}, :pl-word{id="zakaz"}, :pl-word{id="pokoj"}, :pl-word{id="dynia"}, :pl-word{id="list"}, :pl-word{id="czaszka"}, :pl-word{id="wesele"}, :pl-word{id="wies"}.

## Время, чувства и дела

:pl-word{id="rok"}, :pl-word{id="nagle"}, :pl-word{id="zachod"}, :pl-word{id="brak"}, :pl-word{id="sprawa"}, :pl-word{id="zdanie"}, :pl-word{id="obraz"}, :pl-word{id="powiesc"}, :pl-word{id="pytac"}, :pl-word{id="stac"}, :pl-word{id="zalowac"}, :pl-word{id="won"}, :pl-word{id="duma"}.

Все ложные друзья собраны в [словаре](/vocabulary) (фильтр «Только ложные друзья») и в [карточках](/flashcards).

::quiz
---
final: true
questions:
  - type: choice
    q: Sklep — это…
    options: [склеп, магазин, склад]
    answer: 1
  - type: choice
    q: Zapomnieć значит…
    options: [запомнить, забыть]
    answer: 1
  - type: choice
    q: Dywan — это…
    options: [диван, ковёр]
    answer: 1
  - type: input
    q: Как по-польски «завтра»?
    answer: jutro
  - type: match
    q: Соедините слова
    pairs:
      - [owoc, фрукт]
      - [rodzina, семья]
      - [krzesło, стул]
      - [lustro, зеркало]
---
::
```

- [ ] **Step 4: Validate, generate, commit**

Run: `pnpm validate && pnpm generate`
Expected: `✓ content is valid`; generate exit 0.

Manual (`pnpm preview`): 2.4–2.6 render every cognate table and false-friend callout; hovering a red-underlined word shows «⚠ Не путать с …».

```bash
git add content/lessons/02-sounds
git commit -m "content: write chapter 2 lessons on nasals, sibilants and false friends

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Chapter 3 — Первые фразы

**Files:**
- Create: `content/lessons/03-phrases/01-greetings.md`, `content/lessons/03-phrases/02-byc.md`, `content/lessons/03-phrases/03-introductions.md`

**Interfaces:**
- Consumes: phrase, pronoun and verb ids from `content/words/phrases.yml`, plus `byc`, `imie` (Task 1).
- Produces: lessons 3.1 «Приветствия», 3.2 «Глагол być», 3.3 «Знакомство: pan и pani».

- [ ] **Step 1: Write `content/lessons/03-phrases/01-greetings.md`**

```md
---
title: Приветствия
description: Как поздороваться, попрощаться и поблагодарить.
chapter: 3
order: 1
level: A1
words: [dzien-dobry, dobry-wieczor, czesc, do-widzenia, dobranoc, dziekuje, prosze, przepraszam, tak, nie]
---

<!-- review -->

## Здравствуйте и привет

::compare-table
---
headers: [Польский, Русский, Когда]
plColumns: [0]
rows:
  - [Dzień dobry!, "Добрый день! Здравствуйте!", "с утра до вечера, вежливо"]
  - [Dobry wieczór!, Добрый вечер!, "вечером, вежливо"]
  - ["!Cześć!", "Привет! / Пока!", "друзьям — и при встрече, и при прощании"]
  - [Do widzenia!, До свидания!, вежливо]
  - [Dobranoc!, Спокойной ночи!, перед сном]
---
::

**Cześć** — и «привет», и «пока». Незнакомым людям так не говорят.

## Спасибо и пожалуйста

- :pl-word{id="dziekuje"} — спасибо. Послушайте: :pron{id="dziekuje"}
- :pl-word{id="prosze"} — пожалуйста; «прошу» (когда что-то даёте или просите)
- :pl-word{id="przepraszam"} — извините

::quiz
---
final: true
questions:
  - type: choice
    q: Как поздороваться днём с незнакомым человеком?
    options: ["Cześć!", "Dzień dobry!"]
    answer: 1
  - type: input
    q: Напишите по-польски «спасибо».
    answer: dziękuję
  - type: choice
    q: Proszę значит…
    options: ["пожалуйста; прошу", "извините"]
    answer: 0
  - type: match
    q: Соедините фразы
    pairs:
      - [do widzenia, до свидания]
      - [dobranoc, спокойной ночи]
      - [przepraszam, извините]
---
::
```

- [ ] **Step 2: Write `content/lessons/03-phrases/02-byc.md`**

```md
---
title: Глагол być
description: «Быть» в настоящем времени — в польском без него не обойтись.
chapter: 3
order: 2
level: A1
words: [byc, ja, ty, on, ona, my, wy, oni, one]
---

<!-- review -->

В русском мы говорим «Я студент», пропуская глагол. В польском глагол :pl-word{id="byc"} в настоящем времени **обязателен**: *Jestem studentem.*

::compare-table
---
headers: [Лицо, Русский, Польский]
rows:
  - [я, "я (есть)", jestem]
  - [ты, "ты (есть)", jesteś]
  - [он / она / оно, "он (есть)", jest]
  - [мы, "мы (есть)", jesteśmy]
  - [вы, "вы (есть)", jesteście]
  - ["!они", "они (есть)", "są"]
---
::

## Oni и one

В польском два слова «они»:

- :pl-word{id="oni"} — если в группе есть хотя бы один мужчина;
- :pl-word{id="one"} — если мужчин нет (женщины, дети, животные, вещи).

*Oni są w domu.* — Они (мужчины или смешанная группа) дома.
*One są w szkole.* — Они (девушки) в школе.

::quiz
---
final: true
questions:
  - type: input
    q: "Ty ___ w domu. (być)"
    answer: jesteś
  - type: input
    q: "My ___ w szkole. (być)"
    answer: jesteśmy
  - type: choice
    q: "Oni ___ w Polsce."
    options: [jest, są, jesteście]
    answer: 1
  - type: choice
    q: Как сказать «они» о группе девушек?
    options: [oni, one]
    answer: 1
---
::
```

- [ ] **Step 3: Write `content/lessons/03-phrases/03-introductions.md`**

```md
---
title: "Знакомство: pan и pani"
description: Как познакомиться и вежливо обратиться к человеку.
chapter: 3
order: 3
level: A1
words: [pan, pani, milo-mi, jak-sie-masz, imie, skad, mieszkac, mowic, rozumiec, polski, rosyjski, polska, rosja, dobrze, zle, bardzo, przyjaciel, kto, co, gdzie, jak]
---

<!-- review -->

## Вежливое «вы»

Вместо русского «вы» поляки говорят :pl-word{id="pan"} (мужчине) и :pl-word{id="pani"} (женщине), а глагол ставят в **третье лицо**, как будто говорят «он» или «она».

::compare-table
---
headers: [Польский, Русский]
plColumns: [0]
rows:
  - ["Czy pan mówi po polsku?", "Вы говорите по-польски? (мужчине)"]
  - ["Czy pani rozumie?", "Вы понимаете? (женщине)"]
  - ["!Czy mówisz po polsku?", "Ты говоришь по-польски? (другу)"]
---
::

## Диалог

::compare-table
---
headers: [Польский, Русский]
plColumns: [0]
rows:
  - ["Dzień dobry! Jak ma pan na imię?", "Здравствуйте! Как вас зовут?"]
  - ["Mam na imię Adam. A pani?", "Меня зовут Адам. А вас?"]
  - ["Mam na imię Anna. Miło mi!", "Меня зовут Анна. Очень приятно!"]
  - ["Skąd pani jest?", "Откуда вы?"]
  - ["Jestem z Rosji, ale mieszkam w Polsce.", "Я из России, но живу в Польше."]
  - ["Pani bardzo dobrze mówi po polsku!", "Вы очень хорошо говорите по-польски!"]
---
::

Обратите внимание: «как вас зовут» по-польски — *jak ma pan/pani na imię*, дословно «как вы имеете на имя».

::quiz
---
final: true
questions:
  - type: choice
    q: Как вежливо спросить мужчину «Вы говорите по-польски?»
    options: ["Czy pan mówi po polsku?", "Czy wy mówicie po polsku?"]
    answer: 0
  - type: input
    q: Напишите по-польски «очень приятно» (два слова).
    answer: miło mi
  - type: choice
    q: "Jestem z Rosji значит…"
    options: ["Я из России", "Я в России"]
    answer: 0
  - type: match
    q: Соедините вопросительные слова
    pairs:
      - [gdzie, где]
      - [skąd, откуда]
      - [kto, кто]
      - [co, что]
---
::
```

- [ ] **Step 4: Validate, generate, commit**

Run: `pnpm validate && pnpm generate`
Expected: `✓ content is valid`; generate exit 0 with 12 lesson routes prerendered.

Manual (`pnpm preview`): the sidebar lists chapters 1–3 with 3 + 6 + 3 lessons; → navigates from 2.6 to 3.1.

```bash
git add content/lessons/03-phrases
git commit -m "content: write chapter 3 lessons (greetings, być, introductions)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---
### Task 6: Stories and cheat sheet

**Files:**
- Modify: `content/stories/kot-i-mysz.yml`, `content/cheatsheet.md`
- Create: `content/stories/w-sklepie.yml`

**Interfaces:**
- Consumes: word ids and pattern ids from Task 1.
- Produces: stories `/stories/kot-i-mysz`, `/stories/w-sklepie`; the complete `/cheatsheet`.

- [ ] **Step 1: Write `content/stories/kot-i-mysz.yml`**

```yaml
# review
title: Kot i mysz
titleRu: Кот и мышь
level: A1
description: Короткая история о коте, мыши и реке.
sentences:
  - pl: Kot mieszka nad rzeką.
    ru: Кот живёт у реки.
    words: { mieszka: mieszkac, rzeką: rzeka }
  - pl: Na brzegu stoi mały dom.
    ru: На берегу стоит маленький дом.
    words: { brzegu: brzeg, stoi: stac, mały: maly, dom: dom }
  - pl: W domu mieszka też mysz.
    ru: В доме живёт и мышь.
    words: { domu: dom, mieszka: mieszkac, mysz: mysz }
  - pl: Mysz ma małą głowę i długi ogon.
    ru: У мыши маленькая голова и длинный хвост.
    words: { Mysz: mysz, ma: miec, małą: maly, głowę: glowa }
  - pl: Każdego dnia kot szuka myszy.
    ru: Каждый день кот ищет мышь.
    words: { dnia: dzien, myszy: mysz }
  - pl: Ale mysz jest bardzo mądra.
    ru: Но мышь очень умная.
    words: { mysz: mysz, jest: byc, bardzo: bardzo }
  - pl: Rano pije mleko, kiedy kot śpi.
    ru: Утром она пьёт молоко, пока кот спит.
    words: { pije: pic, mleko: mleko }
  - pl: Wieczorem kot wraca do domu zmęczony.
    ru: Вечером кот возвращается домой усталый.
    words: { domu: dom }
  - pl: "„Jutro cię złapię!” — mówi kot."
    ru: "«Завтра я тебя поймаю!» — говорит кот."
    words: { Jutro: jutro, mówi: mowic }
  - pl: Mysz tylko się śmieje.
    ru: Мышь только смеётся.
    words: { Mysz: mysz }
```

- [ ] **Step 2: Write `content/stories/w-sklepie.yml`**

```yaml
# review
title: W sklepie
titleRu: В магазине
level: A1
description: "Покупаем хлеб и кофе. Помните: sklep — это магазин, а не склеп."
sentences:
  - pl: Dzień dobry!
    ru: Здравствуйте!
    words: { Dzień dobry: dzien-dobry }
  - pl: Dzień dobry! W czym mogę pomóc?
    ru: Здравствуйте! Чем могу помочь?
    words: { Dzień dobry: dzien-dobry }
  - pl: Poproszę chleb i mleko.
    ru: Дайте, пожалуйста, хлеб и молоко.
    words: { chleb: chleb, mleko: mleko }
  - pl: Czy ma pan też kawę?
    ru: А кофе у вас есть?
    words: { ma: miec, pan: pan, kawę: kawa }
  - pl: Tak, mamy kawę i herbatę.
    ru: Да, у нас есть кофе и чай.
    words: { Tak: tak, mamy: miec, kawę: kawa, herbatę: herbata }
  - pl: To poproszę jedną kawę. Ile płacę?
    ru: Тогда один кофе, пожалуйста. Сколько с меня?
    words: { kawę: kawa }
  - pl: Dwanaście złotych.
    ru: Двенадцать злотых.
  - pl: Proszę bardzo.
    ru: Пожалуйста.
    words: { Proszę: prosze, bardzo: bardzo }
  - pl: Dziękuję! Do widzenia!
    ru: Спасибо! До свидания!
    words: { Dziękuję: dziekuje, Do widzenia: do-widzenia }
  - pl: Do widzenia!
    ru: До свидания!
    words: { Do widzenia: do-widzenia }
```

- [ ] **Step 3: Write `content/cheatsheet.md`**

```md
---
title: Шпаргалка
description: Главные соответствия между русским и польским на одной странице.
---

<!-- review -->

# Шпаргалка

## Произношение

::compare-table
---
headers: [Польский, Звук]
plColumns: [0]
rows:
  - [ł, "у (краткое)"]
  - [w, в]
  - [y, ы]
  - ["ó, u", у]
  - ["rz, ż", ж]
  - [sz, ш]
  - [cz, "ч (твёрдое)"]
  - ["ch, h", х]
  - ["ś, si", сь]
  - ["ć, ci", ць]
  - ["ź, zi", зь]
  - ["ń, ni", нь]
  - ["dź, dzi", дзь]
  - [ą, "он (ом перед b, p)"]
  - [ę, "эн (эм перед b, p); в конце слова — э"]
---
::

Ударение почти всегда на **предпоследнем** слоге.

## Звуковые соответствия

::compare-table
---
headers: [Польский, Русский, Пример]
plColumns: [0]
rows:
  - [rz, р, "rzeka — река"]
  - [ł, л, "mały — малый"]
  - [ło, оло, "głowa — голова"]
  - [ro, оро, "droga — дорога"]
  - [le, оло, "mleko — молоко"]
  - [ó, о, "stół — стол"]
  - [ą, у, "ząb — зуб"]
  - [ę, у, "ręka — рука"]
  - [ę, я, "mięso — мясо"]
  - [ść, сть, "radość — радость"]
  - [ć, ть, "być — быть"]
  - [ch, х, "chleb — хлеб"]
  - [sz, ш, "szkoła — школа"]
  - [cz, ч, "czarny — чёрный"]
  - [ż, ж, "żona — жена"]
  - [dzi, де, "dzień — день"]
---
::

## Ложные друзья

::compare-table
---
headers: [Польское слово, Похоже на, На самом деле]
plColumns: [0]
rows:
  - [brak, брак, "нехватка, отсутствие"]
  - [czas, час, время]
  - [czaszka, чашка, череп]
  - [duma, дума, гордость]
  - [dworzec, дворец, вокзал]
  - [dynia, дыня, тыква]
  - [dywan, диван, ковёр]
  - [jutro, утро, завтра]
  - [krzesło, кресло, стул]
  - [list, лист, письмо]
  - [lustro, люстра, зеркало]
  - [miasto, место, город]
  - [nagle, нагло, внезапно]
  - [obraz, образ, картина]
  - [owoc, овощ, фрукт]
  - [pokój, покой, "комната; мир"]
  - [powieść, повесть, роман]
  - [pytać, пытать, спрашивать]
  - [rodzina, родина, семья]
  - [rok, рок, год]
  - [sklep, склеп, магазин]
  - [sprawa, справа, дело]
  - [stać, стать, стоять]
  - [uroda, урод, красота]
  - [wesele, веселье, свадьба]
  - [wieś, весь, деревня]
  - [woń, вонь, "аромат, запах"]
  - [zachód, заход, запад]
  - [zakaz, заказ, запрет]
  - [zapomnieć, запомнить, забыть]
  - [zawód, завод, профессия]
  - [zdanie, здание, "предложение; мнение"]
  - [żałować, жаловаться, "жалеть, сожалеть"]
---
::

## Грамматика: главные отличия

::compare-table
---
headers: [Тема, Русский, Польский]
plColumns: []
rows:
  - ["!Глагол «быть»", "Я студент.", "Jestem studentem. — глагол обязателен"]
  - ["!Вежливое «вы»", "Вы говорите…", "Pan / Pani mówi… — третье лицо"]
  - ["!Звательный падеж", "нет", "Anno! Panie Adamie!"]
  - ["!«Они»", "одно слово", "oni (есть мужчины) / one (мужчин нет)"]
  - [Ударение, "свободное", "на предпоследнем слоге"]
  - [Носовые гласные, "нет", "ą, ę"]
---
::
```

- [ ] **Step 4: Validate, run story and search E2E specs, commit**

Run: `pnpm validate && pnpm test:e2e tests/e2e/mobile.spec.ts tests/e2e/search.spec.ts tests/e2e/seo.spec.ts`
Expected: `✓ content is valid`; all selected specs PASS.

Manual (`pnpm preview`): `/stories/w-sklepie` — hovering *kawę* shows *kawa*, *Dzień dobry* is one linked phrase; `/cheatsheet` shows four tables with grammar rows highlighted.

```bash
git add content/stories content/cheatsheet.md
git commit -m "content: write stories and the cheat sheet

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: `CLAUDE.md` and final verification

**Files:**
- Create: `CLAUDE.md`

**Interfaces:**
- Consumes: everything built in Plans 1–5.
- Produces: contributor guide; a fully verified v1.

- [ ] **Step 1: Write `CLAUDE.md`**

````md
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static Nuxt 4 website teaching Polish (A1–A2) to Russian speakers, styled like an mdBook (*The Rust Programming Language*). UI text is Russian. Design spec: `docs/superpowers/specs/2026-09-14-polish-for-russians-design.md`; implementation plans: `docs/superpowers/plans/`.

## Commands

- `pnpm dev` — build the search index, then start the dev server
- `pnpm generate` — validate content → build search index → static site in `.output/public`
- `pnpm preview` — serve `.output/public` at http://localhost:4173
- `pnpm validate` — content schema and cross-reference check (fails with file-prefixed errors)
- `pnpm test` — Vitest; projects `unit` (`tests/unit`, node) and `nuxt` (`tests/nuxt`, Nuxt runtime + happy-dom)
- `pnpm vitest run --project unit tests/unit/quiz.test.ts -t "almost"` — one file / one test
- `pnpm test:e2e` — Playwright against `generate` + `preview`; `pnpm test:e2e tests/e2e/a11y.spec.ts` for one spec
- `pnpm lint`, `pnpm format`, `pnpm typecheck`

## Architecture

- **`shared/schemas.ts` is the single source of truth for content shape.** It feeds both `content.config.ts` (Nuxt Content collections) and `scripts/lib/validate.ts` (strict keys + cross-references). When you change a content field, update the schema, the validator tests and any component reading the field.
- **Content** (`content/`): `lessons/**/*.md` (frontmatter `title chapter order level words`), `words/*.yml` (each file is `{ words: [...] }`), `patterns.yml`, `chapters.yml`, `stories/*.yml`, `cheatsheet.md`. Lesson order and labels (`2.3`) come from `chapter` + `order`, not file names.
- **Markdown components** live in `app/components/content/`: `:pl-word{id}`, `:pron{id}` or `:pron{pl ru}`, `:false-friend{id}`, `::cognate-list{pattern}`, `::compare-table` (YAML props `headers`, `rows`, `plColumns`; a first cell starting with `!` highlights the row), `::quiz` (YAML props `questions`, `final`). The validator checks ids in `pl-word`, `pron`, `false-friend`, `cognate-list`.
- **Word and pattern data** is awaited once in `app/layouts/default.vue` via `useWords()` / `usePatterns()` (shared `useAsyncData` keys); components read it synchronously.
- **Pure logic** is in `app/utils/*.ts` (`nav`, `normalize`, `pattern`, `quiz`, `leitner`, `deck`, `progress`, `story`, `search`, `vocabulary`, `pron`, `speech`). These use relative imports only and no Nuxt auto-imports, so they run in plain Node tests and in `tsx` scripts. Put new rules here, not in components.
- **Progress** is one `useState('progress')` object validated by zod (`app/utils/progress.ts`). `app/plugins/progress.client.ts` loads `localStorage['polski:v1']` on `app:mounted` (after hydration, so prerendered HTML never mismatches) and saves on change. UI depending on progress must check `useProgress().loaded`. The theme is stored separately by `@nuxtjs/color-mode` under `polski:theme`.
- **Search**: `scripts/build-search-index.ts` writes `public/search-index.json` (gitignored); `useSearch()` fetches it on first open and builds a MiniSearch index using `normalizeLoose`, so diacritics and ё/е are ignored.

## Content conventions

- Word ids are ASCII (`ą→a ć→c ę→e ł→l ń→n ó→o ś→s ź/ż→z`); homographs get a suffix (`czesc` vs `czesc-noun`).
- `pron` transcription: `sz→ш cz→ч rz/ż→ж ś→сь ć→ць ź→зь dź/dzi→дзь ń→нь ł→у y→ы ó/u→у ą→он/ом ę→эн/эм (final э) ch→х`, devoice final consonants, mark stress with `́`.
- A word has at most one `pattern`, and the pattern's letters must occur in both `pl` and `ru` (validator enforces).
- Story `words` map exact, case-sensitive forms in the Polish sentence (multi-word forms allowed) to word ids.
- `<!-- review -->` (Markdown) or `# review` (YAML) marks Polish the owner has not checked yet — keep it on new or edited content.
- E2E tests depend on: lessons `01-alphabet/01-letters` and `01-alphabet/02-stress`, the 3-question final quiz in `02-sounds/01-rz`, story `kot-i-mysz`, word `zab`. Update `tests/e2e` in the same change if you alter them.

## Testing notes

- Component tests mock composables with `mockNuxtImport`; shared fixtures come from `tests/nuxt/fixtures.ts` via `await vi.hoisted(() => import('./fixtures'))`.
- Accessibility tests check key pages in light, sepia and dark themes with axe (`wcag2a`, `wcag2aa`); fix contrast failures by adjusting variables in `app/assets/css/themes.css`.
````

- [ ] **Step 2: Run the full verification suite**

Run:
```bash
pnpm validate && pnpm format && pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e
```
Expected: every command exits 0; Vitest and Playwright report no failures.

- [ ] **Step 3: Produce the review checklist for the project owner**

Run: `grep -rl 'review' content | sort`
Expected: the list of files that still need a Polish-language review (all lessons, word files, stories, patterns, cheat sheet). Include this list in the final report to the owner.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md contributor guide

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```
