# API Score

## Description
API Score est une application web permettant de consulter les résultats de matchs en temps réel. Elle est composée d'une API REST (backend) et d'une interface web (frontend) responsive.

### Fonctionnalités principales
- 📊 Consultation des résultats de matchs
- 🏆 Affichage du classement des équipes
- 🔍 Recherche et filtrage des données
- 📱 Interface responsive et intuitive
- ⚡ API REST performante

---

## 🛠️ Prérequis de développement

- Node.js (version 14+)
- npm (gestionnaire de paquets)
- Une base de données MySQL

---

## 🚀 Installation et lancement local

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/Benjaminlmr/apiscore.git
   cd apiscore
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   
   Créer un fichier `.env` à la racine du projet :
   ```
   DB_HOST=your_db_host
   DB_PORT=3306
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   PORT=3000
   ```

4. **Démarrer l'API**
   ```bash
   node index.js
   ```

---

## 📡 API REST

L'API expose les endpoints suivants :

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/healthz` | Vérification de disponibilité |
| `GET` | `/api/matches` | Liste des matchs |
| `GET` | `/api/teams` | Classement des équipes |

---

## 🌐 Frontend

Interface web accessible via le navigateur :
- **Accueil** : `/` 
- **Résultats** : `/resultats`
- **Classement** : `/classement`

---

## 📦 Stack technique

- **Backend** : Node.js + Express.js
- **Base de données** : MySQL
- **Frontend** : HTML5 + CSS3 + Vanilla JavaScript
- **Communication** : REST API avec fetch

---

## 👨‍💻 Auteur
Benjamin Lemare

## 📄 Licence
ISC
