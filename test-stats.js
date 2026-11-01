// Start backend med npm start i en anden terminal, før du kører npm test.
const API_URL = "http://localhost:3000";

async function testEndpoint(path, nameField, numberField) {
    try {
        const response = await fetch(API_URL + path, { signal: AbortSignal.timeout(10000) });
        if (response.status !== 200) {
            throw new Error("Forventede 200 OK, men fik " + response.status);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("Svaret skal være en liste.");
        }

        for (const row of data) {
            if (!row || typeof row[nameField] !== "string") {
                throw new Error("Der mangler et navn eller en type.");
            }
            if (path === "/stats/trainers" && !Number.isInteger(row.trainer_id)) {
                throw new Error("Trainer-ID skal være et heltal.");
            }

            // En manglende attack-værdi må være null. Antal skal altid være et tal.
            if (numberField === "average_attack" && row[numberField] === null) {
                continue;
            }
            if (typeof row[numberField] !== "number" || !Number.isFinite(row[numberField]) || row[numberField] < 0) {
                throw new Error("Feltet " + numberField + " skal være et tal.");
            }
        }

        console.log("OK: " + path + " – " + data.length + " rækker");
    } catch (error) {
        let message = error.message;
        if (error.name === "TypeError" || error.name === "TimeoutError") {
            message = "Backend svarer ikke. Start den med npm start i en anden terminal.";
        }
        console.error("FEJL: " + path + " – " + message);
        process.exitCode = 1;
    }
}

testEndpoint("/stats/types", "type", "pokemon_count");
testEndpoint("/stats/average-attack", "type", "average_attack");
testEndpoint("/stats/trainers", "trainer_name", "pokemon_count");
