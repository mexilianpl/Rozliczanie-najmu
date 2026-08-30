# Kalkulator Najmu v2.0.5

Nowość: podsumowanie najmu i podatku 8,5% na Pulpicie.

Na podstawie arkusza `Suma_wpłat` z pliku `kalkulator wynajmu 2021.xlsm`:
- osobno pokazuje przychód z czynszu Spokojnej,
- osobno pokazuje przychód z czynszu Wrocławskiej,
- sumuje oba przychody,
- liczy podatek ryczałtowy 8,5%,
- pokazuje kwotę po podatku,
- pozwala wpisać podatek już zapłacony,
- automatycznie pokazuje pozostałe `DO ZAPŁATY`, `ROZLICZONE` lub `NADPŁATA`.

Podstawa podatku w tym panelu to tylko czynsz najmu — zgodnie z logiką arkusza `Suma_wpłat`.
Opłaty administracyjne, gaz, prąd i inne rozliczenia najemcy nie są dodawane do tej podstawy.

Dodatkowo v2.0.5 migruje dane zapisane lokalnie z wcześniejszych wersji v2.0.0–v2.0.4.

Struktura:
- index.html
- style.css
- app.js
- apartments/spokojna.js
- apartments/wroclawska.js
- data/history-spokojna.js
- data/history-wroclawska.js
- data/tax.js

Po publikacji:
https://mexilianpl.github.io/Rozliczanie-najmu/?v=2050830
