# WORDS.md — слова, выписанные при чтении

Рабочий список слов и фраз, собранный во время чтения («Пёс Баскервилей» в польском
переводе плюс несколько бытовых и технических фрагментов). Исходный список сохранён
целиком: каждая строка на месте, к ней добавлена пометка о состоянии.

## Что сделано

1. Разобраны все 514 строк: 339 — отдельные слова, 175 — фразы и предложения.
2. Словоформы приведены к начальной форме по PoliMorf: `wynikającego` → `wynikać`,
   `dostrzegł` → `dostrzec`, `przodkowie` → `przodek`, `oka` → `oko`. Страницы делаются
   для лемм, а не для случайных форм. Формы местоимений и определителей (`mu`, `jej`,
   `mi`, `go`, `ta`, `te`, `moja`) свёрнуты к леммам `on`, `ja`, `ten`, `mój` — карточки
   для них уже есть.
3. Леммы записаны в **`data/words.json`** — отдельный файл той же формы, что `data/ranked.json`
   (`rank`, `id`, `lemma`, `pos`, …) плюс происхождение: `sourceLines` — строки этого файла,
   `surfaceForms` — как слово встретилось, `examples` — предложения отсюда с этим словом.
   Всего лемм: **849**; новым присвоены ранги с 2001, чтобы не трогать частотную
   модель первых 2000 слов.
4. Предложения разобраны на слова: каждое слово из предложения попало в словарь,
   а само предложение записано ему в `examples`.
5. Не попали в словарь **34** строк (`data/words-excluded.json`): имена собственные
   из романа (Holmes, Watson, Baskerville, Stapleton, Hall), формы других слов, записи из
   `data/overrides.yml` и строки, которых нет в польской морфологии — похоже на опечатки
   (`ojejkujk`, `trzepieośki`, `cośnąć`, `obczawać`).

## Состояние

|                 |         |
| --------------- | ------- |
| Лемм всего      | **849** |
| Карточка готова | **320** |
| В очереди       | **529** |
| Не в словаре    | **34**  |

## Обозначения

- ✅ — карточка готова, ссылка ведёт на `/slovo/<id>`
- 🟡 — лемма в `data/words.json`, карточка ещё не написана
- ↩︎ — форма другого слова, отдельной страницы не требует
- ⛔ — не распознано морфологией (вероятная опечатка)
- 🔤 — имя собственное

## Как продолжить

```
pnpm dict:draft --ids <id,id,…>
#   … написать content/dictionary/<id>.yml …
pnpm dict:build && pnpm validate
pnpm dict:status && pnpm generate
```

`data/words.json` читают и `dict:draft`, и проверка контента.

---

## Список

- ktokolwiek — ✅ [ktokolwiek](/slovo/ktokolwiek) · noun
- wynikającego — 🟡 `wynikać` · verb · rank 2001
- mianowicie — ✅ [mianowicie](/slovo/mianowicie) · conj
- handlujący — 🟡 `handlować` · verb · rank 2002
- określić — 🟡 `określić` · verb · rank 2003
- twarz — ✅ [twarz](/slovo/twarz) · noun
- tłumaczą — ✅ [tłumaczyć](/slovo/tlumaczyc) · verb
- przedawnioną — 🟡 `przedawnić` · verb · rank 2004
- sędzia — 🟡 `sędzia` · noun · rank 993
- majątek — 🟡 `majątek` · noun · rank 2005
- spadkobierca — 🟡 `spadkobierca` · noun · rank 2006
- objąć — 🟡 `objąć` · verb · rank 2007
- najprędzej — ✅ [prędko](/slovo/predko) · adv
- niełatwo — 🟡 `niełatwo` · adv · rank 2008
- domniemany — 🟡 `domniemany` · adj · rank 2009
- niebawem — 🟡 `niebawem` · adv · rank 2010
- los — 🟡 `los` · noun · rank 896
- powszechnie — 🟡 `powszechnie` · adv · rank 2011
- istotnie — 🟡 `istotnie` · adv · rank 2012
- Zechciej — 🟡 `zechcieć` · verb · rank 1065
- oparł — 🟡 `oprzeć` · verb · rank 2013
- zdradzać — 🟡 `zdradzać` · verb · rank 2014
- rządzące — 🟡 `rządzić` · verb · rank 1505
- łączyły — 🟡 `łączyć` · verb · rank 1486
- kształt — 🟡 `kształt` · noun · rank 2015
- **I oto wynikło nieszczęście**  
  <sub>слова: [i](/slovo/i), [oto](/slovo/oto), `wyniknąć`, `nieszczęście`</sub>
- Wreszcie — ✅ [wreszcie](/slovo/wreszcie) · part
- olbrzymiego — 🟡 `olbrzymi` · adj · rank 2018
- dostrzegł — 🟡 `dostrzec` · verb · rank 2019
- zauważył — ✅ [zauważyć](/slovo/zauwazyc) · verb
- gdybym — ✅ [gdyby](/slovo/gdyby) · conj
- wejście — 🟡 `wejście` · noun · rank 2020
- szczegół — 🟡 `szczegół` · noun · rank 1284
- żwir — 🟡 `żwir` · noun · rank 2021
- zaryglowana — 🟡 `zaryglować` · verb · rank 2022
- przesadzić — 🟡 `przesadzić` · verb · rank 2023
- **— Skąd pan to wie? !!!**  
  <sub>слова: [skąd](/slovo/skad), [pan](/slovo/pan), [to](/slovo/to), [wiedzieć](/slovo/wiedziec)</sub>
- Zresztą — 🟡 `zresztą` · part · rank 2024
- **— Ale pan tak myślisz w głębi ducha.**  
  <sub>слова: [ale](/slovo/ale), [pan](/slovo/pan), [tak](/slovo/tak), [myśleć](/slovo/myslec), [w](/slovo/w), `głąb`, [duch](/slovo/duch)</sub>
- **— Na przykład?**  
  <sub>слова: [na](/slovo/na), [przykład](/slovo/przyklad)</sub>
- Dotychczas — ✅ [dotychczas](/slovo/dotychczas) · adv
- walczyć — ✅ [walczyć](/slovo/walczyc) · verb
- **— Więc w jaki sposób mogę panu dopomóc?**  
  <sub>слова: [więc](/slovo/wiec), [w](/slovo/w), [jaki](/slovo/jaki), [sposób](/slovo/sposob), [móc](/slovo/moc), [pan](/slovo/pan), `dopomóc`</sub>
- Radząc — 🟡 `radzić` · verb · rank 1009
- **jest to młodzieniec bez zarzutu**  
  <sub>слова: [być](/slovo/byc), [to](/slovo/to), `młodzieniec`, [bez](/slovo/bez), `zarzut`</sub>
- spotkać — ✅ [spotkać](/slovo/spotkac) · verb
- **jak mi radzisz postąpić?**  
  <sub>слова: [jak](/slovo/jak), `radzić`, `postąpić`</sub>
- miałby — ↩︎ форма другого слова (overrides.yml)
- dziedzic — 🟡 `dziedzic` · noun · rank 2029
- **pójdzie wniwecz**  
  <sub>слова: [pójść](/slovo/pojsc), [wniwecz](/slovo/wniwecz)</sub>
- zastanawiać — ✅ [zastanawiać](/slovo/zastanawiac) · verb
- święcie — 🟡 `święcie` · adv · rank 2030
- Wszak — 🟡 `wszak` · part · rank 2031
- **— Gotów jestem przypuszczać, że tak jest.**  
  <sub>слова: `gotów`, [być](/slovo/byc), `przypuszczać`, [że](/slovo/ze), [tak](/slovo/tak)</sub>
- pastwić — 🟡 `pastwić` · verb · rank 2033
- działanie — 🟡 `działanie` · noun · rank 2034
- umiejscowione — 🟡 `umiejscowić` · verb · rank 2035
- odechciałoby — 🟡 `odechcieć` · verb · rank 2036
- miarkuję — 🟡 `miarkować` · verb · rank 2037
- **Cóż mi pan radzisz?**  
  <sub>слова: [cóż](/slovo/coz), [pan](/slovo/pan), `radzić`</sub>
- ułatwi — 🟡 `ułatwić` · verb · rank 2038
- **— Zrobię, jak pan chcesz.**  
  <sub>слова: [zrobić](/slovo/zrobic), [jak](/slovo/jak), [pan](/slovo/pan), [chcieć](/slovo/chciec)</sub>
- wyjątkowa — ✅ [wyjątkowy](/slovo/wyjatkowy) · adj
- miarkujesz — 🟡 `miarkować` · verb · rank 2037
- Pochlebiam — 🟡 `pochlebiać` · verb · rank 2039
- kwaterę — 🟡 `kwatera` · noun · rank 2040
- błędzie — ✅ [błąd](/slovo/blad) · noun
- **Czy nie znajdujesz, że wyrażone poglądy są bardzo głębokie?**  
  <sub>слова: [czy](/slovo/czy), [nie](/slovo/nie), `znajdować`, [że](/slovo/ze), `wyrazić`, `poglądy`, [być](/slovo/byc), [bardzo](/slovo/bardzo), [głęboki](/slovo/gleboki)</sub>
- **Nie boję się bawić**  
  <sub>слова: [nie](/slovo/nie), [bać](/slovo/bac), [się](/slovo/sie), [bawić](/slovo/bawic)</sub>
- **Tu się nie pali**  
  <sub>слова: [tu](/slovo/tu), [się](/slovo/sie), [nie](/slovo/nie), `pali`</sub>
