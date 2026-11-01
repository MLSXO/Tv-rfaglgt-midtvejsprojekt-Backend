# Dashboard – Step 4

Dashboardet viser tre ting:

- Antal Pokémon pr. type i et cirkeldiagram.
- Gennemsnitlig attack pr. type i et søjlediagram.
- Antal Pokémon pr. trainer i en tabel.

JavaScript henter tallene fra backend med `fetch()`. Backend bruger SQL til at hente dem fra MySQL.

## Databasen

Vi bruger de eksisterende tabeller. Navnene er kontrolleret i databasen den 1. november 2026.

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

## Start projektet

1. Åbn backendmappen på branchen `backend` (lille b).
2. Brug din `.env` med oplysninger til MySQL. På en ny computer kopieres `.env.example` til `.env`, og oplysningerne udfyldes. `.env` skal ikke pushes.
3. Start MySQL og kør dette i backendmappens terminal:

```bash
npm ci
npm start
```

`npm ci` installerer pakkerne og er kun nødvendigt ved første opstart eller efter ændringer i pakkerne. Backend kører på `http://localhost:3000`.

4. Åbn frontendmappen på `Frontend` i et andet WebStorm-vindue.
5. Højreklik på `Dashboard.html` og vælg **Open in Browser**.

Backend og frontend skal være åbne i hver sin mappe, så begge kan køre samtidig. API-adressen står øverst i `Dashboard.js`.

## Test i Insomnia

Start backend først. Opret derefter tre requests med metoden **GET**:

| Adresse | Hvad skal svaret indeholde? |
| --- | --- |
| `http://localhost:3000/stats/types` | Type og antal Pokémon |
| `http://localhost:3000/stats/average-attack` | Type og gennemsnitlig attack |
| `http://localhost:3000/stats/trainers` | Trainer-ID, navn og antal Pokémon |

Tryk **Send**. Du skal få **200 OK** og en liste med data. Du skal ikke skrive noget i Body.

På den nuværende database har Poison 33 Pokémon, Fighting har gennemsnitlig attack 101,88, og Ash har 5 Pokémon. Kør SQL-forespørgslerne i MySQL Workbench for at sammenligne tallene.

Du kan også køre en lille kontrol fra en anden terminal i backendmappen:

```bash
npm test
```

`test-stats.js` kalder de tre endpoints og skriver OK eller FEJL. Backend skal stadig køre, og testen bruger Node.js 20 eller nyere.

## Test dashboardet

- Åbn siden og kontrollér de to grafer og trainer-tabellen.
- Mens data hentes, vises en loading-besked.
- Hvis API'et sender en tom liste (`[]`), vises en besked om, at der ikke er data.
- Stop backend og tryk **Opdater data**. Nu skal der komme en forståelig fejlbesked.
- Start backend igen og opdater siden. Data skal vises igen.

Ved en databasefejl sender backend **500** og en kort fejlbesked. Den sender ikke adgangskoden eller den tekniske databasefejl til browseren.

## Filer

- `main.js` starter backend og tilføjer dashboardets endpoints.
- `stats.js` indeholder de tre SQL-forespørgsler og endpoints.
- `test-stats.js` kontrollerer svarene fra API'et.
- Frontendmappen indeholder `Dashboard.html`, `Dashboard.js` og `poke.css`.

