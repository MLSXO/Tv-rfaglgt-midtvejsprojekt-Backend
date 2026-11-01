# Dashboard – Step 4

Dashboardet viser tre ting:

- Antal Pokémon pr. type i et cirkeldiagram.
- Gennemsnitlig attack pr. type i et søjlediagram.
- Antal Pokémon pr. trainer i en tabel.

JavaScript henter tallene fra backend med `fetch()`. Backend bruger SQL til at hente dem fra MySQL.

## Databasen

Statistikken bruger disse eksisterende tabeller og kolonner:

| Tabel | Kolonner vi bruger |
| --- | --- |
| `pokemon` | `pokedex_number`, `primary_type`, `secondary_type`, `attack` |
| `trainer` | `trainer_id`, `trainer_name` |
| `trainer_pokemon` | `trainer_id`, `pokedex_number` |

`trainer_pokemon` viser, hvilke Pokémon der hører til hvilke trainers.

## 1. Antal Pokémon pr. type

Endpoint: `GET /stats/types`

```sql
SELECT pokemon_type AS type, COUNT(*) AS pokemon_count
FROM (
    SELECT pokedex_number, TRIM(primary_type) AS pokemon_type
    FROM pokemon
    UNION
    SELECT pokedex_number, TRIM(secondary_type) AS pokemon_type
    FROM pokemon
) AS pokemon_types
WHERE pokemon_type IS NOT NULL AND pokemon_type <> ''
GROUP BY pokemon_type
ORDER BY pokemon_count DESC, pokemon_type;
```

`UNION` samler de to typekolonner i én liste og fjerner gentagelser. Pokédex-nummeret gør, at forskellige Pokémon stadig tælles hver for sig. `TRIM` fjerner mellemrum, og `WHERE` frasorterer manglende typer.

`GROUP BY` samler Pokémon med samme type. `COUNT(*)` tæller dem. En Pokémon med både Fire og Flying tæller med under begge typer.

## 2. Gennemsnitlig attack pr. type

Endpoint: `GET /stats/average-attack`

```sql
SELECT pokemon_type AS type, ROUND(AVG(attack), 2) AS average_attack
FROM (
    SELECT pokedex_number, TRIM(primary_type) AS pokemon_type, attack
    FROM pokemon
    UNION
    SELECT pokedex_number, TRIM(secondary_type) AS pokemon_type, attack
    FROM pokemon
) AS pokemon_types
WHERE pokemon_type IS NOT NULL AND pokemon_type <> ''
GROUP BY pokemon_type
ORDER BY average_attack DESC, pokemon_type;
```

Typerne samles på samme måde som i den første forespørgsel. `AVG` finder gennemsnittet, og `ROUND` afrunder til to decimaler.

Hvis attack mangler (`NULL`), bruges den ikke i gennemsnittet. En type helt uden attack-værdier vises ikke som en søjle med værdien 0.

## 3. Antal Pokémon pr. trainer

Endpoint: `GET /stats/trainers`

```sql
SELECT t.trainer_id, t.trainer_name,
       COUNT(tp.pokedex_number) AS pokemon_count
FROM trainer AS t
LEFT JOIN trainer_pokemon AS tp ON tp.trainer_id = t.trainer_id
GROUP BY t.trainer_id, t.trainer_name
ORDER BY pokemon_count DESC, t.trainer_name, t.trainer_id;
```

`t` og `tp` er bare korte navne for de to tabeller. `LEFT JOIN` kobler tabellerne sammen og tager også trainers uden Pokémon med. `COUNT(tp.pokedex_number)` giver dem antallet 0.

Der grupperes efter både ID og navn, så to trainers med samme navn ikke bliver slået sammen. I denne database kan en trainer kun have én tilknytning til hvert Pokédex-nummer, så antallet er forskellige Pokémon-arter.

## Visning af data

Frontend henter statistikken fra de tre endpoints med `fetch()`. Chart.js viser antal Pokémon pr. type i et cirkeldiagram og gennemsnitlig attack pr. type i et søjlediagram. Trainers og deres antal Pokémon vises i en tabel.

Mens data hentes, vises en loading-besked. En tom liste giver en besked om, at der ikke er data. Hvis API'et eller databasen fejler, vises en forståelig fejlbesked. Siden bruger projektets eksisterende CSS og navigation.
