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

6. Второй раздел «Raw words» (437 строк, 2026-10-11): 641 разное слово, из них 348 уже с
   карточками. **261 новая лемма** записана в `data/words.json` с рангами 5778–6038; опечатки
   сведены к задуманному слову (`zakłycać` → `zakłócać`, `rdzynymi` → `rdzenny`), отдельно
   стоящее слово сохраняет свою лемму (`nawiązanie`, `uderzenie`, `kiepsko`), а в предложении
   лемму выбирает контекст (`lat` → `rok`, `w stanie` → `stan`). 28 токенов — имена,
   сокращения и нераспознанные формы — в `data/words-excluded.json`. Устаревшие пометки 🟡
   у слов, чьи карточки уже написаны, заменены ссылками.

7. Все 266 лемм очереди (2026-10-11) получили карточки формата 2: по три примера на каждую
   форму, значения, примечания, этимология, идиомы; новые тексты помечены `# review`.
   Очередь пуста; 16 записей реестра — формы других слов (↩︎) и карточек не требуют.

## Состояние

|                       |          |
| --------------------- | -------- |
| Лемм всего            | **1397** |
| Карточка готова       | **1397** |
| В очереди             | **0**    |
| Формы других слов (↩︎) | **16**   |
| Не в словаре          | **72**   |

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
- wynikającego — ✅ [wynikać](/slovo/wynikac) · verb
- mianowicie — ✅ [mianowicie](/slovo/mianowicie) · conj
- handlujący — ✅ [handlować](/slovo/handlowac) · verb
- określić — ✅ [określić](/slovo/okreslic) · verb
- twarz — ✅ [twarz](/slovo/twarz) · noun
- tłumaczą — ✅ [tłumaczyć](/slovo/tlumaczyc) · verb
- przedawnioną — ✅ [przedawnić](/slovo/przedawnic) · verb
- sędzia — ✅ [sędzia](/slovo/sedzia) · noun
- majątek — ✅ [majątek](/slovo/majatek) · noun
- spadkobierca — ✅ [spadkobierca](/slovo/spadkobierca) · noun
- objąć — ✅ [objąć](/slovo/objac) · verb
- najprędzej — ✅ [prędko](/slovo/predko) · adv
- niełatwo — ✅ [niełatwo](/slovo/nielatwo) · adv
- domniemany — ✅ [domniemany](/slovo/domniemany) · adj
- niebawem — ✅ [niebawem](/slovo/niebawem) · adv
- los — ✅ [los](/slovo/los) · noun
- powszechnie — ✅ [powszechnie](/slovo/powszechnie) · adv
- istotnie — ✅ [istotnie](/slovo/istotnie) · adv
- Zechciej — ✅ [zechcieć](/slovo/zechciec) · verb
- oparł — ✅ [oprzeć](/slovo/oprzec) · verb
- zdradzać — ✅ [zdradzać](/slovo/zdradzac) · verb
- rządzące — ✅ [rządzić](/slovo/rzadzic) · verb
- łączyły — ✅ [łączyć](/slovo/laczyc) · verb
- kształt — ✅ [kształt](/slovo/ksztalt) · noun
- **I oto wynikło nieszczęście**  
  <sub>слова: [i](/slovo/i), [oto](/slovo/oto), [wyniknąć](/slovo/wyniknac), [nieszczęście](/slovo/nieszczescie)</sub>
- Wreszcie — ✅ [wreszcie](/slovo/wreszcie) · part
- olbrzymiego — ✅ [olbrzymi](/slovo/olbrzymi) · adj
- dostrzegł — ✅ [dostrzec](/slovo/dostrzec) · verb
- zauważył — ✅ [zauważyć](/slovo/zauwazyc) · verb
- gdybym — ✅ [gdyby](/slovo/gdyby) · conj
- wejście — ✅ [wejście](/slovo/wejscie) · noun
- szczegół — ✅ [szczegół](/slovo/szczegol) · noun
- żwir — ✅ [żwir](/slovo/zwir) · noun
- zaryglowana — ✅ [zaryglować](/slovo/zaryglowac) · verb
- przesadzić — ✅ [przesadzić](/slovo/przesadzic) · verb
- **— Skąd pan to wie? !!!**  
  <sub>слова: [skąd](/slovo/skad), [pan](/slovo/pan), [to](/slovo/to), [wiedzieć](/slovo/wiedziec)</sub>
- Zresztą — ✅ [zresztą](/slovo/zreszta) · part
- **— Ale pan tak myślisz w głębi ducha.**  
  <sub>слова: [ale](/slovo/ale), [pan](/slovo/pan), [tak](/slovo/tak), [myśleć](/slovo/myslec), [w](/slovo/w), [głąb](/slovo/glab), [duch](/slovo/duch)</sub>
- **— Na przykład?**  
  <sub>слова: [na](/slovo/na), [przykład](/slovo/przyklad)</sub>
- Dotychczas — ✅ [dotychczas](/slovo/dotychczas) · adv
- walczyć — ✅ [walczyć](/slovo/walczyc) · verb
- **— Więc w jaki sposób mogę panu dopomóc?**  
  <sub>слова: [więc](/slovo/wiec), [w](/slovo/w), [jaki](/slovo/jaki), [sposób](/slovo/sposob), [móc](/slovo/moc), [pan](/slovo/pan), [dopomóc](/slovo/dopomoc)</sub>
- Radząc — ✅ [radzić](/slovo/radzic) · verb
- **jest to młodzieniec bez zarzutu**  
  <sub>слова: [być](/slovo/byc), [to](/slovo/to), [młodzieniec](/slovo/mlodzieniec), [bez](/slovo/bez), [zarzut](/slovo/zarzut)</sub>
- spotkać — ✅ [spotkać](/slovo/spotkac) · verb
- **jak mi radzisz postąpić?**  
  <sub>слова: [jak](/slovo/jak), [radzić](/slovo/radzic), [postąpić](/slovo/postapic)</sub>
- miałby — ↩︎ форма другого слова (overrides.yml)
- dziedzic — ✅ [dziedzic](/slovo/dziedzic) · noun
- **pójdzie wniwecz**  
  <sub>слова: [pójść](/slovo/pojsc), [wniwecz](/slovo/wniwecz)</sub>
- zastanawiać — ✅ [zastanawiać](/slovo/zastanawiac) · verb
- święcie — ✅ [święcie](/slovo/swiecie) · adv
- Wszak — ✅ [wszak](/slovo/wszak) · part
- **— Gotów jestem przypuszczać, że tak jest.**  
  <sub>слова: `gotów`, [być](/slovo/byc), [przypuszczać](/slovo/przypuszczac), [że](/slovo/ze), [tak](/slovo/tak)</sub>
- pastwić — ✅ [pastwić](/slovo/pastwic) · verb
- działanie — ✅ [działanie](/slovo/dzialanie) · noun
- umiejscowione — ✅ [umiejscowić](/slovo/umiejscowic) · verb
- odechciałoby — ✅ [odechcieć](/slovo/odechciec) · verb
- miarkuję — ✅ [miarkować](/slovo/miarkowac) · verb
- **Cóż mi pan radzisz?**  
  <sub>слова: [cóż](/slovo/coz), [pan](/slovo/pan), [radzić](/slovo/radzic)</sub>
- ułatwi — ✅ [ułatwić](/slovo/ulatwic) · verb
- **— Zrobię, jak pan chcesz.**  
  <sub>слова: [zrobić](/slovo/zrobic), [jak](/slovo/jak), [pan](/slovo/pan), [chcieć](/slovo/chciec)</sub>
- wyjątkowa — ✅ [wyjątkowy](/slovo/wyjatkowy) · adj
- miarkujesz — ✅ [miarkować](/slovo/miarkowac) · verb
- Pochlebiam — ✅ [pochlebiać](/slovo/pochlebiac) · verb
- kwaterę — ✅ [kwatera](/slovo/kwatera) · noun
- błędzie — ✅ [błąd](/slovo/blad) · noun
- **Czy nie znajdujesz, że wyrażone poglądy są bardzo głębokie?**  
  <sub>слова: [czy](/slovo/czy), [nie](/slovo/nie), [znajdować](/slovo/znajdowac), [że](/slovo/ze), [wyrazić](/slovo/wyrazic), `poglądy`, [być](/slovo/byc), [bardzo](/slovo/bardzo), [głęboki](/slovo/gleboki)</sub>
- **Nie boję się bawić**  
  <sub>слова: [nie](/slovo/nie), [bać](/slovo/bac), [się](/slovo/sie), [bawić](/slovo/bawic)</sub>
- **Tu się nie pali**  
  <sub>слова: [tu](/slovo/tu), [się](/slovo/sie), [nie](/slovo/nie), `pali`</sub>
- **Jak się to mówi**  
  <sub>слова: [jak](/slovo/jak), [się](/slovo/sie), [to](/slovo/to), [mówić](/slovo/mowic)</sub>
- **Mówi się, że...**  
  <sub>слова: [mówić](/slovo/mowic), [się](/slovo/sie), [że](/slovo/ze)</sub>
- **strzeż się**  
  <sub>слова: [strzec](/slovo/strzec), [się](/slovo/sie)</sub>
- łączność — ✅ [łączność](/slovo/lacznosc) · noun
- ścisła — ✅ [ścisły](/slovo/scisly) · adj
- **przyjrzycie mu się**  
  <sub>слова: [przyjrzeć](/slovo/przyjrzec), [on](/slovo/on), [się](/slovo/sie)</sub>
- **Przepraszam; to nie jest drobiazg**  
  <sub>слова: [przepraszać](/slovo/przepraszac), [to](/slovo/to), [nie](/slovo/nie), [być](/slovo/byc), [drobiazg](/slovo/drobiazg)</sub>
- zaprzeczył — ✅ [zaprzeczyć](/slovo/zaprzeczyc) · verb
- tyle — ✅ [tyle](/slovo/tyle) · adv
- **pędząc życie swobodne**  
  <sub>слова: [pędzić](/slovo/pedzic), [życie](/slovo/zycie), [swobodny](/slovo/swobodny)</sub>
- zemsta — ✅ [zemsta](/slovo/zemsta) · noun
- przywiązywałem — ✅ [przywiązywać](/slovo/przywiazywac) · verb
- twarzyszyć — ⛔ не распознано
- Obecnie — ✅ [obecnie](/slovo/obecnie) · adv
- niebezpieczeństwo — ✅ [niebezpieczeństwo](/slovo/niebezpieczenstwo) · noun
- **Bądź co bądź**  
  <sub>слова: [bądź](/slovo/badz), [co](/slovo/co)</sub>
- **Stawimy się na oznaczoną godzinę.**  
  <sub>слова: [stawić](/slovo/stawic), [się](/slovo/sie), [na](/slovo/na), [oznaczyć](/slovo/oznaczyc), [godzina](/slovo/godzina)</sub>
- paręset — ✅ [paręset](/slovo/pareset) · num
- przyjrzeć — ✅ [przyjrzeć](/slovo/przyjrzec) · verb
- **Nie mam pojęcia**  
  <sub>слова: [nie](/slovo/nie), [mama](/slovo/mama), [pojąć](/slovo/pojac)</sub>
- niewątpliwie — ✅ [niewątpliwie](/slovo/niewatpliwie) · adv
- zmiarkować — ✅ [zmiarkować](/slovo/zmiarkowac) · verb
- tchu — ✅ [dech](/slovo/dech) · noun
- **Zrobiłem wielkie głupstwo…**  
  <sub>слова: [zrobić](/slovo/zrobic), [wielki](/slovo/wielki), [głupstwo](/slovo/glupstwo)</sub>
- korzystać — ✅ [korzystać](/slovo/korzystac) · verb
- uszanowania — ✅ [uszanowanie](/slovo/uszanowanie) · noun
- egzemplarz — ✅ [egzemplarz](/slovo/egzemplarz) · noun
- bezwładna — ✅ [bezwładny](/slovo/bezwladny) · adj
- Drwią — ✅ [drwić](/slovo/drwic) · verb
- naprzód — ✅ [naprzód](/slovo/naprzod) · adv
- lakierki — ✅ [lakierek](/slovo/lakierek) · noun
- cierpliwość — ✅ [cierpliwość](/slovo/cierpliwosc) · noun
- **ale straciłem już cierpliwość**  
  <sub>слова: [ale](/slovo/ale), [stracić](/slovo/stracic), [już](/slovo/juz), [cierpliwość](/slovo/cierpliwosc)</sub>
- przyjęcie — ✅ [przyjęcie](/slovo/przyjecie) · noun
- pięćset — ✅ [pięćset](/slovo/piecset) · num
- nieruchomościami — ✅ [nieruchomość](/slovo/nieruchomosc) · noun
- przeszło — ✅ [przejść](/slovo/przejsc) · verb
- znajdując — ✅ [znajdować](/slovo/znajdowac) · verb
- **— Czyżbyś pan chciał ze mną jechać, panie Holmes?**  
  <sub>слова: [czyżby](/slovo/czyzby), [pan](/slovo/pan), [chcieć](/slovo/chciec), [z](/slovo/z), [ja](/slovo/ja), [jechać](/slovo/jechac)</sub>
- zgubę — ✅ [zguba](/slovo/zguba) · noun
- **człowiek o twarzy dobrodusznej**  
  <sub>слова: [człowiek](/slovo/czlowiek), [o](/slovo/o), [twarz](/slovo/twarz), [dobroduszny](/slovo/dobroduszny)</sub>
- **Nie mam przeciwko wam nic zgoła, mój przyjacielu**  
  <sub>слова: [nie](/slovo/nie), [mama](/slovo/mama), [przeciwko](/slovo/przeciwko), [wy](/slovo/wy), [nic](/slovo/nic), [zgoła](/slovo/zgola), [mój](/slovo/moj), [przyjaciel](/slovo/przyjaciel)</sub>
- **A to szczwany lis!**  
  <sub>слова: [a](/slovo/a), [to](/slovo/to), [szczwany](/slovo/szczwany), [lis](/slovo/lis)</sub>
- wyskoczy — ✅ [wyskoczyć](/slovo/wyskoczyc) · verb
- porządnie — ✅ [porządnie](/slovo/porzadnie) · adv
- spiczasto — ✅ [spiczasto](/slovo/spiczasto) · adv
- **dość spora zmiana**  
  <sub>слова: [dość](/slovo/dosc), `spora`, [zmiana](/slovo/zmiana)</sub>
- zioła — ✅ [zioło](/slovo/ziolo) · noun
- przytyć — ✅ [przytyć](/slovo/przytyc) · verb
- przyciągać — ✅ [przyciągać](/slovo/przyciagac) · verb
- łapa — ✅ [łapa](/slovo/lapa) · noun
- zanim — ✅ [zanim](/slovo/zanim) · conj
- przykryć — ✅ [przykryć](/slovo/przykryc) · verb
- stopień — ✅ [stopień](/slovo/stopien) · noun
- kolejny — ✅ [kolejny](/slovo/kolejny) · adj
- Migdałowiec — ✅ [migdałowiec](/slovo/migdalowiec) · noun
- niebagatelny — ✅ [niebagatelny](/slovo/niebagatelny) · adj
- potrwać — ✅ [potrwać](/slovo/potrwac) · verb
- wędlina — ✅ [wędlina](/slovo/wedlina) · noun
- przypalić — ✅ [przypalić](/slovo/przypalic) · verb
- zdjąć — ✅ [zdjąć](/slovo/zdjac) · verb
- drużyna — ✅ [drużyna](/slovo/druzyna) · noun
- przyjrzeć — ✅ [przyjrzeć](/slovo/przyjrzec) · verb
- odmiana — ✅ [odmiana](/slovo/odmiana) · noun
- życzyć — ✅ [życzyć](/slovo/zyczyc) · verb
- szerknąć — ⛔ не распознано
- czyżby — ✅ [czyżby](/slovo/czyzby) · part
- niestety — ✅ [niestety](/slovo/niestety) · part
- słup — ✅ [słup](/slovo/slup) · noun
- prąd — ✅ [prąd](/slovo/prad) · noun
- zrzucać — ✅ [zrzucać](/slovo/zrzucac) · verb
- obczawać — ⛔ не распознано
- wymienić — ✅ [wymienić](/slovo/wymienic) · verb
- zgadnijcie — ✅ [zgadnąć](/slovo/zgadnac) · verb
- poćwiczyć — ✅ [poćwiczyć](/slovo/pocwiczyc) · verb
- syczeć — ✅ [syczeć](/slovo/syczec) · verb
- zachowanie — ✅ [zachowanie](/slovo/zachowanie) · noun
- pędny — ✅ [pędny](/slovo/pedny) · adj
- zawór — ✅ [zawór](/slovo/zawor) · noun
- przykręcić — ✅ [przykręcić](/slovo/przykrecic) · verb
- paśma — ⛔ не распознано
- rozwiązanie — ✅ [rozwiązanie](/slovo/rozwiazanie) · noun
- Przejebna — ⛔ не распознано
- podociskać — ⛔ не распознано
- mrugać — ✅ [mrugać](/slovo/mrugac) · verb
- cośnąć — ⛔ не распознано
- Ojejkujk — ⛔ не распознано
- zwężka — ✅ [zwężka](/slovo/zwezka) · noun
- trzepieośki — ⛔ не распознано
- ściotkowy — ⛔ не распознано
- opuścił — ✅ [opuścić](/slovo/opuscic) · verb
- poderżnąć — ✅ [poderżnąć](/slovo/poderznac) · verb
- gardło — ✅ [gardło](/slovo/gardlo) · noun
- jałową — ✅ [jałowy](/slovo/jalowy) · adj
- jar — ✅ [jar](/slovo/jar) · noun
- siedzibie — ✅ [siedziba](/slovo/siedziba) · noun
- brama — ✅ [brama](/slovo/brama) · noun
- sklepioną — ✅ [sklepić](/slovo/sklepic) · verb
- gmach — ✅ [gmach](/slovo/gmach) · noun
- turkot — ✅ [turkot](/slovo/turkot) · noun
- przejąć — ✅ [przejąć](/slovo/przejac) · verb
- dziedziniec — ✅ [dziedziniec](/slovo/dziedziniec) · noun
- kuferki — ✅ [kuferek](/slovo/kuferek) · noun
- zsiadając — ✅ [zsiadać](/slovo/zsiadac) · verb
- zmęczony — ✅ [zmęczony](/slovo/zmeczony) · adj
- **Odwróciłem się pewien, że ujrzę doktora Mortimera, lecz ku mojemu zdziwieniu, zobaczyłem nieznajomego.**  
  <sub>слова: [odwrócić](/slovo/odwrocic), [się](/slovo/sie), [pewien](/slovo/pewien), [że](/slovo/ze), [ujrzeć](/slovo/ujrzec), [doktor](/slovo/doktor), [lecz](/slovo/lecz), [ku](/slovo/ku), [mój](/slovo/moj), [zdziwienie](/slovo/zdziwienie), [zobaczyć](/slovo/zobaczyc), [nieznajomy](/slovo/nieznajomy)</sub>
