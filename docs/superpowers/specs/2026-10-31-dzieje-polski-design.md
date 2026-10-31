# «Dzieje Polski» — design

A history of Poland written in Polish by Claude for this site's readers: an original text, not a
translation or an adaptation. It is read in the existing book reader (Frank-method chunks with a
Russian gloss and notes), next to London, Prus and Dante in `/books`.

## Size and structure

Option B of the size discussion: about 110 000 Polish words in 45 chapters of ~2 500 words each,
the size of a solid popular history (~350 printed pages). Two volumes, set up like Dante:

- **Tom I. Od początków do 1795** — `historia-i-NN-<slug>.yml`, 22 chapters.
- **Tom II. Od rozbiorów do dziś** — `historia-ii-NN-<slug>.yml`, 23 chapters.

`bookId` strips `-NN-…`, so each volume is its own book; the roman numeral keeps them in order.

## Header fields

```yaml
# review
title: "Dzieje Polski. Tom I"            # "Dzieje Polski. Tom II"
titleRu: "История Польши. Том I"
author: "Claude (ИИ)"
source:
  name: "Оригинальный текст, написанный для этого сайта"
  url: https://github.com/gramkin/PolishLessons
  license: CC BY-SA 4.0
  licenseUrl: https://creativecommons.org/licenses/by-sa/4.0/
chapter: 1
chapterTitle: "…"
chapterTitleRu: "…"
level: B1 | B2
```

No `translator`. No `en` on paragraphs (there is no source text). Every paragraph carries
`draft: true` until the owner has checked it.

## Level

Tom I chapters 1–3 (legends, Mieszko) are B1; everything else is B2. Sentences stay at the length
of the *Zew krwi* translation; long periodic sentences of academic Polish are split.

## Writing rules

- **A story, not a textbook.** Each chapter is built around one or two scenes or people, with the
  dates, causes and consequences placed around them. Daily life, economy and culture get room in
  every period, not only kings and battles.
- **Facts are checked before the owner sees a chapter.** Every date, number and name is verified
  against reference sources; doubtful or disputed figures (casualty counts, legends presented as
  history) are marked as such in the text («według kronikarza…», «szacuje się…»).
- **Polish perspective, factual tone.** Russian-Polish topics (1610, the partitions, the uprisings,
  1920, 17 September 1939, Katyń, 1944–1947) are told plainly from the Polish side, with facts, not
  polemics. Dark pages of Polish history (the Galician slaughter, Jedwabne, March 1968) are told as
  plainly.
- **After 2004 only an epilogue**: a short overview to the present, without judging current
  politics.
- **Chunks** follow the *Zew krwi* cut: a clause or a short sentence per chunk; `note` explains
  history terms (*sejm, szlachta, rozbiór, powstanie, liberum veto, unia, hołd, lenno*), case
  government and set phrases; dates in notes are read out where the numeral is hard
  («w 1410 roku — w tysiąc czterysta dziesiątym roku»).
- **`words` map** links forms to existing dictionary cards; missing history terms are noted for
  later cards, not added mid-chapter.
- **Names** keep Polish spelling (Karol Wielki, Napoleon, Chmielnicki). Foreign names the voice
  would misread go into `shared/book-pronunciation.ts` under each volume's `bookId`.

## Outline

### Tom I. Od początków do 1795

| # | Rozdział | Treść |
|---|---|---|
| 1 | Zanim powstała Polska | Słowianie, Biskupin, plemiona: Polanie, Wiślanie |
| 2 | Legendy początków | Lech, Krak i smok, Wanda, Popiel i Piast |
| 3 | Mieszko I | sojusz z Czechami, Dobrawa, chrzest 966, *Dagome iudex* |
| 4 | Bolesław Chrobry | zjazd gnieźnieński, wojny, koronacja 1025 |
| 5 | Od kryzysu do rozbicia | reakcja pogańska, Kazimierz Odnowiciel, św. Stanisław, testament Krzywoustego 1138 |
| 6 | Dzielnice, Mongołowie i Krzyżacy | Legnica 1241, sprowadzenie Krzyżaków 1226 |
| 7 | Miasta, wsie i Żydzi | lokacje na prawie niemieckim, statut kaliski 1264 |
| 8 | Władysław Łokietek | zjednoczenie, koronacja 1320, Płowce |
| 9 | Kazimierz Wielki | «zastał Polskę drewnianą…», Akademia 1364, Ruś Czerwona |
| 10 | Jadwiga i Jagiełło | Krewo 1385, chrzest Litwy |
| 11 | Grunwald | 1410, wojna trzynastoletnia, pokój toruński |
| 12 | Jak żyła średniowieczna Polska | wieś, miasto, Kościół, przywileje szlachty, *Nihil novi* |
| 13 | Zygmunt Stary i Bona | renesans na Wawelu, hołd pruski 1525 |
| 14 | Złoty wiek kultury | Kopernik, Kochanowski, Rej |
| 15 | Unia lubelska | 1569, Rzeczpospolita Obojga Narodów |
| 16 | Wolna elekcja | Henryk Walezy, konfederacja warszawska 1573, Batory |
| 17 | Wazowie i Moskwa | Zygmunt III, Kreml 1610–1612, stolica w Warszawie |
| 18 | Chmielnicki i potop | 1648, 1655, Częstochowa, Andruszów |
| 19 | Sobieski | Chocim, Wiedeń 1683 |
| 20 | Sarmaci i czasy saskie | kultura szlachecka, *liberum veto*, «za króla Sasa…» |
| 21 | Ostatni król | Poniatowski, oświecenie, pierwszy rozbiór 1772 |
| 22 | Konstytucja i upadek | Sejm Wielki, 3 maja 1791, Targowica, Kościuszko, 1795 |