- **Jak się to mówi**  
  <sub>слова: [jak](/slovo/jak), [się](/slovo/sie), [to](/slovo/to), [mówić](/slovo/mowic)</sub>
- **Mówi się, że...**  
  <sub>слова: [mówić](/slovo/mowic), [się](/slovo/sie), [że](/slovo/ze)</sub>
- **strzeż się**  
  <sub>слова: `strzec`, [się](/slovo/sie)</sub>
- łączność — 🟡 `łączność` · noun · rank 2045
- ścisła — 🟡 `ścisły` · adj · rank 2046
- **przyjrzycie mu się**  
  <sub>слова: `przyjrzeć`, [on](/slovo/on), [się](/slovo/sie)</sub>
- **Przepraszam; to nie jest drobiazg**  
  <sub>слова: [przepraszać](/slovo/przepraszac), [to](/slovo/to), [nie](/slovo/nie), [być](/slovo/byc), `drobiazg`</sub>
- zaprzeczył — 🟡 `zaprzeczyć` · verb · rank 2049
- tyle — ✅ [tyle](/slovo/tyle) · adv
- **pędząc życie swobodne**  
  <sub>слова: `pędzić`, [życie](/slovo/zycie), `swobodny`</sub>
- zemsta — 🟡 `zemsta` · noun · rank 1667
- przywiązywałem — 🟡 `przywiązywać` · verb · rank 2052
- twarzyszyć — ⛔ не распознано
- Obecnie — 🟡 `obecnie` · adv · rank 1905
- niebezpieczeństwo — 🟡 `niebezpieczeństwo` · noun · rank 1432
- **Bądź co bądź**  
  <sub>слова: [bądź](/slovo/badz), [co](/slovo/co)</sub>
- **Stawimy się na oznaczoną godzinę.**  
  <sub>слова: `stawić`, [się](/slovo/sie), [na](/slovo/na), `oznaczyć`, [godzina](/slovo/godzina)</sub>
- paręset — 🟡 `paręset` · num · rank 2055
- przyjrzeć — 🟡 `przyjrzeć` · verb · rank 2047
- **Nie mam pojęcia**  
  <sub>слова: [nie](/slovo/nie), [mama](/slovo/mama), `pojąć`</sub>
- niewątpliwie — ✅ [niewątpliwie](/slovo/niewatpliwie) · adv
- zmiarkować — 🟡 `zmiarkować` · verb · rank 2056
- tchu — 🟡 `dech` · noun · rank 2057
- **Zrobiłem wielkie głupstwo…**  
  <sub>слова: [zrobić](/slovo/zrobic), [wielki](/slovo/wielki), `głupstwo`</sub>
- korzystać — 🟡 `korzystać` · verb · rank 2059
- uszanowania — 🟡 `uszanowanie` · noun · rank 2060
- egzemplarz — 🟡 `egzemplarz` · noun · rank 2061
- bezwładna — 🟡 `bezwładny` · adj · rank 2062
- Drwią — 🟡 `drwić` · verb · rank 2063
- naprzód — 🟡 `naprzód` · adv · rank 1617
- lakierki — 🟡 `lakierek` · noun · rank 2064
- cierpliwość — 🟡 `cierpliwość` · noun · rank 2065
- **ale straciłem już cierpliwość**  
  <sub>слова: [ale](/slovo/ale), [stracić](/slovo/stracic), [już](/slovo/juz), `cierpliwość`</sub>
- przyjęcie — 🟡 `przyjęcie` · noun · rank 2066
- pięćset — 🟡 `pięćset` · num · rank 2067
- nieruchomościami — 🟡 `nieruchomość` · noun · rank 2068
- przeszło — ✅ [przejść](/slovo/przejsc) · verb
- znajdując — 🟡 `znajdować` · verb · rank 1056
- **— Czyżbyś pan chciał ze mną jechać, panie Holmes?**  
  <sub>слова: [czyżby](/slovo/czyzby), [pan](/slovo/pan), [chcieć](/slovo/chciec), [z](/slovo/z), [ja](/slovo/ja), [jechać](/slovo/jechac)</sub>
- zgubę — 🟡 `zguba` · noun · rank 2069
- **człowiek o twarzy dobrodusznej**  
  <sub>слова: [człowiek](/slovo/czlowiek), [o](/slovo/o), [twarz](/slovo/twarz), `dobroduszny`</sub>
- **Nie mam przeciwko wam nic zgoła, mój przyjacielu**  
  <sub>слова: [nie](/slovo/nie), [mama](/slovo/mama), [przeciwko](/slovo/przeciwko), [wy](/slovo/wy), [nic](/slovo/nic), [zgoła](/slovo/zgola), [mój](/slovo/moj), [przyjaciel](/slovo/przyjaciel)</sub>
- **A to szczwany lis!**  
  <sub>слова: [a](/slovo/a), [to](/slovo/to), `szczwany`, `lis`</sub>
- wyskoczy — 🟡 `wyskoczyć` · verb · rank 2073
- porządnie — 🟡 `porządnie` · adv · rank 2074
- spiczasto — 🟡 `spiczasto` · adv · rank 2075
- **dość spora zmiana**  
  <sub>слова: [dość](/slovo/dosc), `spora`, [zmiana](/slovo/zmiana)</sub>
- zioła — 🟡 `zioła` · noun · rank 2077
- przytyć — 🟡 `przytyć` · verb · rank 2078
- przyciągać — 🟡 `przyciągać` · verb · rank 2079
- łapa — 🟡 `łapa` · noun · rank 1957
- zanim — ✅ [zanim](/slovo/zanim) · conj
- przykryć — 🟡 `przykryć` · verb · rank 2080
- stopień — 🟡 `stopień` · noun · rank 1187
- kolejny — ✅ [kolejny](/slovo/kolejny) · adj
- Migdałowiec — 🟡 `migdałowiec` · noun · rank 2081
- niebagatelny — 🟡 `niebagatelny` · adj · rank 2082
- potrwać — 🟡 `potrwać` · verb · rank 1610
- wędlina — 🟡 `wędlina` · noun · rank 2083
- przypalić — 🟡 `przypalić` · verb · rank 2084
- zdjąć — ✅ [zdjąć](/slovo/zdjac) · verb
- drużyna — ✅ [drużyna](/slovo/druzyna) · noun
- przyjrzeć — 🟡 `przyjrzeć` · verb · rank 2047
- odmiana — 🟡 `odmiana` · noun · rank 2085
- życzyć — 🟡 `życzyć` · verb · rank 869
- szerknąć — ⛔ не распознано
- czyżby — ✅ [czyżby](/slovo/czyzby) · part
- niestety — ✅ [niestety](/slovo/niestety) · part
- słup — 🟡 `słup` · noun · rank 2086
- prąd — 🟡 `prąd` · noun · rank 2087
- zrzucać — 🟡 `zrzucać` · verb · rank 2088
- obczawać — ⛔ не распознано
- wymienić — 🟡 `wymienić` · verb · rank 2089
- zgadnijcie — 🟡 `zgadnąć` · verb · rank 1285
- poćwiczyć — 🟡 `poćwiczyć` · verb · rank 2090
- syczeć — 🟡 `syczeć` · verb · rank 2091
- zachowanie — 🟡 `zachowanie` · noun · rank 2092
- pędny — 🟡 `pędny` · adj · rank 2093
- zawór — 🟡 `zawór` · noun · rank 2094
- przykręcić — 🟡 `przykręcić` · verb · rank 2095
- paśma — ⛔ не распознано
- rozwiązanie — 🟡 `rozwiązanie` · noun · rank 2096
- Przejebna — ⛔ не распознано
- podociskać — ⛔ не распознано
- mrugać — 🟡 `mrugać` · verb · rank 2097
- cośnąć — ⛔ не распознано
- Ojejkujk — ⛔ не распознано
- zwężka — 🟡 `zwężka` · noun · rank 2098
- trzepieośki — ⛔ не распознано
- ściotkowy — ⛔ не распознано
- opuścił — ✅ [opuścić](/slovo/opuscic) · verb
- poderżnąć — 🟡 `poderżnąć` · verb · rank 2099
- gardło — 🟡 `gardło` · noun · rank 1753
- jałową — 🟡 `jałowy` · adj · rank 2100
- jar — 🟡 `jar` · noun · rank 2101
- siedzibie — 🟡 `siedziba` · noun · rank 2102
- brama — 🟡 `brama` · noun · rank 1813
- sklepioną — 🟡 `sklepić` · verb · rank 2103
- gmach — 🟡 `gmach` · noun · rank 2104
- turkot — 🟡 `turkot` · noun · rank 2105
- przejąć — 🟡 `przejąć` · verb · rank 1358
- dziedziniec — 🟡 `dziedziniec` · noun · rank 2106
- kuferki — 🟡 `kuferek` · noun · rank 2107
- zsiadając — 🟡 `zsiadać` · verb · rank 2108
- zmęczony — ✅ [zmęczony](/slovo/zmeczony) · adj
- **Odwróciłem się pewien, że ujrzę doktora Mortimera, lecz ku mojemu zdziwieniu, zobaczyłem nieznajomego.**  
  <sub>слова: `odwrócić`, [się](/slovo/sie), [pewien](/slovo/pewien), [że](/slovo/ze), `ujrzeć`, [doktor](/slovo/doktor), [lecz](/slovo/lecz), `ku`, [mój](/slovo/moj), `zdziwienie`, [zobaczyć](/slovo/zobaczyc), [nieznajomy](/slovo/nieznajomy)</sub>
- **złamała mu się noga, zepsuł mi się samochód.**  
  <sub>слова: [złamać](/slovo/zlamac), [on](/slovo/on), [się](/slovo/sie), [noga](/slovo/noga), `zepsuć`, [samochód](/slovo/samochod)</sub>
