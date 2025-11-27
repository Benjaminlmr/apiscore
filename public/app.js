// Configuration - À adapter selon ton API
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api'
    : 'https://apiscore-7ek0.onrender.com/api';  // Remplace par l'URL de ton API Render

// Éléments du DOM
const loadingEl = document.getElementById('loading');
const resultsContainer = document.getElementById('results-container');
const errorContainer = document.getElementById('error-container');
const tableBody = document.getElementById('table-body');
const statusText = document.getElementById('status-text');
const errorText = document.getElementById('error-text');

// Fonction principale pour charger les données
async function loadResults() {
    try {
        // Appel à l'API
        const response = await fetch(`${API_BASE_URL}/matches`);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Si les données sont vides
        if (!data || data.length === 0) {
            showNoData();
            return;
        }
        
        // Afficher les résultats
        displayResults(data);
        
        // Mettre à jour le statut
        statusText.textContent = 'Connecté ✓';
        
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
        showError(`Impossible de charger les données: ${error.message}`);
    }
}

// Fonction pour afficher les résultats dans le tableau
function displayResults(matches) {
    loadingEl.style.display = 'none';
    errorContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    if (!matches || matches.length === 0) {
        showNoData();
        return;
    }
    
    // Vider le tableau
    tableBody.innerHTML = '';
    
    // Ajouter chaque ligne au tableau
    matches.forEach((match, index) => {
        const row = document.createElement('tr');
        
        // Utiliser les colonnes avec les noms des équipes depuis la jointure SQL
        const id = match.match_id || index + 1;
        const date = match.match_date || '-';
        const team1 = match.home_team || `Équipe ${match.home_team_id}` || 'Équipe 1';
        const team2 = match.away_team || `Équipe ${match.away_team_id}` || 'Équipe 2';
        const score = `${match.home_score || 0} - ${match.away_score || 0}`;
        
        row.innerHTML = `
            <td>${id}</td>
            <td>${formatDate(date)}</td>
            <td>${team1}</td>
            <td>${team2}</td>
            <td class="score">${score}</td>
        `;
        tableBody.appendChild(row);
    });
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

// Charger les résultats au chargement de la page
document.addEventListener('DOMContentLoaded', loadResults);

// Optionnel: Rafraîchir les données toutes les 30 secondes
setInterval(loadResults, 30000);
