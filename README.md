#  Banque d'Épreuves & Système d'Apprentissage Universitaire

> **Projet d'Évaluation (Contrôle Continu)** — Module Bases de Données (NoSQL & MongoDB)  
> Application Fullstack moderne développée avec **React 18**, **Node.js / Express** et le **Driver Officiel Natif MongoDB** (100% NoSQL, sans ODM Mongoose).

---

##  Présentation du Projet

La **Banque d'Épreuves Universitaire** est une plateforme académique complète conçue pour centraliser, archiver et valoriser les annales d'examens, partiels, TD et TP universitaires, tout en offrant aux étudiants un environnement d'entraînement et d'auto-évaluation en conditions réelles.

L'application intègre deux grandes dimensions :
1. **La Banque de Ressources Pédagogiques** : consultation, recherche plein-texte, filtrage multicritères et téléchargement des vrais fichiers PDF d'examen physiques.
2. **Le Système d'Apprentissage & de Supervision Académique** : carnet de révision personnel pour les étudiants, corrigés types avec votes utiles, espace d'entraide communautaire, et tableau de bord de pilotage pour le corps enseignant.

---

##  Architecture & Choix NoSQL (MongoDB Natif)

Ce projet a été conçu selon les standards de l'ingénierie des bases de données NoSQL :

- **Driver Officiel Natif (`mongodb` v7+)** : Zéro Mongoose. Toutes les opérations utilisent directement la syntaxe BSON native (`insertOne`, `find`, `updateOne`, `deleteOne`, `aggregate`).
- **Opérations Atomiques** :
  - Incrément atomique des compteurs de consultation : `{ $inc: { vues: 1 } }`.
  - Système de votes utiles sans doublon : `$addToSet` pour voter, `$pull` pour annuler le vote.
  - Sauvegarde de progression d'entraînement : `updateOne(..., { $set: ... }, { upsert: true })`.
- **Pipelines d'Agrégation Avancés (`aggregate`)** :
  - Multi-facettes `$facet` pour calculer en une seule requête les moyennes, temps cumulés et ventilations par statut.
  - Jointures documentaires natives avec `$lookup` et `$unwind`.
- **Modélisation Hybride Justifiée (Embedding vs Referencing)** :
  - *Référence (`ObjectId`)* : matières, utilisateurs, corrigés et discussions sont séparés pour éviter l'anti-pattern des documents non bornés (*Unbounded Array*) et respecter la limite BSON de 16 Mo.
  - *Imbrication (Embedding)* : les tags et la liste des votants sont directement embarqués dans les documents parents.
- **Stratégie d'Indexation (7 index B-Tree & Full-Text)** :
  - Index plein-texte : `{ titre: 'text', description: 'text' }` sur `epreuves`.
  - Index composé unique : `{ utilisateurId: 1, epreuveId: 1 }` sur `progressions` garantissant l'intégrité métier sans doublons.
  - Index de filtrage et tri : `{ matiere: 1 }`, `{ annee: -1 }`, `{ epreuveId: 1 }`, `{ createdAt: -1 }`.

---

##  Fonctionnalités Principales