- biedak — 🟡 `biedak` · noun · rank 2112
- **— Pan je zgłębiłeś?**  
  <sub>слова: [pan](/slovo/pan), [on](/slovo/on), `zgłębić`</sub>
- zaledwie — 🟡 `zaledwie` · conj · rank 2114
- wędrówek — 🟡 `wędrówka` · noun · rank 2115
- **— Czy okolica jest tak trudna do poznania?**  
  <sub>слова: [czy](/slovo/czy), `okolica`, [być](/slovo/byc), [tak](/slovo/tak), [trudny](/slovo/trudny), [do](/slovo/do), [poznać](/slovo/poznac)</sub>
- chętkę — 🟡 `chętka` · noun · rank 2116
- **Stapleton roześmiał się.**  
  <sub>слова: `roześmiać`, [się](/slovo/sie)</sub>
- nieprzebyte — 🟡 `przebyć` · verb · rank 2118
- **Już po nim!**  
  <sub>слова: [już](/slovo/juz), [po](/slovo/po), [on](/slovo/on)</sub>
- **— Pan jednak przebywa je bez szwanku? — wtrąciłem.**  
  <sub>слова: [pan](/slovo/pan), [jednak](/slovo/jednak), `przebywać`, [on](/slovo/on), [bez](/slovo/bez), `szwank`, `wtrącić`</sub>
- fruwają — 🟡 `fruwać` · verb · rank 2122
- **— Co to takiego?**  
  <sub>слова: [co](/slovo/co), [to](/slovo/to), [taki](/slovo/taki)</sub>
- wykształconym — 🟡 `wykształcić` · verb · rank 2123
- foremnymi — 🟡 `foremny` · adj · rank 2124
- **Mamy dużo dzikich storczyków. Lubię ten kwiat.**  
  <sub>слова: [mama](/slovo/mama), [dużo](/slovo/duzo), `dziki`, `storczyk`, [lubić](/slovo/lubic), [ten](/slovo/ten), `kwiat`</sub>
- **Rumieniec oblał jej śliczną twarzyczkę**  
  <sub>слова: `rumieniec`, `oblać`, [on](/slovo/on), [śliczny](/slovo/sliczny), `twarzyczka`</sub>
- obcowanie — 🟡 `obcowanie` · noun · rank 2130
- urabianie — 🟡 `urabiać` · verb · rank 2131
- ucierpiała — 🟡 `ucierpieć` · verb · rank 2132
- skutkiem — 🟡 `skutek` · noun · rank 2133
- **Urabianie umysłów**  
  <sub>слова: `urabiać`, `umysł`</sub>
- ciosem — 🟡 `cios` · noun · rank 2134
- **Jestem pewien, że będzie panu rad**  
  <sub>слова: [być](/slovo/byc), [pewien](/slovo/pewien), [że](/slovo/ze), [pan](/slovo/pan), `rad`</sub>
- ostrzeżeń — 🟡 `ostrzeżenie` · noun · rank 2136
- pożegnać — 🟡 `pożegnać` · verb · rank 1606
- gościniec — 🟡 `gościniec` · noun · rank 2137
- **Na miłość boską, bądź ze mną szczera, miss Stapleton.**  
  <sub>слова: [na](/slovo/na), [miłość](/slovo/milosc), [boski](/slovo/boski), [bądź](/slovo/badz), [z](/slovo/z), [ja](/slovo/ja), [szczery](/slovo/szczery), `miss`</sub>
- przejęciem — 🟡 `przejąć` · verb · rank 1358
- ciążącej — 🟡 `ciążyć` · verb · rank 2139
- **— Słyszałeś pan legendę o psie?**  
  <sub>слова: [słyszeć](/slovo/slyszec), [pan](/slovo/pan), `legenda`, [o](/slovo/o), [pies](/slovo/pies)</sub>
- **— Nie wierzę w te brednie.**  
  <sub>слова: [nie](/slovo/nie), [wierzyć](/slovo/wierzyc), [w](/slovo/w), [ten](/slovo/ten), `brednia`</sub>
- koniecznie — 🟡 `koniecznie` · adv · rank 2142
- opuszczenia — ✅ [opuścić](/slovo/opuscic) · verb
- pragnę — 🟡 `pragnąć` · verb · rank 932
- albowiem — 🟡 `albowiem` · conj · rank 2143
- bowiem — 🟡 `bowiem` · conj · rank 2144
- **Im dłużej tu bawię, tym bardziej czuję się smutny i zaniepokojony**  
  <sub>слова: [on](/slovo/on), [długo](/slovo/dlugo), [tu](/slovo/tu), [bawić](/slovo/bawic), [ten](/slovo/ten), [bardziej](/slovo/bardziej), [czuć](/slovo/czuc), [się](/slovo/sie), [smutny](/slovo/smutny), [i](/slovo/i), `zaniepokoić`</sub>
- gęsto — 🟡 `gęsto` · adv · rank 2146
- zasiewają — 🟡 `zasiewać` · verb · rank 2147
- należy — ✅ [należeć](/slovo/nalezec) · verb
- szczep — 🟡 `szczep` · noun · rank 2148
- tchórzliwy — 🟡 `tchórzliwy` · adj · rank 2149
- warownią — 🟡 `warownia` · noun · rank 2150
- okoliczność — 🟡 `okoliczność` · noun · rank 2151
- **Dzisiaj zdarzyła się okoliczność niezwykła**  
  <sub>слова: [dzisiaj](/slovo/dzisiaj), `zdarzyć`, [się](/slovo/sie), `okoliczność`, [niezwykły](/slovo/niezwykly)</sub>
- żyć — ✅ [żyć](/slovo/zyc) · verb
- **Dwa tygodnie już minęło od jego ucieczki, a dotychczas nikt go nie widział i nikt o nim nie słyszał**  
  <sub>слова: [dwa](/slovo/dwa), [tydzień](/slovo/tydzien), [już](/slovo/juz), [minąć](/slovo/minac), [od](/slovo/od), [on](/slovo/on), `ucieczka`, [a](/slovo/a), [dotychczas](/slovo/dotychczas), [nikt](/slovo/nikt), [nie](/slovo/nie), [widzieć](/slovo/widziec), [i](/slovo/i), [o](/slovo/o), [słyszeć](/slovo/slyszec)</sub>
- pozywienia — ⛔ не распознано
- nabierać — 🟡 `nabierać` · verb · rank 2152
- **Nabierać otuchy (приободриться)**  
  <sub>слова: `nabierać`, `otucha`</sub>
- wątły — 🟡 `wątły` · adj · rank 2154
- niezbyt — 🟡 `niezbyt` · adv · rank 1756
- jakkolwiek — 🟡 `jakkolwiek` · conj · rank 2155
- **byliby na jego łasce i niełasce**  
  <sub>слова: [być](/slovo/byc), [na](/slovo/na), [on](/slovo/on), `łaska`, [i](/slovo/i), `niełaska`</sub>
- stanowczo — 🟡 `stanowczo` · adv · rank 2158
- prześliczna — 🟡 `prześliczny` · adj · rank 2159
- sprzeczność — 🟡 `sprzeczność` · noun · rank 2160
- zdumiewająca — 🟡 `zdumiewać` · verb · rank 2161
- zdradzają — 🟡 `zdradzać` · verb · rank 2014
- nieubłaganą — 🟡 `ubłagać` · verb · rank 2162
- **Byłby ciekawym studium dla ciebie**  
  <sub>слова: [być](/slovo/byc), [ciekawy](/slovo/ciekawy), `studium`, [dla](/slovo/dla), [ty](/slovo/ty)</sub>
- **Nasz baronet zaczyna interesować się żywo piękną sąsiadką**  
  <sub>слова: [nasz](/slovo/nasz), [baronet](/slovo/baronet), [zaczynać](/slovo/zaczynac), [interesować](/slovo/interesowac), [się](/slovo/sie), [żywo](/slovo/zywo), [piękny](/slovo/piekny), `sąsiadka`</sub>
- wzruszony — 🟡 `wzruszony` · adj · rank 2166
- kilkakrotnie — 🟡 `kilkakrotnie` · adv · rank 2167
- oddziaływanie — 🟡 `oddziaływanie` · noun · rank 2168
- obopólne — 🟡 `obopólny` · adj · rank 2169
- ilekroć — 🟡 `ilekroć` · adv · rank 2170
- zachwyt — 🟡 `zachwyt` · noun · rank 2171
- opromieniała — 🟡 `opromieniać` · verb · rank 2172
- Wątpię — 🟡 `wątpić` · verb · rank 1164
- zażyłości — 🟡 `zażyłość` · noun · rank 2173
- Sprzykrzyłbym — 🟡 `sprzykrzyć` · verb · rank 2174
- prędko — ✅ [prędko](/slovo/predko) · adv
- Kiedyś — ✅ [kiedyś](/slovo/kiedys) · adv
- wykopaliska — 🟡 `wykopaliska` · noun · rank 2175
- **Trudno o większego entuzjastę i maniaka.**  
  <sub>слова: [trudno](/slovo/trudno), [o](/slovo/o), [duży](/slovo/duzy), `entuzjasta`, [i](/slovo/i), `maniak`</sub>
- wznosi — 🟡 `wznosić` · verb · rank 2178
- odtworzyć — 🟡 `odtworzyć` · verb · rank 2179
- **starałem się odtworzyć w myśli katastrofę**  
  <sub>слова: [starać](/slovo/starac), [się](/slovo/sie), `odtworzyć`, [w](/slovo/w), [myśleć](/slovo/myslec), `katastrofa`</sub>