- **złamała mu się noga, zepsuł mi się samochód.**  
  <sub>слова: [złamać](/slovo/zlamac), [on](/slovo/on), [się](/slovo/sie), [noga](/slovo/noga), [zepsuć](/slovo/zepsuc), [samochód](/slovo/samochod)</sub>
- biedak — ✅ [biedak](/slovo/biedak) · noun
- **— Pan je zgłębiłeś?**  
  <sub>слова: [pan](/slovo/pan), [on](/slovo/on), [zgłębić](/slovo/zglebic)</sub>
- zaledwie — ✅ [zaledwie](/slovo/zaledwie) · conj
- wędrówek — ✅ [wędrówka](/slovo/wedrowka) · noun
- **— Czy okolica jest tak trudna do poznania?**  
  <sub>слова: [czy](/slovo/czy), [okolica](/slovo/okolica), [być](/slovo/byc), [tak](/slovo/tak), [trudny](/slovo/trudny), [do](/slovo/do), [poznać](/slovo/poznac)</sub>
- chętkę — ✅ [chętka](/slovo/chetka) · noun
- **Stapleton roześmiał się.**  
  <sub>слова: [roześmiać](/slovo/rozesmiac), [się](/slovo/sie)</sub>
- nieprzebyte — ✅ [przebyć](/slovo/przebyc) · verb
- **Już po nim!**  
  <sub>слова: [już](/slovo/juz), [po](/slovo/po), [on](/slovo/on)</sub>
- **— Pan jednak przebywa je bez szwanku? — wtrąciłem.**  
  <sub>слова: [pan](/slovo/pan), [jednak](/slovo/jednak), [przebywać](/slovo/przebywac), [on](/slovo/on), [bez](/slovo/bez), [szwank](/slovo/szwank), [wtrącić](/slovo/wtracic)</sub>
- fruwają — ✅ [fruwać](/slovo/fruwac) · verb
- **— Co to takiego?**  
  <sub>слова: [co](/slovo/co), [to](/slovo/to), [taki](/slovo/taki)</sub>
- wykształconym — ✅ [wykształcić](/slovo/wyksztalcic) · verb
- foremnymi — ✅ [foremny](/slovo/foremny) · adj
- **Mamy dużo dzikich storczyków. Lubię ten kwiat.**  
  <sub>слова: [mama](/slovo/mama), [dużo](/slovo/duzo), [dziki](/slovo/dziki), [storczyk](/slovo/storczyk), [lubić](/slovo/lubic), [ten](/slovo/ten), [kwiat](/slovo/kwiat)</sub>
- **Rumieniec oblał jej śliczną twarzyczkę**  
  <sub>слова: [rumieniec](/slovo/rumieniec), [oblać](/slovo/oblac), [on](/slovo/on), [śliczny](/slovo/sliczny), [twarzyczka](/slovo/twarzyczka)</sub>
- obcowanie — ✅ [obcowanie](/slovo/obcowanie) · noun
- urabianie — ✅ [urabiać](/slovo/urabiac) · verb
- ucierpiała — ✅ [ucierpieć](/slovo/ucierpiec) · verb
- skutkiem — ✅ [skutek](/slovo/skutek) · noun
- **Urabianie umysłów**  
  <sub>слова: [urabiać](/slovo/urabiac), [umysł](/slovo/umysl)</sub>
- ciosem — ✅ [cios](/slovo/cios) · noun
- **Jestem pewien, że będzie panu rad**  
  <sub>слова: [być](/slovo/byc), [pewien](/slovo/pewien), [że](/slovo/ze), [pan](/slovo/pan), `rad`</sub>
- ostrzeżeń — ✅ [ostrzeżenie](/slovo/ostrzezenie) · noun
- pożegnać — ✅ [pożegnać](/slovo/pozegnac) · verb
- gościniec — ✅ [gościniec](/slovo/gosciniec) · noun
- **Na miłość boską, bądź ze mną szczera, miss Stapleton.**  
  <sub>слова: [na](/slovo/na), [miłość](/slovo/milosc), [boski](/slovo/boski), [bądź](/slovo/badz), [z](/slovo/z), [ja](/slovo/ja), [szczery](/slovo/szczery), `miss`</sub>
- przejęciem — ✅ [przejąć](/slovo/przejac) · verb
- ciążącej — ✅ [ciążyć](/slovo/ciazyc) · verb
- **— Słyszałeś pan legendę o psie?**  
  <sub>слова: [słyszeć](/slovo/slyszec), [pan](/slovo/pan), [legenda](/slovo/legenda), [o](/slovo/o), [pies](/slovo/pies)</sub>
- **— Nie wierzę w te brednie.**  
  <sub>слова: [nie](/slovo/nie), [wierzyć](/slovo/wierzyc), [w](/slovo/w), [ten](/slovo/ten), [brednia](/slovo/brednia)</sub>
- koniecznie — ✅ [koniecznie](/slovo/koniecznie) · adv
- opuszczenia — ✅ [opuścić](/slovo/opuscic) · verb
- pragnę — ✅ [pragnąć](/slovo/pragnac) · verb
- albowiem — ✅ [albowiem](/slovo/albowiem) · conj
- bowiem — ✅ [bowiem](/slovo/bowiem) · conj
- **Im dłużej tu bawię, tym bardziej czuję się smutny i zaniepokojony**  
  <sub>слова: [on](/slovo/on), [długo](/slovo/dlugo), [tu](/slovo/tu), [bawić](/slovo/bawic), [ten](/slovo/ten), [bardziej](/slovo/bardziej), [czuć](/slovo/czuc), [się](/slovo/sie), [smutny](/slovo/smutny), [i](/slovo/i), [zaniepokoić](/slovo/zaniepokoic)</sub>
- gęsto — ✅ [gęsto](/slovo/gesto) · adv
- zasiewają — ✅ [zasiewać](/slovo/zasiewac) · verb
- należy — ✅ [należeć](/slovo/nalezec) · verb
- szczep — ✅ [szczep](/slovo/szczep) · noun
- tchórzliwy — ✅ [tchórzliwy](/slovo/tchorzliwy) · adj
- warownią — ✅ [warownia](/slovo/warownia) · noun
- okoliczność — ✅ [okoliczność](/slovo/okolicznosc) · noun
- **Dzisiaj zdarzyła się okoliczność niezwykła**  
  <sub>слова: [dzisiaj](/slovo/dzisiaj), [zdarzyć](/slovo/zdarzyc), [się](/slovo/sie), [okoliczność](/slovo/okolicznosc), [niezwykły](/slovo/niezwykly)</sub>
- żyć — ✅ [żyć](/slovo/zyc) · verb
- **Dwa tygodnie już minęło od jego ucieczki, a dotychczas nikt go nie widział i nikt o nim nie słyszał**  
  <sub>слова: [dwa](/slovo/dwa), [tydzień](/slovo/tydzien), [już](/slovo/juz), [minąć](/slovo/minac), [od](/slovo/od), [on](/slovo/on), [ucieczka](/slovo/ucieczka), [a](/slovo/a), [dotychczas](/slovo/dotychczas), [nikt](/slovo/nikt), [nie](/slovo/nie), [widzieć](/slovo/widziec), [i](/slovo/i), [o](/slovo/o), [słyszeć](/slovo/slyszec)</sub>
- pozywienia — ⛔ не распознано
- nabierać — ✅ [nabierać](/slovo/nabierac) · verb
- **Nabierać otuchy (приободриться)**  
  <sub>слова: [nabierać](/slovo/nabierac), [otucha](/slovo/otucha)</sub>
- wątły — ✅ [wątły](/slovo/watly) · adj
- niezbyt — ✅ [niezbyt](/slovo/niezbyt) · adv
- jakkolwiek — ✅ [jakkolwiek](/slovo/jakkolwiek) · conj
- **byliby na jego łasce i niełasce**  
  <sub>слова: [być](/slovo/byc), [na](/slovo/na), [on](/slovo/on), [łaska](/slovo/laska-2), [i](/slovo/i), [niełaska](/slovo/nielaska)</sub>
- stanowczo — ✅ [stanowczo](/slovo/stanowczo) · adv
- prześliczna — ✅ [prześliczny](/slovo/przesliczny) · adj
- sprzeczność — ✅ [sprzeczność](/slovo/sprzecznosc) · noun
- zdumiewająca — ✅ [zdumiewać](/slovo/zdumiewac) · verb
- zdradzają — ✅ [zdradzać](/slovo/zdradzac) · verb
- nieubłaganą — ✅ [ubłagać](/slovo/ublagac) · verb
- **Byłby ciekawym studium dla ciebie**  
  <sub>слова: [być](/slovo/byc), [ciekawy](/slovo/ciekawy), [studium](/slovo/studium), [dla](/slovo/dla), [ty](/slovo/ty)</sub>
- **Nasz baronet zaczyna interesować się żywo piękną sąsiadką**  
  <sub>слова: [nasz](/slovo/nasz), [baronet](/slovo/baronet), [zaczynać](/slovo/zaczynac), [interesować](/slovo/interesowac), [się](/slovo/sie), [żywo](/slovo/zywo), [piękny](/slovo/piekny), [sąsiadka](/slovo/sasiadka)</sub>
- wzruszony — ✅ [wzruszony](/slovo/wzruszony) · adj
- kilkakrotnie — ✅ [kilkakrotnie](/slovo/kilkakrotnie) · adv
- oddziaływanie — ✅ [oddziaływanie](/slovo/oddzialywanie) · noun
- obopólne — ✅ [obopólny](/slovo/obopolny) · adj
- ilekroć — ✅ [ilekroć](/slovo/ilekroc) · adv
- zachwyt — ✅ [zachwyt](/slovo/zachwyt) · noun
- opromieniała — ✅ [opromieniać](/slovo/opromieniac) · verb
- Wątpię — ✅ [wątpić](/slovo/watpic) · verb
- zażyłości — ✅ [zażyłość](/slovo/zazylosc) · noun
- Sprzykrzyłbym — ✅ [sprzykrzyć](/slovo/sprzykrzyc) · verb
- prędko — ✅ [prędko](/slovo/predko) · adv
- Kiedyś — ✅ [kiedyś](/slovo/kiedys) · adv
- wykopaliska — ✅ [wykopaliska](/slovo/wykopaliska) · noun
- **Trudno o większego entuzjastę i maniaka.**  
  <sub>слова: [trudno](/slovo/trudno), [o](/slovo/o), [duży](/slovo/duzy), [entuzjasta](/slovo/entuzjasta), [i](/slovo/i), [maniak](/slovo/maniak)</sub>
- wznosi — ✅ [wznosić](/slovo/wznosic) · verb
- odtworzyć — ✅ [odtworzyć](/slovo/odtworzyc) · verb
- **starałem się odtworzyć w myśli katastrofę**  
  <sub>слова: [starać](/slovo/starac), [się](/slovo/sie), [odtworzyć](/slovo/odtworzyc), [w](/slovo/w), [myśleć](/slovo/myslec), [katastrofa](/slovo/katastrofa)</sub>
- ujrzał — ✅ [ujrzeć](/slovo/ujrzec) · verb
- **tchu zbrakło**  
  <sub>слова: [dech](/slovo/dech), [zbraknąć](/slovo/zbraknac)</sub>
- **Co go wystraszyło?**  
  <sub>слова: [co](/slovo/co), [on](/slovo/on), [wystraszyć](/slovo/wystraszyc)</sub>
- przytomność — ✅ [przytomność](/slovo/przytomnosc) · noun
- widmowe — ✅ [widmowy](/slovo/widmowy) · adj
- blady — ✅ [blady](/slovo/blady) · adj
- zbrodnia — ✅ [zbrodnia](/slovo/zbrodnia) · noun
- obecnie — ✅ [obecnie](/slovo/obecnie) · adv
- skutkiem — ✅ [skutek](/slovo/skutek) · noun
- pierwiastek — ✅ [pierwiastek](/slovo/pierwiastek) · noun
- wyręczyć — ✅ [wyręczyć](/slovo/wyreczyc) · verb
- **Czy zrobiłem coś niewłaściwego?**  
  <sub>слова: [czy](/slovo/czy), [zrobić](/slovo/zrobic), [coś](/slovo/cos), [niewłaściwy](/slovo/niewlasciwy)</sub>
- względzie — ✅ [wzgląd](/slovo/wzglad) · noun
- niewiasta — ✅ [niewiasta](/slovo/niewiasta) · noun
- zgryzotę — ✅ [zgryzota](/slovo/zgryzota) · noun
- zastanawiam — ✅ [zastanawiać](/slovo/zastanawiac) · verb
- Zauważyłem — ✅ [zauważyć](/slovo/zauwazyc) · verb
- posądzeniach — ✅ [posądzenie](/slovo/posadzenie) · noun
- **A jednak sam fakt może się wydać błahy.**  
  <sub>слова: [a](/slovo/a), [jednak](/slovo/jednak), [sam](/slovo/sam), [fakt](/slovo/fakt), [móc](/slovo/moc), [się](/slovo/sie), [wydać](/slovo/wydac), [błahy](/slovo/blahy)</sub>
- **Wiesz, że mam sen lekki, a od chwili, gdym tu przybył w charakterze anioła-stróża, sypiam z otwartymi oczyma, jak zając.**  
  <sub>слова: [wiedzieć](/slovo/wiedziec), [że](/slovo/ze), [mama](/slovo/mama), [sen](/slovo/sen), [lekki](/slovo/lekki), [a](/slovo/a), [od](/slovo/od), [chwila](/slovo/chwila), [gdy](/slovo/gdy), [tu](/slovo/tu), [przybyć](/slovo/przybyc), [w](/slovo/w), [charakter](/slovo/charakter), [sypiać](/slovo/sypiac), [z](/slovo/z), [otworzyć](/slovo/otworzyc), [oko](/slovo/oko), [jak](/slovo/jak)</sub>
- błahy — ✅ [błahy](/slovo/blahy) · adj
- rzucany — ✅ [rzucać](/slovo/rzucac) · verb
- zakradającego — ✅ [zakradać](/slovo/zakradac) · verb
- **Żeglowanie jest koniecznością.**  
  <sub>слова: [żeglować](/slovo/zeglowac), [być](/slovo/byc), [konieczność](/slovo/koniecznosc)</sub>
- koperek — ✅ [koperek](/slovo/koperek) · noun
- zamach — ✅ [zamach](/slovo/zamach) · noun
- chrzanowy — ✅ [chrzanowy](/slovo/chrzanowy) · adj
- poruszać — ✅ [poruszać](/slovo/poruszac) · verb
- napędzać — ✅ [napędzać](/slovo/napedzac) · verb
- leniuszek — ✅ [leniuszek](/slovo/leniuszek) · noun
- wepchać — ✅ [wepchać](/slovo/wepchac) · verb
- **prąd Nie jest to napędzane prądem, a jak się rower w dół sprowadza**  
  <sub>слова: [prąd](/slovo/prad), [nie](/slovo/nie), [być](/slovo/byc), [to](/slovo/to), [napędzać](/slovo/napedzac), [a](/slovo/a), [jak](/slovo/jak), [się](/slovo/sie), [rower](/slovo/rower), [w](/slovo/w), [dół](/slovo/dol), [sprowadzać](/slovo/sprowadzac)</sub>
- chętnie — ✅ [chętnie](/slovo/chetnie) · adv
- chałupa — ✅ [chałupa](/slovo/chalupa) · noun
- pochodzić — ✅ [pochodzić](/slovo/pochodzic) · verb
- porządny — ✅ [porządny](/slovo/porzadny) · adj
- toczyć — ✅ [toczyć](/slovo/toczyc) · verb
- namiętnie — ✅ [namiętnie](/slovo/namietnie) · adv
- zaskakująco — ✅ [zaskakująco](/slovo/zaskakujaco) · adv
- obawiać — ✅ [obawiać](/slovo/obawiac) · verb
- **Wygląda na to, że trafiliśmy we właściwe miejsce.**  
  <sub>слова: [wyglądać](/slovo/wygladac), [na](/slovo/na), [to](/slovo/to), [że](/slovo/ze), [trafić](/slovo/trafic), `we`, [właściwy](/slovo/wlasciwy), [miejsce](/slovo/miejsce)</sub>
- masarz — ✅ [masarz](/slovo/masarz) · noun
- spójrzcie — ✅ [spojrzeć](/slovo/spojrzec) · verb
- mistrzowski — ✅ [mistrzowski](/slovo/mistrzowski) · adj
- żegnać — ✅ [żegnać](/slovo/zegnac) · verb
- zmiarkowałem — ✅ [zmiarkować](/slovo/zmiarkowac) · verb
- miarkowałem — ✅ [miarkować](/slovo/miarkowac) · verb
- doleciały — ✅ [dolecieć](/slovo/doleciec) · verb
- Niebawem — ✅ [niebawem](/slovo/niebawem) · adv
- nierokujące — ✅ [rokować](/slovo/rokowac) · verb
- wprawdzie — ✅ [wprawdzie](/slovo/wprawdzie) · part
- pragnę — ✅ [pragnąć](/slovo/pragnac) · verb
- **Rzeczy wzięły obrót niespodziewany**  
  <sub>слова: [rzecz](/slovo/rzecz), [wziąć](/slovo/wziac), [obrót](/slovo/obrot), [niespodziewany](/slovo/niespodziewany)</sub>
