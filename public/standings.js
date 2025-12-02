// Configuration - utilise l'API relative quand le frontend et l'API sont servis depuis le même domaine
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : `${window.location.origin}/api`;

const loadingEl = document.getElementById('loading');
const standingsContainer = document.getElementById('standings-container');
const errorContainer = document.getElementById('error-container');
const standingsBody = document.getElementById('standings-body');
const statusText = document.getElementById('status-text');
const errorText = document.getElementById('error-text');
const searchInput = document.getElementById('search-standings');

let allTeams = [];
let filteredTeams = [];
let searchText = '';

async function loadStandings() {
    try {
        const res = await fetch(`${API_BASE_URL}/teams`);
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
        const data = await res.json();

        if (!data || data.length === 0) {
            showError('Aucun classement disponible.');
            return;
        }

        allTeams = data;
        filteredTeams = [...allTeams];
        renderStandings();
        attachSearchListener();
        statusText.textContent = 'Connecté ✓';
    } catch (e) {
        console.error('Erreur chargement classement', e);
        showError(`Impossible de charger le classement: ${e.message}`);
    }
}

function renderStandings() {
    loadingEl.style.display = 'none';
    errorContainer.style.display = 'none';
    standingsContainer.style.display = 'block';
    standingsBody.innerHTML = '';

    filteredTeams.forEach((team, idx) => {
        const tr = document.createElement('tr');
        const displayName = team.name || `Équipe ${team.id}`;
        const logo = `<div class="team-logo">${getInitials(displayName)}</div>`;
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td><div class="team-cell">${logo}<span class="team-name">${displayName}</span></div></td>
            <td>${team.played || 0}</td>
            <td>${team.wins || 0}</td>
            <td>${team.draws || 0}</td>
            <td>${team.losses || 0}</td>
            <td>${team.points || 0}</td>
        `;
        standingsBody.appendChild(tr);
    });
}

function attachSearchListener() {
    searchInput.addEventListener('input', (e) => {
        searchText = e.target.value.toLowerCase().trim();
        applyFilter();
    });
}

function applyFilter() {
    filteredTeams = allTeams.filter(team => {
        const name = (team.name || '').toLowerCase();
        return name.includes(searchText);
    });
    renderStandings();
}

function showError(message) {
    loadingEl.style.display = 'none';
    standingsContainer.style.display = 'none';
    errorContainer.style.display = 'flex';
    errorText.textContent = message;
    statusText.textContent = 'Erreur de connexion ✗';
}

document.addEventListener('DOMContentLoaded', loadStandings);

function getInitials(name){
    if(!name) return '';
    const parts = String(name).trim().split(/\s+/);
    if(parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}
