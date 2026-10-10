---
title: "Niż, od и bardziej"
description: "Как сказать «лучше, чем» — и что делать, если суффикс не подходит."
chapter: 10
order: 4
level: A2
words: [niz, bardziej]
---

<!-- review -->

Сравнительная форма есть — осталось присоединить к ней второй предмет. Способов два.

::compare-table
---
headers: [Конструкция, Пример, Русский]
plColumns: [0, 1]
rows:
  - ["!niż + именительный", "lepszy niż ten", "лучше, чем этот"]
  - ["!od + родительный", "lepszy od tego", "лучше этого"]
---
::

:pron{pl="Kawa jest lepsza niż herbata."} — Кофе лучше, чем чай.
:pron{pl="Kawa jest lepsza od herbaty."} — Кофе лучше чая.

Оба варианта правильны и означают одно и то же. Разница только в падеже: после :pl-word{id="niz"} — именительный, после :pl-word{id="od"} — родительный, как мы видели в шестой главе.

Строго говоря, после **niż** второй предмет стоит в том же падеже, что и первый. Чаще всего первый — подлежащее, отсюда именительный. Но если сравниваются дополнения, падеж будет другим: :pron{pl="Lubię kawę bardziej niż herbatę."} — «Я люблю кофе больше, чем чай» (оба в винительном). С **od** всегда родительный.

Перед *mnie* предлог **od** превращается в **ode**: :pron{pl="On jest starszy ode mnie."} — Он старше меня.

Русский устроен так же: «лучше, чем чай» и «лучше чая».

::quiz
---
questions:
  - type: choice
    q: "Ten film jest lepszy ___ tamten."
    options: [niż, od]
    answer: 0
    explain: "После niż сравниваемое стоит в именительном, поэтому подходит tamten: lepszy niż tamten. С od было бы od tamtego."
  - type: input
    q: "Pociąg jest szybszy od ___. (autobus)"
    answer: autobusu
    explain: "od + родительный: autobus → autobusu, «быстрее автобуса»."
  - type: input
    q: "Pociąg jest szybszy niż ___. (autobus)"
    answer: autobus
    explain: "niż + именительный: autobus не меняется, «быстрее, чем автобус»."
---
::

## Bardziej — когда суффикс не годится

Некоторые прилагательные не образуют степень через **-szy**. Тогда на помощь приходит :pl-word{id="bardziej"} «более»:

:pron{pl="To jest bardziej znany film."} — Это более известный фильм.
:pron{pl="Najbardziej znany film w Polsce."} — Самый известный фильм в Польше.

Это касается прежде всего причастий и длинных заимствований: *znany*, *interesujący*, *skomplikowany*. Противоположный смысл дают **mniej** «менее» и **najmniej** «наименее»: :pron{pl="To mniej znany film."} — Это менее известный фильм.

::quiz
---
questions:
  - type: choice
    q: "«Это более сложная задача»: To jest ___ zadanie."
    options: ["bardziej skomplikowane", "skomplikowańsze"]
    answer: 0
    explain: "skomplikowany — длинное причастие, суффикс к нему не присоединяется: bardziej skomplikowane."
  - type: input
    q: "«Самый известный актёр»: ___ znany aktor."
    answer: najbardziej
    explain: "Превосходная степень с bardziej — najbardziej: najbardziej znany."
---
::

## Осторожно: не оба сразу

Нельзя сказать *bardziej lepszy*. Либо суффикс, либо :pl-word{id="bardziej"} — как в русском нельзя «более лучший».

::quiz
---
questions:
  - type: choice
    q: Как правильно?
    options: ["bardziej lepszy", "lepszy", "najbardziej lepszy"]
    answer: 1
    explain: "lepszy уже сравнительная степень. Добавлять bardziej нельзя, как в русском «более лучший»."
  - type: choice
    q: Как правильно?
    options: ["bardziej znany", "znańszy"]
    answer: 0
    explain: "znany — причастие, степень образуется через bardziej."
---
::

## Coraz — «всё более»

Полезный оборот: **coraz** плюс сравнительная степень значит «всё ...»:

:pron{pl="Dni są coraz krótsze."} — Дни всё короче.

::quiz
---
questions:
  - type: input
    q: "Dni są coraz ___. (długi, сравнительная)"
    answer: dłuższe
    explain: "długi → dłuższy (g → ż перед суффиксом); dni — не люди, поэтому -e: dłuższe."
  - type: choice
    q: "Ceny są coraz ___. (wysoki)"
    options: [wyższe, wyżsi]
    answer: 0
    explain: "ceny — не люди, поэтому -e: wyższe. Форма wyżsi — только для мужчин."
---
::

::quiz
---
questions:
  - type: translate
    q: "Этот фильм более известный."
    answer: ["Ten film jest bardziej znany."]
    explain: "znany — причастие, суффикса -szy у него нет: bardziej znany."
  - type: translate
    q: "Дни всё длиннее."
    answer: ["Dni są coraz dłuższe."]
    explain: "coraz + сравнительная степень — «всё …»; dni не люди, поэтому dłuższe."
  - type: translate
    q: "Я люблю чай больше, чем кофе."
    answer: ["Lubię herbatę bardziej niż kawę."]
    explain: "После niż второе слово в том же падеже, что и первое: herbatę … kawę, оба в винительном."
  - type: translate
    q: "Он выше меня."
    answer: ["On jest wyższy ode mnie.", "On jest wyższy niż ja.", "Jest wyższy ode mnie.", "Jest wyższy niż ja."]
    explain: "wysoki → wyższy; перед mnie предлог od становится ode."
---
::

::quiz
---
final: true
questions:
  - type: choice
    q: "После niż какой падеж?"
    options: [именительный, родительный, творительный]
    answer: 0
    explain: "После niż второй предмет стоит в именительном: lepsza niż herbata."
  - type: input
    q: "Kawa jest lepsza ___ herbaty. (od / niż)"
    answer: od
    explain: "herbaty — родительный, а родительный требует od: lepsza od herbaty."
  - type: choice
    q: "Можно ли сказать «bardziej lepszy»?"
    options: [да, нет]
    answer: 1
    explain: "Либо суффикс, либо bardziej. Двойная степень — ошибка, как «более лучший»."
  - type: input
    q: "«Всё короче» — ___ krótsze."
    answer: coraz
    explain: "coraz плюс сравнительная степень значит «всё ...»: coraz krótsze."
  - type: match
    q: Соедините конструкцию и падеж
    pairs:
      - [niż, именительный]
      - [od, родительный]
    explain: "niż — именительный, od — родительный."
---
::