- ujrzał — 🟡 `ujrzeć` · verb · rank 2109
- **tchu zbrakło**  
  <sub>слова: `dech`, `zbraknąć`</sub>
- **Co go wystraszyło?**  
  <sub>слова: [co](/slovo/co), [on](/slovo/on), `wystraszyć`</sub>
- przytomność — 🟡 `przytomność` · noun · rank 2182
- widmowe — 🟡 `widmowy` · adj · rank 2183
- blady — 🟡 `blady` · adj · rank 2184
- zbrodnia — 🟡 `zbrodnia` · noun · rank 871
- obecnie — 🟡 `obecnie` · adv · rank 1905
- skutkiem — 🟡 `skutek` · noun · rank 2133
- pierwiastek — 🟡 `pierwiastek` · noun · rank 2185
- wyręczyć — 🟡 `wyręczyć` · verb · rank 2186
- **Czy zrobiłem coś niewłaściwego?**  
  <sub>слова: [czy](/slovo/czy), [zrobić](/slovo/zrobic), [coś](/slovo/cos), `niewłaściwy`</sub>
- względzie — 🟡 `wzgląd` · noun · rank 1029
- niewiasta — 🟡 `niewiasta` · noun · rank 2188
- zgryzotę — 🟡 `zgryzota` · noun · rank 2189
- zastanawiam — ✅ [zastanawiać](/slovo/zastanawiac) · verb
- Zauważyłem — ✅ [zauważyć](/slovo/zauwazyc) · verb
- posądzeniach — 🟡 `posądzenie` · noun · rank 2190
- **A jednak sam fakt może się wydać błahy.**  
  <sub>слова: [a](/slovo/a), [jednak](/slovo/jednak), [sam](/slovo/sam), [fakt](/slovo/fakt), [móc](/slovo/moc), [się](/slovo/sie), [wydać](/slovo/wydac), `błahy`</sub>
- **Wiesz, że mam sen lekki, a od chwili, gdym tu przybył w charakterze anioła-stróża, sypiam z otwartymi oczyma, jak zając.**  
  <sub>слова: [wiedzieć](/slovo/wiedziec), [że](/slovo/ze), [mama](/slovo/mama), [sen](/slovo/sen), [lekki](/slovo/lekki), [a](/slovo/a), [od](/slovo/od), [chwila](/slovo/chwila), [gdy](/slovo/gdy), [tu](/slovo/tu), [przybyć](/slovo/przybyc), [w](/slovo/w), `charakter`, `sypiać`, [z](/slovo/z), [otworzyć](/slovo/otworzyc), [oko](/slovo/oko), [jak](/slovo/jak)</sub>
- błahy — 🟡 `błahy` · adj · rank 2191
- rzucany — 🟡 `rzucać` · verb · rank 1353
- zakradającego — 🟡 `zakradać` · verb · rank 2194
- **Żeglowanie jest koniecznością.**  
  <sub>слова: `żeglować`, [być](/slovo/byc), `konieczność`</sub>
- koperek — 🟡 `koperek` · noun · rank 2197
- zamach — 🟡 `zamach` · noun · rank 2198
- chrzanowy — 🟡 `chrzanowy` · adj · rank 2199
- poruszać — 🟡 `poruszać` · verb · rank 2200
- napędzać — 🟡 `napędzać` · verb · rank 2201
- leniuszek — 🟡 `leniuszek` · noun · rank 2202
- wepchać — 🟡 `wepchać` · verb · rank 2203
- **prąd Nie jest to napędzane prądem, a jak się rower w dół sprowadza**  
  <sub>слова: `prąd`, [nie](/slovo/nie), [być](/slovo/byc), [to](/slovo/to), `napędzać`, [a](/slovo/a), [jak](/slovo/jak), [się](/slovo/sie), `rower`, [w](/slovo/w), [dół](/slovo/dol), `sprowadzać`</sub>
- chętnie — 🟡 `chętnie` · adv · rank 1423
- chałupa — 🟡 `chałupa` · noun · rank 2206
- pochodzić — 🟡 `pochodzić` · verb · rank 864
- porządny — 🟡 `porządny` · adj · rank 2207
- toczyć — 🟡 `toczyć` · verb · rank 2208
- namiętnie — 🟡 `namiętnie` · adv · rank 2209
- zaskakująco — 🟡 `zaskakująco` · adv · rank 2210
- obawiać — ✅ [obawiać](/slovo/obawiac) · verb
- **Wygląda na to, że trafiliśmy we właściwe miejsce.**  
  <sub>слова: [wyglądać](/slovo/wygladac), [na](/slovo/na), [to](/slovo/to), [że](/slovo/ze), [trafić](/slovo/trafic), `we`, [właściwy](/slovo/wlasciwy), [miejsce](/slovo/miejsce)</sub>
- masarz — 🟡 `masarz` · noun · rank 2212
- spójrzcie — ✅ [spojrzeć](/slovo/spojrzec) · verb
- mistrzowski — 🟡 `mistrzowski` · adj · rank 2213
- żegnać — 🟡 `żegnać` · verb · rank 1332
- zmiarkowałem — 🟡 `zmiarkować` · verb · rank 2056
- miarkowałem — 🟡 `miarkować` · verb · rank 2037
- doleciały — 🟡 `dolecieć` · verb · rank 2214
- Niebawem — 🟡 `niebawem` · adv · rank 2010
- nierokujące — 🟡 `rokować` · verb · rank 2215
- wprawdzie — 🟡 `wprawdzie` · part · rank 2216
- pragnę — 🟡 `pragnąć` · verb · rank 932
- **Rzeczy wzięły obrót niespodziewany**  
  <sub>слова: [rzecz](/slovo/rzecz), [wziąć](/slovo/wziac), `obrót`, `niespodziewany`</sub>
- **Sam osądź**  
  <sub>слова: [sam](/slovo/sam), `osądzić`</sub>
- ubiegłej — 🟡 `ubiegły` · adj · rank 2220
- bagno — ✅ [bagno](/slovo/bagno) · noun
- **Zgrzyt klucza w zamku świadczył może o potajemnym wyjściu na schadzkę.**  
  <sub>слова: `zgrzyt`, [klucz](/slovo/klucz), [w](/slovo/w), `zamek`, `świadczyć`, [móc](/slovo/moc), [o](/slovo/o), `potajemny`, [wyjść](/slovo/wyjsc), [na](/slovo/na), [schadzka](/slovo/schadzka)</sub>
- urozmaiceniem — 🟡 `urozmaicenie` · noun · rank 2226
- zaś — 🟡 `zaś` · conj · rank 2227
- **nie szczędził kosztów**  
  <sub>слова: [nie](/slovo/nie), `szczędzić`, `koszt`</sub>
- siedzibie — 🟡 `siedziba` · noun · rank 2102
- **Nie dalej jak dziś sir Henryk miał przykrą niespodziankę**  
  <sub>слова: [nie](/slovo/nie), [daleko](/slovo/daleko), [jak](/slovo/jak), [dziś](/slovo/dzis), [przykry](/slovo/przykry), `niespodzianka`</sub>
- **istnieją przeszkody**  
  <sub>слова: [istnieć](/slovo/istniec), `przeszkoda`</sub>
- narzucam — 🟡 `narzucać` · verb · rank 2230
- **Byłem w trudnym położeniu**  
  <sub>слова: [były](/slovo/byly), [w](/slovo/w), [trudny](/slovo/trudny), [położyć](/slovo/polozyc)</sub>
- zafrasowany — 🟡 `zafrasować` · verb · rank 2231
- **odwrócił się**  
  <sub>слова: `odwrócić`, [się](/slovo/sie)</sub>
- nuż — 🟡 `nuż` · part · rank 2232
- **wspiąłem się**  
  <sub>слова: `wspiąć`, [się](/slovo/sie)</sub>
- **Ukrywszy się za skałą**  
  <sub>слова: [ukryć](/slovo/ukryc), [się](/slovo/sie), [za](/slovo/za), [skała](/slovo/skala)</sub>
- **A więc to była schadzka umówiona**  
  <sub>слова: [a](/slovo/a), [więc](/slovo/wiec), [to](/slovo/to), `była`, [schadzka](/slovo/schadzka), `umówić`</sub>
- Wstrętnym — 🟡 `wstrętny` · adj · rank 2236
- **Więc cóż począć?**  
  <sub>слова: [więc](/slovo/wiec), [cóż](/slovo/coz), `począć`</sub>
- Wahałem — 🟡 `wahać` · verb · rank 2238
- podążał — 🟡 `podążać` · verb · rank 2239
- uścisku — 🟡 `uścisk` · noun · rank 2240
- usprawiedliwiał — 🟡 `usprawiedliwiać` · verb · rank 2241
- skinął — 🟡 `skinąć` · verb · rank 2242
- **Skądże się tu wziąłeś?**  
  <sub>слова: [skądże](/slovo/skadze), [się](/slovo/sie), [tu](/slovo/tu), [wziąć](/slovo/wziac)</sub>
