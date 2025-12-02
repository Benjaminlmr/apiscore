# 📋 Livraison Projet API Score

## Étudiant
**Nom** : Benjamin Lemare

---

## 1️⃣ URL de l'API

L'API est déployée sur Render et accessible publiquement :

- **Base API** : `https://apiscore-doow.onrender.com`

### Endpoints disponibles (URL complètes)

- ✅ **Health Check** : `GET https://apiscore-doow.onrender.com/api/healthz`
  - Réponse : `{ "ok": true }`
  - Objectif : Vérifier que l'API est en ligne

- ✅ **Récupérer les matchs** : `GET https://apiscore-doow.onrender.com/api/matches`
  - Réponse : Liste JSON de tous les matchs avec les noms des équipes

- ✅ **Récupérer les équipes (classement)** : `GET https://apiscore-doow.onrender.com/api/teams`
  - Réponse : Classement des équipes avec statistiques

---

## 2️⃣ URL du Frontend

Le frontend est servi par le même service Render que l'API :

- **Base Frontend** : `https://apiscore-doow.onrender.com`

Pages disponibles (URL complètes) :

| Page | URL | Fonction |
|------|-----|----------|
| 🏠 Accueil | `https://apiscore-doow.onrender.com/` | Page d'accueil (index.html) |
| 📊 Résultats | `https://apiscore-doow.onrender.com/resultats.html` | Page résultats (fichier `resultats.html`) |
| 🏆 Classement | `https://apiscore-doow.onrender.com/classement.html` | Page classement (fichier `classement.html`) |

Remarque : la route propre `/resultats` (sans `.html`) retourne actuellement 404. Les pages statiques sont servies sous leurs noms de fichiers (`resultats.html`, `classement.html`). Si vous souhaitez des URLs propres sans extensions, il faudra ajouter une réécriture côté serveur (ou renommer/fournir une route Express qui redirige `/resultats` vers `/resultats.html`).

---

## 3️⃣ Dépôt GitHub

**URL du dépôt** : https://github.com/Benjaminlmr/apiscore

### Contenu du README
Le `README.md` du dépôt contient :

✅ **Comment lancer l'API en local**
```bash
npm install
# Configurer le fichier .env
node index.js
```

✅ **Variables d'environnement nécessaires**
| Variable | Description | Exemple |
|----------|-------------|---------|
| `DB_HOST` | Serveur MySQL | `localhost` ou service cloud |
| `DB_PORT` | Port MySQL | `3306` |
| `DB_USER` | Utilisateur | `root` |
| `DB_PASSWORD` | Mot de passe | `password123` |
| `DB_NAME` | Base de données | `apiscore` |
| `PORT` | Port API | `3000` |

✅ **Liste des endpoints**
- `GET /api/healthz` - Vérification de disponibilité
- `GET /api/matches` - Liste des matchs
- `GET /api/teams` - Classement des équipes

---

## 4️⃣ Schéma de la base de données

### Structure des tables

#### Table `teams` (Équipes)
```sql
CREATE TABLE teams (
  team_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL
);
```

| Colonne | Type | Description |
|---------|------|-------------|
| `team_id` | INT | Identifiant unique |
| `name` | VARCHAR(100) | Nom de l'équipe |
| `city` | VARCHAR(100) | Ville |

---

#### Table `matches` (Matchs)
```sql
CREATE TABLE matches (
  match_id INT PRIMARY KEY AUTO_INCREMENT,
  match_date DATE NOT NULL,
  home_team_id INT NOT NULL,
  away_team_id INT NOT NULL,
  home_score INT,
  away_score INT,
  FOREIGN KEY (home_team_id) REFERENCES teams(team_id),
  FOREIGN KEY (away_team_id) REFERENCES teams(team_id)
);
```

| Colonne | Type | Description |
|---------|------|-------------|
| `match_id` | INT | Identifiant unique |
| `match_date` | DATE | Date du match |
| `home_team_id` | INT | ID équipe à domicile |
| `away_team_id` | INT | ID équipe à l'extérieur |
| `home_score` | INT | Score équipe 1 |
| `away_score` | INT | Score équipe 2 |

---

### Exemple de données

#### Teams
| team_id | name | city |
|---------|------|------|
| 1 | Paris SC | Paris |
| 2 | Lyon FC | Lyon |
| 3 | Marseille OL | Marseille |
| 4 | Nice FC | Nice |
| 5 | Toulouse FC | Toulouse |
| 6 | Bordeaux FC | Bordeaux |

#### Matches (au moins 6 matchs)
| match_id | match_date | home_team_id | away_team_id | home_score | away_score |
|----------|------------|--------------|--------------|-----------|-----------|
| 1 | 2025-01-15 | 1 | 2 | 3 | 1 |
| 2 | 2025-01-16 | 3 | 4 | 2 | 2 |
| 3 | 2025-01-17 | 5 | 6 | 1 | 0 |
| 4 | 2025-01-18 | 2 | 3 | 4 | 2 |
| 5 | 2025-01-19 | 4 | 5 | 1 | 1 |
| 6 | 2025-01-20 | 6 | 1 | 2 | 3 |

---

## 📦 Technologies utilisées

### Backend
- **Node.js** : Runtime JavaScript
- **Express.js** (v5.1.0) : Framework web
- **MySQL** (mysql2 v3.15.3) : Base de données
- **CORS** (v2.8.5) : Gestion des requêtes cross-origin
- **Dotenv** (v17.2.3) : Gestion des variables d'environnement

### Frontend
- **HTML5** : Structure
- **CSS3** : Styling responsive
- **Vanilla JavaScript** : Logique client
- **Fetch API** : Communication avec l'API

---

## ✅ Checklist de validation

- [x] API fonctionnelle en local (`node index.js`)
- [x] Endpoint `/api/healthz` opérationnel
- [x] Endpoint `/api/matches` opérationnel
- [x] Endpoint `/api/teams` opérationnel
- [x] Frontend avec page d'accueil (`/`)
- [x] Frontend avec page résultats (`/resultats`)
- [x] Frontend avec page classement (`/classement`)
- [x] README.md complet dans le dépôt GitHub
- [x] Schéma de base de données documenté
- [x] API déployée en ligne (`https://apiscore-doow.onrender.com`)
- [x] Frontend déployé en ligne (`https://apiscore-doow.onrender.com`)
- [ ] Données de test (6 matchs minimum)

---

## 🚀 Prochaines étapes

1. **Ajouter les données de test** : Insérer au minimum 6 matchs dans la base de données
2. **Déployer l'API** : Utiliser Render, Heroku ou autre plateforme
3. **Déployer le Frontend** : Utiliser Render, Netlify ou autre plateforme
4. **Mettre à jour ce document** : Ajouter les URLs de déploiement
5. **Tester en production** : Vérifier que les endpoints répondent correctement

---

## 📞 Support

Pour plus de détails sur le lancement en local, consultez le `README.md` du dépôt GitHub.

---

**Date de création** : 2 décembre 2025  
**Dernière mise à jour** : 2 décembre 2025
