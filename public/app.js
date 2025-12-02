// Configuration - utilise l'API relative quand le frontend et l'API sont servis depuis le même domaine
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : `${window.location.origin}/api`;

// Éléments du DOM
const loadingEl = document.getElementById('loading');
const resultsContainer = document.getElementById('results-container');
const errorContainer = document.getElementById('error-container');
const tableBody = document.getElementById('table-body');
const statusText = document.getElementById('status-text');
const errorText = document.getElementById('error-text');

// État client pour tri/filtre/pagination
let allMatches = [];
let filteredMatches = [];
let sortKey = 'match_date';
let sortDir = 'desc'; // 'asc' | 'desc'
let filterText = '';
let perPage = 25;
let currentPage = 1;

// Fonction principale pour charger les données
async function loadResults() {
    try {
        const response = await fetch(`${API_BASE_URL}/matches`);
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        const data = await response.json();

        if (!data || data.length === 0) {
            showNoData();
            return;
        }

        // Stocker les données et initialiser l'affichage
        allMatches = data.map(m => ({
            ...m,
            match_date: m.match_date,
            home_score: m.home_score,
            away_score: m.away_score,
            home_team: m.home_team || (`Équipe ${m.home_team_id}`),
            away_team: m.away_team || (`Équipe ${m.away_team_id}`),
            score_diff: (Number(m.home_score) || 0) - (Number(m.away_score) || 0)
        }));

        filteredMatches = allMatches.slice();
        currentPage = 1;
        renderTable();
        statusText.textContent = 'Connecté ✓';
        attachControls();
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        showError(`Impossible de charger les données: ${error.message}`);
    }
}

// Fonction pour afficher les résultats dans le tableau
function renderTable() {
    loadingEl.style.display = 'none';
    errorContainer.style.display = 'none';
    resultsContainer.style.display = 'block';

    // appliquer filtre
    const q = filterText.trim().toLowerCase();
    filteredMatches = allMatches.filter(m => {
        if (!q) return true;
        const parts = [String(m.home_team), String(m.away_team), String(m.match_date)];
        return parts.join(' ').toLowerCase().includes(q);
    });

    // trier
    filteredMatches.sort((a, b) => compareRows(a, b, sortKey, sortDir));

    // pagination
    const total = filteredMatches.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * perPage;
    const pageItems = filteredMatches.slice(start, start + perPage);

    // rendre
    tableBody.innerHTML = '';
    pageItems.forEach((match, index) => {
        const row = document.createElement('tr');
        const id = match.match_id || (start + index + 1);
        const date = match.match_date || '-';
        const team1 = match.home_team || `Équipe ${match.home_team_id}`;
        const team2 = match.away_team || `Équipe ${match.away_team_id}`;
        const score = `${match.home_score || 0} - ${match.away_score || 0}`;
        const team1Logo = `<div class="team-logo">${getInitials(team1)}</div>`;
        const team2Logo = `<div class="team-logo">${getInitials(team2)}</div>`;

        row.innerHTML = `
            <td>${id}</td>
            <td>${formatDate(date)}</td>
            <td><div class="team-cell">${team1Logo}<span class="team-name">${team1}</span></div></td>
            <td><div class="team-cell">${team2Logo}<span class="team-name">${team2}</span></div></td>
            <td class="score">${score}</td>
        `;
        tableBody.appendChild(row);
    });

    renderPagination(total, perPage, currentPage);
    updateSortIndicators();
}

function compareRows(a, b, key, dir) {
    const mul = dir === 'asc' ? 1 : -1;
    if (key === 'score_diff') {
        return (Number(a.home_score || 0) - Number(a.away_score || 0) - (Number(b.home_score || 0) - Number(b.away_score || 0))) * mul;
    }
    const va = (a[key] !== undefined && a[key] !== null) ? String(a[key]) : '';
    const vb = (b[key] !== undefined && b[key] !== null) ? String(b[key]) : '';
    // try numeric
    const na = Number(va);
    const nb = Number(vb);
    if (!isNaN(na) && !isNaN(nb)) return (na - nb) * mul;
    return va.localeCompare(vb, 'fr', { numeric: true }) * mul;
}

function updateSortIndicators(){
    document.querySelectorAll('.sortable').forEach(th => {
        const key = th.getAttribute('data-key');
        const span = th.querySelector('.sort-indicator');
        if(key === sortKey){
            span.textContent = sortDir === 'asc' ? '▲' : '▼';
        } else span.textContent = '';
    });
}

function renderPagination(total, perPage, currentPage){
    const pagination = document.getElementById('pagination');
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    if(totalPages <=1){ pagination.style.display='none'; return; }
    pagination.style.display = 'flex';
    pagination.innerHTML = '';
    const makeBtn = (text, disabled, handler) => {
        const b = document.createElement('button'); b.textContent = text; b.disabled = disabled; b.className='page-btn'; b.addEventListener('click', handler); return b;
    }
    pagination.appendChild(makeBtn('«', currentPage===1, ()=>{ currentPage=1; renderTable(); }));
    pagination.appendChild(makeBtn('‹', currentPage===1, ()=>{ currentPage=Math.max(1,currentPage-1); renderTable(); }));
    const span = document.createElement('span'); span.textContent = ` Page ${currentPage} / ${totalPages} `; pagination.appendChild(span);
    pagination.appendChild(makeBtn('›', currentPage===totalPages, ()=>{ currentPage=Math.min(totalPages,currentPage+1); renderTable(); }));
    pagination.appendChild(makeBtn('»', currentPage===totalPages, ()=>{ currentPage=totalPages; renderTable(); }));
}

// Fonction pour afficher une erreur
function showError(message) {
    loadingEl.style.display = 'none';
    resultsContainer.style.display = 'none';
    errorContainer.style.display = 'flex';
    errorText.textContent = message;
    statusText.textContent = 'Erreur de connexion ✗';
}

// Fonction pour afficher "Aucune donnée"
function showNoData() {
    loadingEl.style.display = 'none';
    resultsContainer.style.display = 'none';
    errorContainer.style.display = 'flex';
    errorText.textContent = 'Aucun résultat disponible pour le moment.';
}

// Fonction pour formater la date
function formatDate(dateString) {
    if (!dateString || dateString === '-') return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

function getInitials(name){
    if(!name) return '';
    const parts = String(name).trim().split(/\s+/);
    if(parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

// Charger les résultats au chargement de la page
document.addEventListener('DOMContentLoaded', loadResults);

// Optionnel: Rafraîchir les données toutes les 30 secondes
setInterval(loadResults, 30000);

function attachControls(){
    const search = document.getElementById('search-input');
    const per = document.getElementById('per-page');
    search.addEventListener('input', (e)=>{ filterText = e.target.value; currentPage =1; renderTable(); });
    per.addEventListener('change', (e)=>{ perPage = Number(e.target.value); currentPage=1; renderTable(); });

    document.querySelectorAll('.sortable').forEach(th=>{
        th.style.cursor='pointer';
        th.addEventListener('click', ()=>{
            const key = th.getAttribute('data-key');
            if(sortKey === key) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
            else { sortKey = key; sortDir = 'asc'; }
            renderTable();
        })
    });
}
