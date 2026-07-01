const API_BASE = "http://localhost:8080/api";

async function loadFixtures() {
    const response = await fetch(`${API_BASE}/fixtures`);
    const fixtures = await response.json();

    const fixturesList = document.getElementById("fixtures-list");
    const fixtureSelect = document.getElementById("fixture-select");

    fixturesList.innerHTML = "";
    fixtureSelect.innerHTML = `<option value="">Select a fixture...</option>`;

    fixtures.forEach(fixture => {
        const { id, matchDate, opponent, venue, actualHomeScore, actualAwayScore } = fixture;

        const result = actualHomeScore !== null
            ? `${actualHomeScore} - ${actualAwayScore}`
            : "Not played yet";

        fixturesList.innerHTML += `
            <div class="fixture-card">
                <strong>${opponent}</strong>
                <span>${matchDate} | ${venue}</span>
                <span>Result: ${result}</span>
            </div>
        `;

        fixtureSelect.innerHTML += `<option value="${id}">${opponent} (${matchDate})</option>`;
    });
}

async function loadPredictions() {
    const response = await fetch(`${API_BASE}/predictions`);
    const predictions = await response.json();

    const predictionsList = document.getElementById("predictions-list");
    predictionsList.innerHTML = "";

    if (predictions.length === 0) {
        predictionsList.innerHTML = "<p>No predictions yet.</p>";
        return;
    }

    predictions.forEach(({ id, fixtureOpponent, predHomeScore, predAwayScore, pointsEarned }) => {
        predictionsList.innerHTML += `
            <div class="prediction-card">
                <strong>${fixtureOpponent}</strong>
                <span>Predicted: ${predHomeScore} - ${predAwayScore}</span>
                <span>Points: ${pointsEarned !== null ? pointsEarned : "Pending"}</span>
            </div>
        `;
    });
}

async function submitPrediction() {
    const fixtureId = document.getElementById("fixture-select").value;
    const predHomeScore = document.getElementById("pred-home").value;
    const predAwayScore = document.getElementById("pred-away").value;
    const message = document.getElementById("prediction-message");

    if (!fixtureId || predHomeScore === "" || predAwayScore === "") {
        message.textContent = "Please fill in all fields.";
        return;
    }

    const response = await fetch(`${API_BASE}/predictions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: 1,
            fixtureId: Number(fixtureId),
            predHomeScore: Number(predHomeScore),
            predAwayScore: Number(predAwayScore)
        })
    });

    if (response.ok) {
        message.textContent = "Prediction submitted!";
        loadPredictions();
    } else {
        message.textContent = "Something went wrong. Try again.";
    }
}

document.getElementById("submit-prediction").addEventListener("click", submitPrediction);

loadFixtures();
loadPredictions();