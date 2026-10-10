---
title: Согласование прилагательных
description: "Прилагательное подстраивается под существительное — род, число, падеж."
chapter: 10
order: 1
level: A2
words: [dobry, zly, duzy, nowy, stary]
---

<!-- review -->

Прилагательное в польском согласуется с существительным — точно так же, как в русском. Если вы умеете сказать «новый дом», «новая книга», «новое окно», половина работы уже сделана.

::compare-table
---
headers: [Род, Окончание, Пример, Русский]
plColumns: [1, 2]
rows:
  - ["!мужской", "-y / -i", "nowy dom", новый дом]
  - ["!женский", "-a", "nowa książka", новая книга]
  - ["!средний", "-e", "nowe okno", новое окно]
---
::

:pron{pl="To jest nowy dom."} — Это новый дом.
:pron{pl="To jest nowa książka."} — Это новая книга.
:pron{pl="To jest nowe okno."} — Это новое окно.

::quiz
---
questions:
  - type: input
    q: "To jest ___ dom. (stary)"
    answer: stary
    explain: "dom — мужской род, окончание -y: stary dom, «старый дом»."
  - type: input
    q: "To jest ___ kawa. (dobry)"
    answer: dobra
    explain: "kawa — женский род, окончание -a: dobra kawa. По-русски «кофе» мужского рода, а польское kawa — женского."
  - type: choice
    q: "To jest ___ morze. (duży)"
    options: [duży, duża, duże]
    answer: 2
    explain: "morze — средний род, окончание -e: duże morze, «большое море»."
---
::

## Окончание -i после k и g

После **k** и **g** вместо **-y** пишется **-i**: :pl-word{id="wysoki"} «высокий», *drogi* «дорогой». Это чисто орфографическое правило, знакомое по русскому «высокий», а не «высокый».

::quiz
---
questions:
  - type: input
    q: "To jest ___ dom. (wysoki)"
    answer: wysoki
    explain: "После k пишется -i: wysoki dom, как «высокий дом»."
  - type: choice
    q: "To jest ___ samochód. (drogi)"
    options: [drogy, drogi]
    answer: 1
    explain: "После g тоже -i: drogi samochód, «дорогая машина»."
  - type: choice
    q: "To jest ___ góra. (wysoki)"
    options: [wysoka, wysoki]
    answer: 0
    explain: "Правило -i касается только окончания -y. В женском роде окончание -a: wysoka góra, «высокая гора»."
---
::

## Во множественном числе снова мужской личный род

Тот же раздел, что в четвёртой главе, возвращается и здесь:

:pron{pl="Dobrzy studenci."} — Хорошие студенты. *(мужчины)*
:pron{pl="Dobre książki."} — Хорошие книги.

Мужской личный род требует **-i / -y** со смягчением: *dobry* → **dobrzy**, *stary* → **starzy**. Всё остальное берёт **-e**.

::quiz
---
questions:
  - type: choice
    q: "___ koledzy. (nowy)"
    options: [nowe, nowi]
    answer: 1
    explain: "koledzy — мужчины, поэтому мужской личный род: nowy → nowi."
  - type: choice
    q: "___ samochody. (nowy)"
    options: [nowi, nowe]
    answer: 1
    explain: "samochody — не люди, поэтому -e: nowe samochody."
  - type: input
    q: "___ panowie. (stary)"
    answer: starzy
    explain: "panowie — мужчины: мужской личный род со смягчением, stary → starzy (r → rz)."
---
::

## Прилагательное склоняется вместе с существительным

:pron{pl="Mam nowy samochód."} — У меня новая машина.
:pron{pl="Jadę nowym samochodem."} — Я еду на новой машине.

Падеж меняет оба слова сразу, как и в русском.

::quiz
---
questions:
  - type: choice
    q: "Mieszkam w ___ domu. (nowy)"
    options: [nowy, nowym, nowego]
    answer: 1
    explain: "w + предложный (место, урок 7.2): w nowym domu, «в новом доме». Прилагательное меняет падеж вместе с существительным."
  - type: choice
    q: "Nie mam ___ samochodu. (nowy)"
    options: [nowy, nowego, nowym]
    answer: 1
    explain: "После отрицания — родительный (урок 6.3), и прилагательное тоже: nowego samochodu."
  - type: input
    q: "Czytam ___ książkę. (dobry)"
    answer: dobrą
    explain: "książkę — винительный женского рода, прилагательное получает -ą: dobrą książkę, «хорошую книгу»."
---
::

::quiz
---
final: true
questions:
  - type: input
    q: "To jest ___ książka. (nowy)"
    answer: nowa
    explain: "książka — женский род: nowa."
  - type: input
    q: "To jest ___ okno. (nowy)"
    answer: nowe
    explain: "okno — средний род: nowe."
  - type: choice
    q: "Хорошие студенты (мужчины) — как правильно?"
    options: [dobre studenci, dobrzy studenci, dobra studenci]
    answer: 1
    explain: "studenci — мужчины, мужской личный род: dobry → dobrzy. Форма dobre — для всех остальных."
  - type: choice
    q: Почему «wysoki», а не «wysoky»?
    options: ["после k пишется -i", "это исключение", "так короче"]
    answer: 0
    explain: "После k и g пишется -i: wysoki, drogi. Это орфография, как в русском «высокий»."
  - type: match
    q: Соедините род и окончание
    pairs:
      - [мужской, "-y"]
      - [женский, "-a"]
      - [средний, "-e"]
    explain: "Мужской род -y (-i), женский -a, средний -e."
---
::