- **Sam osądź**  
  <sub>слова: [sam](/slovo/sam), [osądzić](/slovo/osadzic)</sub>
- ubiegłej — ✅ [ubiegły](/slovo/ubiegly) · adj
- bagno — ✅ [bagno](/slovo/bagno) · noun
- **Zgrzyt klucza w zamku świadczył może o potajemnym wyjściu na schadzkę.**  
  <sub>слова: [zgrzyt](/slovo/zgrzyt), [klucz](/slovo/klucz), [w](/slovo/w), [zamek](/slovo/zamek), [świadczyć](/slovo/swiadczyc), [móc](/slovo/moc), [o](/slovo/o), [potajemny](/slovo/potajemny), [wyjść](/slovo/wyjsc), [na](/slovo/na), [schadzka](/slovo/schadzka)</sub>
- urozmaiceniem — ✅ [urozmaicenie](/slovo/urozmaicenie) · noun
- zaś — ✅ [zaś](/slovo/zas) · conj
- **nie szczędził kosztów**  
  <sub>слова: [nie](/slovo/nie), [szczędzić](/slovo/szczedzic), [koszt](/slovo/koszt)</sub>
- siedzibie — ✅ [siedziba](/slovo/siedziba) · noun
- **Nie dalej jak dziś sir Henryk miał przykrą niespodziankę**  
  <sub>слова: [nie](/slovo/nie), [daleko](/slovo/daleko), [jak](/slovo/jak), [dziś](/slovo/dzis), [przykry](/slovo/przykry), [niespodzianka](/slovo/niespodzianka)</sub>
- **istnieją przeszkody**  
  <sub>слова: [istnieć](/slovo/istniec), [przeszkoda](/slovo/przeszkoda)</sub>
- narzucam — ✅ [narzucać](/slovo/narzucac) · verb
- **Byłem w trudnym położeniu**  
  <sub>слова: [były](/slovo/byly), [w](/slovo/w), [trudny](/slovo/trudny), [położyć](/slovo/polozyc)</sub>
- zafrasowany — ✅ [zafrasować](/slovo/zafrasowac) · verb
- **odwrócił się**  
  <sub>слова: [odwrócić](/slovo/odwrocic), [się](/slovo/sie)</sub>
- nuż — ✅ [nuż](/slovo/nuz) · part
- **wspiąłem się**  
  <sub>слова: [wspiąć](/slovo/wspiac), [się](/slovo/sie)</sub>
- **Ukrywszy się za skałą**  
  <sub>слова: [ukryć](/slovo/ukryc), [się](/slovo/sie), [za](/slovo/za), [skała](/slovo/skala)</sub>
- **A więc to była schadzka umówiona**  
  <sub>слова: [a](/slovo/a), [więc](/slovo/wiec), [to](/slovo/to), `była`, [schadzka](/slovo/schadzka), [umówić](/slovo/umowic)</sub>
- Wstrętnym — ✅ [wstrętny](/slovo/wstretny) · adj
- **Więc cóż począć?**  
  <sub>слова: [więc](/slovo/wiec), [cóż](/slovo/coz), [począć](/slovo/poczac)</sub>
- Wahałem — ✅ [wahać](/slovo/wahac) · verb
- podążał — ✅ [podążać](/slovo/podazac) · verb
- uścisku — ✅ [uścisk](/slovo/uscisk) · noun
- usprawiedliwiał — ✅ [usprawiedliwiać](/slovo/usprawiedliwiac) · verb
- skinął — ✅ [skinąć](/slovo/skinac) · verb
- **Skądże się tu wziąłeś?**  
  <sub>слова: [skądże](/slovo/skadze), [się](/slovo/sie), [tu](/slovo/tu), [wziąć](/slovo/wziac)</sub>
- wariat — ✅ [wariat](/slovo/wariat) · noun
- Spłoszyć — ✅ [spłoszyć](/slovo/sploszyc) · verb
- społecznemu — ✅ [społeczny](/slovo/spoleczny) · adj
- bodaj — ✅ [bodaj](/slovo/bodaj) · part
- wręcz — ✅ [wręcz](/slovo/wrecz) · adv
- nieznośny — ✅ [nieznośny](/slovo/nieznosny) · adj
- porozumieć — ✅ [porozumieć](/slovo/porozumiec) · verb
- pilno — ✅ [pilno](/slovo/pilno) · adv
- utrapiony — ✅ [utrapiony](/slovo/utrapiony) · adj
- dbać — ✅ [dbać](/slovo/dbac) · verb
- rozwścieczył — ✅ [rozwścieczyć](/slovo/rozwscieczyc) · verb
- niepyszny — ✅ [niepyszny](/slovo/niepyszny) · adj
- przychylna — ✅ [przychylny](/slovo/przychylny) · adj
- mimo — ✅ [mimo](/slovo/mimo) · adv
- przyzwoicie — ✅ [przyzwoicie](/slovo/przyzwoicie) · adv
- omacku (po którym błądzimy po omacku) — ✅ [omacek](/slovo/omacek) · noun
- szmer — ✅ [szmer](/slovo/szmer) · noun
- **Wreszcie usnęliśmy obaj na krzesłach**  
  <sub>слова: [wreszcie](/slovo/wreszcie), [usnąć](/slovo/usnac), [oba](/slovo/oba), [na](/slovo/na), [krzesło](/slovo/krzeslo)</sub>
- **Niezrażeni tym, postanowiliśmy próbę ponowić. Następnej nocy zgasiliśmy lampkę i zapaliwszy papierosy, czekaliśmy, co będzie dalej**  
  <sub>слова: [zrazić](/slovo/zrazic), [ten](/slovo/ten), [postanowić](/slovo/postanowic), [próba](/slovo/proba), [ponowić](/slovo/ponowic), [następny](/slovo/nastepny), [noc](/slovo/noc), [zgasić](/slovo/zgasic), [lampka](/slovo/lampka), [i](/slovo/i), [zapalić](/slovo/zapalic), [papieros](/slovo/papieros), [czekać](/slovo/czekac), [co](/slovo/co), [być](/slovo/byc), [daleko](/slovo/daleko)</sub>
- **już nas sen morzył**  
  <sub>слова: [już](/slovo/juz), [my](/slovo/my), [sen](/slovo/sen), [morzyć](/slovo/morzyc)</sub>
- **Nie ułożyliśmy planu kampanii, ale baronet uważa prostą drogę za najkrótszą i najwłaściwszą**  
  <sub>слова: [nie](/slovo/nie), [ułożyć](/slovo/ulozyc), [plan](/slovo/plan), [kampania](/slovo/kampania), [ale](/slovo/ale), [baronet](/slovo/baronet), [uważać](/slovo/uwazac), [prosty](/slovo/prosty), [droga](/slovo/droga), [za](/slovo/za), [krótki](/slovo/krotki), [i](/slovo/i), [właściwy](/slovo/wlasciwy)</sub>
- **Co ty tu robisz?**  
  <sub>слова: [co](/slovo/co), [ty](/slovo/ty), [tu](/slovo/tu), [robić](/slovo/robic)</sub>
- piętro — ✅ [piętro](/slovo/pietro) · noun
- **Im prędzej ją wyznasz, tym lepiej dla ciebie**  
  <sub>слова: [on](/slovo/on), [prędko](/slovo/predko), [wyznać](/slovo/wyznac), [ten](/slovo/ten), `lepiej`, [dla](/slovo/dla), [ty](/slovo/ty)</sub>
- **Dość tych kłamstw**  
  <sub>слова: [dość](/slovo/dosc), [ten](/slovo/ten), [kłamstwo](/slovo/klamstwo)</sub>
- Gadaj — ✅ [gadać](/slovo/gadac) · verb
- **Spojrzał na nas z rozpaczą, załamał ręce bezradnie**  
  <sub>слова: [spojrzeć](/slovo/spojrzec), [na](/slovo/na), [my](/slovo/my), [z](/slovo/z), [rozpacz](/slovo/rozpacz), [załamać](/slovo/zalamac), [ręka](/slovo/reka), [bezradnie](/slovo/bezradnie)</sub>
- **Niech mnie pan o to nie pyta. Daję panu słowo honoru, że to cudza tajemnica. Nie mogę jej wyjawić. Gdyby chodziło tylko o mnie, wyznałbym panu całą prawdę**  
  <sub>слова: [niech](/slovo/niech), [ja](/slovo/ja), [pan](/slovo/pan), [o](/slovo/o), [to](/slovo/to), [nie](/slovo/nie), `pyta`, [dawać](/slovo/dawac), [słowo](/slovo/slowo), [honor](/slovo/honor), [że](/slovo/ze), [cudzy](/slovo/cudzy), [tajemnica](/slovo/tajemnica), [móc](/slovo/moc), [on](/slovo/on), [wyjawić](/slovo/wyjawic), [gdyby](/slovo/gdyby), [chodzić](/slovo/chodzic), [tylko](/slovo/tylko), [wyznać](/slovo/wyznac), [cały](/slovo/caly), [prawda](/slovo/prawda)</sub>
- łotrze — ✅ [łotr](/slovo/lotr) · noun
- **Czy i teraz, łotrze, będziesz przeczył, że dawaliście sobie sygnały?… Chodź no tutaj. Mów, kto jest twoim wspólnikiem i jaki knujecie spisek?**  
  <sub>слова: [czy](/slovo/czy), [i](/slovo/i), [teraz](/slovo/teraz), [łotr](/slovo/lotr), [być](/slovo/byc), [przeczyć](/slovo/przeczyc), [że](/slovo/ze), [dawać](/slovo/dawac), [sygnał](/slovo/sygnal), [chodzić](/slovo/chodzic), [no](/slovo/no), [tutaj](/slovo/tutaj), [mowa](/slovo/mowa), [kto](/slovo/kto), [twój](/slovo/twoj), [wspólnik](/slovo/wspolnik), [jaki](/slovo/jaki), [knuć](/slovo/knuc), [spisek](/slovo/spisek)</sub>
- **— Nie powiem! — oświadczył butnie. — To moja rzecz, nie pańska.**  
  <sub>слова: [nie](/slovo/nie), [powiedzieć](/slovo/powiedziec), [oświadczyć](/slovo/oswiadczyc), [butnie](/slovo/butnie), [to](/slovo/to), [rzecz](/slovo/rzecz), [pański](/slovo/panski)</sub>
- **— W takim razie wynoś się zaraz z mego domu!**  
  <sub>слова: [w](/slovo/w), [taki](/slovo/taki), [raz](/slovo/raz), [wynosić](/slovo/wynosic), [się](/slovo/sie), [zaraz](/slovo/zaraz), [z](/slovo/z), [mój](/slovo/moj), [dom](/slovo/dom)</sub>
- **— I żebyś mi się nie pokazywał na oczy! To wstyd, hańba!… Twoja rodzina służyła mojej przez kilka pokoleń, a ty knujesz przeciwko mnie spiski?…**  
  <sub>слова: [i](/slovo/i), [żeby](/slovo/zeby), [się](/slovo/sie), [nie](/slovo/nie), [pokazywać](/slovo/pokazywac), [na](/slovo/na), [oko](/slovo/oko), [to](/slovo/to), [wstyd](/slovo/wstyd), [hańba](/slovo/hanba), [rodzina](/slovo/rodzina), [służyć](/slovo/sluzyc), [mój](/slovo/moj), [przez](/slovo/przez), [kilka](/slovo/kilka), [pokolenie](/slovo/pokolenie), [a](/slovo/a), [ty](/slovo/ty), [knuć](/slovo/knuc), [przeciwko](/slovo/przeciwko), [ja](/slovo/ja), [spiski](/slovo/spiski)</sub>
- hulać — ✅ [hulać](/slovo/hulac) · verb
- **Cóż miałam począć?**  
  <sub>слова: [cóż](/slovo/coz), [mieć](/slovo/miec), [począć](/slovo/poczac)</sub>
- **on go ukrywał i żywił przez wzgląd na mnie**  
  <sub>слова: [on](/slovo/on), [ukrywać](/slovo/ukrywac), [i](/slovo/i), [żywić](/slovo/zywic), [przez](/slovo/przez), [wzgląd](/slovo/wzglad), [na](/slovo/na), [ja](/slovo/ja)</sub>
- **— Dziwna rzecz, że on nie boi się zdradzać swej obecności… — rzekł baronet.**  
  <sub>слова: [dziwny](/slovo/dziwny), [rzecz](/slovo/rzecz), [że](/slovo/ze), [on](/slovo/on), [nie](/slovo/nie), [bać](/slovo/bac), [się](/slovo/sie), [zdradzać](/slovo/zdradzac), [swój](/slovo/swoj), [obecność](/slovo/obecnosc), [rzec](/slovo/rzec), [baronet](/slovo/baronet)</sub>
- współczucia — ✅ [współczucie](/slovo/wspolczucie) · noun
- **Musimy wpaść na niego znienacka**  
  <sub>слова: [musieć](/slovo/musiec), [wpaść](/slovo/wpasc), [na](/slovo/na), [on](/slovo/on), [znienacka](/slovo/znienacka)</sub>
- Podobno — ✅ [podobny](/slovo/podobny) · adj
- **Zaległa znowu cisza, przerażająca, złowroga**  
  <sub>слова: [zalec](/slovo/zalec), [znowu](/slovo/znowu), [cisza](/slovo/cisza), [przerażać](/slovo/przerazac), [złowrogi](/slovo/zlowrogi)</sub>
- **W jego głosie brzmiał tłumiony strach**  
  <sub>слова: [w](/slovo/w), [on](/slovo/on), [głos](/slovo/glos), [brzmieć](/slovo/brzmiec), [tłumić](/slovo/tlumic), [strach](/slovo/strach)</sub>
- cofniemy — ✅ [cofnąć](/slovo/cofnac) · verb
- **Chodźmy! Co ma być, niech się stanie**  
  <sub>слова: [chodzić](/slovo/chodzic), [co](/slovo/co), [mój](/slovo/moj), [być](/slovo/byc), [niech](/slovo/niech), [się](/slovo/sie), [stan](/slovo/stan)</sub>
- przodkowie — ✅ [przodek](/slovo/przodek) · noun
- **Morderca wodził niespokojnym wzrokiem dokoła jak zwierz, gdy go doleci odgłos nagonki**  
  <sub>слова: [morderca](/slovo/morderca), [wodzić](/slovo/wodzic), [niespokojny](/slovo/niespokojny), [wzrok](/slovo/wzrok), [dokoła](/slovo/dokola), [jak](/slovo/jak), [zwierz](/slovo/zwierz), [gdy](/slovo/gdy), [on](/slovo/on), [dolecieć](/slovo/doleciec), [odgłos](/slovo/odglos), [nagonka](/slovo/nagonka)</sub>
- podejrzliwość — ✅ [podejrzliwość](/slovo/podejrzliwosc) · noun
- zwykł — ✅ [zwyknąć](/slovo/zwyknac) · verb
- niebawem — ✅ [niebawem](/slovo/niebawem) · adv
- ustawicznie — ✅ [ustawicznie](/slovo/ustawicznie) · adv
- **Wreszcie, zdyszani, usiedliśmy na skale, patrząc za nim, dopóki nam nie znikł sprzed oczu**  
  <sub>слова: [wreszcie](/slovo/wreszcie), [zdyszeć](/slovo/zdyszec), [usiąść](/slovo/usiasc), [na](/slovo/na), [skała](/slovo/skala), [patrzeć](/slovo/patrzec), [za](/slovo/za), [on](/slovo/on), [dopóki](/slovo/dopoki), [my](/slovo/my), [nie](/slovo/nie), [zniknąć](/slovo/zniknac), [sprzed](/slovo/sprzed), [oko](/slovo/oko)</sub>
- zaniechali — ✅ [zaniechać](/slovo/zaniechac) · verb
- szczycie — ✅ [szczyt](/slovo/szczyt) · noun
- przestrzeń — ✅ [przestrzeń](/slovo/przestrzen) · noun
- **Na tle księżycowej tarczy odrzynały się skały, lecz żywy posąg nie stał już na ich szczycie**  
  <sub>слова: [na](/slovo/na), [tło](/slovo/tlo), [księżycowy](/slovo/ksiezycowy), [tarcza](/slovo/tarcza), [odrzynać](/slovo/odrzynac), [się](/slovo/sie), [skała](/slovo/skala), [lecz](/slovo/lecz), [żywy](/slovo/zywy), [posąg](/slovo/posag), [nie](/slovo/nie), [stać](/slovo/stac), [już](/slovo/juz), [on](/slovo/on), [szczyt](/slovo/szczyt)</sub>
- **które mnie wstrząsnęło do szpiku kości**  
  <sub>слова: [który](/slovo/ktory), [ja](/slovo/ja), [wstrząsnąć](/slovo/wstrzasnac), [do](/slovo/do), [szpik](/slovo/szpik), `kości`</sub>
- schwytać — ✅ [schwytać](/slovo/schwytac) · verb
- **Takie są przygody ostatniej nocy**  
  <sub>слова: [taki](/slovo/taki), [być](/slovo/byc), [przygoda](/slovo/przygoda), [ostatni](/slovo/ostatni), [noc](/slovo/noc)</sub>
- odkryć (Postąpiliśmy naprzód na drodze odkryć) — ✅ [odkryć](/slovo/odkryc) · verb
- rzucić (zdołam rzucić na nie światło) — ✅ [rzucić](/slovo/rzucic) · verb
- **Byłoby najlepiej, gdybyś mógł sam przyjechać**  
  <sub>слова: [być](/slovo/byc), [dobrze](/slovo/dobrze), [gdyby](/slovo/gdyby), [móc](/slovo/moc), [sam](/slovo/sam), [przyjechać](/slovo/przyjechac)</sub>
