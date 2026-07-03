const API_BASE = "http://localhost:8080/api";

function getToken() {
    return localStorage.getItem("token");
}

function authHeaders() {
    return {
        "Authorization": `Bearer ${getToken()}`
    };
}

async function loadFixtures() {
    const response = await fetch(`${API_BASE}/fixtures`, {
        headers: authHeaders()
    });
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
    const response = await fetch(`${API_BASE}/predictions`, {
        headers: authHeaders()
    });
    const predictions = await response.json();

    const predictionsList = document.getElementById("predictions-list");
    predictionsList.innerHTML = "";

    if (predictions.length === 0) {
        predictionsList.innerHTML = "<p>No predictions yet.</p>";
        return;
    }

    predictions.forEach(({ fixtureOpponent, predHomeScore, predAwayScore, pointsEarned }) => {
        predictionsList.innerHTML += `
            <div class="prediction-card">
                <strong>${fixtureOpponent}</strong>
                <span>Predicted: ${predHomeScore} - ${predAwayScore}</span>
                <span>Points: ${pointsEarned !== null ? pointsEarned : "Pending"}</span>
            </div>
        `;
    });
}

async function loadStandings() {
    const response = await fetch(`${API_BASE}/leaderboard`, {
        headers: authHeaders()
    });
    const standings = await response.json();

    const standingsList = document.getElementById("standings-list");

    if (standings.length === 0) {
        standingsList.innerHTML = "<p>No standings yet.</p>";
        return;
    }

    let tableHTML = `
        <table class="standings-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Points</th>
                </tr>
            </thead>
            <tbody>
    `;

    standings.forEach((entry, index) => {
        tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${entry.email}</td>
                <td>${entry.totalPoints}</td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table>`;
    standingsList.innerHTML = tableHTML;
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
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
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
        const error = await response.json();
        message.textContent = error.error || "Something went wrong.";
    }
}

async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const message = document.getElementById("login-message");

    const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        showApp();
    } else {
        message.textContent = "Invalid email or password.";
    }
}

function logout() {
    localStorage.removeItem("token");
    document.getElementById("main-content").style.display = "none";
    document.getElementById("login-section").style.display = "flex";
}

function showApp() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("main-content").style.display = "flex";
    loadFixtures();
    loadPredictions();
    loadStandings();
}

document.getElementById("login-button").addEventListener("click", login);
document.getElementById("submit-prediction").addEventListener("click", submitPrediction);
document.getElementById("logout-button").addEventListener("click", logout);

if (getToken()) {
    showApp();
} else {
    document.getElementById("login-section").style.display = "flex";
}