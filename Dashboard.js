const API_BASE_URL = "http://localhost:3000";

async function loadTypes() {
    const status = document.getElementById("types-status");
    const content = document.getElementById("types-content");

    try {
        const response = await fetch(API_BASE_URL + "/stats/types", {
            signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) {
            throw new Error("API'et kunne ikke hente typerne.");
        }

        const types = await response.json();
        if (!Array.isArray(types)) {
            throw new Error("API'et skal svare med en liste.");
        }

        const labels = [];
        const counts = [];
        let total = 0;
        for (const type of types) {
            labels.push(type.type);
            counts.push(type.pokemon_count);
            total += type.pokemon_count;
        }

        if (total === 0) {
            status.textContent = "Der er endnu ingen Pokémon med en registreret type.";
            return;
        }
        if (typeof Chart === "undefined") {
            status.dataset.state = "error";
            status.textContent = "Diagrammet mangler Chart.js. Kontrollér filen vendor/chart.umd.js.";
            return;
        }

        content.hidden = false;
        new Chart(document.getElementById("types-chart"), {
            type: "pie",
            data: {
                labels: labels,
                datasets: [{
                    label: "Antal Pokémon",
                    data: counts,
                    backgroundColor: [
                        "#f08030", "#6890f0", "#78c850", "#f8d030", "#a040a0", "#98d8d8",
                        "#c03028", "#e0c068", "#a890f0", "#f85888", "#a8b820", "#b8a038",
                        "#705898", "#7038f8", "#705848", "#b8b8d0", "#ee99ac", "#a8a878"
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" } }
            }
        });
        status.textContent = "Hold markøren over diagrammet for at se antal.";
    } catch (error) {
        content.hidden = true;
        status.dataset.state = "error";
        status.textContent = "Typerne kunne ikke hentes. Kontrollér, at backend og databasen kører, og prøv igen.";
    } finally {
        document.getElementById("types-panel").setAttribute("aria-busy", "false");
    }
}

async function loadAverageAttack() {
    const status = document.getElementById("attack-status");
    const content = document.getElementById("attack-content");

    try {
        const response = await fetch(API_BASE_URL + "/stats/average-attack", {
            signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) {
            throw new Error("API'et kunne ikke hente attack.");
        }

        const types = await response.json();
        if (!Array.isArray(types)) {
            throw new Error("API'et skal svare med en liste.");
        }

        const labels = [];
        const averages = [];
        for (const type of types) {
            // null betyder, at der mangler en attack-værdi. Det er ikke det samme som 0.
            if (type.average_attack !== null) {
                labels.push(type.type);
                averages.push(type.average_attack);
            }
        }

        if (averages.length === 0) {
            status.textContent = "Der er endnu ingen registrerede attack-værdier.";
            return;
        }
        if (typeof Chart === "undefined") {
            status.dataset.state = "error";
            status.textContent = "Diagrammet mangler Chart.js. Kontrollér filen vendor/chart.umd.js.";
            return;
        }

        content.hidden = false;
        new Chart(document.getElementById("attack-chart"), {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Gennemsnitlig attack",
                    data: averages,
                    backgroundColor: "#2563a6"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 } },
                    y: { beginAtZero: true }
                }
            }
        });
        status.textContent = "Hold markøren over en søjle for at se gennemsnittet. Typer uden attack-værdier vises ikke.";
    } catch (error) {
        content.hidden = true;
        status.dataset.state = "error";
        status.textContent = "Attack kunne ikke hentes. Kontrollér, at backend og databasen kører, og prøv igen.";
    } finally {
        document.getElementById("attack-panel").setAttribute("aria-busy", "false");
    }
}

async function loadTrainers() {
    const status = document.getElementById("trainers-status");
    const content = document.getElementById("trainers-content");
    const tableBody = document.getElementById("trainers-rows");

    try {
        const response = await fetch(API_BASE_URL + "/stats/trainers", {
            signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) {
            throw new Error("API'et kunne ikke hente trainers.");
        }

        const trainers = await response.json();
        if (!Array.isArray(trainers)) {
            throw new Error("API'et skal svare med en liste.");
        }
        if (trainers.length === 0) {
            status.textContent = "Der er endnu ingen trainers.";
            return;
        }

        for (const trainer of trainers) {
            const row = document.createElement("tr");
            const id = document.createElement("td");
            const name = document.createElement("td");
            const count = document.createElement("td");

            id.textContent = trainer.trainer_id;
            name.textContent = trainer.trainer_name;
            count.textContent = trainer.pokemon_count;

            row.appendChild(id);
            row.appendChild(name);
            row.appendChild(count);
            tableBody.appendChild(row);
        }

        content.hidden = false;
        status.textContent = trainers.length + " trainers.";
    } catch (error) {
        content.hidden = true;
        status.dataset.state = "error";
        status.textContent = "Trainers kunne ikke hentes. Kontrollér, at backend og databasen kører, og prøv igen.";
    } finally {
        document.getElementById("trainers-panel").setAttribute("aria-busy", "false");
    }
}

document.getElementById("refresh-dashboard").addEventListener("click", function () {
    location.reload();
});

loadTypes();
loadAverageAttack();
loadTrainers();