- **posiłkowałem się**  
  <sub>слова: [posiłkować](/slovo/posilkowac), [się](/slovo/sie)</sub>
- Odtąd — ✅ [odtąd](/slovo/odtad) · adv
- **Przytoczę kilka ustępów, zaczynając od dnia następującego po naszym pościgu**  
  <sub>слова: [przytoczyć](/slovo/przytoczyc), [kilka](/slovo/kilka), [ustęp](/slovo/ustep), [zaczynać](/slovo/zaczynac), [od](/slovo/od), [dzień](/slovo/dzien), [następować](/slovo/nastepowac), [po](/slovo/po), [nasz](/slovo/nasz), [pościg](/slovo/poscig)</sub>
- **Drobny deszczyk kropi bez ustanku**  
  <sub>слова: [drobny](/slovo/drobny), [deszczyk](/slovo/deszczyk), [kropić](/slovo/kropic), [bez](/slovo/bez), [ustanek](/slovo/ustanek)</sub>
- spowity — ✅ [spowić](/slovo/spowic) · verb
- potrafimy — ✅ [potrafić](/slovo/potrafic) · verb
- **Powodów do obawy nie braknie**  
  <sub>слова: [powód](/slovo/powod), [do](/slovo/do), [obawa](/slovo/obawa), [nie](/slovo/nie), `braknąć`</sub>
- szereg — ✅ [szereg](/slovo/szereg) · noun
- ziejącego — ✅ [ziać](/slovo/ziac) · verb
- siarka — ✅ [siarka](/slovo/siarka) · noun
- **Lecz fakty są faktami, a na własne uszy dwa razy słyszałem szczekanie na bagnie**  
  <sub>слова: [lecz](/slovo/lecz), [fakt](/slovo/fakt), [być](/slovo/byc), [a](/slovo/a), [na](/slovo/na), `własne`, [ucho](/slovo/ucho), [dwa](/slovo/dwa), [raz](/slovo/raz), [słyszeć](/slovo/slyszec), [szczekać](/slovo/szczekac), [bagno](/slovo/bagno)</sub>
- Przypuśćmy — ✅ [przypuścić](/slovo/przypuscic) · verb
- Pomijając — ✅ [pomijać](/slovo/pomijac) · verb
- **Gdzież on teraz przebywa?**  
  <sub>слова: [gdzież](/slovo/gdziez), [on](/slovo/on), [teraz](/slovo/teraz), [przebywać](/slovo/przebywac)</sub>
- **Całą moją energię wytężę, aby tego celu dopiąć**  
  <sub>слова: [cały](/slovo/caly), [mój](/slovo/moj), [energia](/slovo/energia), [wytężyć](/slovo/wytezyc), [aby](/slovo/aby), [ten](/slovo/ten), [cel](/slovo/cel), [dopiąć](/slovo/dopiac)</sub>
- **Będę działał na własną rękę**  
  <sub>слова: [być](/slovo/byc), [działać](/slovo/dzialac), [na](/slovo/na), [własny](/slovo/wlasny), [ręka](/slovo/reka)</sub>
- zajście — ✅ [zajście](/slovo/zajscie) · noun
- zmierzał — ✅ [zmierzać](/slovo/zmierzac) · verb
- **każdy w kłopocie udawał się do niego**  
  <sub>слова: [każdy](/slovo/kazdy), [w](/slovo/w), [kłopot](/slovo/klopot), [udawać](/slovo/udawac), [się](/slovo/sie), [do](/slovo/do), [on](/slovo/on)</sub>
- zauważyłem — ✅ [zauważyć](/slovo/zauwazyc) · verb
- nietknięty — ✅ [nietknięty](/slovo/nietkniety) · adj
- **otóż moja żona znalazła w popiele z kominka niedopalony szczątek listu**  
  <sub>слова: [otóż](/slovo/otoz), [żona](/slovo/zona), [znaleźć](/slovo/znalezc), [w](/slovo/w), [popiół](/slovo/popiol), [z](/slovo/z), [kominek](/slovo/kominek), [dopalić](/slovo/dopalic), [szczątek](/slovo/szczatek), [list](/slovo/list)</sub>
- **— Nie; gdyśmy go poruszyli, rozsypał się.**  
  <sub>слова: [nie](/slovo/nie), [gdy](/slovo/gdy), [on](/slovo/on), [poruszyć](/slovo/poruszyc), [rozsypać](/slovo/rozsypac), [się](/slovo/sie)</sub>
- **Zwiększa ono jeszcze ciemności otaczające nas zewsząd.**  
  <sub>слова: [zwiększać](/slovo/zwiekszac), [on](/slovo/on), [jeszcze](/slovo/jeszcze), `ciemności`, [otaczać](/slovo/otaczac), [my](/slovo/my), [zewsząd](/slovo/zewszad)</sub>
- **Jak uważasz: co nam teraz uczynić należy?**  
  <sub>слова: [jak](/slovo/jak), [uważać](/slovo/uwazac), [co](/slovo/co), [my](/slovo/my), [teraz](/slovo/teraz), [uczynić](/slovo/uczynic), [należeć](/slovo/nalezec)</sub>
- wyzysk — ✅ [wyzysk](/slovo/wyzysk) · noun
- pochłania — ✅ [pochłaniać](/slovo/pochlaniac) · verb
- **Przez cały dzień deszcz padał**  
  <sub>слова: [przez](/slovo/przez), [cały](/slovo/caly), [dzień](/slovo/dzien), [deszcz](/slovo/deszcz), [padać](/slovo/padac)</sub>
- tarczy — ✅ [tarcza](/slovo/tarcza) · noun
- **Wiatr smagał mnie po twarzy, deszcz lał się za kołnierz**  
  <sub>слова: [wiatr](/slovo/wiatr), [smagać](/slovo/smagac), [ja](/slovo/ja), [po](/slovo/po), [twarz](/slovo/twarz), [deszcz](/slovo/deszcz), [lać](/slovo/lac), [się](/slovo/sie), [za](/slovo/za), [kołnierz](/slovo/kolnierz)</sub>
- **Wracając, spotkałem doktora Mortimera**  
  <sub>слова: [wracać](/slovo/wracac), [spotkać](/slovo/spotkac), [doktor](/slovo/doktor)</sub>
- **Wątpię, czy doktor zobaczy jeszcze swego ulubieńca**  
  <sub>слова: [wątpić](/slovo/watpic), [czy](/slovo/czy), [doktor](/slovo/doktor), [zobaczyć](/slovo/zobaczyc), [jeszcze](/slovo/jeszcze), [swój](/slovo/swoj), [ulubieniec](/slovo/ulubieniec)</sub>
- **— Zdaje mi się — odparł**  
  <sub>слова: [zdawać](/slovo/zdawac), [się](/slovo/sie), [odeprzeć](/slovo/odeprzec)</sub>
- **Ojciec wyparł jej się**  
  <sub>слова: [ojciec](/slovo/ojciec), [wyprzeć](/slovo/wyprzec), [on](/slovo/on), [się](/slovo/sie)</sub>
- **Biedna kobieta ma ciężkie życie**  
  <sub>слова: [biedny](/slovo/biedny), [kobieta](/slovo/kobieta), [mój](/slovo/moj), [ciężki](/slovo/ciezki), [życie](/slovo/zycie)</sub>
- **— Z czegóż się utrzymuje?**  
  <sub>слова: [z](/slovo/z), [czegóż](/slovo/czegoz), [się](/slovo/sie), [utrzymywać](/slovo/utrzymywac)</sub>
- indagacji — ✅ [indagacja](/slovo/indagacja) · noun
- podejrzanej — ✅ [podejrzany](/slovo/podejrzany) · adj
- łańcucha — ✅ [łańcuch](/slovo/lancuch) · noun
- **Nie darmo tyle lat przebywam w towarzystwie Sherlocka Holmesa**  
  <sub>слова: [nie](/slovo/nie), [darmo](/slovo/darmo), [tyle](/slovo/tyle), [lato](/slovo/lato), [przebywać](/slovo/przebywac), [w](/slovo/w), [towarzystwo](/slovo/towarzystwo)</sub>
- zanotować — ✅ [zanotować](/slovo/zanotowac) · verb
- **Pozostaje mi już tylko zanotować jeden fakt z owego dnia, a mianowicie moją rozmowę z Barrymore'em**  
  <sub>слова: [pozostawać](/slovo/pozostawac), [już](/slovo/juz), [tylko](/slovo/tylko), [zanotować](/slovo/zanotowac), [jeden](/slovo/jeden), [fakt](/slovo/fakt), [z](/slovo/z), [ów](/slovo/ow), [dzień](/slovo/dzien), [a](/slovo/a), [mianowicie](/slovo/mianowicie), [mój](/slovo/moj), [rozmowa](/slovo/rozmowa), `em`</sub>
- **Czy jeszcze grasuje?**  
  <sub>слова: [czy](/slovo/czy), [jeszcze](/slovo/jeszcze), [grasować](/slovo/grasowac)</sub>
- **Spodziewam się, że już go tu nie ma; nie dawał znaku życia od dnia, gdy po raz ostatni zaniosłem mu żywność**  
  <sub>слова: [spodziewać](/slovo/spodziewac), [się](/slovo/sie), [że](/slovo/ze), [już](/slovo/juz), [on](/slovo/on), [tu](/slovo/tu), [nie](/slovo/nie), [mój](/slovo/moj), [dawać](/slovo/dawac), [znak](/slovo/znak), [życie](/slovo/zycie), [od](/slovo/od), [dzień](/slovo/dzien), [gdy](/slovo/gdy), [po](/slovo/po), [raz](/slovo/raz), [ostatni](/slovo/ostatni), [zanieść](/slovo/zaniesc), [żywność](/slovo/zywnosc)</sub>
- odezwania — ✅ [odezwać](/slovo/odezwac) · verb
- **Wahał się**  
  <sub>слова: [wahać](/slovo/wahac), [się](/slovo/sie)</sub>
- **Cóż cię zaniepokoiło?**  
  <sub>слова: [cóż](/slovo/coz), [ty](/slovo/ty), [zaniepokoić](/slovo/zaniepokoic)</sub>
- **Powiem panu szczerze**  
  <sub>слова: [powiedzieć](/slovo/powiedziec), [pan](/slovo/pan), [szczerze](/slovo/szczerze)</sub>
- **Znając te dwa fakty, miałem w ręku oręż, który mógł mi pomóc do wyjaśnienia tej krwawej zagadki**  
  <sub>слова: [znać](/slovo/znac), [ten](/slovo/ten), [dwa](/slovo/dwa), [fakt](/slovo/fakt), [w](/slovo/w), [ręka](/slovo/reka), [oręż](/slovo/orez), [który](/slovo/ktory), [móc](/slovo/moc), [pomóc](/slovo/pomoc), [do](/slovo/do), [wyjaśnienia](/slovo/wyjasnienia), [krwawy](/slovo/krwawy), [zagadka](/slovo/zagadka)</sub>
- zwiady — ✅ [zwiad](/slovo/zwiad) · noun
- **Na pierwszy rzut oka**  
  <sub>слова: [na](/slovo/na), [pierwszy](/slovo/pierwszy), [rzut](/slovo/rzut), [oko](/slovo/oko)</sub>
- zawdzięczam (Mówiłam już panu, że wiele mu zawdzięczam) — ✅ [zawdzięczać](/slovo/zawdzieczac) · verb
- jałmużnikiem — ✅ [jałmużnik](/slovo/jalmuznik) · noun
- potrwa — ✅ [potrwać](/slovo/potrwac) · verb
- zaś — ✅ [zaś](/slovo/zas) · conj
- bezkarnie — ✅ [bezkarnie](/slovo/bezkarnie) · adv
- **— Mówię prawdę**  
  <sub>слова: [mówić](/slovo/mowic), [prawda](/slovo/prawda)</sub>
- nadaremnie — ✅ [nadaremnie](/slovo/nadaremnie) · adv
- przekonasz — ✅ [przekonać](/slovo/przekonac) · verb
- dopiero — ✅ [dopiero](/slovo/dopiero) · part
- żałować — ✅ [żałować](/slovo/zalowac) · verb
- złapać — ✅ [złapać](/slovo/zlapac) · verb
- przedsięwzięła — ✅ [przedsięwziąć](/slovo/przedsiewziac) · verb
- zniechęcony — ✅ [zniechęcony](/slovo/zniechecony) · adj
- mur — ✅ [mur](/slovo/mur) · noun
- **Niewątpliwie była bardziej winna, niż się przedstawiała.**  
  <sub>слова: [niewątpliwie](/slovo/niewatpliwie), `była`, [bardziej](/slovo/bardziej), `winna`, [niż](/slovo/niz), [się](/slovo/sie), [przedstawiać](/slovo/przedstawiac)</sub>
- jaskiniom — ✅ [jaskinia](/slovo/jaskinia) · noun
- **Obiecywałem sobie, że znajdę nieznajomego i że musi mi wyznać, dlaczego tu przebywa**  
  <sub>слова: [obiecywać](/slovo/obiecywac), [że](/slovo/ze), [znaleźć](/slovo/znalezc), [nieznajomy](/slovo/nieznajomy), [i](/slovo/i), [musieć](/slovo/musiec), [wyznać](/slovo/wyznac), [dlaczego](/slovo/dlaczego), [tu](/slovo/tu), [przebywać](/slovo/przebywac)</sub>
- **Jakiż byłby to dla mnie tryumf, gdybym go zdołał schwytać!**  
  <sub>слова: [jakiż](/slovo/jakiz), [być](/slovo/byc), [to](/slovo/to), [dla](/slovo/dla), [ja](/slovo/ja), [tryumf](/slovo/tryumf), [gdyby](/slovo/gdyby), [on](/slovo/on), [zdołać](/slovo/zdolac), [schwytać](/slovo/schwytac)</sub>
- dopisywało — ✅ [dopisywać](/slovo/dopisywac) · verb
- **Zwiastunem dobrej wieści był pan Frankland.**  
  <sub>слова: [zwiastun](/slovo/zwiastun), [dobry](/slovo/dobry), [wieść](/slovo/wiesc), [być](/slovo/byc), [pan](/slovo/pan)</sub>
- wznoszącego — ✅ [wznosić](/slovo/wznosic) · verb
- **Dowodzenie było bardzo logiczne**  
  <sub>слова: [dowodzenie](/slovo/dowodzenie), [być](/slovo/byc), [bardzo](/slovo/bardzo), [logiczny](/slovo/logiczny)</sub>
- **— Bez wątpienia — odparłem — ale skąd pan wie, że on kryje się na bagnie?**  
  <sub>слова: [bez](/slovo/bez), [wątpić](/slovo/watpic), [odeprzeć](/slovo/odeprzec), [ale](/slovo/ale), [skąd](/slovo/skad), [pan](/slovo/pan), [wiedzieć](/slovo/wiedziec), [że](/slovo/ze), [on](/slovo/on), [kryć](/slovo/kryc), [się](/slovo/sie), [na](/slovo/na), [bagno](/slovo/bagno)</sub>
- **Udawałem, że ta wiadomość jest mi zupełnie obojętna**  
  <sub>слова: [udawać](/slovo/udawac), [że](/slovo/ze), [ten](/slovo/ten), [wiadomość](/slovo/wiadomosc), [być](/slovo/byc), [zupełnie](/slovo/zupelnie), [obojętny](/slovo/obojetny)</sub>
- **Jeżeli potrafię wydobyć z niego więcej faktów, oszczędzi mi to czasu i trudu**  
  <sub>слова: [jeżeli](/slovo/jezeli), [potrafić](/slovo/potrafic), [wydobyć](/slovo/wydobyc), [z](/slovo/z), [on](/slovo/on), [więcej](/slovo/wiecej), [fakt](/slovo/fakt), [oszczędzić](/slovo/oszczedzic), [to](/slovo/to), [czas](/slovo/czas), [i](/slovo/i), [trud](/slovo/trud)</sub>
- **— Więc pan wątpi?**  
  <sub>слова: [więc](/slovo/wiec), [pan](/slovo/pan), [wątpić](/slovo/watpic)</sub>
- **Pozwól sobie powiedzieć, że to przypuszczenie jest niedorzeczne.**  
  <sub>слова: [pozwolić](/slovo/pozwolic), [powiedzieć](/slovo/powiedziec), [że](/slovo/ze), [to](/slovo/to), [przypuszczenie](/slovo/przypuszczenie), [być](/slovo/byc), [niedorzeczny](/slovo/niedorzeczny)</sub>
- **Nie ma tam ani źdźbła trawy, więc cóż by skubała trzoda, a bez trzody nie ma pastucha.**  
  <sub>слова: [nie](/slovo/nie), [mój](/slovo/moj), [tam](/slovo/tam), [ani](/slovo/ani), [źdźbło](/slovo/zdzblo), [trawa](/slovo/trawa), [więc](/slovo/wiec), [cóż](/slovo/coz), [by](/slovo/by), [skubać](/slovo/skubac), [trzoda](/slovo/trzoda), [a](/slovo/a), [bez](/slovo/bez), [pastuch](/slovo/pastuch)</sub>
- **— Chodź pan, chodź — zawołał Frankland, biegnąc na górę. — Zobaczysz pan na własne oczy i przekonasz się, że nie rzucam słów na wiatr**  
  <sub>слова: [chodzić](/slovo/chodzic), [pan](/slovo/pan), [zawołać](/slovo/zawolac), [biec](/slovo/biec), [na](/slovo/na), [góra](/slovo/gora), [zobaczyć](/slovo/zobaczyc), `własne`, [oko](/slovo/oko), [i](/slovo/i), [przekonać](/slovo/przekonac), [się](/slovo/sie), [że](/slovo/ze), [nie](/slovo/nie), [rzucać](/slovo/rzucac), [słowo](/slovo/slowo), [wiatr](/slovo/wiatr)</sub>
