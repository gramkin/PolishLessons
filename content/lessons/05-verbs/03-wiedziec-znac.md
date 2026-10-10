---
title: "Wiedzieć, znać, umieć"
description: Три польских глагола там, где в русском «знать» и «уметь».
chapter: 5
order: 3
level: A1
words: [wiedziec, znac, umiec, rozumiec, mowic]
---

<!-- review -->

Русское «знать» покрывает и знание фактов, и знакомство с человеком. Польский их разводит, и ошибка здесь слышна сразу.

::compare-table
---
headers: [Глагол, Когда, Пример]
plColumns: [0, 2]
rows:
  - ["!wiedzieć", "знать факт, что-то о чём-то", "Wiem, że tu jesteś"]
  - ["!znać", "знать кого-то или что-то лично", "Znam go"]
  - ["!umieć", "уметь, владеть навыком", "Umiem pływać"]
---
::

## Wiedzieć — о фактах

:pl-word{id="wiedziec"} отвечает на вопрос «что именно?» и почти всегда тянет за собой придаточное с *że* или вопросительное слово:

:pron{pl="Wiem, że mieszkasz w Krakowie."} — Я знаю, что ты живёшь в Кракове.
:pron{pl="Nie wiem, gdzie on jest."} — Я не знаю, где он.

Спряжение нерегулярное, четвёртое спряжение: *wiem, wiesz, wie, wiemy, wiecie, wiedzą*.

::quiz
---
questions:
  - type: input
    q: "Ty ___, gdzie jest dworzec? (wiedzieć)"
    answer: wiesz
    explain: "wiedzieć: wiem, wiesz, wie. Вопрос о факте «где вокзал» — значит wiedzieć."
  - type: input
    q: "Oni nie ___, że jesteś tutaj. (wiedzieć)"
    answer: wiedzą
    explain: "«они» — wiedzą, с d, как в русском «ведают»."
  - type: choice
    q: "Kto ___, która jest godzina?"
    options: [wie, zna, umie]
    answer: 0
    explain: "Который час — это факт, поэтому wiedzieć: kto wie."
---
::

## Znać — о людях и вещах

:pl-word{id="znac"} берёт прямое дополнение — человека, город, язык:

:pron{pl="Znam Toma."} — Я знаю Тома.
:pron{pl="Znam to miasto."} — Я знаю этот город.

<!-- negative example: deliberately NOT :pron — the phrase is ungrammatical
     and must not get a listen button that would read it aloud -->
Нельзя сказать *znam, że…* — для факта нужен *wiedzieć*.

::quiz
---
questions:
  - type: choice
    q: "Czy ___ moją siostrę?"
    options: [wiesz, znasz]
    answer: 1
    explain: "Знакомство с человеком — znać: znasz moją siostrę?"
  - type: input
    q: "My ___ to miasto. (znać)"
    answer: znamy
    explain: "znać — III спряжение: znam, znasz, znamy."
  - type: choice
    q: Как сказать «Я знаю польский»?
    options: ["Wiem polski.", "Znam polski."]
    answer: 1
    explain: "Язык — прямое дополнение, поэтому znać: znam polski."
---
::

## Umieć — о навыке

:pl-word{id="umiec"} — это русское «уметь»: *Umiem pływać* «Я умею плавать». Не путайте с *móc* «мочь», о котором следующий урок.

::quiz
---
questions:
  - type: input
    q: "Ona ___ gotować. (umieć)"
    answer: umie
    explain: "umieć: umiem, umiesz, umie — «она умеет готовить»."
  - type: choice
    q: Как сказать «Я умею читать по-польски»?
    options: ["Umiem czytać po polsku.", "Wiem czytać po polsku."]
    answer: 0
    explain: "Навык — umieć + инфинитив, как русское «умею читать»."
---
::

## Короткая проверка

Подставьте вместо «знать» слово «ведать» — если фраза осталась осмысленной, нужен *wiedzieć*. «Я ведаю, что он дома» — да. «Я ведаю Тома» — нет, значит *znam*.

::quiz
---
questions:
  - type: choice
    q: "Nie ___, co powiedzieć."
    options: [wiem, znam, umiem]
    answer: 0
    explain: "«Не ведаю, что сказать» звучит осмысленно, значит это факт: nie wiem."
  - type: choice
    q: "___ tego pana?"
    options: [Wiesz, Znasz, Umiesz]
    answer: 1
    explain: "«Ведаешь этого господина?» не годится, значит человек: znasz."
  - type: choice
    q: "Dzieci ___ już pływać."
    options: [wiedzą, znają, umieją]
    answer: 2
    explain: "Плавать — навык, поэтому umieć: umieją."
---
::

::quiz
---
final: true
questions:
  - type: choice
    q: "Как сказать «Я знаю Тома»?"
    options: ["Wiem Toma", "Znam Toma", "Umiem Toma"]
    answer: 1
    explain: "Человек — znać: Znam Toma."
  - type: choice
    q: "Как сказать «Я знаю, что он дома»?"
    options: ["Znam, że jest w domu", "Wiem, że jest w domu", "Umiem, że jest w domu"]
    answer: 1
    explain: "Факт с że — wiedzieć: Wiem, że jest w domu."
  - type: input
    q: "Я умею плавать — ___ pływać."
    answer: Umiem
    explain: "Навык — umieć: umiem pływać."
  - type: input
    q: "Я не знаю, где он — Nie ___, gdzie on jest."
    answer: wiem
    explain: "«Где он» — факт, поэтому wiedzieć: nie wiem."
  - type: match
    q: Соедините глагол и случай
    pairs:
      - [wiedzieć, факт]
      - [znać, человек]
      - [umieć, навык]
    explain: "wiedzieć — факты, znać — люди и вещи, umieć — навыки."
---
::
