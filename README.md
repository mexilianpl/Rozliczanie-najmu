# Kalkulator Najmu v2.0.0

Nowa aplikacja do obsługi dwóch mieszkań: Spokojna i Wrocławska.

## Dane przeniesione z Excela
- Źródło: `kalkulator wynajmu 2021.xlsm`
- 81 miesięcy szczegółowych arkuszy: październik 2019 – sierpień 2026
- Czynsze, administracja, gaz, prąd, inne pozycje, najemcy i sumy
- Zachowany także moduł końcowego rozliczenia Wrocławskiej z aktualnymi odczytami i potrąceniami

## Funkcje
- ciemny dashboard dla dwóch mieszkań
- widoczne zdjęcie każdego mieszkania (można wgrać własne)
- szybkie rozliczenie miesiąca
- edytowalny czynsz najmu i administracyjny
- dodawanie dowolnych innych opłat
- rachunek za gaz/prąd ze zdjęcia + lokalne OCR (Tesseract.js)
- historia z wieloletniego Excela
- rozliczenie końcowe najemcy z kaucją i PDF
- moduł ogłoszeń z galerią zdjęć i generowaniem tekstu
- import/eksport kopii danych JSON
- numer wersji u góry aplikacji

## GitHub Pages
Podmień/dodaj:
- `index.html`
- `style.css`
- `app.js`
- `history-data.js`

OCR i bezpośredni PDF korzystają z bibliotek ładowanych z CDN, więc wymagają połączenia z internetem.