- **— Śpiesz się, doktorze, bo przejdzie na drugą stronę góry!**  
  <sub>слова: `śpieszyć`, [się](/slovo/sie), [doktor](/slovo/doktor), [bo](/slovo/bo), [przejść](/slovo/przejsc), [na](/slovo/na), [drugi](/slovo/drugi), [strona](/slovo/strona), `góry`</sub>
- prostopadle — ✅ [prostopadle](/slovo/prostopadle) · adv
- zawiniątko — ✅ [zawiniątko](/slovo/zawiniatko) · noun
- **bochenek chleba**  
  <sub>слова: [bochenek](/slovo/bochenek), [chleb](/slovo/chleb)</sub>
- **wędzony ozór**  
  <sub>слова: [wędzić](/slovo/wedzic), [ozór](/slovo/ozor)</sub>
- **dwa słoiki owocowych konserw**  
  <sub>слова: [dwa](/slovo/dwa), [słoik](/slovo/sloik), [owocowa](/slovo/owocowa), [konserwa](/slovo/konserwa)</sub>
- **Szukałem innych kartek, ale na próżno**  
  <sub>слова: [szukać](/slovo/szukac), [inny](/slovo/inny), [kartka](/slovo/kartka), [ale](/slovo/ale), [na](/slovo/na), [próżno](/slovo/prozno)</sub>
- **Poprzysiągłem sobie, że stąd nie wyjdę, dopóki nie dowiem się, czy ten człowiek jest naszym przyjacielem, czy wrogiem**  
  <sub>слова: [poprzysięgnąć](/slovo/poprzysiegnac), [że](/slovo/ze), [stąd](/slovo/stad), [nie](/slovo/nie), [wyjść](/slovo/wyjsc), [dopóki](/slovo/dopoki), [dowiedzieć](/slovo/dowiedziec), [się](/slovo/sie), [czy](/slovo/czy), [ten](/slovo/ten), [człowiek](/slovo/czlowiek), [być](/slovo/byc), [nasz](/slovo/nasz), [przyjaciel](/slovo/przyjaciel), [wróg](/slovo/wrog)</sub>
- **— Jakże się cieszę, że to ty!**  
  <sub>слова: [jakże](/slovo/jakze), [się](/slovo/sie), [cieszyć](/slovo/cieszyc), [że](/slovo/ze), [to](/slovo/to), [ty](/slovo/ty)</sub>
- **— Tak, wtedy cię ujrzałem**  
  <sub>слова: [tak](/slovo/tak), [wtedy](/slovo/wtedy), [ty](/slovo/ty), [ujrzeć](/slovo/ujrzec)</sub>
- **— Więc posługujesz się mną, a jednak mi nie ufasz… — zawołałem z goryczą. — Zdaje mi się, że zasłużyłem na zaufanie**  
  <sub>слова: [więc](/slovo/wiec), [posługiwać](/slovo/poslugiwac), [się](/slovo/sie), [ja](/slovo/ja), [a](/slovo/a), [jednak](/slovo/jednak), [nie](/slovo/nie), [ufać](/slovo/ufac), [zawołać](/slovo/zawolac), [z](/slovo/z), [gorycz](/slovo/gorycz), [zdawać](/slovo/zdawac), [że](/slovo/ze), [zasłużyć](/slovo/zasluzyc), [na](/slovo/na), [zaufanie](/slovo/zaufanie)</sub>
- **zniechęcić się**  
  <sub>слова: [zniechęcić](/slovo/zniechecic), [się](/slovo/sie)</sub>
- **Nie zniechęcaj się!**  
  <sub>слова: [nie](/slovo/nie), [zniechęcać](/slovo/zniechecac), [się](/slovo/sie)</sub>
- **— Teraz ja udzielę ci garstkę informacji w zamian za te, których ty mi dostarczyłeś. Dama, uchodząca tutaj za miss Stapleton, jest w istocie jego żoną.**  
  <sub>слова: [teraz](/slovo/teraz), [ja](/slovo/ja), [udzielić](/slovo/udzielic), [ten](/slovo/ten), [garstka](/slovo/garstka), [informacja](/slovo/informacja), [w](/slovo/w), [zamian](/slovo/zamian), [za](/slovo/za), [który](/slovo/ktory), [ty](/slovo/ty), [dostarczyć](/slovo/dostarczyc), [dama](/slovo/dama), [uchodzić](/slovo/uchodzic), [tutaj](/slovo/tutaj), `miss`, [być](/slovo/byc), [istota](/slovo/istota), [on](/slovo/on), [żona](/slovo/zona)</sub>
- **Powtarzam ci: ta piękna dama jest nie siostrą, lecz żoną Stapletona**  
  <sub>слова: [powtarzać](/slovo/powtarzac), [ten](/slovo/ten), [piękno](/slovo/piekno), [dama](/slovo/dama), [być](/slovo/byc), [nie](/slovo/nie), [siostra](/slovo/siostra), [lecz](/slovo/lecz), [żona](/slovo/zona)</sub>
- **— Za późno już, za późno!… — mówił z rozpaczą. — Że też siedziałem tu jak bałwan, z założonymi rękoma!… A ty, jak mogłeś wypuścić z opieki sir Henryka!…**  
  <sub>слова: [za](/slovo/za), [późno](/slovo/pozno), [już](/slovo/juz), [mówić](/slovo/mowic), [z](/slovo/z), [rozpacz](/slovo/rozpacz), [że](/slovo/ze), [też](/slovo/tez), [siedzieć](/slovo/siedziec), [tu](/slovo/tu), [jak](/slovo/jak), [bałwan](/slovo/balwan), [założyć](/slovo/zalozyc), [ręka](/slovo/reka), [a](/slovo/a), [ty](/slovo/ty), [móc](/slovo/moc), [wypuścić](/slovo/wypuscic), [opieka](/slovo/opieka)</sub>
- **— Trzeba sprowadzić ludzi — rzekłem. — We dwóch nie przeniesiemy go do Baskerville Hall. Co ci jest? Czyś oszalał?…**  
  <sub>слова: [trzeba](/slovo/trzeba), [sprowadzić](/slovo/sprowadzic), [człowiek](/slovo/czlowiek), [rzec](/slovo/rzec), `we`, [dwa](/slovo/dwa), [nie](/slovo/nie), [przenieść](/slovo/przeniesc), [on](/slovo/on), [do](/slovo/do), [co](/slovo/co), [ten](/slovo/ten), [być](/slovo/byc), [czy](/slovo/czy), [oszaleć](/slovo/oszalec)</sub>
- **Z gorączkową skwapliwością odwróciliśmy zwłoki twarzą do księżyca**  
  <sub>слова: [z](/slovo/z), [gorączkowy](/slovo/goraczkowy), [skwapliwość](/slovo/skwapliwosc), [odwrócić](/slovo/odwrocic), [zwłoki](/slovo/zwloki), [twarz](/slovo/twarz), [do](/slovo/do), [księżyc](/slovo/ksiezyc)</sub>
- **Co za zimna krew!**  
  <sub>слова: [co](/slovo/co), [za](/slovo/za), [zimny](/slovo/zimny), [krew](/slovo/krew)</sub>
- **— Żałuję, że nas widział**  
  <sub>слова: [żałować](/slovo/zalowac), [że](/slovo/ze), [my](/slovo/my), [widzieć](/slovo/widziec)</sub>
- **Drogi Watsonie, ty jesteś stworzony na człowieka czynu.**  
  <sub>слова: `drogi`, [ty](/slovo/ty), [być](/slovo/byc), [stworzyć](/slovo/stworzyc), [na](/slovo/na), [człowiek](/slovo/czlowiek), [czyn](/slovo/czyn)</sub>
- **Nie zdołamy mu nic dowieść**  
  <sub>слова: [nie](/slovo/nie), [zdołać](/slovo/zdolac), [on](/slovo/on), [nic](/slovo/nic), [dowieść](/slovo/dowiesc)</sub>
- **Mamy przecież dowód.**  
  <sub>слова: [mama](/slovo/mama), [przecież](/slovo/przeciez), [dowód](/slovo/dowod)</sub>
- **Ma się rozumieć**  
  <sub>слова: [mój](/slovo/moj), [się](/slovo/sie), [rozumieć](/slovo/rozumiec)</sub>
- poniekąd — ✅ [poniekąd](/slovo/poniekad) · part
- wyrzutkiem — ✅ [wyrzutek](/slovo/wyrzutek) · noun
- zatarg — ✅ [zatarg](/slovo/zatarg) · noun
- **spodziewam się rzucić na nie światło**  
  <sub>слова: [spodziewać](/slovo/spodziewac), [się](/slovo/sie), [rzucić](/slovo/rzucic), [na](/slovo/na), [nie](/slovo/nie), [światło](/slovo/swiatlo)</sub>
- kaganiec — ✅ [kaganiec](/slovo/kaganiec) · noun
- **Rozporządzaj pan mną do woli**  
  <sub>слова: [rozporządzać](/slovo/rozporzadzac), [pan](/slovo/pan), [ja](/slovo/ja), [do](/slovo/do), `woli`</sub>
- owszem — ✅ [owszem](/slovo/owszem) · part
- **— Jeżeli pan zastosujesz się do moich wskazówek i poleceń, nie pytając o ich przyczynę, to uda mi się może rozwikłać tajemnicę. Nie wątpię…**  
  <sub>слова: [jeżeli](/slovo/jezeli), [pan](/slovo/pan), [zastosować](/slovo/zastosowac), [się](/slovo/sie), [do](/slovo/do), [mój](/slovo/moj), [wskazówka](/slovo/wskazowka), [i](/slovo/i), [polecenie](/slovo/polecenie), [nie](/slovo/nie), [pytać](/slovo/pytac), [o](/slovo/o), [on](/slovo/on), [przyczyna](/slovo/przyczyna), [to](/slovo/to), [udać](/slovo/udac), [móc](/slovo/moc), [rozwikłać](/slovo/rozwiklac), [tajemnica](/slovo/tajemnica), [wątpić](/slovo/watpic)</sub>
- **Patrząc na Sherlocka, spostrzegłem, że tłumi wewnętrzne wzburzenie.**  
  <sub>слова: [patrzeć](/slovo/patrzec), [na](/slovo/na), [spostrzec](/slovo/spostrzec), [że](/slovo/ze), [tłumić](/slovo/tlumic), [wewnętrzny](/slovo/wewnetrzny), [wzburzenie](/slovo/wzburzenie)</sub>
- **— Co cię uderza? — zapytał.**  
  <sub>слова: [co](/slovo/co), [ty](/slovo/ty), [uderzać](/slovo/uderzac), [zapytać](/slovo/zapytac)</sub>
- **Nazajutrz wstałem bardzo wcześnie, ale Holmes już mnie wyprzedził. Był ubrany do wyjścia.**  
  <sub>слова: [nazajutrz](/slovo/nazajutrz), [wstać](/slovo/wstac), [bardzo](/slovo/bardzo), [wcześnie](/slovo/wczesnie), [ale](/slovo/ale), [już](/slovo/juz), [ja](/slovo/ja), [wyprzedzić](/slovo/wyprzedzic), [być](/slovo/byc), [ubrany](/slovo/ubrany), [do](/slovo/do), [wyjść](/slovo/wyjsc)</sub>
- **— Cóż dalej?**  
  <sub>слова: [cóż](/slovo/coz), [daleko](/slovo/daleko)</sub>
- **— Bo też tak jest.**  
  <sub>слова: [bo](/slovo/bo), [też](/slovo/tez), [tak](/slovo/tak), [być](/slovo/byc)</sub>
- **— I ja gotów jestem ich wysłuchać.**  
  <sub>слова: [i](/slovo/i), [ja](/slovo/ja), `gotów`, [być](/slovo/byc), [on](/slovo/on), [wysłuchać](/slovo/wysluchac)</sub>

- **Dlaczego właśnie ja?**  
  <sub>слова: [dlaczego](/slovo/dlaczego), [właśnie](/slovo/wlasnie), [ja](/slovo/ja)</sub>
- **Czemu właśnie teraz?**  
  <sub>слова: [co](/slovo/co), [właśnie](/slovo/wlasnie), [teraz](/slovo/teraz)</sub>
- **— Trzeba było wcześniej zarezerwować. — Właśnie!**  
  <sub>слова: [trzeba](/slovo/trzeba), [być](/slovo/byc), [wcześnie](/slovo/wczesnie), [zarezerwować](/slovo/zarezerwowac), [właśnie](/slovo/wlasnie)</sub>
- **transportu. Gwarantuję wam, że nie jesteście w stanie zgadnąć, co sobie**  
  <sub>слова: [transport](/slovo/transport), [gwarantować](/slovo/gwarantowac), [wy](/slovo/wy), [że](/slovo/ze), [nie](/slovo/nie), [być](/slovo/byc), [w](/slovo/w), [stan](/slovo/stan), [zgadnąć](/slovo/zgadnac), [co](/slovo/co), [siebie](/slovo/siebie)</sub>
- **Mogę dać wam podpowiedź. Nie było dużego wyboru nawet.**  
  <sub>слова: [móc](/slovo/moc), [dać](/slovo/dac), [wy](/slovo/wy), [podpowiedź](/slovo/podpowiedz), [nie](/slovo/nie), [być](/slovo/byc), [duży](/slovo/duzy), [wybór](/slovo/wybor), [nawet](/slovo/nawet)</sub>
- **zgadnąć, zanim to otworzę, zanim wszyscy się dowiedzą i zanim bęem sztabkę złota**  
  <sub>слова: [zgadnąć](/slovo/zgadnac), [zanim](/slovo/zanim), [to](/slovo/to), [otworzyć](/slovo/otworzyc), [zanim](/slovo/zanim), [wszyscy](/slovo/wszyscy), [się](/slovo/sie), [dowiedzieć](/slovo/dowiedziec), [i](/slovo/i), [zanim](/slovo/zanim), [sztabka](/slovo/sztabka), [złoto](/slovo/zloto)</sub>
- zgarnąć — ✅ [zgarnąć](/slovo/zgarnac) · verb
- otoczka — ✅ [otoczka](/slovo/otoczka) · noun
- **Jest tu sympatycznie. Jest tu wszystko, czego potrzebuję.**  
  <sub>слова: [być](/slovo/byc), [tu](/slovo/tu), [sympatycznie](/slovo/sympatycznie), [być](/slovo/byc), [tu](/slovo/tu), [wszystko](/slovo/wszystko), [co](/slovo/co), [potrzebować](/slovo/potrzebowac)</sub>
- współdzielić — ✅ [współdzielić](/slovo/wspoldzielic) · verb
- Przyznam szczerze — ✅ [przyznać](/slovo/przyznac)
- **Kogo ja próbuję oszukać? Jestem świnią.**  
  <sub>слова: [kto](/slovo/kto), [ja](/slovo/ja), [próbować](/slovo/probowac), [oszukać](/slovo/oszukac), [być](/slovo/byc), [świnia](/slovo/swinia)</sub>
- **Nie wiem czemu, ale jak zobaczyłem słowo pepperone, to jakoś tak po prostu zrobiło mi się miło na serduszku.**  
  <sub>слова: [nie](/slovo/nie), [wiedzieć](/slovo/wiedziec), [co](/slovo/co), [ale](/slovo/ale), [jak](/slovo/jak), [zobaczyć](/slovo/zobaczyc), [słowo](/slovo/slowo), [to](/slovo/to), [jakoś](/slovo/jakos), [tak](/slovo/tak), [po](/slovo/po), [prosty](/slovo/prosty), [zrobić](/slovo/zrobic), [ja](/slovo/ja), [się](/slovo/sie), [miło](/slovo/milo), [na](/slovo/na), [serduszko](/slovo/serduszko)</sub>
- **A tak to spoko.**  
  <sub>слова: [a](/slovo/a), [tak](/slovo/tak), [to](/slovo/to), [spoko](/slovo/spoko)</sub>
- **Znalazłem jakiś budynek, do którego tutaj trzeba było przejść kontrolę policyjną i nie wnieść zakazanych rzeczy.**  
  <sub>слова: [znaleźć](/slovo/znalezc), [jakiś](/slovo/jakis), [budynek](/slovo/budynek), [do](/slovo/do), [który](/slovo/ktory), [tutaj](/slovo/tutaj), [trzeba](/slovo/trzeba), [być](/slovo/byc), [przejść](/slovo/przejsc), [kontrola](/slovo/kontrola), [policyjny](/slovo/policyjny), [i](/slovo/i), [nie](/slovo/nie), [wnieść](/slovo/wniesc), [zakazać](/slovo/zakazac), [rzecz](/slovo/rzecz)</sub>
- **Wiem, może nie najmniej.**  
  <sub>слова: [wiedzieć](/slovo/wiedziec), [może](/slovo/moze), [nie](/slovo/nie), [mało](/slovo/malo)</sub>
- **To prawda, dało się taniej.**  
  <sub>слова: [to](/slovo/to), [prawda](/slovo/prawda), [dać](/slovo/dac), [się](/slovo/sie), [tanio](/slovo/tanio)</sub>
- **Chodźcie, opowiem wam co nieco.**  
  <sub>слова: [chodzić](/slovo/chodzic), [opowiedzieć](/slovo/opowiedziec), [wy](/slovo/wy), [co](/slovo/co), [nieco](/slovo/nieco)</sub>
- **A to dlatego, że jest to przepyszne.**  
  <sub>слова: [a](/slovo/a), [to](/slovo/to), [dlatego](/slovo/dlatego), [że](/slovo/ze), [być](/slovo/byc), [to](/slovo/to), [przepyszny](/slovo/przepyszny)</sub>
- **Dzięki, że obejrzałeś ten film.**  
  <sub>слова: [dzięki](/slovo/dzieki), [że](/slovo/ze), [obejrzeć](/slovo/obejrzec), [ten](/slovo/ten), [film](/slovo/film)</sub>