- wariat — 🟡 `wariat` · noun · rank 2243
- Spłoszyć — 🟡 `spłoszyć` · verb · rank 2244
- społecznemu — 🟡 `społeczny` · adj · rank 2245
- bodaj — 🟡 `bodaj` · part · rank 2246
- wręcz — 🟡 `wręcz` · adv · rank 2247
- nieznośny — 🟡 `nieznośny` · adj · rank 2248
- porozumieć — 🟡 `porozumieć` · verb · rank 2249
- pilno — 🟡 `pilno` · adv · rank 2250
- utrapiony — 🟡 `utrapiony` · noun · rank 2251
- dbać — 🟡 `dbać` · verb · rank 1245
- rozwścieczył — 🟡 `rozwścieczyć` · verb · rank 2252
- niepyszny — 🟡 `niepyszny` · adj · rank 2253
- przychylna — 🟡 `przychylny` · adj · rank 2254
- mimo — ✅ [mimo](/slovo/mimo) · adv
- przyzwoicie — 🟡 `przyzwoicie` · adv · rank 2255
- omacku (po którym błądzimy po omacku) — 🟡 `omacek` · noun · rank 2256
- szmer — 🟡 `szmer` · noun · rank 2257
- **Wreszcie usnęliśmy obaj na krzesłach**  
  <sub>слова: [wreszcie](/slovo/wreszcie), `usnąć`, [oba](/slovo/oba), [na](/slovo/na), `krzesło`</sub>
- **Niezrażeni tym, postanowiliśmy próbę ponowić. Następnej nocy zgasiliśmy lampkę i zapaliwszy papierosy, czekaliśmy, co będzie dalej**  
  <sub>слова: `zrazić`, [ten](/slovo/ten), `postanowić`, `próba`, `ponowić`, [następny](/slovo/nastepny), [noc](/slovo/noc), `zgasić`, `lampka`, [i](/slovo/i), `zapalić`, `papieros`, [czekać](/slovo/czekac), [co](/slovo/co), [być](/slovo/byc), [daleko](/slovo/daleko)</sub>
- **już nas sen morzył**  
  <sub>слова: [już](/slovo/juz), [my](/slovo/my), [sen](/slovo/sen), `morzyć`</sub>
- **Nie ułożyliśmy planu kampanii, ale baronet uważa prostą drogę za najkrótszą i najwłaściwszą**  
  <sub>слова: [nie](/slovo/nie), `ułożyć`, [plan](/slovo/plan), `kampania`, [ale](/slovo/ale), [baronet](/slovo/baronet), [uważać](/slovo/uwazac), [prosty](/slovo/prosty), [droga](/slovo/droga), [za](/slovo/za), [krótki](/slovo/krotki), [i](/slovo/i), [właściwy](/slovo/wlasciwy)</sub>
- **Co ty tu robisz?**  
  <sub>слова: [co](/slovo/co), [ty](/slovo/ty), [tu](/slovo/tu), [robić](/slovo/robic)</sub>
- piętro — 🟡 `piętro` · noun · rank 1398
- **Im prędzej ją wyznasz, tym lepiej dla ciebie**  
  <sub>слова: [on](/slovo/on), [prędko](/slovo/predko), `wyznać`, [ten](/slovo/ten), `lepiej`, [dla](/slovo/dla), [ty](/slovo/ty)</sub>
- **Dość tych kłamstw**  
  <sub>слова: [dość](/slovo/dosc), [ten](/slovo/ten), `kłamstwo`</sub>
- Gadaj — ✅ [gadać](/slovo/gadac) · verb
- **Spojrzał na nas z rozpaczą, załamał ręce bezradnie**  
  <sub>слова: [spojrzeć](/slovo/spojrzec), [na](/slovo/na), [my](/slovo/my), [z](/slovo/z), [rozpacz](/slovo/rozpacz), `załamać`, [ręka](/slovo/reka), [bezradnie](/slovo/bezradnie)</sub>
- **Niech mnie pan o to nie pyta. Daję panu słowo honoru, że to cudza tajemnica. Nie mogę jej wyjawić. Gdyby chodziło tylko o mnie, wyznałbym panu całą prawdę**  
  <sub>слова: [niech](/slovo/niech), [ja](/slovo/ja), [pan](/slovo/pan), [o](/slovo/o), [to](/slovo/to), [nie](/slovo/nie), `pyta`, [dawać](/slovo/dawac), [słowo](/slovo/slowo), `honor`, [że](/slovo/ze), `cudzy`, [tajemnica](/slovo/tajemnica), [móc](/slovo/moc), [on](/slovo/on), `wyjawić`, [gdyby](/slovo/gdyby), [chodzić](/slovo/chodzic), [tylko](/slovo/tylko), `wyznać`, [cały](/slovo/caly), [prawda](/slovo/prawda)</sub>
- łotrze — 🟡 `łotr` · noun · rank 2275
- **Czy i teraz, łotrze, będziesz przeczył, że dawaliście sobie sygnały?… Chodź no tutaj. Mów, kto jest twoim wspólnikiem i jaki knujecie spisek?**  
  <sub>слова: [czy](/slovo/czy), [i](/slovo/i), [teraz](/slovo/teraz), `łotr`, [być](/slovo/byc), `przeczyć`, [że](/slovo/ze), [dawać](/slovo/dawac), `sygnał`, [chodzić](/slovo/chodzic), [no](/slovo/no), [tutaj](/slovo/tutaj), [mowa](/slovo/mowa), [kto](/slovo/kto), [twój](/slovo/twoj), `wspólnik`, [jaki](/slovo/jaki), `knuć`, `spisek`</sub>
- **— Nie powiem! — oświadczył butnie. — To moja rzecz, nie pańska.**  
  <sub>слова: [nie](/slovo/nie), [powiedzieć](/slovo/powiedziec), `oświadczyć`, [butnie](/slovo/butnie), [to](/slovo/to), [rzecz](/slovo/rzecz), [pański](/slovo/panski)</sub>
- **— W takim razie wynoś się zaraz z mego domu!**  
  <sub>слова: [w](/slovo/w), [taki](/slovo/taki), [raz](/slovo/raz), `wynosić`, [się](/slovo/sie), [zaraz](/slovo/zaraz), [z](/slovo/z), [mój](/slovo/moj), [dom](/slovo/dom)</sub>
- **— I żebyś mi się nie pokazywał na oczy! To wstyd, hańba!… Twoja rodzina służyła mojej przez kilka pokoleń, a ty knujesz przeciwko mnie spiski?…**  
  <sub>слова: [i](/slovo/i), [żeby](/slovo/zeby), [się](/slovo/sie), [nie](/slovo/nie), `pokazywać`, [na](/slovo/na), [oko](/slovo/oko), [to](/slovo/to), `wstyd`, `hańba`, [rodzina](/slovo/rodzina), `służyć`, [mój](/slovo/moj), [przez](/slovo/przez), [kilka](/slovo/kilka), `pokolenie`, [a](/slovo/a), [ty](/slovo/ty), `knuć`, [przeciwko](/slovo/przeciwko), [ja](/slovo/ja), `spiski`</sub>
- hulać — 🟡 `hulać` · verb · rank 2284
- **Cóż miałam począć?**  
  <sub>слова: [cóż](/slovo/coz), [mieć](/slovo/miec), `począć`</sub>
- **on go ukrywał i żywił przez wzgląd na mnie**  
  <sub>слова: [on](/slovo/on), `ukrywać`, [i](/slovo/i), `żywić`, [przez](/slovo/przez), `wzgląd`, [na](/slovo/na), [ja](/slovo/ja)</sub>
- **— Dziwna rzecz, że on nie boi się zdradzać swej obecności… — rzekł baronet.**  
  <sub>слова: [dziwny](/slovo/dziwny), [rzecz](/slovo/rzecz), [że](/slovo/ze), [on](/slovo/on), [nie](/slovo/nie), [bać](/slovo/bac), [się](/slovo/sie), `zdradzać`, [swój](/slovo/swoj), `obecność`, `rzec`, [baronet](/slovo/baronet)</sub>
- współczucia — 🟡 `współczucie` · noun · rank 2287
- **Musimy wpaść na niego znienacka**  
  <sub>слова: [musieć](/slovo/musiec), [wpaść](/slovo/wpasc), [na](/slovo/na), [on](/slovo/on), [znienacka](/slovo/znienacka)</sub>
- Podobno — ✅ [podobny](/slovo/podobny) · adj
- **Zaległa znowu cisza, przerażająca, złowroga**  
  <sub>слова: `zalec`, [znowu](/slovo/znowu), `cisza`, `przerażać`, `złowrogi`</sub>
- **W jego głosie brzmiał tłumiony strach**  
  <sub>слова: [w](/slovo/w), [on](/slovo/on), [głos](/slovo/glos), [brzmieć](/slovo/brzmiec), `tłumić`, `strach`</sub>
- cofniemy — 🟡 `cofnąć` · verb · rank 1336
- **Chodźmy! Co ma być, niech się stanie**  
  <sub>слова: [chodzić](/slovo/chodzic), [co](/slovo/co), [mój](/slovo/moj), [być](/slovo/byc), [niech](/slovo/niech), [się](/slovo/sie), [stan](/slovo/stan)</sub>
- przodkowie — 🟡 `przodek` · noun · rank 2292
- **Morderca wodził niespokojnym wzrokiem dokoła jak zwierz, gdy go doleci odgłos nagonki**  
  <sub>слова: `morderca`, `wodzić`, `niespokojny`, `wzrok`, [dokoła](/slovo/dokola), [jak](/slovo/jak), `zwierz`, [gdy](/slovo/gdy), [on](/slovo/on), `dolecieć`, `odgłos`, `nagonka`</sub>
