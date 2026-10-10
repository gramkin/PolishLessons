---
title: Предложный падеж
description: Где и о чём — единственный падеж, который живёт только с предлогами.
chapter: 7
order: 2
level: A2
words: [praca, biuro, hotel, restauracja, o, przy]
---

<!-- review -->

Предложный (его называют и местным) отвечает на **o kim? o czym? gdzie?** Он единственный, который без предлога не встречается вовсе — отсюда и название.

::compare-table
---
headers: [Именительный, Предложный, Что изменилось]
plColumns: [0, 1]
rows:
  - ["!miasto", "w mieście", "t → ci"]
  - ["!książka", "o książce", "k → c"]
  - ["!szkoła", "w szkole", "ł → l"]
  - ["!biuro", "w biurze", "r → rz"]
  - ["!autobus", "w autobusie", "s → si"]
  - [dom, "w domu", "-u, без смягчения"]
  - [hotel, "w hotelu", "-u, без смягчения"]
---
::

## Смягчение — главная трудность

В большинстве слов окончание **-e** смягчает предыдущий согласный, и основа меняется на вид неузнаваемо:

:pron{pl="Mieszkam w mieście."} — Я живу в городе.
:pron{pl="Myślę o książce."} — Я думаю о книге.
:pron{pl="Pracuję w biurze."} — Я работаю в офисе.

Русский делает то же самое, только мягче: «в городе», «о книге». Сравните пары — соответствие есть, просто польские чередования заметнее.

::quiz
---
questions:
  - type: input
    q: "Czekam w ___. (samochód)"
    answer: samochodzie
    explain: "d перед -e смягчается в dzi, а ó переходит в o: samochód → w samochodzie."
  - type: choice
    q: "Mówimy o ___. (Polska)"
    options: [Polsce, Polsku, Polską]
    answer: 0
    explain: "k перед -e переходит в c: Polska → o Polsce, как książka → o książce."
  - type: input
    q: "Myślę o ___. (mama)"
    answer: mamie
    explain: "m перед -e смягчается: mama → o mamie, как «о маме»."
  - type: input
    q: "Pracuję w ___. (fabryka)"
    answer: fabryce
    explain: "Тот же переход k → c: fabryka → w fabryce, «на фабрике»."
---
::

## Когда окончание -u

Слова, оканчивающиеся на **k, g, ch** и на мягкий согласный, берут **-u** и ничего не меняют:

:pron{pl="Jestem w domu."} — Я дома.
:pron{pl="Mieszkam w hotelu."} — Я живу в отеле.
:pron{pl="Jedziemy w pociągu."} — Мы едем в поезде.

::quiz
---
questions:
  - type: input
    q: "Jestem w ___. (park)"
    answer: parku
    explain: "Основа на k — окончание -u без чередования: w parku."
  - type: choice
    q: "Śpię w ___. (namiot)"
    options: [namiotu, namiocie]
    answer: 1
    explain: "t — твёрдый согласный, поэтому -e со смягчением: namiot → w namiocie."
  - type: input
    q: "Książka leży na ___. (stolik)"
    answer: stoliku
    explain: "Основа на k — -u: na stoliku."
---
::

## Предлоги

С предложным идут :pl-word{id="w"}, :pl-word{id="na"}, :pl-word{id="o"}, :pl-word{id="przy"} и :pl-word{id="po"}:

:pron{pl="Jestem w pracy."} — Я на работе.
:pron{pl="Stoję przy oknie."} — Я стою у окна.
:pron{pl="Rozmawiamy o pracy."} — Мы говорим о работе.

Заметьте: *w pracy* — «на работе», а не «в работе». Предлоги в двух языках распределены по-разному, и это приходится запоминать пословно.

::quiz
---
questions:
  - type: choice
    q: "«Я на работе»: Jestem ___ pracy."
    options: [w, na]
    answer: 0
    explain: "«На работе» по-польски — w pracy. Предлоги в двух языках распределены по-разному, их запоминают пословно."
  - type: choice
    q: "«Я на почте» — какой падеж?"
    options: [винительный, предложный]
    answer: 1
    explain: "Место «где?» после na — предложный: na poczcie."
  - type: input
    q: "Wracam po ___. (koncert)"
    answer: koncercie
    explain: "po «после» + предложный: koncert → po koncercie, t смягчается в ci."
---
::

::quiz
---
final: true
questions:
  - type: input
    q: "Mieszkam w ___. (miasto)"
    answer: mieście
    explain: "w + предложный о месте; t перед -e переходит в ci, а a в основе — в e: miasto → w mieście."
  - type: input
    q: "Myślę o ___. (książka)"
    answer: książce
    explain: "o + предложный; k перед -e переходит в c: książka → o książce."
  - type: input
    q: "Jestem w ___. (dom)"
    answer: domu
    explain: "dom — исключение: -u без смягчения, w domu «дома»."
  - type: choice
    q: Какой падеж всегда требует предлога?
    options: [творительный, предложный, дательный]
    answer: 1
    explain: "Предложный без предлога не употребляется."
  - type: match
    q: Соедините слово и форму
    pairs:
      - [szkoła, "w szkole"]
      - [biuro, "w biurze"]
      - [hotel, "w hotelu"]
    explain: "szkoła → w szkole (ł → l), biuro → w biurze (r → rz), hotel → w hotelu (-u)."
---
::
