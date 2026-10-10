---
title: Когда род не совпадает
description: Слова, у которых польский род другой, чем у русского перевода.
chapter: 4
order: 2
level: A1
words: [pies, cien, bol, medal, twarz, muzeum, zwierze, krokodyl, labedz]
---

<!-- review -->

В прошлом уроке мы увидели, что род обычно совпадает с русским. Теперь — исключения. Их немного, но они частотные, и ошибка сразу слышна: неверный род тянет за собой неверное прилагательное и неверное местоимение.

::compare-table
---
headers: [Польский, Род, Русский, Род]
plColumns: [0]
rows:
  - ["!pies", мужской, собака, женский]
  - ["!cień", мужской, тень, женский]
  - ["!ból", мужской, боль, женский]
  - ["!medal", мужской, медаль, женский]
  - ["!twarz", женский, лицо, средний]
  - ["!muzeum", средний, музей, мужской]
  - ["!zwierzę", средний, зверь, мужской]
---
::

Четыре первых слова опасны одинаково: по-русски они женского рода (три из них — на **-ь**), а по-польски мужского. Поэтому:

:pron{pl="Ten pies jest duży."} — Эта собака большая.
:pron{pl="Mam silny ból głowy."} — У меня сильная головная боль.
:pron{pl="Zdobył złoty medal."} — Он завоевал золотую медаль.

Обратите внимание на прилагательные: **silny**, **złoty** — мужская форма, хотя по-русски «сильная», «золотая».

::quiz
---
questions:
  - type: choice
    q: Как сказать «эта тень»?
    options: [ta cień, ten cień, to cień]
    answer: 1
    explain: "cień мужского рода, хотя русская «тень» женского: ten cień."
  - type: choice
    q: Как сказать «эта боль»?
    options: [ta ból, ten ból, to ból]
    answer: 1
    explain: "ból мужского рода, хотя «боль» по-русски женского: ten ból."
  - type: choice
    q: "Zdobył ___ medal. (золотой)"
    options: [złota, złoty, złote]
    answer: 1
    explain: "medal мужского рода, поэтому złoty, хотя по-русски «золотую медаль»."
  - type: input
    q: "To jest ___ pies. (mój / moja / moje)"
    answer: mój
    explain: "pies мужского рода: mój pies, хотя по-русски «моя собака»."
---
::

## Лицо и зверь

:pl-word{id="twarz"} — женского рода, хотя русское «лицо» среднего: *ta twarz*, *ładna twarz*.

:pl-word{id="zwierze"} — среднего рода, хотя русское «зверь» мужского: *to zwierzę*, *dzikie zwierzę*. Слово меняет основу в косвенных падежах: *zwierzę*, но *zwierzęcia*.

::quiz
---
questions:
  - type: choice
    q: Как сказать «красивое лицо»?
    options: [ładny twarz, ładna twarz, ładne twarz]
    answer: 1
    explain: "twarz женского рода, хотя «лицо» среднего: ładna twarz."
  - type: input
    q: "Вставьте указательное слово: ___ zwierzę (ta / ten / to)"
    answer: to
    explain: "zwierzę среднего рода, хотя «зверь» по-русски мужского: to zwierzę."
  - type: choice
    q: Как сказать «дикий зверь»?
    options: [dziki zwierzę, dzika zwierzę, dzikie zwierzę]
    answer: 2
    explain: "zwierzę среднего рода, поэтому прилагательное в среднем роде: dzikie zwierzę."
---
::

## Животные и винительный падеж

У названий животных мужского рода есть своя особенность: винительный падеж совпадает с родительным, а не с именительным. С мужчинами так же (*widzę brata*), а у женского рода этого нет: *widzę krowę*.

:pron{pl="Widzę krokodyla."} — Я вижу крокодила.
:pron{pl="Karmię łabędzia."} — Я кормлю лебедя.

Не *widzę krokodyl*. Русский делает ровно то же самое («вижу крокодила»), так что правило знакомое.

::quiz
---
questions:
  - type: input
    q: "Widzę ___. (kot)"
    answer: kota
    explain: "У названий животных винительный совпадает с родительным: kot → kota, как «вижу кота»."
  - type: choice
    q: "Karmię ___. (ptak)"
    options: [ptak, ptaka]
    answer: 1
    explain: "ptak — животное, поэтому в винительном форма родительного: karmię ptaka."
  - type: input
    q: "Mam ___. (pies)"
    answer: psa
    explain: "pies → psa: животное, винительный = родительный, а беглое e выпадает."
---
::

::quiz
---
final: true
questions:
  - type: choice
    q: Как правильно сказать «большая собака»?
    options: [duża pies, duży pies, duże pies]
    answer: 1
    explain: "pies мужского рода, поэтому duży pies, хотя по-русски «большая собака»."
  - type: choice
    q: Какого рода польское «muzeum»?
    options: [мужского, женского, среднего]
    answer: 2
    explain: "muzeum среднего рода, хотя русский «музей» мужского."
  - type: input
    q: "Вставьте существительное: silny ___ (боль)"
    answer: ból
    explain: "ból мужского рода, поэтому при нём silny, а не silna."
  - type: input
    q: "Я вижу крокодила — Widzę ___."
    answer: krokodyla
    explain: "krokodyl — животное: винительный = родительный, krokodyla."
  - type: match
    q: Соедините польское слово и род
    pairs:
      - [cień, мужской]
      - [twarz, женский]
      - [zwierzę, средний]
    explain: "cień — мужской (русская «тень» — женская), twarz — женский («лицо» — средний), zwierzę — средний («зверь» — мужской)."
---
::
