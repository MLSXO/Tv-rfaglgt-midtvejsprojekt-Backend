# Dashboard til Pokébase

Dashboardet viser tre statistikker fra vores database:

| Statistik | Visning | Endpoint |
| --- | --- | --- |
| Antal Pokémon pr. type | Cirkeldiagram | `GET /stats/types` |
| Gennemsnitlig attack pr. type | Søjlediagram | `GET /stats/average-attack` |
| Antal Pokémon pr. trainer | Tabel | `GET /stats/trainers` |

JavaScript henter data fra backend med `fetch()`. Chart.js bruges til diagrammerne. Dashboardet bruger projektets eksisterende CSS og navigation.

## Sådan beregnes statistikken

En Pokémon tæller med i både sin primære og sekundære type, men kun én gang i samme type. Derfor kan summen i cirkeldiagrammet være større end antallet af Pokémon.

Gennemsnitlig attack beregnes for hver type og afrundes til to decimaler. Manglende attack-værdier tæller ikke som 0.

Tabellen viser alle trainers, også dem med 0 Pokémon. Den tæller forskellige Pokémon-arter hos hver trainer.

SQL-forespørgslerne er forklaret i [backendens README](https://github.com/MLSXO/Tv-rfaglgt-midtvejsprojekt-Backend/blob/backend/README.md).

## Loading, tomme resultater og fejl

Mens data hentes, vises en loading-besked. Hvis et endpoint svarer med en tom liste, vises en besked om, at der ikke er data.

Hvis API'et eller databasen fejler, vises en forståelig fejlbesked. De andre statistikker kan stadig vises, selvom ét kald fejler.
