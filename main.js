require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const { createStatsRouter } = require("./stats");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// En pool holder styr på databaseforbindelserne og kan åbne en ny, hvis en fejler.
const connection = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
    connectTimeout: 5000
});

// Tilføj dashboardets tre endpoints fra stats.js.
app.use("/stats", createStatsRouter(connection));

app.get("/", (req, res) => {
    res.json({
        message: "API'et kører"
    });
});

app.get("/pokemons", (req, res) => {
    const sql = `
        SELECT *
        FROM pokemon
    `;

    connection.query(sql, (error, results) => {
        if (error) {
            console.error(error);

            return res.status(500).json({
                error: "Kunne ikke hente Pokémon-navne"
            });
        }

        res.json(results);
    });
});

app.get("/leagues", (req, res) => {
    const sql = `
        SELECT
            league_id,
            league_name,
            region,
            description
        FROM league
        ORDER BY league_name
    `;

    connection.query(sql, (error, results) => {
        if (error) {
            console.error(error);

            return res.status(500).json({
                error: "Kunne ikke hente ligaer"
            });
        }

        res.json(results);
    });
});

app.get('/pokemon-name', (req, res) => {

    const name = req.query.name;

    connection.query(
        'SELECT * FROM pokemon WHERE name LIKE ?',
        ['%' + name + '%'],
        (error, results) => {

            if (error) {
                return res.status(500).send(error);
            }

            res.send(results);
        }
    );
});

app.get('/pokemon-type', (req, res) => {

    const type = req.query.type;

    connection.query(
        'SELECT * FROM pokemon WHERE primary_type = ? OR secondary_type = ?',
        [type, type],
        (error, results) => {

            if (error) {
                return res.status(500).send(error);
            }

            res.send(results);
        }
    );
});

app.get('/pokemon-attack', (req, res) => {

    const attack = req.query.attack;

    connection.query(
        'SELECT * FROM pokemon WHERE attack >= ? ORDER BY attack DESC',
        [attack],
        (error, results) => {

            if (error) {
                return res.status(500).send(error);
            }

            res.send(results);
        }
    );
});

connection.getConnection((error, databaseConnection) => {
    if (error) {
        console.error("Kunne ikke forbinde til databasen:", error.code);
        return;
    }
    databaseConnection.release();
    console.log("Forbundet til databasen");
});

// HTTP-serveren kan også forklare databasefejl og prøve igen ved næste kald.
app.listen(port, () => {
    console.log(`Serveren kører på http://localhost:${port}`);
});
