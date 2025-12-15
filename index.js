// On "importe" les outils qu'on a installés pour pouvoir les utiliser
require('dotenv').config(); // Charge les variables du fichier .env
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
// Mode mock pour développement / démo si la base n'est pas accessible
const USE_MOCK = process.env.USE_MOCK === 'true';
// On crée l'application (le serveur)
const app = express();
// On configure CORS pour accepter les requêtes venant d'ailleurs (du front)
app.use(cors());
// On sert les fichiers statiques du dossier "public" (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
// --- CONFIGURATION DE LA BASE DE DONNÉES ---
// Si on est en mode mock, on n'essaie pas de se connecter à la DB
let connection = null;
if (!USE_MOCK) {
  // On récupère les infos de connexion depuis les variables d'environnement (le fichier .env)
  // C'est sécurisé : le mot de passe n'est pas écrit ici !
  connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  // On teste la connexion au démarrage
  connection.connect((err) => {
    if (err) {
      console.error('Erreur de connexion à la base de données :', err);
    } else {
      console.log('Connecté à la base de données MySQL sur Aiven !');
    }
  });
} else {
  console.log('USE_MOCK=true : le serveur utilisera des données factices, pas de connexion DB.');
}

// --- LES ROUTES DE L'API (Les URLs disponibles) ---
// 1. Route de santé (Health Check)
// Permet de vérifier que l'API est en vie.
// Quand on appellera GET /api/healthz, ça répondra { "ok": true }
app.get('/api/healthz', (req, res) => {
res.json({ ok: true });
});
// 2. Route pour récupérer les matchs
// Quand on appellera GET /api/matches, on demandera la liste à la base de données avec les noms des équipes
const USE_MOCK = process.env.USE_MOCK === 'true';
app.get('/api/matches', (req, res) => {
  if (USE_MOCK) {
    // Répondre avec des données mock (utile si la DB n'est pas accessible)
    const mock = require(path.join(__dirname, 'data', 'mock_matches.json'));
    return res.json(mock);
  }

  // On écrit une requête SQL avec JOIN pour récupérer les noms des équipes
  const query = `
    SELECT 
      m.match_id,
      m.match_date,
      m.home_team_id,
      m.away_team_id,
      m.home_score,
      m.away_score,
      ht.name as home_team,
      at.name as away_team
    FROM \`matches\` m
    LEFT JOIN \`teams\` ht ON m.home_team_id = ht.team_id
    LEFT JOIN \`teams\` at ON m.away_team_id = at.team_id
    ORDER BY m.match_date ASC
  `;
  // On l'exécute sur la connexion
  connection.query(query, (err, results) => {
    if (err) {
      // S'il y a une erreur technique (ex: table inexistante), on renvoie une erreur 500
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération des matchs' });
    } else {
      // Sinon, on renvoie les résultats en format JSON (texte structuré)
      res.json(results);
    }
  });
});

// 3. Route pour récupérer le classement des équipes avec leurs statistiques
app.get('/api/teams', (req, res) => {
  if (USE_MOCK) {
    const mockTeams = require(path.join(__dirname, 'data', 'mock_teams.json'));
    return res.json(mockTeams);
  }
  // Récupérer les équipes
  connection.query('SELECT team_id, name, city FROM `teams`', (errTeams, teams) => {
    if (errTeams) {
      console.error('Erreur equipes:', errTeams);
      return res.status(500).json({ error: 'Erreur equipess' });
    }

    // Récupérer tous les matchs
    connection.query('SELECT home_team_id, away_team_id, home_score, away_score FROM `matches`', (errMatches, matches) => {
      if (errMatches) {
        console.error('Erreur matchs:', errMatches);
        return res.status(500).json({ error: 'Erreur matchs' });
      }

      // Initialiser les stats pour chaque équipe
      const standings = {};
      teams.forEach(team => {
        standings[team.team_id] = {
          id: team.team_id,
          name: team.name,
          city: team.city,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          points: 0
        };
      });

      // Calculer les résultats
      matches.forEach(match => {
        const homeId = match.home_team_id;
        const awayId = match.away_team_id;
        const homeScore = match.home_score;
        const awayScore = match.away_score;

        // Ignorer si pas de scores
        if (homeScore === null || awayScore === null) return;

        // Incrémenter les matchs joués
        if (standings[homeId]) standings[homeId].played += 1;
        if (standings[awayId]) standings[awayId].played += 1;

        // Calculer victoires/nuls/défaites
        if (homeScore > awayScore) {
          if (standings[homeId]) { standings[homeId].wins += 1; standings[homeId].points += 3; }
          if (standings[awayId]) standings[awayId].losses += 1;
        } else if (awayScore > homeScore) {
          if (standings[awayId]) { standings[awayId].wins += 1; standings[awayId].points += 3; }
          if (standings[homeId]) standings[homeId].losses += 1;
        } else {
          if (standings[homeId]) { standings[homeId].draws += 1; standings[homeId].points += 1; }
          if (standings[awayId]) { standings[awayId].draws += 1; standings[awayId].points += 1; }
        }
      });

      // Trier par points décroissants
      const result = Object.values(standings).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.name.localeCompare(b.name);
      });

      res.json(result);
    });
  });
});

// --- ROUTES POUR PAGES STATIQUES (URLs 'propres' sans .html)
// Ces routes servent directement les fichiers HTML présents dans /public
app.get('/resultats', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'resultats.html'));
});

app.get('/classement', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'classement.html'));
});

// --- DÉMARRAGE DU SERVEUR ---
// On dit à l'application d'écouter sur le port défini (souvent 3000 en local, ou défini par Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Le serveur API est lancé !`);
console.log(`Testez le ici : http://localhost:${PORT}/api/healthz`);
console.log(`Interface web : http://localhost:${PORT}`);
});