### Tom II. Od rozbiorów do dziś

| # | Rozdział | Treść |
|---|---|---|
| 1 | Legiony i Napoleon | Dąbrowski, Mazurek, Księstwo Warszawskie |
| 2 | Królestwo Kongresowe | Kongres wiedeński, konstytucja 1815, Kraków, Poznań |
| 3 | Powstanie listopadowe | 1830–1831 |
| 4 | Wielka Emigracja | Mickiewicz, Chopin, Słowacki |
| 5 | Wiosna Ludów | rabacja galicyjska 1846, 1848 |
| 6 | Powstanie styczniowe | 1863–1864, Traugutt |
| 7 | Praca organiczna | pozytywizm, Prus, Sienkiewicz, Łódź, uwłaszczenie |
| 8 | Trzy zabory | rusyfikacja, Kulturkampf, Drzymała, Września, autonomia Galicji |
| 9 | Nowe idee | PPS i endecja, 1905, Skłodowska, emigracja za chlebem |
| 10 | Niepodległość | 1914–1918, Legiony Piłsudskiego, 11 listopada |
| 11 | Walka o granice | powstania wielkopolskie i śląskie, plebiscyty, Lwów |
| 12 | Wojna 1920 roku | Bitwa Warszawska, pokój ryski |
| 13 | Druga Rzeczpospolita | Narutowicz, Grabski, Gdynia, przewrót majowy 1926 |
| 14 | Życie międzywojenne | mniejszości, kultura, COP, kryzys, sanacja |
| 15 | Wrzesień 1939 | pakt, 1 i 17 września |
| 16 | Dwie okupacje | Generalne Gubernatorstwo, deportacje sowieckie, Katyń, Państwo Podziemne |
| 17 | Zagłada | getta, Auschwitz, powstanie w getcie 1943, Żegota, Jedwabne |
| 18 | Polacy na frontach | Enigma, Bitwa o Anglię, Anders, Monte Cassino, Berling |
| 19 | Powstanie Warszawskie | 1944 |
| 20 | Nowe granice, nowa władza | Jałta, przesiedlenia, 1946–1947, stalinizm, żołnierze wyklęci |
| 21 | Od Października do Grudnia | 1956, Gomułka, Marzec 1968, Grudzień 1970, Gierek |
| 22 | Solidarność | 1979, Sierpień 1980, stan wojenny |
| 23 | Wolna Polska | Okrągły Stół, 4 czerwca 1989, Balcerowicz, NATO, UE; epilog do dziś |

## Workflow

- Written by Claude alone, sequentially, without subagents (owner's rule).
- **Pilot first:** Tom I chapter 1 is written and committed alone; the owner checks the language,
  the detail and the chunking before the rest is written, and this spec is updated with anything
  that changes.
- Then one chapter per commit, each pushed. Per chapter: draft the Polish text → check facts →
  cut chunks with Russian gloss and notes → `words` map → `pnpm validate` (blocking) →
  commit and push.
- `pnpm lexicon` does not read books, so spelling is checked by a script of my own: every word of
  `clean` looked up in PoliMorf (`data/sources`), unknown ones listed and read by hand; `clean`
  must equal the joined chunks.
- Chapters do not have to change any code: the schema, reader, book index and search already
  handle original texts. If the source line or the empty `translator` shows oddly in the reader,
  that is fixed in the pilot commit.

## Out of scope

- Maps, images, timelines.
- New dictionary cards for history terms (listed after each chapter, added later on request).
- Quizzes on the book's chapters.
