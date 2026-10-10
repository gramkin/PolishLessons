---
title: Мужской личный род в прошедшем
description: Byli или były — тот же выбор, что между oni и one, только в глаголе.
chapter: 8
order: 3
level: A2
words: [spotkac, wrocic, skonczyc]
---

<!-- review -->

В четвёртой главе мы разобрали :pl-word{id="oni"} и :pl-word{id="one"}. В прошедшем времени то же самое различие проходит через глагол, и здесь его уже не обойти.

::compare-table
---
headers: [Подлежащее, Местоимение, Глагол, Пример]
plColumns: [2, 3]
rows:
  - ["!мужчины (или смешанно)", oni, "-li", "studenci czytali"]
  - [женщины, one, "-ły", "kobiety czytały"]
  - [дети, one, "-ły", "dzieci czytały"]
  - [предметы, one, "-ły", "książki leżały"]
---
::

## Одно правило

Есть ли в группе хотя бы один мужчина? Если да — **-li**. Если нет — **-ły**.

:pron{pl="Studenci wrócili do domu."} — Студенты вернулись домой.
:pron{pl="Studentki wróciły do domu."} — Студентки вернулись домой.

Разница в одной букве, но она обязательна, и на слух заметна сразу.

::quiz
---
questions:
  - type: input
    q: "Chłopcy ___ w parku. (grać)"
    answer: grali
    explain: "Мальчики — мужско-личная группа: -li, grali."
  - type: input
    q: "Dziewczyny ___ w parku. (grać)"
    answer: grały
    explain: "Только девушки — -ły: grały."
  - type: choice
    q: "Nauczyciele ___ list. (napisać)"
    options: [napisały, napisali]
    answer: 1
    explain: "nauczyciele — мужчины-учителя, поэтому napisali."
  - type: choice
    q: "Кто говорит «Byliśmy w kinie»?"
    options: ["группа, где есть мужчина", "только женщины"]
    answer: 0
    explain: "-liśmy — мужско-личное «мы». Только женщины скажут byłyśmy."
---
::

## Смешанная группа

Достаточно одного мужчины, чтобы вся группа стала мужско-личной:

:pron{pl="Anna i Piotr spotkali się wczoraj."} — Анна и Пётр встретились вчера.

Хотя женщина названа первой, глагол берёт **-li**, потому что среди них есть Пётр.

::quiz
---
questions:
  - type: choice
    q: "Mama i tata ___ do domu. (wrócić)"
    options: [wróciły, wrócili]
    answer: 1
    explain: "В паре есть мужчина (tata) — значит -li."
  - type: choice
    q: "Ewa i Kasia ___ do domu. (wrócić)"
    options: [wróciły, wrócili]
    answer: 0
    explain: "Две женщины, мужчин нет — -ły."
  - type: input
    q: "Marta, Ola i Paweł ___ film. (oglądać)"
    answer: oglądali
    explain: "Хватает одного мужчины (Paweł), чтобы группа стала мужско-личной: oglądali."
---
::

## Предметы всегда -ły

:pron{pl="Książki leżały na stole."} — Книги лежали на столе.
:pron{pl="Lekcje skończyły się o piątej."} — Уроки закончились в пять.

Для русского уха это непривычно: «книги лежали» и «студенты читали» по-русски выглядят одинаково. В польском — нет.

::quiz
---
questions:
  - type: input
    q: "Okna ___ otwarte. (być)"
    answer: były
    explain: "Предметы — всегда -ły: okna były."
  - type: choice
    q: "Psy ___ całą noc. (szczekać)"
    options: [szczekali, szczekały]
    answer: 1
    explain: "Животные не мужско-личные: psy szczekały, хотя pies — мужского рода."
  - type: choice
    q: "Autobusy ___ późno. (przyjechać)"
    options: [przyjechali, przyjechały]
    answer: 1
    explain: "autobus мужского рода, но это не человек: -ły."
---
::

::quiz
---
final: true
questions:
  - type: choice
    q: "Anna i Piotr ___ się wczoraj."
    options: [spotkały, spotkali, spotkało]
    answer: 1
    explain: "В паре есть мужчина (Piotr) — мужско-личное -li, хотя Anna названа первой."
  - type: input
    q: "Studentki ___ do domu. (wrócić)"
    answer: wróciły
    explain: "Только женщины — -ły: wróciły."
  - type: input
    q: "Książki ___ na stole. (leżeć)"
    answer: leżały
    explain: "Предметы — всегда -ły: leżały."
  - type: choice
    q: "Группа из трёх женщин и одного мужчины — какое окончание?"
    options: ["-ły", "-li"]
    answer: 1
    explain: "Хватает одного мужчины в группе — -li."
  - type: match
    q: Соедините подлежащее и глагол
    pairs:
      - [studenci, czytali]
      - [kobiety, czytały]
      - [książki, leżały]
    explain: "Мужчины — -li; женщины и предметы — -ły."
---
::

::drill{id="verb-past-plural"}
::