- podejrzliwość — 🟡 `podejrzliwość` · noun · rank 2299
- zwykł — 🟡 `zwyknąć` · verb · rank 2300
- niebawem — 🟡 `niebawem` · adv · rank 2010
- ustawicznie — 🟡 `ustawicznie` · adv · rank 2301
- **Wreszcie, zdyszani, usiedliśmy na skale, patrząc za nim, dopóki nam nie znikł sprzed oczu**  
  <sub>слова: [wreszcie](/slovo/wreszcie), `zdyszeć`, [usiąść](/slovo/usiasc), [na](/slovo/na), [skała](/slovo/skala), [patrzeć](/slovo/patrzec), [za](/slovo/za), [on](/slovo/on), [dopóki](/slovo/dopoki), [my](/slovo/my), [nie](/slovo/nie), [zniknąć](/slovo/zniknac), [sprzed](/slovo/sprzed), [oko](/slovo/oko)</sub>
- zaniechali — 🟡 `zaniechać` · verb · rank 2303
- szczycie — 🟡 `szczyt` · noun · rank 1706
- przestrzeń — 🟡 `przestrzeń` · noun · rank 1640
- **Na tle księżycowej tarczy odrzynały się skały, lecz żywy posąg nie stał już na ich szczycie**  
  <sub>слова: [na](/slovo/na), `tło`, `księżycowy`, `tarcza`, `odrzynać`, [się](/slovo/sie), [skała](/slovo/skala), [lecz](/slovo/lecz), [żywy](/slovo/zywy), `posąg`, [nie](/slovo/nie), [stać](/slovo/stac), [już](/slovo/juz), [on](/slovo/on), `szczyt`</sub>
- **które mnie wstrząsnęło do szpiku kości**  
  <sub>слова: [który](/slovo/ktory), [ja](/slovo/ja), `wstrząsnąć`, [do](/slovo/do), `szpik`, `kości`</sub>
- schwytać — 🟡 `schwytać` · verb · rank 2312
- **Takie są przygody ostatniej nocy**  
  <sub>слова: [taki](/slovo/taki), [być](/slovo/byc), `przygoda`, [ostatni](/slovo/ostatni), [noc](/slovo/noc)</sub>
- odkryć (Postąpiliśmy naprzód na drodze odkryć) — ✅ [odkryć](/slovo/odkryc) · verb
- rzucić (zdołam rzucić na nie światło) — ✅ [rzucić](/slovo/rzucic) · verb
- **Byłoby najlepiej, gdybyś mógł sam przyjechać**  
  <sub>слова: [być](/slovo/byc), [dobrze](/slovo/dobrze), [gdyby](/slovo/gdyby), [móc](/slovo/moc), [sam](/slovo/sam), [przyjechać](/slovo/przyjechac)</sub>
- **posiłkowałem się**  
  <sub>слова: `posiłkować`, [się](/slovo/sie)</sub>
- Odtąd — 🟡 `odtąd` · adv · rank 2315
- **Przytoczę kilka ustępów, zaczynając od dnia następującego po naszym pościgu**  
  <sub>слова: `przytoczyć`, [kilka](/slovo/kilka), `ustęp`, [zaczynać](/slovo/zaczynac), [od](/slovo/od), [dzień](/slovo/dzien), `następować`, [po](/slovo/po), [nasz](/slovo/nasz), `pościg`</sub>
- **Drobny deszczyk kropi bez ustanku**  
  <sub>слова: `drobny`, `deszczyk`, `kropić`, [bez](/slovo/bez), `ustanek`</sub>
- spowity — 🟡 `spowić` · verb · rank 2324
- potrafimy — ✅ [potrafić](/slovo/potrafic) · verb
- **Powodów do obawy nie braknie**  
  <sub>слова: [powód](/slovo/powod), [do](/slovo/do), `obawa`, [nie](/slovo/nie), `braknąć`</sub>
- szereg — 🟡 `szereg` · noun · rank 2326
- ziejącego — 🟡 `ziać` · verb · rank 2327
- siarka — 🟡 `siarka` · noun · rank 2328
- **Lecz fakty są faktami, a na własne uszy dwa razy słyszałem szczekanie na bagnie**  
  <sub>слова: [lecz](/slovo/lecz), [fakt](/slovo/fakt), [być](/slovo/byc), [a](/slovo/a), [na](/slovo/na), `własne`, `ucho`, [dwa](/slovo/dwa), [raz](/slovo/raz), [słyszeć](/slovo/slyszec), `szczekać`, [bagno](/slovo/bagno)</sub>
- Przypuśćmy — 🟡 `przypuścić` · verb · rank 2331
- Pomijając — 🟡 `pomijać` · verb · rank 2332
- **Gdzież on teraz przebywa?**  
  <sub>слова: [gdzież](/slovo/gdziez), [on](/slovo/on), [teraz](/slovo/teraz), `przebywać`</sub>
- **Całą moją energię wytężę, aby tego celu dopiąć**  
  <sub>слова: [cały](/slovo/caly), [mój](/slovo/moj), `energia`, `wytężyć`, [aby](/slovo/aby), [ten](/slovo/ten), [cel](/slovo/cel), `dopiąć`</sub>
- **Będę działał na własną rękę**  
  <sub>слова: [być](/slovo/byc), [działać](/slovo/dzialac), [na](/slovo/na), [własny](/slovo/wlasny), [ręka](/slovo/reka)</sub>
- zajście — 🟡 `zajście` · noun · rank 2336
- zmierzał — 🟡 `zmierzać` · verb · rank 1498
- **każdy w kłopocie udawał się do niego**  
  <sub>слова: [każdy](/slovo/kazdy), [w](/slovo/w), [kłopot](/slovo/klopot), [udawać](/slovo/udawac), [się](/slovo/sie), [do](/slovo/do), [on](/slovo/on)</sub>
- zauważyłem — ✅ [zauważyć](/slovo/zauwazyc) · verb
- nietknięty — 🟡 `nietknięty` · adj · rank 2337
- **otóż moja żona znalazła w popiele z kominka niedopalony szczątek listu**  
  <sub>слова: [otóż](/slovo/otoz), [żona](/slovo/zona), [znaleźć](/slovo/znalezc), [w](/slovo/w), `popiół`, [z](/slovo/z), `kominek`, `dopalić`, `szczątek`, `list`</sub>
- **— Nie; gdyśmy go poruszyli, rozsypał się.**  
  <sub>слова: [nie](/slovo/nie), [gdy](/slovo/gdy), [on](/slovo/on), `poruszyć`, `rozsypać`, [się](/slovo/sie)</sub>
- **Zwiększa ono jeszcze ciemności otaczające nas zewsząd.**  
  <sub>слова: `zwiększać`, [on](/slovo/on), [jeszcze](/slovo/jeszcze), `ciemności`, `otaczać`, [my](/slovo/my), [zewsząd](/slovo/zewszad)</sub>
- **Jak uważasz: co nam teraz uczynić należy?**  
  <sub>слова: [jak](/slovo/jak), [uważać](/slovo/uwazac), [co](/slovo/co), [my](/slovo/my), [teraz](/slovo/teraz), `uczynić`, [należeć](/slovo/nalezec)</sub>
- wyzysk — 🟡 `wyzysk` · noun · rank 2348
- pochłania — 🟡 `pochłaniać` · verb · rank 2349
- **Przez cały dzień deszcz padał**  
  <sub>слова: [przez](/slovo/przez), [cały](/slovo/caly), [dzień](/slovo/dzien), [deszcz](/slovo/deszcz), `padać`</sub>
- tarczy — 🟡 `tarcza` · noun · rank 2306
- **Wiatr smagał mnie po twarzy, deszcz lał się za kołnierz**  
  <sub>слова: [wiatr](/slovo/wiatr), `smagać`, [ja](/slovo/ja), [po](/slovo/po), [twarz](/slovo/twarz), [deszcz](/slovo/deszcz), `lać`, [się](/slovo/sie), [za](/slovo/za), `kołnierz`</sub>
- **Wracając, spotkałem doktora Mortimera**  
  <sub>слова: [wracać](/slovo/wracac), [spotkać](/slovo/spotkac), [doktor](/slovo/doktor)</sub>
- **Wątpię, czy doktor zobaczy jeszcze swego ulubieńca**  
  <sub>слова: `wątpić`, [czy](/slovo/czy), [doktor](/slovo/doktor), [zobaczyć](/slovo/zobaczyc), [jeszcze](/slovo/jeszcze), [swój](/slovo/swoj), `ulubieniec`</sub>
- **— Zdaje mi się — odparł**  
  <sub>слова: [zdawać](/slovo/zdawac), [się](/slovo/sie), `odeprzeć`</sub>
- **Ojciec wyparł jej się**  
  <sub>слова: [ojciec](/slovo/ojciec), `wyprzeć`, [on](/slovo/on), [się](/slovo/sie)</sub>
- **Biedna kobieta ma ciężkie życie**  
  <sub>слова: [biedny](/slovo/biedny), [kobieta](/slovo/kobieta), [mój](/slovo/moj), [ciężki](/slovo/ciezki), [życie](/slovo/zycie)</sub>
- **— Z czegóż się utrzymuje?**  
  <sub>слова: [z](/slovo/z), [czegóż](/slovo/czegoz), [się](/slovo/sie), `utrzymywać`</sub>
- indagacji — 🟡 `indagacja` · noun · rank 2358
- podejrzanej — ✅ [podejrzany](/slovo/podejrzany) · adj
- łańcucha — 🟡 `łańcuch` · noun · rank 2359
- **Nie darmo tyle lat przebywam w towarzystwie Sherlocka Holmesa**  
  <sub>слова: [nie](/slovo/nie), [darmo](/slovo/darmo), [tyle](/slovo/tyle), [lato](/slovo/lato), `przebywać`, [w](/slovo/w), `towarzystwo`</sub>