###  Espace Étudiant
- **Exploration & Recherche** : moteur de recherche plein-texte, filtres dynamiques (par matière, niveau Licence/Master, année, type d'évaluation).
- **Vrais Fichiers PDF** : ouverture et téléchargement direct des sujets d'examen réels hébergés sur le serveur.
- **Carnet de Révision & Entraînement** :
  - Suivi par épreuve :  *À réviser*,  *En cours*,  *Maîtrisé*.
  - Enregistrement du temps passé réel et score estimé d'après le barème.
  - Fiches mémo et remarques personnelles de révision.
- **Tableau de Bord « Mon Apprentissage » (`/apprentissage`)** :
  - Jauge de couverture globale du programme.
  - Temps cumulé d'entraînement et moyenne sur examens blancs.
  - Progression ventilée par matière universitaire.
- **Solutions & Corrigés** : consultation des corrections officielles et propositions étudiantes, avec système d'évaluation par vote utile.
- **Espace Entraide** : fil de questions/réponses sous chaque épreuve pour échanger entre pairs et avec les professeurs.

###  Espace Enseignant / Supervision Académique
- **Pilotage Académique (`/supervision`)** :
  - Métriques globales en temps réel (total épreuves, volume de téléchargements, consultations).
  - Taux de couverture en corrigés officiels.
  - **Alerte Pédagogique** : liste des questions étudiantes en attente de réponse avec accès direct.
  - **Priorités Pédagogiques** : détection automatique des épreuves orphelines sans corrigé.
  - Répartition du volume de ressources par discipline.
- **Administration & Modération** :
  - Droit exclusif de modification et de suppression des épreuves du patrimoine universitaire.
  - Publication de corrigés officiels certifiés (*Badge Officiel*).
  - Résolution des interrogations étudiantes dans l'espace d'entraide.

###  Design & Ergonomie Pro
- **Sidebar Rétractable Blanche Épurée** : barre latérale moderne pliable (mode étendu 260px / mode compact 80px) avec persistance du choix utilisateur (`localStorage`).
- **Affichage Contextuel** :
  - *Visiteur déconnecté* : Landing Page d'accueil pleine largeur avec barre supérieure classique.
  - *Utilisateur connecté* : immersion immédiate dans l'espace de travail avec barre latérale et redirection intelligente selon le rôle.

---

## 🏗️ Structure du Projet

```
Banque/
├── backend/                       # Serveur API REST Node.js & Express
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Connexion MongoClient natif & création des index
│   │   ├── controllers/
│   │   │   ├── epreuveController.js       # CRUD épreuves & incrément atomique
│   │   │   ├── matiereController.js       # Gestion des disciplines
│   │   │   ├── authController.js          # Inscription, JWT & bcrypt
│   │   │   ├── apprentissageController.js # Pipelines $facet & supervision
│   │   │   ├── corrigeController.js       # Corrigés, PDF & votes $addToSet
│   │   │   └── commentaireController.js   # Questions & entraide
│   │   ├── middleware/
│   │   │   ├── auth.js            # Vérification JWT & contrôle RBAC des rôles
│   │   │   ├── upload.js          # Gestion Multer des uploads PDF physiques
│   │   │   └── errorHandler.js    # Intercepteur centralisé des erreurs
│   │   ├── routes/                # Définition des points d'entrée d'API
│   │   └── app.js                 # Configuration Express, CORS, Helmet & statics
│   ├── uploads/                   # Fichiers PDF physiques stockés sur disque
│   │   ├── epreuves/
│   │   └── corriges/
│   ├── .env.example
│   ├── package.json
│   └── server.js                  # Démarrage du serveur HTTP (port 5000)
│
├── frontend/                      # Application Single Page React (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx  # Layout conditionnel public / espace connecté
│   │   │   │   ├── Sidebar.jsx    # Sidebar blanche rétractable
│   │   │   │   ├── Header.jsx     # Top bar avec indicateur MongoDB
│   │   │   │   ├── Navbar.jsx     # Header pour visiteurs publics
│   │   │   │   └── Footer.jsx
│   │   │   ├── epreuves/          # Cartes et filtres de recherche
│   │   │   └── ui/                # Boutons, badges et indicateurs
│   │   ├── pages/
│   │   │   ├── Accueil.jsx        # Landing page publique
│   │   │   ├── Epreuves.jsx       # Catalogue complet avec pagination
│   │   │   ├── DetailEpreuve.jsx  # Fiche épreuve (Sujet, Entraînement, Corrigés, Entraide)
│   │   │   ├── TableauDeBord.jsx  # Tableau de bord apprentissage étudiant
│   │   │   ├── SupervisionEnseignant.jsx # Supervision académique enseignant
│   │   │   ├── AjouterEpreuve.jsx # Formulaire d'upload multipart/form-data
│   │   │   ├── Connexion.jsx
│   │   │   └── Inscription.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # État global utilisateur & authentification
│   │   ├── services/
│   │   │   └── api.js             # Client Axios centralisé
│   │   ├── App.jsx                # Configuration des routes React Router
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── db/                            # Outillage & Scripts de Base de Données
│   ├── seed.js                    # Peuplement initial avec 15 épreuves & vrais PDF
│   ├── reset.js                   # Remise à zéro propre (garde utilisateurs & matières)
│   ├── creerAdmin.js              # Création / promotion CLI d'un administrateur
│   └── genererPdfsReels.js        # Générateur PDFKit de PDF universitaires
│
├── .gitignore                     # Exclusion globale node_modules, build & secrets
└── README.md
```

---

##  Prérequis

- **Node.js** : version 18.x ou supérieure (testé sous Node 22.x)
- **pnpm** : gestionnaire de paquets recommandé (`npm install -g pnpm`)
- **MongoDB** : instance locale en cours d'exécution sur le port par défaut (`mongodb://localhost:27017`)
- **MongoDB Compass** : recommandé pour visualiser graphiquement les collections et index BSON.

---

##  Installation & Démarrage

### 1. Cloner le Dépôt
```bash
git clone <URL_DU_DEPOT_GITHUB>
cd Banque
```

### 2. Configuration du Backend
```bash
cd backend
pnpm install

# Copier les variables d'environnement
copy .env.example .env
```

Vérifiez le contenu de `backend/.env` :
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/banque_epreuves
JWT_SECRET=cle_secrete_universite_jwt_2026
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Installation du Frontend
```bash
cd ../frontend
pnpm install
```

---

##  Gestion de la Base de Données (Scripts Utilitaires)

Depuis la racine du projet, vous disposez de 3 scripts dédiés :

### A. Peuplement complet avec données de démonstration (Seed)
Génère 5 matières, 2 comptes de test, 15 épreuves avec leurs **vrais fichiers PDF physiques générés sur le disque**, des corrigés types et des sessions d'entraînement :
```bash
node db/seed.js
```

### B. Remise à zéro pour tester avec vos propres données (Reset)
Supprime toutes les épreuves, corrigés, discussions et fichiers PDF pour repartir d'une base vierge, **tout en conservant vos comptes utilisateurs et vos matières** :
```bash
node db/reset.js
```

### C. Créer un nouvel Enseignant / Administrateur
Crée instantanément un compte administrateur avec mot de passe haché par `bcrypt` (ou promeut un compte existant) :
```bash
node db/creerAdmin.js <Nom> <Prenom> <Email> <MotDePasse>
```
*Exemple :*
```bash
node db/creerAdmin.js Traore Amadou prof.traore@universite.edu ProfPass123!
```

---

##  Lancement de l'Application

Ouvrez deux terminaux séparés :

### Terminal 1 — Serveur Backend (Port 5000)
```bash
cd backend
pnpm run dev
```
> Le serveur écoute sur **http://localhost:5000** et sert les fichiers statiques PDF sur `/uploads`.

### Terminal 2 — Application Frontend (Port 5173)
```bash
cd frontend
pnpm run dev
```
> L'interface s'ouvre sur **http://localhost:5173**.

---

##  Identifiants de Test Préconfigurés

| Profil | Email | Mot de Passe | Rôle & Droits |
| :--- | :--- | :--- | :--- |
| **Enseignant / Admin** | `admin@universite.edu` | `Admin1234!` | Accès Supervision, suppression épreuves, publication de corrigés certifiés |
| **Étudiant** | `etudiant@universite.edu` | `Etudiant1234!` | Accès Mon Apprentissage, dépôt d'annales, entraide, vote sur corrigés |

---

##  Documentation des Endpoints API

### Épreuves (`/api/epreuves`)
- `GET /api/epreuves` : liste paginée avec filtres (`matiere`, `annee`, `niveau`, `type`, `q`, `page`, `limite`).
- `GET /api/epreuves/:id` : fiche détaillée avec incrément atomique de vue (`$inc: { vues: 1 }`).
- `POST /api/epreuves` : création d'épreuve avec upload de PDF physique via Multer (`multipart/form-data`).
- `PUT /api/epreuves/:id` : mise à jour (admin uniquement).
- `DELETE /api/epreuves/:id` : suppression de l'épreuve et de son fichier physique (admin uniquement).

### Apprentissage & Supervision (`/api/apprentissage`)
- `GET /api/apprentissage/statistiques` : KPIs d'apprentissage personnel de l'étudiant via `$facet`.
- `GET /api/apprentissage/progression` : liste des révisions de l'étudiant connecté avec filtres.
- `GET /api/apprentissage/progression/:epreuveId` : état de révision d'une épreuve spécifique.
- `POST /api/apprentissage/progression/:epreuveId` : upsert natif de session d'entraînement.
- `GET /api/apprentissage/supervision` : métriques globales académiques et alertes pédagogiques (admin uniquement).

### Corrigés (`/api/corriges`)
- `GET /api/corriges/epreuve/:epreuveId` : corrigés d'un sujet avec décompte de votes utiles.
- `POST /api/corriges/epreuve/:epreuveId` : dépôt de corrigé avec fichier PDF physique.
- `POST /api/corriges/:corrigeId/vote` : vote utile atomique (`$addToSet` / `$pull`).
- `DELETE /api/corriges/:corrigeId` : suppression d'un corrigé (auteur ou admin).

### Entraide & Discussions (`/api/commentaires`)
- `GET /api/commentaires/epreuve/:epreuveId` : fil de discussion trié par date.
- `POST /api/commentaires/epreuve/:epreuveId` : publication d'une question ou réponse.
- `DELETE /api/commentaires/:commentaireId` : suppression d'un message.

### Matières (`/api/matieres`)
- `GET /api/matieres` : catalogue des disciplines universitaires.
- `POST /api/matieres` : création d'une discipline (admin uniquement).

### Authentification (`/api/auth`)
- `POST /api/auth/inscription` : création d'un compte étudiant (hachage bcrypt 12 tours).
- `POST /api/auth/connexion` : vérification des identifiants et émission du token JWT.
- `GET /api/auth/moi` : récupération du profil connecté à partir du token Bearer.

---

##  Technologies Utilisées

| Composant | Technologie | Description |
| :--- | :--- | :--- |
| **Backend** | Node.js, Express 4 | API REST modulaire et performante |
| **Base de Données** | MongoDB Natif Driver 7.x | Requêtes BSON natives sans surcouche ODM |
| **Uploads** | Multer 2.x | Stockage physique sur disque des fichiers PDF réels |
| **Sécurité** | bcryptjs, jsonwebtoken, Helmet, CORS | Hachage sécurisé, tokens JWT et protection HTTP |
| **Frontend** | React 18, Vite 5 | SPA fluide, performante avec Fast Refresh |
| **Routage** | React Router DOM 6 | Gestion des vues et routes protégées |
| **Style** | Tailwind CSS 3 | Design moderne, épuré, responsive et accessible |
| **Iconographie** | Lucide React | Icônes vectorielles cohérentes |
| **Notifications** | React Hot Toast | Retours visuels élégants et non intrusifs |

---

##  Licence
Projet réalisé dans un cadre académique universitaire — Usage éducatif et pédagogique.
