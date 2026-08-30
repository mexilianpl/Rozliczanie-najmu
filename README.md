# Rozliczanie najmu v1.3

Ta wersja naprawia dwa problemy:
1. Wszystkie edytowane pola liczbowe są `type="text"` z `inputmode="decimal"` — nie mają strzałek góra/dół.
2. `index.html` ładuje `app.js?v=13` i `style.css?v=13`, dzięki czemu GitHub Pages nie powinien podawać starej wersji plików z cache.

Pola nie są przebudowywane podczas wpisywania, więc kursor pozostaje w aktywnym polu.

Podmień na GitHubie wszystkie trzy pliki:
- index.html
- style.css
- app.js