- zanotować — 🟡 `zanotować` · verb · rank 2361
- **Pozostaje mi już tylko zanotować jeden fakt z owego dnia, a mianowicie moją rozmowę z Barrymore'em**  
  <sub>слова: `pozostawać`, [już](/slovo/juz), [tylko](/slovo/tylko), `zanotować`, [jeden](/slovo/jeden), [fakt](/slovo/fakt), [z](/slovo/z), `ów`, [dzień](/slovo/dzien), [a](/slovo/a), [mianowicie](/slovo/mianowicie), [mój](/slovo/moj), [rozmowa](/slovo/rozmowa), `em`</sub>
- **Czy jeszcze grasuje?**  
  <sub>слова: [czy](/slovo/czy), [jeszcze](/slovo/jeszcze), `grasować`</sub>
- **Spodziewam się, że już go tu nie ma; nie dawał znaku życia od dnia, gdy po raz ostatni zaniosłem mu żywność**  
  <sub>слова: [spodziewać](/slovo/spodziewac), [się](/slovo/sie), [że](/slovo/ze), [już](/slovo/juz), [on](/slovo/on), [tu](/slovo/tu), [nie](/slovo/nie), [mój](/slovo/moj), [dawać](/slovo/dawac), `znak`, [życie](/slovo/zycie), [od](/slovo/od), [dzień](/slovo/dzien), [gdy](/slovo/gdy), [po](/slovo/po), [raz](/slovo/raz), [ostatni](/slovo/ostatni), `zanieść`, `żywność`</sub>
- odezwania — 🟡 `odezwać` · verb · rank 2367
- **Wahał się**  
  <sub>слова: `wahać`, [się](/slovo/sie)</sub>
- **Cóż cię zaniepokoiło?**  
  <sub>слова: [cóż](/slovo/coz), [ty](/slovo/ty), `zaniepokoić`</sub>
- **Powiem panu szczerze**  
  <sub>слова: [powiedzieć](/slovo/powiedziec), [pan](/slovo/pan), [szczerze](/slovo/szczerze)</sub>
- **Znając te dwa fakty, miałem w ręku oręż, który mógł mi pomóc do wyjaśnienia tej krwawej zagadki**  
  <sub>слова: [znać](/slovo/znac), [ten](/slovo/ten), [dwa](/slovo/dwa), [fakt](/slovo/fakt), [w](/slovo/w), [ręka](/slovo/reka), `oręż`, [który](/slovo/ktory), [móc](/slovo/moc), [pomóc](/slovo/pomoc), [do](/slovo/do), `wyjaśnienia`, `krwawy`, `zagadka`</sub>
- zwiady — 🟡 `zwiad` · noun · rank 2372
- **Na pierwszy rzut oka**  
  <sub>слова: [na](/slovo/na), [pierwszy](/slovo/pierwszy), `rzut`, [oko](/slovo/oko)</sub>
- zawdzięczam (Mówiłam już panu, że wiele mu zawdzięczam) — 🟡 `zawdzięczać` · verb · rank 2374
- jałmużnikiem — 🟡 `jałmużnik` · noun · rank 2375
- potrwa — 🟡 `potrwać` · verb · rank 1610
- zaś — 🟡 `zaś` · conj · rank 2227
- bezkarnie — 🟡 `bezkarnie` · adv · rank 2376
- **— Mówię prawdę**  
  <sub>слова: [mówić](/slovo/mowic), [prawda](/slovo/prawda)</sub>
- nadaremnie — 🟡 `nadaremnie` · adv · rank 2377
- przekonasz — ✅ [przekonać](/slovo/przekonac) · verb
- dopiero — ✅ [dopiero](/slovo/dopiero) · part
- żałować — 🟡 `żałować` · verb · rank 1226
- złapać — ✅ [złapać](/slovo/zlapac) · verb
- przedsięwzięła — 🟡 `przedsięwziąć` · verb · rank 2378
- zniechęcony — 🟡 `zniechęcony` · adj · rank 2379
- mur — 🟡 `mur` · noun · rank 2380
- **Niewątpliwie była bardziej winna, niż się przedstawiała.**  
  <sub>слова: [niewątpliwie](/slovo/niewatpliwie), `była`, [bardziej](/slovo/bardziej), `winna`, [niż](/slovo/niz), [się](/slovo/sie), `przedstawiać`</sub>
- jaskiniom — 🟡 `jaskinia` · noun · rank 2383
- **Obiecywałem sobie, że znajdę nieznajomego i że musi mi wyznać, dlaczego tu przebywa**  
  <sub>слова: `obiecywać`, [że](/slovo/ze), [znaleźć](/slovo/znalezc), [nieznajomy](/slovo/nieznajomy), [i](/slovo/i), [musieć](/slovo/musiec), `wyznać`, [dlaczego](/slovo/dlaczego), [tu](/slovo/tu), `przebywać`</sub>
- **Jakiż byłby to dla mnie tryumf, gdybym go zdołał schwytać!**  
  <sub>слова: `jakiż`, [być](/slovo/byc), [to](/slovo/to), [dla](/slovo/dla), [ja](/slovo/ja), `tryumf`, [gdyby](/slovo/gdyby), [on](/slovo/on), `zdołać`, `schwytać`</sub>
- dopisywało — 🟡 `dopisywać` · verb · rank 2387
- **Zwiastunem dobrej wieści był pan Frankland.**  
  <sub>слова: `zwiastun`, [dobry](/slovo/dobry), [wieść](/slovo/wiesc), [być](/slovo/byc), [pan](/slovo/pan)</sub>
- wznoszącego — 🟡 `wznosić` · verb · rank 2178
- **Dowodzenie było bardzo logiczne**  
  <sub>слова: `dowodzenie`, [być](/slovo/byc), [bardzo](/slovo/bardzo), `logiczny`</sub>
- **— Bez wątpienia — odparłem — ale skąd pan wie, że on kryje się na bagnie?**  
  <sub>слова: [bez](/slovo/bez), `wątpić`, `odeprzeć`, [ale](/slovo/ale), [skąd](/slovo/skad), [pan](/slovo/pan), [wiedzieć](/slovo/wiedziec), [że](/slovo/ze), [on](/slovo/on), `kryć`, [się](/slovo/sie), [na](/slovo/na), [bagno](/slovo/bagno)</sub>
- **Udawałem, że ta wiadomość jest mi zupełnie obojętna**  
  <sub>слова: [udawać](/slovo/udawac), [że](/slovo/ze), [ten](/slovo/ten), [wiadomość](/slovo/wiadomosc), [być](/slovo/byc), [zupełnie](/slovo/zupelnie), `obojętny`</sub>
- **Jeżeli potrafię wydobyć z niego więcej faktów, oszczędzi mi to czasu i trudu**  
  <sub>слова: [jeżeli](/slovo/jezeli), [potrafić](/slovo/potrafic), `wydobyć`, [z](/slovo/z), [on](/slovo/on), [więcej](/slovo/wiecej), [fakt](/slovo/fakt), `oszczędzić`, [to](/slovo/to), [czas](/slovo/czas), [i](/slovo/i), `trud`</sub>
- **— Więc pan wątpi?**  
  <sub>слова: [więc](/slovo/wiec), [pan](/slovo/pan), `wątpić`</sub>
- **Pozwól sobie powiedzieć, że to przypuszczenie jest niedorzeczne.**  
  <sub>слова: [pozwolić](/slovo/pozwolic), [powiedzieć](/slovo/powiedziec), [że](/slovo/ze), [to](/slovo/to), `przypuszczenie`, [być](/slovo/byc), `niedorzeczny`</sub>
- **Nie ma tam ani źdźbła trawy, więc cóż by skubała trzoda, a bez trzody nie ma pastucha.**  
  <sub>слова: [nie](/slovo/nie), [mój](/slovo/moj), [tam](/slovo/tam), [ani](/slovo/ani), `źdźbło`, `trawa`, [więc](/slovo/wiec), [cóż](/slovo/coz), [by](/slovo/by), `skubać`, `trzoda`, [a](/slovo/a), [bez](/slovo/bez), `pastuch`</sub>
- **— Chodź pan, chodź — zawołał Frankland, biegnąc na górę. — Zobaczysz pan na własne oczy i przekonasz się, że nie rzucam słów na wiatr**  
  <sub>слова: [chodzić](/slovo/chodzic), [pan](/slovo/pan), `zawołać`, `biec`, [na](/slovo/na), [góra](/slovo/gora), [zobaczyć](/slovo/zobaczyc), `własne`, [oko](/slovo/oko), [i](/slovo/i), [przekonać](/slovo/przekonac), [się](/slovo/sie), [że](/slovo/ze), [nie](/slovo/nie), `rzucać`, [słowo](/slovo/slowo), [wiatr](/slovo/wiatr)</sub>
- **— Śpiesz się, doktorze, bo przejdzie na drugą stronę góry!**  
  <sub>слова: `śpieszyć`, [się](/slovo/sie), [doktor](/slovo/doktor), [bo](/slovo/bo), [przejść](/slovo/przejsc), [na](/slovo/na), [drugi](/slovo/drugi), [strona](/slovo/strona), `góry`</sub>
- prostopadle — 🟡 `prostopadle` · adv · rank 2406
- zawiniątko — 🟡 `zawiniątko` · noun · rank 2407
- **bochenek chleba**  
  <sub>слова: `bochenek`, `chleb`</sub>
- **wędzony ozór**  
  <sub>слова: `wędzić`, `ozór`</sub>
- **dwa słoiki owocowych konserw**  
  <sub>слова: [dwa](/slovo/dwa), `słoik`, `owocowa`, `konserwa`</sub>
