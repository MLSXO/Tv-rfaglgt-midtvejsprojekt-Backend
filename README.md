# Dashboard til Pokébase

Dashboardet viser tre statistikker fra vores database:

- Et cirkeldiagram med antal Pokémon pr. type.
- Et søjlediagram med gennemsnitlig attack pr. type.
- En tabel med antal Pokémon pr. trainer.

Vi bruger Chart.js til diagrammerne og `fetch()` til at hente data fra backend.

## Start dashboardet

1. Åbn backendmappen `Tv-rfaglgt-midtvejsprojekt-Backend` i WebStorm. Følg dens README for at sætte databasen og `.env` op.
2. Kør `npm ci` første gang, og start backend med `npm start`. Lad den køre.
3. Åbn `Dashboard.html` i frontendmappen med WebStorms **Open in Browser**.

Du kan også starte frontend fra en terminal i denne mappe:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Åbn så [dashboardet](http://localhost:8000/Dashboard.html).

Frontend henter data fra `http://localhost:3000`. Adressen står øverst i `Dashboard.js` og er den samme, som Pokébase-siden bruger.

## Sådan virker koden

`Dashboard.html` indeholder de to diagrammer, tabellen og beskederne på siden. `Dashboard.js` har én funktion til hver statistik. Hver funktion henter data, tjekker svaret og viser enten resultatet eller en besked. `poke.css` styrer udseendet. Chart.js ligger i mappen `vendor`.

| Funktion | Adresse i backend |
| --- | --- |
| `loadTypes()` | `GET /stats/types` |
| `loadAverageAttack()` | `GET /stats/average-attack` |
| `loadTrainers()` | `GET /stats/trainers` |

En Pokémon tæller med i både sin primære og sekundære type, men kun én gang i samme type. Derfor kan summen i cirkeldiagrammet være større end antallet af Pokémon. Manglende attack-værdier tæller ikke som 0. Alle trainers vises, også dem med 0 Pokémon. Tabellen tæller forskellige Pokémon-arter hos hver trainer.

SQL-forespørgslerne og test i Insomnia er forklaret i [backendens README](https://github.com/MLSXO/Tv-rfaglgt-midtvejsprojekt-Backend/blob/backend/README.md).

## Test siden

- Åbn siden, og kontrollér de to diagrammer og trainer-tabellen. Mens data hentes, står der en indlæsningsbesked.
- Tryk **Opdater data**. Siden genindlæses og henter data igen.
- Stop backend, og opdater siden. Der skal komme en fejlbesked. Start backend igen, og opdater siden.
- Hvis backend svarer med en tom liste (`[]`), viser siden en besked om manglende data. Slet ikke gruppens data for at teste det.
- Hvis et kald fejler, kan de andre statistikker stadig vises. Et kald stopper efter 10 sekunder uden svar.

## Commit og push

Frontend og backend ligger i hver sin mappe, så de kan køre samtidig. Brug de eksisterende branches: `Frontend` til denne mappe og `backend` med lille b til backendmappen. Gennemgå, commit og push ændringerne i hver mappe. Ændringerne vises under **Remote** i WebStorm efter dit push.
