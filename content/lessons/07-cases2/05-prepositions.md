---
title: Предлоги, которые меняют падеж
description: Один предлог, два падежа, два смысла — и как их не путать.
chapter: 7
order: 5
level: A2
words: [z, w, na, po, pod, nad, przed]
---

<!-- review -->

Теперь, когда все косвенные падежи разобраны, соберём вместе предлоги, которые работают с двумя падежами сразу. Падеж здесь — не украшение: он и несёт смысл.

::compare-table
---
headers: [Предлог, Падеж, Смысл, Пример]
plColumns: [0, 3]
rows:
  - ["!z", родительный, "откуда", "wracam z pracy"]
  - ["!z", творительный, "с кем, с чем", "idę z bratem"]
  - ["!w", винительный, "куда", "jadę w góry"]
  - ["!w", предложный, "где", "jestem w domu"]
  - ["!na", винительный, "куда", "idę na pocztę"]
  - ["!na", предложный, "где", "jestem na poczcie"]
---
::

## Движение или положение

Это главная ось. :pl-word{id="w"} и :pl-word{id="na"} с винительным отвечают на «куда?», с предложным — на «где?»:

:pron{pl="Idę na pocztę."} — Я иду на почту.
:pron{pl="Jestem na poczcie."} — Я на почте.

Русский различает их точно так же: «на почту» и «на почте». Логика знакомая, меняются только окончания.

::quiz
---
questions:
  - type: input
    q: "Jadę na ___. (dworzec)"
    answer: dworzec
    explain: "Направление «куда?» после na — винительный; dworzec неодушевлённый, форма не меняется."
  - type: choice
    q: "Jestem na ___. (plaża)"
    options: [plażę, plaży]
    answer: 1
    explain: "Место «где?» — предложный: na plaży. У слов на -ża, -cza, -rza в предложном -y."
  - type: choice
    q: "Kot wskoczył na ___. (stół)"
    options: [stół, stole]
    answer: 0
    explain: "Движение «куда?» — винительный: na stół. Место «где?» было бы na stole."
---
::

## Два z

Самая частая путаница, потому что оба смысла встречаются постоянно:

:pron{pl="Wracam z pracy."} — Я возвращаюсь с работы. *(родительный: откуда)*
:pron{pl="Rozmawiam z bratem."} — Я разговариваю с братом. *(творительный: с кем)*

Проверка простая: если по-русски выходит «из» или «с» в смысле «откуда» — родительный. Если «вместе с» — творительный.

::quiz
---
questions:
  - type: input
    q: "Rozmawiam z ___. (siostra)"
    answer: siostrą
    explain: "«Вместе с» — творительный: z siostrą."
  - type: input
    q: "Wracam z ___. (kino)"
    answer: kina
    explain: "«Откуда?» — родительный: kino → z kina."
  - type: choice
    q: "Idę na spacer z ___. (pies)"
    options: [psa, psem]
    answer: 1
    explain: "«Вместе с» — творительный: z psem. Psa — родительный и винительный."
---
::

## Przed, pod, nad

С творительным они означают положение, с винительным — направление:

:pron{pl="Kot jest pod stołem."} — Кот под столом.
:pron{pl="Kot wchodzi pod stół."} — Кот залезает под стол.

Русский поступает так же: «под столом» и «под стол». Ещё одно место, где интуиция работает.

::quiz
---
questions:
  - type: choice
    q: "Kot wchodzi pod ___. (łóżko)"
    options: [łóżko, łóżkiem]
    answer: 0
    explain: "Направление «куда?» — винительный: pod łóżko, «под кровать»."
  - type: choice
    q: "Kot śpi pod ___. (łóżko)"
    options: [łóżko, łóżkiem]
    answer: 1
    explain: "Место «где?» — творительный: pod łóżkiem, «под кроватью»."
  - type: input
    q: "Samochód stoi przed ___. (sklep)"
    answer: sklepem
    explain: "przed о месте — творительный: przed sklepem."
---
::

## Po

:pl-word{id="po"} с предложным значит «после»:

:pron{pl="Wracam po pracy."} — Я возвращаюсь после работы.

::quiz
---
questions:
  - type: input
    q: "Idziemy do domu po ___. (film)"
    answer: filmie
    explain: "po «после» + предложный: film → po filmie, m смягчается перед -e."
  - type: choice
    q: "«После работы» по-польски:"
    options: ["po pracy", "po pracę"]
    answer: 0
    explain: "po в значении «после» — с предложным: po pracy."
---
::

::quiz
---
final: true
questions:
  - type: choice
    q: "«Я иду на почту» — какой падеж после na?"
    options: [винительный, предложный, творительный]
    answer: 0
    explain: "Направление «куда?» — винительный: na pocztę."
  - type: choice
    q: "«Разговариваю с братом» — какой падеж после z?"
    options: [родительный, творительный, дательный]
    answer: 1
    explain: "«Вместе с» — творительный: z bratem."
  - type: input
    q: "Jestem na ___. (poczta)"
    answer: poczcie
    explain: "Место «где?» — предложный: poczta → na poczcie (t → ci)."
  - type: input
    q: "Wracam z ___. (praca)"
    answer: pracy
    explain: "«Откуда?» — родительный: z pracy."
  - type: match
    q: Соедините смысл и падеж
    pairs:
      - ["откуда (z)", родительный]
      - ["с кем (z)", творительный]
      - ["где (w)", предложный]
    explain: "z «откуда» — родительный, z «с кем» — творительный, w «где» — предложный."
---
::

::drill{id="noun-prepositions"}
::