- udo — ✅ [udo](/slovo/udo) · noun
- cofanie — ✅ [cofać](/slovo/cofac) · verb
- cofać — ✅ [cofać](/slovo/cofac) · verb
- aż — ✅ [aż](/slovo/az)
- podejmować — ✅ [podejmować](/slovo/podejmowac) · verb
- **Był to pierwszy raz odkąd sam sobie kupiłem jedzenie od rozpoczęcia tego wyzwania**  
  <sub>слова: [być](/slovo/byc), [to](/slovo/to), [pierwszy](/slovo/pierwszy), [raz](/slovo/raz), [odkąd](/slovo/odkad), [sam](/slovo/sam), [siebie](/slovo/siebie), [kupić](/slovo/kupic), [jedzenie](/slovo/jedzenie), [od](/slovo/od), [rozpocząć](/slovo/rozpoczac), [ten](/slovo/ten), [wyzwanie](/slovo/wyzwanie)</sub>
- nolek — ⛔ не распознано
- dołączyć — ✅ [dołączyć](/slovo/dolaczyc)
- zazdrościć — ✅ [zazdrościć](/slovo/zazdroscic) · verb
- zdążyć — ✅ [zdążyć](/slovo/zdazyc)
- męczyć — ✅ [męczyć](/slovo/meczyc) · verb
- męczący — ✅ [męczący](/slovo/meczacy) · adj
- przetestować — ✅ [przetestować](/slovo/przetestowac) · verb
- cierpieć — ✅ [cierpieć](/slovo/cierpiec)
- przerwa — ✅ [przerwa](/slovo/przerwa)
- mięciutki — ✅ [mięciutki](/slovo/mieciutki) · adj
- łazić — ✅ [łazić](/slovo/lazic) · verb
- okrutnie — ✅ [okrutnie](/slovo/okrutnie) · adv
- okropnie — ✅ [okropnie](/slovo/okropnie) · adv
- przysięgam — ✅ [przysięgać](/slovo/przysiegac)
- okrutnie — ✅ [okrutnie](/slovo/okrutnie) · adv
- nagrzać — ✅ [nagrzać](/slovo/nagrzac) · verb
- czaicie — ✅ [czaić](/slovo/czaic) · verb
- niepojęte — ✅ [niepojęty](/slovo/niepojety) · adj
- **Jeszcze nie kładę się spać ale już bardzo bym chciał**  
  <sub>слова: [jeszcze](/slovo/jeszcze), [nie](/slovo/nie), [kłaść](/slovo/klasc), [się](/slovo/sie), [spać](/slovo/spac), [ale](/slovo/ale), [już](/slovo/juz), [bardzo](/slovo/bardzo), [by](/slovo/by), [chcieć](/slovo/chciec)</sub>
- **Oby już nie było bo to bez sensu**  
  <sub>слова: [oby](/slovo/oby), [już](/slovo/juz), [nie](/slovo/nie), [być](/slovo/byc), [bo](/slovo/bo), [to](/slovo/to), [bez](/slovo/bez), [sens](/slovo/sens)</sub>
- pęcherzyk — ✅ [pęcherzyk](/slovo/pecherzyk) · noun
- powstrzymać — ✅ [powstrzymać](/slovo/powstrzymac)
- zmierzać — ✅ [zmierzać](/slovo/zmierzac)
- narzekać — ✅ [narzekać](/slovo/narzekac) · verb
- chrząstka — ✅ [chrząstka](/slovo/chrzastka) · noun
- olać — ✅ [olać](/slovo/olac) · verb
- kontuzja — ✅ [kontuzja](/slovo/kontuzja) · noun
- zajeżdżać — ✅ [zajeżdżać](/slovo/zajezdzac) · verb
- utrzymywać — ✅ [utrzymywać](/slovo/utrzymywac)
- zadbać — ✅ [zadbać](/slovo/zadbac) · verb
- kuracja — ✅ [kuracja](/slovo/kuracja) · noun
- zabior — ⛔ не распознано
- prowizorycznie — ✅ [prowizorycznie](/slovo/prowizorycznie) · adv
- włączyć — ✅ [włączyć](/slovo/wlaczyc)
- wszelaki — ✅ [wszelaki](/slovo/wszelaki) · adj
- gonić — ✅ [gonić](/slovo/gonic) · verb
- doberek — ⛔ не распознано
- napięcie — ✅ [napięcie](/slovo/napiecie) · noun
- schabowy — ✅ [schabowy](/slovo/schabowy) · adj
- pierniczyć — ✅ [pierniczyć](/slovo/pierniczyc) · verb
- uderzyć — ✅ [uderzyć](/slovo/uderzyc)
- odczuć — ✅ [odczuć](/slovo/odczuc) · verb
- siak — ✅ [siak](/slovo/siak) · part
- zasięg — ✅ [zasięg](/slovo/zasieg)
- zrezygnować — ✅ [zrezygnować](/slovo/zrezygnowac)
- ogarnąć — ✅ [ogarnąć](/slovo/ogarnac) · verb
- utrudnić — ✅ [utrudnić](/slovo/utrudnic) · verb
- unikać — ✅ [unikać](/slovo/unikac) · verb
- marudzić — ✅ [marudzić](/slovo/marudzic)
- dreptać — ✅ [dreptać](/slovo/dreptac) · verb
- beciak — ⛔ не распознано
- zaklepać — ✅ [zaklepać](/slovo/zaklepac) · verb
- trzew — ⛔ не распознано
- wyznacznik — ✅ [wyznacznik](/slovo/wyznacznik) · noun
- kibicować — ✅ [kibicować](/slovo/kibicowac) · verb
- przedłużyć — ✅ [przedłużyć](/slovo/przedluzyc) · verb
- denerwacja — ⛔ не распознано
- matura — ✅ [matura](/slovo/matura) · noun
- zmęczenie — ✅ [zmęczenie](/slovo/zmeczenie) · noun
- pierniczyć — ✅ [pierniczyć](/slovo/pierniczyc) · verb
- zakać — ⛔ не распознано
- wytarły — ✅ [wytrzeć](/slovo/wytrzec) · verb
- ulga — ✅ [ulga](/slovo/ulga) · noun
- podszyć — ✅ [podszyć](/slovo/podszyc) · verb
- marnowazć — ⛔ не распознано
- Sięgano — ✅ [sięgać](/slovo/siegac) · verb
- sięgać — ✅ [sięgać](/slovo/siegac) · verb
- ubogi — ✅ [ubogi](/slovo/ubogi) · adj
- Ówcześnie — ✅ [ówcześnie](/slovo/owczesnie) · adv
- **prowizorki okazały się najtrwalsze**  
  <sub>слова: [prowizorka](/slovo/prowizorka), [okazać](/slovo/okazac), [się](/slovo/sie), [trwały](/slovo/trwaly)</sub>
- knajpa — ✅ [knajpa](/slovo/knajpa) · noun
- wprowadzić — ✅ [wprowadzić](/slovo/wprowadzic) · verb
- pralina — ✅ [pralina](/slovo/pralina) · noun
- tandeta — ✅ [tandeta](/slovo/tandeta) · noun
- drzeworyt — ✅ [drzeworyt](/slovo/drzeworyt) · noun
- pochodzić — ✅ [pochodzić](/slovo/pochodzic) · verb
- kształcić — ✅ [kształcić](/slovo/ksztalcic) · verb
- rzeźba — ✅ [rzeźba](/slovo/rzezba) · noun
- nawiązanie — ✅ [nawiązanie](/slovo/nawiazanie) · noun
- łagodniutki — ✅ [łagodniutki](/slovo/lagodniutki) · adj
- zlecenie — ✅ [zlecenie](/slovo/zlecenie) · noun
- wiekopomny — ✅ [wiekopomny](/slovo/wiekopomny) · adj
- omamić — ✅ [omamić](/slovo/omamic) · verb
- pohańbion — ✅ [pohańbić](/slovo/pohanbic) · verb
- prężnie — ✅ [prężnie](/slovo/preznie) · adv
- **tutaj walicie jak w dym.**  
  <sub>слова: [tutaj](/slovo/tutaj), [walić](/slovo/walic), [jak](/slovo/jak), [w](/slovo/w), [dym](/slovo/dym)</sub>
- **Walić jak w dym**  
  <sub>слова: [walić](/slovo/walic), [jak](/slovo/jak), [w](/slovo/w), [dym](/slovo/dym)</sub>
- **Walczyć z urzędem to kopać się z koniem.**  
  <sub>слова: [walczyć](/slovo/walczyc), [z](/slovo/z), [urząd](/slovo/urzad), [to](/slovo/to), [kopać](/slovo/kopac), [się](/slovo/sie), [z](/slovo/z), [koń](/slovo/kon)</sub>
- **Chciałoby się powiedzieć, ale nie można tak powiedzieć.**  
  <sub>слова: [chcieć](/slovo/chciec), [się](/slovo/sie), [powiedzieć](/slovo/powiedziec), [ale](/slovo/ale), [nie](/slovo/nie), [można](/slovo/mozna), [tak](/slovo/tak), [powiedzieć](/slovo/powiedziec)</sub>
- **Typowa już całkowicie dla tych stron.**  
  <sub>слова: [typowy](/slovo/typowy), [już](/slovo/juz), [całkowicie](/slovo/calkowicie), [dla](/slovo/dla), [ten](/slovo/ten), [strona](/slovo/strona)</sub>
- **a w Norymberdze Tucher jest niemal wszędzie i trudno się temu dziwić.**  
  <sub>слова: [a](/slovo/a), [w](/slovo/w), ~~Norymberdze~~, ~~Tucher~~, [być](/slovo/byc), [niemal](/slovo/niemal), [wszędzie](/slovo/wszedzie), [i](/slovo/i), [trudno](/slovo/trudno), [się](/slovo/sie), [to](/slovo/to), [dziwić](/slovo/dziwic)</sub>
- **To trzeba zjeść w przódy.**  
  <sub>слова: [to](/slovo/to), [trzeba](/slovo/trzeba), [zjeść](/slovo/zjesc), [w](/slovo/w), [przódy](/slovo/przody)</sub>
- podniecać — ✅ [podniecać](/slovo/podniecac) · verb
- klucha — ✅ [klucha](/slovo/klucha) · noun
- **Mama zawsze mówiła, nie pakuj tyle do buzi.**  
  <sub>слова: [mama](/slovo/mama), [zawsze](/slovo/zawsze), [mówić](/slovo/mowic), [nie](/slovo/nie), [pakować](/slovo/pakowac), [tyle](/slovo/tyle), [do](/slovo/do), [buzia](/slovo/buzia)</sub>
- unurzać — ✅ [unurzać](/slovo/unurzac) · verb
- **To moje szczęście jest pełne i chciałbym, żeby moje szczęście było również waszym szczęściem.**  
  <sub>слова: [to](/slovo/to), [mój](/slovo/moj), [szczęście](/slovo/szczescie), [być](/slovo/byc), [pełny](/slovo/pelny), [i](/slovo/i), [chcieć](/slovo/chciec), [żeby](/slovo/zeby), [mój](/slovo/moj), [szczęście](/slovo/szczescie), [być](/slovo/byc), [również](/slovo/rowniez), [wasz](/slovo/wasz), [szczęście](/slovo/szczescie)</sub>
- pieczeń — ✅ [pieczeń](/slovo/pieczen) · noun
- spacerkiem — ✅ [spacerek](/slovo/spacerek) · noun
- mieścić — ✅ [mieścić](/slovo/miescic) · verb
- **mieści się**  
  <sub>слова: [mieścić](/slovo/miescic), [się](/slovo/sie)</sub>
- szynach — ✅ [szyna](/slovo/szyna) · noun
- przytup — ✅ [przytup](/slovo/przytup) · noun
- wyprzeć — ✅ [wyprzeć](/slovo/wyprzec) · verb
- ważyć — ✅ [ważyć](/slovo/wazyc) · verb
- **I teraz, to jest tradycyjna receptura, ale oczywiście dopasowana nieco do współczesnych gustów.**  
  <sub>слова: [i](/slovo/i), [teraz](/slovo/teraz), [to](/slovo/to), [być](/slovo/byc), [tradycyjny](/slovo/tradycyjny), [receptura](/slovo/receptura), [ale](/slovo/ale), [oczywiście](/slovo/oczywiscie), [dopasować](/slovo/dopasowac), [nieco](/slovo/nieco), [do](/slovo/do), [współczesny](/slovo/wspolczesny), [gust](/slovo/gust)</sub>
- **Niektórzy tak mówią.**  
  <sub>слова: [niektóry](/slovo/niektory), [tak](/slovo/tak), [mówić](/slovo/mowic)</sub>
- **Ta whisky trafia od razu wprzódy do beczek z nowego amerykańskiego dębu.**  
  <sub>слова: [ten](/slovo/ten), [whisky](/slovo/whisky), [trafiać](/slovo/trafiac), [od](/slovo/od), [raz](/slovo/raz), [wprzódy](/slovo/wprzody), [do](/slovo/do), [beczka](/slovo/beczka), [z](/slovo/z), [nowy](/slovo/nowy), [amerykański](/slovo/amerykanski), [dąb](/slovo/dab)</sub>
- uderzenie — ✅ [uderzenie](/slovo/uderzenie) · noun
- podniebienie — ✅ [podniebienie](/slovo/podniebienie) · noun
- fanaberia — ✅ [fanaberia](/slovo/fanaberia) · noun
- petent — ✅ [petent](/slovo/petent) · noun
- miedza — ✅ [miedza](/slovo/miedza) · noun
- **Proces norymberski był przełomowy w historii ludzkości.**  
  <sub>слова: [proces](/slovo/proces), [norymberski](/slovo/norymberski), [być](/slovo/byc), [przełomowy](/slovo/przelomowy), [w](/slovo/w), [historia](/slovo/historia), [ludzkość](/slovo/ludzkosc)</sub>
- **Właśnie wówczas, po raz pierwszy pojawił się prawniczy termin zbrodni przeciwko ludzkości.**  
  <sub>слова: [właśnie](/slovo/wlasnie), [wówczas](/slovo/wowczas), [po](/slovo/po), [raz](/slovo/raz), [pierwszy](/slovo/pierwszy), [pojawić](/slovo/pojawic), [się](/slovo/sie), [prawniczy](/slovo/prawniczy), [termin](/slovo/termin), [zbrodnia](/slovo/zbrodnia), [przeciwko](/slovo/przeciwko), [ludzkość](/slovo/ludzkosc)</sub>
- przełomowy — ✅ [przełomowy](/slovo/przelomowy) · adj
- wystrój — ✅ [wystrój](/slovo/wystroj) · noun
- ocaleć — ✅ [ocaleć](/slovo/ocalec) · verb
- niejako — ✅ [niejako](/slovo/niejako) · part
- obręb — ✅ [obręb](/slovo/obreb) · noun
- zburzyć — ✅ [zburzyć](/slovo/zburzyc) · verb
- nawiązywać — ✅ [nawiązywać](/slovo/nawiazywac) · verb
- wzmiankowana — ✅ [wzmiankować](/slovo/wzmiankowac) · verb
- **Zobaczcie jakie to są urocze, piękne maleństwa.**  
  <sub>слова: [zobaczyć](/slovo/zobaczyc), [jaki](/slovo/jaki), [to](/slovo/to), [być](/slovo/byc), [uroczy](/slovo/uroczy), [piękny](/slovo/piekny), [maleństwo](/slovo/malenstwo)</sub>
- przyrządzać — ✅ [przyrządzać](/slovo/przyrzadzac) · verb
- chrzanka — ⛔ не распознано
- zaniedbany — ✅ [zaniedbany](/slovo/zaniedbany) · adj
- **I w ogóle były plany, żeby to wyburzyć.**  
  <sub>слова: [i](/slovo/i), [w](/slovo/w), [ogół](/slovo/ogol), [były](/slovo/byly), [plan](/slovo/plan), [żeby](/slovo/zeby), [to](/slovo/to), [wyburzyć](/slovo/wyburzyc)</sub>
- **i oni nadają temu siły.**  
  <sub>слова: [i](/slovo/i), [on](/slovo/on), [nadawać](/slovo/nadawac), [to](/slovo/to), [siła](/slovo/sila)</sub>
- **To wszystko jest smakiem nie tylko wspaniałym, ale to jest po prostu smak historii.**  
  <sub>слова: [to](/slovo/to), [wszystko](/slovo/wszystko), [być](/slovo/byc), [smak](/slovo/smak), [nie](/slovo/nie), [tylko](/slovo/tylko), [wspaniały](/slovo/wspanialy), [ale](/slovo/ale), [to](/slovo/to), [być](/slovo/byc), [po](/slovo/po), [prosty](/slovo/prosty), [smak](/slovo/smak), [historia](/slovo/historia)</sub>
- **kiedy wszedłeś między wrony, musisz krakać tak jak one**  
  <sub>слова: [kiedy](/slovo/kiedy), [wejść](/slovo/wejsc), [między](/slovo/miedzy), [wrona](/slovo/wrona), [musieć](/slovo/musiec), [krakać](/slovo/krakac), [tak](/slovo/tak), [jak](/slovo/jak), [on](/slovo/on)</sub>
- kiepsko — ✅ [kiepsko](/slovo/kiepsko) · adv
- zmieścić — ✅ [zmieścić](/slovo/zmiescic) · verb
- **I to jeszcze przy słońcu świecącym.**  
  <sub>слова: [i](/slovo/i), [to](/slovo/to), [jeszcze](/slovo/jeszcze), [przy](/slovo/przy), [słońce](/slovo/slonce), [świecić](/slovo/swiecic)</sub>
- **Kim jesteśmy? Dokąd zmierzamy?**  
  <sub>слова: [kto](/slovo/kto), [być](/slovo/byc), [dokąd](/slovo/dokad), [zmierzać](/slovo/zmierzac)</sub>
