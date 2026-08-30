# Kalkulator Najmu v2.0.6

Nowości:
- roczne podsumowanie jak w pierwszej stronie starego arkusza:
  - Razem brutto / podatek 8,5% / Razem netto,
  - Spokojna brutto / podatek / netto,
  - Wrocławska brutto / podatek / netto,
- nowa sekcja `Podatki / księgowa`,
- tabela 12 miesięcy z przychodem z obu mieszkań i podatkiem 8,5%,
- dla każdego miesiąca można wpisać faktycznie zapłacony podatek,
- dla każdego miesiąca można dołączyć potwierdzenie wpłaty do Urzędu Skarbowego (PDF lub zdjęcie),
- potwierdzenia są przechowywane lokalnie w przeglądarce w IndexedDB,
- `Pobierz zestawienie PDF` tworzy roczne zestawienie dla księgowej,
- `Pobierz paczkę dla księgowej` tworzy ZIP zawierający:
  - zestawienie roczne PDF,
  - zestawienie CSV,
  - wszystkie dołączone potwierdzenia wpłat US.

Ważne:
- pliki potwierdzeń są zapisane lokalnie na tym urządzeniu/w tej przeglądarce; nie są wysyłane na GitHub.
- jeżeli wyczyścisz dane przeglądarki, pliki mogą zostać usunięte. Dlatego na koniec roku warto pobrać paczkę ZIP jako kopię.

Nowy zewnętrzny moduł: JSZip z CDN.

Link po publikacji:
https://mexilianpl.github.io/Rozliczanie-najmu/?v=2060830
