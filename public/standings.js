// Configuration - adapte l'URL si besoin
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : 'https://apiscore-7ek0.onrender.com/api'; // Remplace par ton URL Render si nécessaire

const loadingEl = document.getElementById('loading');
const standingsContainer = document.getElementById('standings-container');
const errorContainer = document.getElementById('error-container');
const standingsBody = document.getElementById('standings-body');
const statusText = document.getElementById('status-text');
const errorText = document.getElementById('error-text');

async function loadStandings() {
    try {
        const res = await fetch(`${API_BASE_URL}/teams`);
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
        const data = await res.json();

        if (!data || data.length === 0) {
            showError('Aucun classement disponible.');
            return;
        }

        renderStandings(data);
        statusText.textContent = 'Connecté ✓';
    } catch (e) {
        console.error('Erreur chargement classement', e);
        showError(`Impossible de charger le classement: ${e.message}`);
    }
}

function renderStandings(list) {
    loadingEl.style.display = 'none';
    errorContainer.style.display = 'none';
    standingsContainer.style.display = 'block';
    standingsBody.innerHTML = '';

    list.forEach((team, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${team.name || `Équipe ${team.id}`}</td>
            <td>${team.played || 0}</td>
            <td>${team.wins || 0}</td>
            <td>${team.draws || 0}</td>
            <td>${team.losses || 0}</td>
            <td>${team.points || 0}</td>
        `;
        standingsBody.appendChild(tr);
    });
}

function showError(message) {
    loadingEl.style.display = 'none';
    standingsContainer.style.display = 'none';
    errorContainer.style.display = 'flex';
    errorText.textContent = message;
    statusText.textContent = 'Erreur de connexion ✗';
}

document.addEventListener('DOMContentLoaded', loadStandings);