- **Szukałem innych kartek, ale na próżno**  
  <sub>слова: [szukać](/slovo/szukac), [inny](/slovo/inny), `kartka`, [ale](/slovo/ale), [na](/slovo/na), [próżno](/slovo/prozno)</sub>
- **Poprzysiągłem sobie, że stąd nie wyjdę, dopóki nie dowiem się, czy ten człowiek jest naszym przyjacielem, czy wrogiem**  
  <sub>слова: `poprzysięgnąć`, [że](/slovo/ze), [stąd](/slovo/stad), [nie](/slovo/nie), [wyjść](/slovo/wyjsc), [dopóki](/slovo/dopoki), [dowiedzieć](/slovo/dowiedziec), [się](/slovo/sie), [czy](/slovo/czy), [ten](/slovo/ten), [człowiek](/slovo/czlowiek), [być](/slovo/byc), [nasz](/slovo/nasz), [przyjaciel](/slovo/przyjaciel), [wróg](/slovo/wrog)</sub>
- **— Jakże się cieszę, że to ty!**  
  <sub>слова: [jakże](/slovo/jakze), [się](/slovo/sie), [cieszyć](/slovo/cieszyc), [że](/slovo/ze), [to](/slovo/to), [ty](/slovo/ty)</sub>
- **— Tak, wtedy cię ujrzałem**  
  <sub>слова: [tak](/slovo/tak), [wtedy](/slovo/wtedy), [ty](/slovo/ty), `ujrzeć`</sub>
- **— Więc posługujesz się mną, a jednak mi nie ufasz… — zawołałem z goryczą. — Zdaje mi się, że zasłużyłem na zaufanie**  
  <sub>слова: [więc](/slovo/wiec), `posługiwać`, [się](/slovo/sie), [ja](/slovo/ja), [a](/slovo/a), [jednak](/slovo/jednak), [nie](/slovo/nie), [ufać](/slovo/ufac), `zawołać`, [z](/slovo/z), `gorycz`, [zdawać](/slovo/zdawac), [że](/slovo/ze), `zasłużyć`, [na](/slovo/na), `zaufanie`</sub>
- **zniechęcić się**  
  <sub>слова: `zniechęcić`, [się](/slovo/sie)</sub>
- **Nie zniechęcaj się!**  
  <sub>слова: [nie](/slovo/nie), `zniechęcać`, [się](/slovo/sie)</sub>
- **— Teraz ja udzielę ci garstkę informacji w zamian za te, których ty mi dostarczyłeś. Dama, uchodząca tutaj za miss Stapleton, jest w istocie jego żoną.**  
  <sub>слова: [teraz](/slovo/teraz), [ja](/slovo/ja), `udzielić`, [ten](/slovo/ten), `garstka`, [informacja](/slovo/informacja), [w](/slovo/w), `zamian`, [za](/slovo/za), [który](/slovo/ktory), [ty](/slovo/ty), `dostarczyć`, [dama](/slovo/dama), `uchodzić`, [tutaj](/slovo/tutaj), `miss`, [być](/slovo/byc), `istota`, [on](/slovo/on), [żona](/slovo/zona)</sub>
- **Powtarzam ci: ta piękna dama jest nie siostrą, lecz żoną Stapletona**  
  <sub>слова: `powtarzać`, [ten](/slovo/ten), `piękno`, [dama](/slovo/dama), [być](/slovo/byc), [nie](/slovo/nie), [siostra](/slovo/siostra), [lecz](/slovo/lecz), [żona](/slovo/zona)</sub>
- **— Za późno już, za późno!… — mówił z rozpaczą. — Że też siedziałem tu jak bałwan, z założonymi rękoma!… A ty, jak mogłeś wypuścić z opieki sir Henryka!…**  
  <sub>слова: [za](/slovo/za), [późno](/slovo/pozno), [już](/slovo/juz), [mówić](/slovo/mowic), [z](/slovo/z), [rozpacz](/slovo/rozpacz), [że](/slovo/ze), [też](/slovo/tez), [siedzieć](/slovo/siedziec), [tu](/slovo/tu), [jak](/slovo/jak), `bałwan`, [założyć](/slovo/zalozyc), [ręka](/slovo/reka), [a](/slovo/a), [ty](/slovo/ty), [móc](/slovo/moc), `wypuścić`, `opieka`</sub>
- **— Trzeba sprowadzić ludzi — rzekłem. — We dwóch nie przeniesiemy go do Baskerville Hall. Co ci jest? Czyś oszalał?…**  
  <sub>слова: [trzeba](/slovo/trzeba), `sprowadzić`, [człowiek](/slovo/czlowiek), `rzec`, `we`, [dwa](/slovo/dwa), [nie](/slovo/nie), `przenieść`, [on](/slovo/on), [do](/slovo/do), [co](/slovo/co), [ten](/slovo/ten), [być](/slovo/byc), [czy](/slovo/czy), `oszaleć`</sub>
- **Z gorączkową skwapliwością odwróciliśmy zwłoki twarzą do księżyca**  
  <sub>слова: [z](/slovo/z), `gorączkowy`, `skwapliwość`, `odwrócić`, `zwłoki`, [twarz](/slovo/twarz), [do](/slovo/do), `księżyc`</sub>
- **Co za zimna krew!**  
  <sub>слова: [co](/slovo/co), [za](/slovo/za), [zimny](/slovo/zimny), [krew](/slovo/krew)</sub>
- **— Żałuję, że nas widział**  
  <sub>слова: `żałować`, [że](/slovo/ze), [my](/slovo/my), [widzieć](/slovo/widziec)</sub>
- **Drogi Watsonie, ty jesteś stworzony na człowieka czynu.**  
  <sub>слова: `drogi`, [ty](/slovo/ty), [być](/slovo/byc), [stworzyć](/slovo/stworzyc), [na](/slovo/na), [człowiek](/slovo/czlowiek), `czyn`</sub>
- **Nie zdołamy mu nic dowieść**  
  <sub>слова: [nie](/slovo/nie), `zdołać`, [on](/slovo/on), [nic](/slovo/nic), `dowieść`</sub>
- **Mamy przecież dowód.**  
  <sub>слова: [mama](/slovo/mama), [przecież](/slovo/przeciez), [dowód](/slovo/dowod)</sub>
- **Ma się rozumieć**  
  <sub>слова: [mój](/slovo/moj), [się](/slovo/sie), [rozumieć](/slovo/rozumiec)</sub>
- poniekąd — 🟡 `poniekąd` · part · rank 2435
- wyrzutkiem — 🟡 `wyrzutek` · noun · rank 2436
- zatarg — 🟡 `zatarg` · noun · rank 2437
- **spodziewam się rzucić na nie światło**  
  <sub>слова: [spodziewać](/slovo/spodziewac), [się](/slovo/sie), [rzucić](/slovo/rzucic), [na](/slovo/na), [nie](/slovo/nie), [światło](/slovo/swiatlo)</sub>
- kaganiec — 🟡 `kaganiec` · noun · rank 2438
- **Rozporządzaj pan mną do woli**  
  <sub>слова: `rozporządzać`, [pan](/slovo/pan), [ja](/slovo/ja), [do](/slovo/do), `woli`</sub>
- owszem — 🟡 `owszem` · part · rank 1175
- **— Jeżeli pan zastosujesz się do moich wskazówek i poleceń, nie pytając o ich przyczynę, to uda mi się może rozwikłać tajemnicę. Nie wątpię…**  
  <sub>слова: [jeżeli](/slovo/jezeli), [pan](/slovo/pan), `zastosować`, [się](/slovo/sie), [do](/slovo/do), [mój](/slovo/moj), `wskazówka`, [i](/slovo/i), `polecenie`, [nie](/slovo/nie), [pytać](/slovo/pytac), [o](/slovo/o), [on](/slovo/on), `przyczyna`, [to](/slovo/to), [udać](/slovo/udac), [móc](/slovo/moc), `rozwikłać`, [tajemnica](/slovo/tajemnica), `wątpić`</sub>
- **Patrząc na Sherlocka, spostrzegłem, że tłumi wewnętrzne wzburzenie.**  
  <sub>слова: [patrzeć](/slovo/patrzec), [na](/slovo/na), `spostrzec`, [że](/slovo/ze), `tłumić`, [wewnętrzny](/slovo/wewnetrzny), `wzburzenie`</sub>
- **— Co cię uderza? — zapytał.**  
  <sub>слова: [co](/slovo/co), [ty](/slovo/ty), `uderzać`, [zapytać](/slovo/zapytac)</sub>
- **Nazajutrz wstałem bardzo wcześnie, ale Holmes już mnie wyprzedził. Był ubrany do wyjścia.**  
  <sub>слова: [nazajutrz](/slovo/nazajutrz), `wstać`, [bardzo](/slovo/bardzo), [wcześnie](/slovo/wczesnie), [ale](/slovo/ale), [już](/slovo/juz), [ja](/slovo/ja), `wyprzedzić`, [być](/slovo/byc), `ubrany`, [do](/slovo/do), [wyjść](/slovo/wyjsc)</sub>
- **— Cóż dalej?**  
  <sub>слова: [cóż](/slovo/coz), [daleko](/slovo/daleko)</sub>
- **— Bo też tak jest.**  
  <sub>слова: [bo](/slovo/bo), [też](/slovo/tez), [tak](/slovo/tak), [być](/slovo/byc)</sub>
- **— I ja gotów jestem ich wysłuchać.**  
  <sub>слова: [i](/slovo/i), [ja](/slovo/ja), `gotów`, [być](/slovo/byc), [on](/slovo/on), `wysłuchać`</sub>
