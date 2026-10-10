---
title: "Mieć: «у меня есть»"
description: Поляк не говорит «у меня есть» — он говорит «я имею».
chapter: 5
order: 2
level: A1
words: [miec, kochac, lubic, czas, pies, kot]
---

<!-- review -->

Русский строит владение через **«у меня есть»**: предмет становится подлежащим, а человек уходит в предлог. Польский так не делает. Он берёт глагол :pl-word{id="miec"} «иметь» — тот самый, который в русском звучит книжно, — и строит обычное предложение.

::compare-table
---
headers: [Русский, Польский, Дословно]
plColumns: [1]
rows:
  - ["!У меня есть книга", "Mam książkę", "Я имею книгу"]
  - ["!У тебя есть время?", "Masz czas?", "Ты имеешь время?"]
  - ["!У нас есть собака", "Mamy psa", "Мы имеем собаку"]
---
::

Это первая конструкция, которую приходится перестраивать целиком, а не переводить по словам.

::quiz
---
questions:
  - type: choice
    q: Как сказать «У тебя есть брат?»
    options: ["Masz brata?", "U ciebie jest brat?", "Jest ci brat?"]
    answer: 0
    explain: "Владение строится через mieć: «ты имеешь брата?». brat одушевлённый, поэтому brata — об этом ниже."
  - type: choice
    q: Как сказать «У нас есть время»?
    options: ["Mamy czas.", "U nas jest czas."]
    answer: 0
    explain: "Не «у нас есть», а «мы имеем»: mamy czas."
  - type: input
    q: "У меня есть дом — ___ dom."
    answer: Mam
    explain: "mam — «я имею», то есть «у меня есть»."
---
::

## Спряжение

*mam, masz, ma, mamy, macie, mają* — третье спряжение, самое простое.

::quiz
---
questions:
  - type: input
    q: "Oni ___ dom. (mieć)"
    answer: mają
    explain: "mieć: mam, masz, ma, mamy, macie, mają — «они» на -ają."
  - type: input
    q: "Wy ___ czas? (mieć)"
    answer: macie
    explain: "«вы» — macie, как czytacie у czytać."
  - type: input
    q: "Ona ___ kota. (mieć)"
    answer: ma
    explain: "Третье лицо — ma, без окончания."
---
::

## Дополнение в винительном падеже

Раз «книга» больше не подлежащее, она становится дополнением: *książka* → *książkę*, *pies* → *psa*, *czas* → *czas*.

:pron{pl="Mam książkę."} — У меня есть книга.
:pron{pl="Mam psa."} — У меня есть собака.

::quiz
---
questions:
  - type: input
    q: "Mam ___. (siostra)"
    answer: siostrę
    explain: "siostra — дополнение, поэтому винительный: -a → -ę, siostrę. Дословно «я имею сестру»."
  - type: choice
    q: "Mamy ___. (kot)"
    options: [kot, kota, kotem]
    answer: 1
    explain: "kot одушевлённый: винительный совпадает с родительным — kota, как psa."
  - type: input
    q: "Masz ___? (samochód)"
    answer: samochód
    explain: "Неодушевлённый мужской род в винительном не меняется, как czas → czas."
---
::

## А отрицание меняет падеж

Вот здесь нужно быть внимательным: при отрицании винительный уступает место **родительному**.

:pron{pl="Mam czas."} → :pron{pl="Nie mam czasu."}
:pron{pl="Mam psa."} → :pron{pl="Nie mam psa."}

Русский делает то же самое («нет времени», «нет собаки»), так что правило знакомое — просто в польском оно обязательно и в случае с *mieć*.

::quiz
---
questions:
  - type: input
    q: "Mam samochód. → Nie mam ___."
    answer: samochodu
    explain: "При отрицании — родительный: samochód → samochodu (ó переходит в o)."
  - type: input
    q: "Mam siostrę. → Nie mam ___."
    answer: siostry
    explain: "Родительный женского рода на -a — -y: nie mam siostry, «у меня нет сестры»."
  - type: choice
    q: "Mam kota. → Nie mam ___."
    options: [kot, kota]
    answer: 1
    explain: "У одушевлённых винительный уже равен родительному, поэтому kota остаётся kota."
---
::

::quiz
---
final: true
questions:
  - type: choice
    q: Как сказать «У меня есть книга»?
    options: ["U mnie jest książka", "Mam książkę", "Jest mi książka"]
    answer: 1
    explain: "Владение по-польски — через mieć: Mam książkę, «я имею книгу»."
  - type: input
    q: "У тебя есть время? — ___ czas?"
    answer: Masz
    explain: "ty → masz."
  - type: input
    q: "У нас есть собака — ___ psa."
    answer: Mamy
    explain: "my → mamy; pies одушевлённый, поэтому psa."
  - type: input
    q: "У меня нет времени — Nie mam ___."
    answer: czasu
    explain: "Отрицание переводит дополнение в родительный: czas → czasu."
  - type: match
    q: Соедините лицо и форму
    pairs:
      - [ja, mam]
      - [ty, masz]
      - [my, mamy]
      - [oni, mają]
    explain: "mam, masz, mamy, mają — образец III спряжения, как czytam."
---
::