- obczaić — ✅ [obczaić](/slovo/obczaic) · verb
- zluzować — ✅ [zluzować](/slovo/zluzowac) · verb
- wybredność — ✅ [wybredność](/slovo/wybrednosc) · noun
- bystrość — ✅ [bystrość](/slovo/bystrosc) · noun
- podważać — ✅ [podważać](/slovo/podwazac) · verb
- obrazoburstwo — ✅ [obrazoburstwo](/slovo/obrazoburstwo) · noun
- krygować — ✅ [krygować](/slovo/krygowac) · verb
- rzetelnie — ✅ [rzetelnie](/slovo/rzetelnie) · adv
- zróżnicować — ✅ [zróżnicować](/slovo/zroznicowac) · verb
- odzwierciedlić — ✅ [odzwierciedlić](/slovo/odzwierciedlic) · verb
- **A niechaj narodowie wżdy postronni znają, Iż Polacy nie Gęsi, iż swój język mają**  
  <sub>слова: [a](/slovo/a), [niechaj](/slovo/niechaj), [naród](/slovo/narod), [wżdy](/slovo/wzdy), [postronny](/slovo/postronny), [znać](/slovo/znac), [iż](/slovo/iz), [Polak](/slovo/polak), [nie](/slovo/nie), [gęś](/slovo/ges), [iż](/slovo/iz), [swój](/slovo/swoj), [język](/slovo/jezyk), [mieć](/slovo/miec)</sub>
- szacunek — ✅ [szacunek](/slovo/szacunek) · noun
- przemawiać — ✅ [przemawiać](/slovo/przemawiac) · verb
- uprzywilejowany — ✅ [uprzywilejowany](/slovo/uprzywilejowany) · adj
- kilkanaście — ✅ [kilkanaście](/slovo/kilkanascie) · num
- grono — ✅ [grono](/slovo/grono) · noun
- sejmika — ✅ [sejmik](/slovo/sejmik) · noun
- przysłuchuć — ✅ [przysłuchiwać](/slovo/przysluchiwac) · verb
- waćpan — ✅ [waćpan](/slovo/wacpan) · noun
- kmieć — ✅ [kmieć](/slovo/kmiec) · noun
- warstwa — ✅ [warstwa](/slovo/warstwa) · noun
- modła — ✅ [modła](/slovo/modla) · noun
- oszust — ✅ [oszust](/slovo/oszust) · noun
- zewnątrz — ✅ [zewnątrz](/slovo/zewnatrz) · prep
- irytować — ✅ [irytować](/slovo/irytowac) · verb
- przynajmniej — ✅ [przynajmniej](/slovo/przynajmniej) · part
- przynajmniej — ✅ [przynajmniej](/slovo/przynajmniej) · part
- krawędź — ✅ [krawędź](/slovo/krawedz) · noun
- wykop — ✅ [wykop](/slovo/wykop) · noun
- pnący — ✅ [piąć](/slovo/piac) · verb
- strop — ✅ [strop](/slovo/strop) · noun
- wczesnośredniowieczny — ✅ [wczesnośredniowieczny](/slovo/wczesnosredniowieczny) · adj
- podgrodzie — ✅ [podgrodzie](/slovo/podgrodzie) · noun
- śmieć — ✅ [śmieć](/slovo/smiec) · verb
- **Dawniej większości odpadów nie**  
  <sub>слова: [dawno](/slovo/dawno), [większość](/slovo/wiekszosc), [odpad](/slovo/odpad), [nie](/slovo/nie)</sub>
- **wywożono. Nie było też żadnych pszok-ów.**  
  <sub>слова: [wywozić](/slovo/wywozic), [nie](/slovo/nie), [być](/slovo/byc), [też](/slovo/tez), [żaden](/slovo/zaden), ~~pszok~~, [ów](/slovo/ow)</sub>
- nawarstwienie — ✅ [nawarstwić](/slovo/nawarstwic) · verb
- odnaleźć — ✅ [odnaleźć](/slovo/odnalezc) · verb
- zbagatelizować — ✅ [zbagatelizować](/slovo/zbagatelizowac) · verb
- niepostrzeżenie — ✅ [niepostrzeżenie](/slovo/niepostrzezenie) · adv
- zwarty — ✅ [zwarty](/slovo/zwarty) · adj
- skojarzyć — ✅ [skojarzyć](/slovo/skojarzyc) · verb
- nietrwale — ✅ [nietrwale](/slovo/nietrwale) · adv
- wypiętrzać — ✅ [wypiętrzać](/slovo/wypietrzac) · verb
- nieuchronnie — ✅ [nieuchronnie](/slovo/nieuchronnie) · adv
- wypiętrzenie — ✅ [wypiętrzenie](/slovo/wypietrzenie) · noun
- napotkać — ✅ [napotkać](/slovo/napotkac) · verb
- wszędzie — ✅ [wszędzie](/slovo/wszedzie) · adv
- indziej — ✅ [indziej](/slovo/indziej) · adv
- ekierka — ✅ [ekierka](/slovo/ekierka) · noun
- pionowy — ✅ [pionowy](/slovo/pionowy) · adj
- podszywać — ✅ [podszywać](/slovo/podszywac) · verb
- przedostatni — ✅ [przedostatni](/slovo/przedostatni) · adj
- szopa — ✅ [szopa](/slovo/szopa) · noun
- eternit — ✅ [eternit](/slovo/eternit) · noun
- odekierka — ⛔ не распознано
- obtłukać — ⛔ не распознано
- odwrzucać — ⛔ не распознано
- skansen — ✅ [skansen](/slovo/skansen) · noun
- strzechę — ✅ [strzecha](/slovo/strzecha) · noun
- wianek — ✅ [wianek](/slovo/wianek) · noun
- zwalczać — ✅ [zwalczać](/slovo/zwalczac) · verb
- żywioł — ✅ [żywioł](/slovo/zywiol) · noun
- psuć — ✅ [psuć](/slovo/psuc) · verb
- patyk — ✅ [patyk](/slovo/patyk) · noun
- czeluść — ✅ [czeluść](/slovo/czelusc) · noun
- wyobrażenie — ✅ [wyobrażenie](/slovo/wyobrazenie) · noun
- **Dobrze, dobrze. To już skoro Kamil zahaczył, to kolejna rzecz, która mnie po prostu doprowadza do szewskiej pasji, to właśnie jak bardzo ozdobione są te wszystkie chłopskie izby i to w miejscach, gdzie teoretycznie wygląd tej chaty sugerowałby, że jest to domostwo na przykład z połowy XIX wieku.**  
  <sub>слова: [dobrze](/slovo/dobrze), [dobrze](/slovo/dobrze), [to](/slovo/to), [już](/slovo/juz), [skoro](/slovo/skoro), ~~Kamil~~, [zahaczyć](/slovo/zahaczyc), [to](/slovo/to), [kolejny](/slovo/kolejny), [rzecz](/slovo/rzecz), [który](/slovo/ktory), [ja](/slovo/ja), [po](/slovo/po), [prosty](/slovo/prosty), [doprowadzać](/slovo/doprowadzac), [do](/slovo/do), [szewski](/slovo/szewski), [pasja](/slovo/pasja), [to](/slovo/to), [właśnie](/slovo/wlasnie), [jak](/slovo/jak), [bardzo](/slovo/bardzo), [ozdobić](/slovo/ozdobic), [być](/slovo/byc), [ten](/slovo/ten), [wszystek](/slovo/wszystek), [chłopski](/slovo/chlopski), [izba](/slovo/izba), [i](/slovo/i), [to](/slovo/to), [w](/slovo/w), [miejsce](/slovo/miejsce), [gdzie](/slovo/gdzie), [teoretycznie](/slovo/teoretycznie), [wygląd](/slovo/wyglad), [ten](/slovo/ten), [chata](/slovo/chata), [sugerować](/slovo/sugerowac), [że](/slovo/ze), [być](/slovo/byc), [to](/slovo/to), [domostwo](/slovo/domostwo), [na](/slovo/na), [przykład](/slovo/przyklad), [z](/slovo/z), [połowa](/slovo/polowa), ~~XIX~~, [wiek](/slovo/wiek)</sub>
- sugerowałyby — ✅ [sugerować](/slovo/sugerowac) · verb
- cepelia — ✅ [cepelia](/slovo/cepelia) · noun
- guzik — ✅ [guzik](/slovo/guzik) · noun
- nęta — ✅ [nęta](/slovo/neta) · noun
- ozdoba — ✅ [ozdoba](/slovo/ozdoba) · noun
- mit — ✅ [mit](/slovo/mit) · noun
- przymus — ✅ [przymus](/slovo/przymus) · noun
- wdrożyć — ✅ [wdrożyć](/slovo/wdrozyc) · verb
- przecież — ✅ [przecież](/slovo/przeciez) · part
- wgłębiać — ✅ [wgłębiać](/slovo/wglebiac) · verb
- rozszerzać — ✅ [rozszerzać](/slovo/rozszerzac) · verb
- rzemieślniczo — ✅ [rzemieślniczo](/slovo/rzemieslniczo) · adv
- zewnątrz — ✅ [zewnątrz](/slovo/zewnatrz) · prep
- podstawowy — ✅ [podstawowy](/slovo/podstawowy) · adj
- przytrzasnąć — ✅ [przytrzasnąć](/slovo/przytrzasnac) · verb
- kratka — ✅ [kratka](/slovo/kratka) · noun
- szczelny — ✅ [szczelny](/slovo/szczelny) · adj
- pierzyna — ✅ [pierzyna](/slovo/pierzyna) · noun
- **domostwa w dużym stopniu używane. skrzynię wianne, tam się trzyma sprzęty,**  
  <sub>слова: [domostwo](/slovo/domostwo), [w](/slovo/w), [duży](/slovo/duzy), [stopień](/slovo/stopien), [używać](/slovo/uzywac), [skrzynia](/slovo/skrzynia), ~~wianne~~, [tam](/slovo/tam), [się](/slovo/sie), [trzymać](/slovo/trzymac), [sprzęt](/slovo/sprzet)</sub>
- wnętrze — ✅ [wnętrze](/slovo/wnetrze) · noun
- zewnętrze — ✅ [zewnętrze](/slovo/zewnetrze) · noun
- współczesny — ✅ [współczesny](/slovo/wspolczesny) · adj
- rzemieślniczy — ✅ [rzemieślniczy](/slovo/rzemieslniczy) · adj
- równowaga — ✅ [równowaga](/slovo/rownowaga) · noun
- zrębowy — ✅ [zrębowy](/slovo/zrebowy) · adj
- ulewa — ✅ [ulewa](/slovo/ulewa) · noun
- obelga — ✅ [obelga](/slovo/obelga) · noun
- wylewka — ✅ [wylewka](/slovo/wylewka) · noun
- przycies — ⛔ не распознано
- ewenement — ✅ [ewenement](/slovo/ewenement) · noun
- klepisko — ✅ [klepisko](/slovo/klepisko) · noun
- plewa — ✅ [plewa](/slovo/plewa) · noun
- bezpośrednio — ✅ [bezpośrednio](/slovo/bezposrednio) · adv
- odkruszać — ✅ [odkruszać](/slovo/odkruszac) · verb
- uszkodzenie — ✅ [uszkodzenie](/slovo/uszkodzenie) · noun
- wylepiać — ✅ [wylepiać](/slovo/wylepiac) · verb
- utrzymać — ✅ [utrzymać](/slovo/utrzymac) · verb
- porać — ✅ [porać](/slovo/porac) · verb
- najrzadziej — ✅ [rzadko](/slovo/rzadko) · adv
- pęknąć — ✅ [pęknąć](/slovo/peknac) · verb
- zapakucić — ⛔ не распознано
- grzać — ✅ [grzać](/slovo/grzac) · verb
- nieporządek — ✅ [nieporządek](/slovo/nieporzadek) · noun
- rozpowszechniać — ✅ [rozpowszechniać](/slovo/rozpowszechniac) · verb
- łych — ⛔ не распознано
- kredens — ✅ [kredens](/slovo/kredens) · noun
- zamożny — ✅ [zamożny](/slovo/zamozny) · adj
- sprzęt — ✅ [sprzęt](/slovo/sprzet) · noun
- sięgać — ✅ [sięgać](/slovo/siegac) · verb
- zboże — ✅ [zboże](/slovo/zboze) · noun
- prędko — ✅ [prędko](/slovo/predko) · adv
- szuflą — ✅ [szufla](/slovo/szufla) · noun
- wygarnać — ✅ [wygarnąć](/slovo/wygarnac) · verb
- przeszkadzać — ✅ [przeszkadzać](/slovo/przeszkadzac) · verb
- brak — ✅ [brak](/slovo/brak) · noun
- przewracać — ✅ [przewracać](/slovo/przewracac) · verb
- zeżreć — ✅ [zeżreć](/slovo/zezrec) · verb
- bajoro — ✅ [bajoro](/slovo/bajoro) · noun
- wnętrze — ✅ [wnętrze](/slovo/wnetrze) · noun
- rzucić — ✅ [rzucić](/slovo/rzucic) · verb
- zazdrość — ✅ [zazdrość](/slovo/zazdrosc) · noun
- nastolatek — ✅ [nastolatek](/slovo/nastolatek) · noun
- trójkątny — ✅ [trójkątny](/slovo/trojkatny) · adj
- otwór — ✅ [otwór](/slovo/otwor) · noun
- dziura — ✅ [dziura](/slovo/dziura) · noun
- **chodzić chyłkiem**  
  <sub>слова: [chodzić](/slovo/chodzic), [chyłkiem](/slovo/chylkiem)</sub>
- błona — ✅ [błona](/slovo/blona) · noun
- zabytek — ✅ [zabytek](/slovo/zabytek) · noun
- zawał — ✅ [zawał](/slovo/zawal) · noun
- odpicować — ✅ [odpicować](/slovo/odpicowac) · verb
- prowizoryczność — ✅ [prowizoryczność](/slovo/prowizorycznosc) · noun
- Pokrzywo — ✅ [pokrzywa](/slovo/pokrzywa) · noun
- oschły — ✅ [oschły](/slovo/oschly) · adj
- nacechowane — ✅ [nacechować](/slovo/nacechowac) · verb
- ulec — ✅ [ulec](/slovo/ulec) · verb
- sugerować — ✅ [sugerować](/slovo/sugerowac) · verb
- łechtać — ✅ [łechtać](/slovo/lechtac) · verb
- duma — ✅ [duma](/slovo/duma) · noun
- jarzmo — ✅ [jarzmo](/slovo/jarzmo) · noun
- dziedzictwo — ✅ [dziedzictwo](/slovo/dziedzictwo) · noun
- łączny — ✅ [łączny](/slovo/laczny) · adj
- przekraczać — ✅ [przekraczać](/slovo/przekraczac) · verb
- przednówek — ✅ [przednówek](/slovo/przednowek) · noun
- **Na przednówku nadal zmagał się z głodem.**  
  <sub>слова: [na](/slovo/na), [przednówek](/slovo/przednowek), [nadal](/slovo/nadal), [zmagać](/slovo/zmagac), [się](/slovo/sie), [z](/slovo/z), [głód](/slovo/glod)</sub>
- wybitny — ✅ [wybitny](/slovo/wybitny) · adj
- gospodarka — ✅ [gospodarka](/slovo/gospodarka) · noun
- nędza — ✅ [nędza](/slovo/nedza) · noun
- nędzarz — ✅ [nędzarz](/slovo/nedzarz) · noun
- montownia — ✅ [montownia](/slovo/montownia) · noun
- ówczesny — ✅ [ówczesny](/slovo/owczesny) · adj
- wyzbywać — ✅ [wyzbywać](/slovo/wyzbywac) · verb
- pułapka — ✅ [pułapka](/slovo/pulapka) · noun
- włóczęgostwo — ✅ [włóczęgostwo](/slovo/wloczegostwo) · noun
- **a propos**  
  <sub>слова: [a](/slovo/a), [propos](/slovo/propos)</sub>
- **Sudan to państwo będące od ponad trzech lat w stanie wojny.**  
  <sub>слова: ~~Sudan~~, [to](/slovo/to), [państwo](/slovo/panstwo), [być](/slovo/byc), [od](/slovo/od), [ponad](/slovo/ponad), [trzy](/slovo/trzy), [rok](/slovo/rok), [w](/slovo/w), [stan](/slovo/stan), [wojna](/slovo/wojna)</sub>
- toczącą — ✅ [toczyć](/slovo/toczyc) · verb
- stanowić — ✅ [stanowić](/slovo/stanowic) · verb
- rdzenny — ✅ [rdzenny](/slovo/rdzenny) · adj
- zróżnicowanie — ✅ [zróżnicowanie](/slovo/zroznicowanie) · noun
- przekleństwo — ✅ [przekleństwo](/slovo/przeklenstwo) · noun
- spichlerz — ✅ [spichlerz](/slovo/spichlerz) · noun
- kłótnia — ✅ [kłótnia](/slovo/klotnia) · noun
- pogrążać — ✅ [pogrążać](/slovo/pograzac) · verb
- tlący — ✅ [tlić](/slovo/tlic) · verb
- zadłużeniowy — ✅ [zadłużeniowy](/slovo/zadluzeniowy) · adj
- **kres nadejdzie dopiero**  
  <sub>слова: [kres](/slovo/kres), [nadejść](/slovo/nadejsc), [dopiero](/slovo/dopiero)</sub>
- dowódca — ✅ [dowódca](/slovo/dowodca) · noun
- ośmiornica — ✅ [ośmiornica](/slovo/osmiornica) · noun
- przestrzeń — ✅ [przestrzeń](/slovo/przestrzen) · noun
- rzeczywistość — ✅ [rzeczywistość](/slovo/rzeczywistosc) · noun
- złożoność — ✅ [złożoność](/slovo/zlozonosc) · noun
- **Złożoność tego świata jest naprawdę ciekawa.**  
  <sub>слова: [złożoność](/slovo/zlozonosc), [ten](/slovo/ten), [świat](/slovo/swiat), [być](/slovo/byc), [naprawdę](/slovo/naprawde), [ciekawy](/slovo/ciekawy)</sub>
