# Kalkulator Najmu v2.0.2

Zmiany:
- PDF jest generowany również dla miesięcznego rozliczenia z przycisku „Wyślij”.
- Na telefonach, które obsługują udostępnianie plików z przeglądarki, PDF jest przekazywany do systemowego menu udostępniania. Stamtąd można wybrać WhatsApp, Messenger lub e-mail.
- Gdy przeglądarka tego nie obsługuje, PDF jest automatycznie pobierany, a wybrana aplikacja otwierana z gotową treścią.
- Spokojna i Wrocławska mają osobne pliki konfiguracji i osobne pliki historii.

Struktura:
- index.html
- style.css
- app.js
- apartments/spokojna.js
- apartments/wroclawska.js
- data/history-spokojna.js
- data/history-wroclawska.js

Po aktualizacji usuń stary plik history-data.js z repozytorium, bo nie jest już używany.