- łączyć — ✅ [łączyć](/slovo/laczyc) · verb
- dzielić — ✅ [dzielić](/slovo/dzielic) · verb
- zachęcać — ✅ [zachęcać](/slovo/zachecac) · verb
- odrzucać — ✅ [odrzucać](/slovo/odrzucac) · verb
- niezdrowy — ✅ [niezdrowy](/slovo/niezdrowy) · adj
- wyspa — ✅ [wyspa](/slovo/wyspa) · noun
- Animoje — 🔤 имя собственное
- rządzący — ✅ [rządzący](/slovo/rzadzacy) · adj
- namacalny — ✅ [namacalny](/slovo/namacalny) · adj
- skrótowo — ✅ [skrótowo](/slovo/skrotowo) · adv
- przeciwieństwo — ✅ [przeciwieństwo](/slovo/przeciwienstwo) · noun
- przejąć — ✅ [przejąć](/slovo/przejac) · verb
- winda — ✅ [winda](/slovo/winda) · noun
- **Jak mam się dostać do środka?**  
  <sub>слова: [jak](/slovo/jak), [mama](/slovo/mama), [się](/slovo/sie), [dostać](/slovo/dostac), [do](/slovo/do), [środek](/slovo/srodek)</sub>
- przecież — ✅ [przecież](/slovo/przeciez) · part
- musnął — ✅ [musnąć](/slovo/musnac) · verb
- **Uważaj no!**  
  <sub>слова: [uważać](/slovo/uwazac), [no](/slovo/no)</sub>
- malowniczy — ✅ [malowniczy](/slovo/malowniczy) · adj
- zdjęcie — ✅ [zdjęcie](/slovo/zdjecie) · noun
- wąwóz — ✅ [wąwóz](/slovo/wawoz) · noun
- **Niestety tym razem nie udało się tam dotrzeć.**  
  <sub>слова: [niestety](/slovo/niestety), [ten](/slovo/ten), [raz](/slovo/raz), [nie](/slovo/nie), [udać](/slovo/udac), [się](/slovo/sie), [tam](/slovo/tam), [dotrzeć](/slovo/dotrzec)</sub>
- przekąsić — ✅ [przekąsić](/slovo/przekasic) · verb
- **Płynął z Cypru na grecką wyspę Rodos, którą pewnie większość z was kojarzy.**  
  <sub>слова: [płynąć](/slovo/plynac), [z](/slovo/z), ~~Cypru~~, [na](/slovo/na), [grecki](/slovo/grecki), [wyspa](/slovo/wyspa), ~~Rodos~~, [który](/slovo/ktory), [pewnie](/slovo/pewnie), [większość](/slovo/wiekszosc), [z](/slovo/z), [wy](/slovo/wy), [kojarzyć](/slovo/kojarzyc)</sub>
- śmigłowiec — ✅ [śmigłowiec](/slovo/smiglowiec) · noun
- ląd — ✅ [ląd](/slovo/lad) · noun
- urokliwy — ✅ [urokliwy](/slovo/urokliwy) · adj
- nawiązywać — ✅ [nawiązywać](/slovo/nawiazywac) · verb
- połączenie — ✅ [połączenie](/slovo/polaczenie) · noun
- **Alicja wkrótce doszła do wniosku, że to doprawdy bardzo trudna gra**  
  <sub>слова: ~~Alicja~~, [wkrótce](/slovo/wkrotce), [dojść](/slovo/dojsc), [do](/slovo/do), [wniosek](/slovo/wniosek), [że](/slovo/ze), [to](/slovo/to), [doprawdy](/slovo/doprawdy), [bardzo](/slovo/bardzo), [trudny](/slovo/trudny), [gra](/slovo/gra)</sub>
- przynajmniej — ✅ [przynajmniej](/slovo/przynajmniej) · part
- pęknąć — ✅ [pęknąć](/slovo/peknac) · verb
- wciąż — ✅ [wciąż](/slovo/wciaz) · adv
- **nie ma się czym tak chełpić**  
  <sub>слова: [nie](/slovo/nie), [mieć](/slovo/miec), [się](/slovo/sie), [co](/slovo/co), [tak](/slovo/tak), [chełpić](/slovo/chelpic)</sub>
- **Nigdy się nad tym nie zastanawiałam**  
  <sub>слова: [nigdy](/slovo/nigdy), [się](/slovo/sie), [nad](/slovo/nad), [ten](/slovo/ten), [nie](/slovo/nie), [zastanawiać](/slovo/zastanawiac)</sub>
- **Alicja nic nie powiedziała; usiadła z twarzą w dłoniach, zastanawiając się, czy cokolwiek kiedykolwiek znów potoczy się naturalnie.**  
  <sub>слова: ~~Alicja~~, [nic](/slovo/nic), [nie](/slovo/nie), [powiedzieć](/slovo/powiedziec), [usiąść](/slovo/usiasc), [z](/slovo/z), [twarz](/slovo/twarz), [w](/slovo/w), [dłoń](/slovo/dlon), [zastanawiać](/slovo/zastanawiac), [się](/slovo/sie), [czy](/slovo/czy), [cokolwiek](/slovo/cokolwiek), [kiedykolwiek](/slovo/kiedykolwiek), [znów](/slovo/znow), [potoczyć](/slovo/potoczyc), [się](/slovo/sie), [naturalnie](/slovo/naturalnie)</sub>
- zaprzeczać — ✅ [zaprzeczać](/slovo/zaprzeczac) · verb
- wór — ✅ [wór](/slovo/wor) · noun
- strącając — ✅ [strącać](/slovo/stracac) · verb
- przecież — ✅ [przecież](/slovo/przeciez) · part
- zatankować — ✅ [zatankować](/slovo/zatankowac) · verb
- zwłaszcza — ✅ [zwłaszcza](/slovo/zwlaszcza) · conj
- bywać — ✅ [bywać](/slovo/bywac) · verb
- rywalizować — ✅ [rywalizować](/slovo/rywalizowac) · verb
- ostentacyjny — ✅ [ostentacyjny](/slovo/ostentacyjny) · adj
- nadejść — ✅ [nadejść](/slovo/nadejsc) · verb
- rdzynymi — ✅ [rdzenny](/slovo/rdzenny) · adj
- przeciwieństwo — ✅ [przeciwieństwo](/slovo/przeciwienstwo) · noun
- ingerencja — ✅ [ingerencja](/slovo/ingerencja) · noun
- popękać — ✅ [popękać](/slovo/popekac) · verb
- wyblakły — ✅ [wyblakły](/slovo/wyblakly) · adj
- garncarski — ✅ [garncarski](/slovo/garncarski) · adj
- zardzewieć — ✅ [zardzewieć](/slovo/zardzewiec) · verb
- wyrób — ✅ [wyrób](/slovo/wyrob) · noun
- założyć — ✅ [założyć](/slovo/zalozyc) · verb
- łobuziak — ✅ [łobuziak](/slovo/lobuziak) · noun
- śmigał — ✅ [śmigać](/slovo/smigac) · verb
- koleś — ✅ [koleś](/slovo/koles) · noun
- przegapić — ✅ [przegapić](/slovo/przegapic) · verb
- splądrować — ✅ [splądrować](/slovo/spladrowac) · verb
- złożyć — ✅ [złożyć](/slovo/zlozyc) · verb
- zużycie — ✅ [zużycie](/slovo/zuzycie) · noun
- strefa — ✅ [strefa](/slovo/strefa) · noun
- lornetka — ✅ [lornetka](/slovo/lornetka) · noun
- zakłycać — ✅ [zakłócać](/slovo/zaklocac) · verb
- przejąć — ✅ [przejąć](/slovo/przejac) · verb
- szpargał — ✅ [szpargał](/slovo/szpargal) · noun
- żarówka — ✅ [żarówka](/slovo/zarowka) · noun
- wszakże — ✅ [wszakże](/slovo/wszakze) · part
- plansza — ✅ [plansza](/slovo/plansza) · noun
- nieruchomość — ✅ [nieruchomość](/slovo/nieruchomosc) · noun
- marnieć — ✅ [marnieć](/slovo/marniec) · verb
- kąpielówek — ✅ [kąpielówki](/slovo/kapielowki) · noun
- tło — ✅ [tło](/slovo/tlo) · noun
- wart — ✅ [wart](/slovo/wart) · adj
- odzyskać — ✅ [odzyskać](/slovo/odzyskac) · verb
- zapożyczenie — ✅ [zapożyczenie](/slovo/zapozyczenie) · noun
- przestawiać — ✅ [przestawiać](/slovo/przestawiac) · verb
- narzekać — ✅ [narzekać](/slovo/narzekac) · verb
- cypelku — ✅ [cypelek](/slovo/cypelek) · noun
- psuć — ✅ [psuć](/slovo/psuc) · verb
- zacny — ✅ [zacny](/slovo/zacny) · adj
- leżyte — ⛔ не распознано
- szybro — ⛔ не распознано
- pochodzić — ✅ [pochodzić](/slovo/pochodzic) · verb
- sprężysty — ✅ [sprężysty](/slovo/sprezysty) · adj
- zwycięzca — ✅ [zwycięzca](/slovo/zwyciezca) · noun
- syczeć — ✅ [syczeć](/slovo/syczec) · verb
- węglowodać — ✅ [węglowodan](/slovo/weglowodan) · noun
- wpisać — ✅ [wpisać](/slovo/wpisac) · verb
- szczep — ✅ [szczep](/slovo/szczep) · noun
- bieżąco — ✅ [bieżąco](/slovo/biezaco) · adv
- rozpruwać — ✅ [rozpruwać](/slovo/rozpruwac) · verb
- rewelka — ⛔ не распознано
- piętrowy — ✅ [piętrowy](/slovo/pietrowy) · adj
- nadjeżdżać — ✅ [nadjeżdżać](/slovo/nadjezdzac) · verb
- posiadać — ✅ [posiadać](/slovo/posiadac) · verb
- kopł — ⛔ не распознано
- wynosić — ✅ [wynosić](/slovo/wynosic) · verb
- śmigać — ✅ [śmigać](/slovo/smigac) · verb
- gąszczy — ✅ [gąszcz](/slovo/gaszcz) · noun
- bodaj — ✅ [bodaj](/slovo/bodaj) · part
- laik — ✅ [laik](/slovo/laik) · noun
- założenie — ✅ [założenie](/slovo/zalozenie) · noun
- wielokrotnie — ✅ [wielokrotnie](/slovo/wielokrotnie) · adv
- występować — ✅ [występować](/slovo/wystepowac) · verb
- zwróćcie — ✅ [zwrócić](/slovo/zwrocic) · verb
- ujęcie — ✅ [ujęcie](/slovo/ujecie) · noun
- piesi — ✅ [pieszy](/slovo/pieszy) · adj
- potocznie — ✅ [potocznie](/slovo/potocznie) · adv
- taras — ✅ [taras](/slovo/taras) · noun
- promień — ✅ [promień](/slovo/promien) · noun
- odbijać — ✅ [odbijać](/slovo/odbijac) · verb
- wycieraczka — ✅ [wycieraczka](/slovo/wycieraczka) · noun
- skubaniec — ✅ [skubaniec](/slovo/skubaniec) · noun
- polecam — ✅ [polecać](/slovo/polecac) · verb
- polecać — ✅ [polecać](/slovo/polecac) · verb
- tor — ✅ [tor](/slovo/tor) · noun
- puszka — ✅ [puszka](/slovo/puszka) · noun
- zachęcać — ✅ [zachęcać](/slovo/zachecac) · verb
- zakres — ✅ [zakres](/slovo/zakres) · noun
- widmo — ✅ [widmo](/slovo/widmo) · noun
- czynny — ✅ [czynny](/slovo/czynny) · adj
- gdzieniegdzie — ✅ [gdzieniegdzie](/slovo/gdzieniegdzie) · adv
- spłukać — ✅ [spłukać](/slovo/splukac) · verb
- nieobecność — ✅ [nieobecność](/slovo/nieobecnosc) · noun
- przytłaczać — ✅ [przytłaczać](/slovo/przytlaczac) · verb
- przytłaczające — ✅ [przytłaczający](/slovo/przytlaczajacy) · adj
- tętnić — ✅ [tętnić](/slovo/tetnic) · verb
- zwycięski — ✅ [zwycięski](/slovo/zwycieski) · adj
- przejść — ✅ [przejść](/slovo/przejsc) · verb
- przejście — ✅ [przejście](/slovo/przejscie) · noun
- jeńc — ✅ [jeniec](/slovo/jeniec) · noun
- prastara — ✅ [prastary](/slovo/prastary) · adj
- niedźwiedziagi — ⛔ не распознано
- przekazać — ✅ [przekazać](/slovo/przekazac) · verb
- pstrokaty — ✅ [pstrokaty](/slovo/pstrokaty) · adj
- **Wbrew pozorom, bo wszyscy narzekają na kuchnię brytyjską**  
  <sub>слова: [wbrew](/slovo/wbrew), [pozór](/slovo/pozor), [bo](/slovo/bo), [wszyscy](/slovo/wszyscy), [narzekać](/slovo/narzekac), [na](/slovo/na), [kuchnia](/slovo/kuchnia), [brytyjski](/slovo/brytyjski)</sub>
- narzekać — ✅ [narzekać](/slovo/narzekac) · verb
- wbrew — ✅ [wbrew](/slovo/wbrew) · prep
- pozór — ✅ [pozór](/slovo/pozor) · noun
- ledwo — ✅ [ledwo](/slovo/ledwo) · adv
- **Jest taki tłok, że po prostu ledwo weszliśmy, musieliśmy się wepchać.**  
  <sub>слова: [być](/slovo/byc), [taki](/slovo/taki), [tłok](/slovo/tlok), [że](/slovo/ze), [po](/slovo/po), [prosty](/slovo/prosty), [ledwo](/slovo/ledwo), [wejść](/slovo/wejsc), [musieć](/slovo/musiec), [się](/slovo/sie), [wepchać](/slovo/wepchac)</sub>
- szczyt — ✅ [szczyt](/slovo/szczyt) · noun
- podążać — ✅ [podążać](/slovo/podazac) · verb
- podążając — ✅ [podążać](/slovo/podazac) · verb
- ściemy — ✅ [ściema](/slovo/sciema) · noun
- **nie skłam**  
  <sub>слова: [nie](/slovo/nie), [skłamać](/slovo/sklamac)</sub>
- soczewica — ✅ [soczewica](/slovo/soczewica) · noun
- Czicie — 🔤 имя собственное
- syf — ✅ [syf](/slovo/syf) · noun
- wypas — ✅ [wypas](/slovo/wypas) · noun
- wyluzować — ✅ [wyluzować](/slovo/wyluzowac) · verb
- luz — ✅ [luz](/slovo/luz) · noun
- wszędzie — ✅ [wszędzie](/slovo/wszedzie) · adv
- przyjemność — ✅ [przyjemność](/slovo/przyjemnosc) · noun
- króciutko — ✅ [króciutko](/slovo/krociutko) · adv
- gadać — ✅ [gadać](/slovo/gadac) · verb
- aczkolwiek — ✅ [aczkolwiek](/slovo/aczkolwiek) · conj
- baszkanka — ⛔ не распознано
- pozbawionych — ✅ [pozbawić](/slovo/pozbawic) · verb
- pochylić — ✅ [pochylić](/slovo/pochylic) · verb
- powszechny — ✅ [powszechny](/slovo/powszechny) · adj
- swoistość — ✅ [swoistość](/slovo/swoistosc) · noun
- oszczędność — ✅ [oszczędność](/slovo/oszczednosc) · noun
- dążyć — ✅ [dążyć](/slovo/dazyc) · verb
- utarte — ✅ [utarty](/slovo/utarty) · adj
- przyzwyczajenie — ✅ [przyzwyczajenie](/slovo/przyzwyczajenie) · noun
- skupiać — ✅ [skupiać](/slovo/skupiac) · verb
- wówczas — ✅ [wówczas](/slovo/wowczas) · adv
- czołowy — ✅ [czołowy](/slovo/czolowy) · adj
- skupić — ✅ [skupić](/slovo/skupic) · verb
- zbagatelizować — ✅ [zbagatelizować](/slovo/zbagatelizowac) · verb
- sklecić — ✅ [sklecić](/slovo/sklecic) · verb
- zasadniczy — ✅ [zasadniczy](/slovo/zasadniczy) · adj
- posiaść — ✅ [posiąść](/slovo/posiasc) · verb
- umiejętność — ✅ [umiejętność](/slovo/umiejetnosc) · noun
- doskwierać — ✅ [doskwierać](/slovo/doskwierac) · verb
- prawidłowość — ✅ [prawidłowość](/slovo/prawidlowosc) · noun
- szeregowy — ✅ [szeregowy](/slovo/szeregowy) · adj
- trwalszy — ✅ [trwały](/slovo/trwaly) · adj
- **"Nie przesuwajcie!" or "Proszę nie przesuwać!"**  
  <sub>слова: [nie](/slovo/nie), [przesuwać](/slovo/przesuwac), ~~or~~, [prosić](/slovo/prosic), [nie](/slovo/nie), [przesuwać](/slovo/przesuwac)</sub>
- rzetelny — ✅ [rzetelny](/slovo/rzetelny) · adj
- imponujący — ✅ [imponujący](/slovo/imponujacy) · adj
- kojarzyć — ✅ [kojarzyć](/slovo/kojarzyc) · verb
- zrębisty — ⛔ не распознано
- mijać — ✅ [mijać](/slovo/mijac) · verb
- zaciążyć — ✅ [zaciążyć](/slovo/zaciazyc) · verb
- dziedzictwo — ✅ [dziedzictwo](/slovo/dziedzictwo) · noun
- przełamać — ✅ [przełamać](/slovo/przelamac) · verb
- przytłaczającej — ✅ [przytłaczający](/slovo/przytlaczajacy) · adj

### Raw words
