# Répertoire DB — Driver MongoDB Natif & Vrais Fichiers PDF

Ce répertoire contient les scripts pour initialiser la base de données MongoDB nativement avec des données 100% réelles et générer physiquement les véritables sujets d'examen en PDF.

## Contenu

```
db/
├── seed.js             # Script de seed avec le Driver Officiel MongoDB Natif (MongoClient)
├── genererPdfsReels.js # Générateur de véritables fichiers PDF physiques (A4, en-tête, questions)
└── README.md           # Ce fichier de documentation
```

## Fonctionnement

1. **Driver MongoDB Natif (`mongodb` v7+)** :
   - Connexion via `MongoClient`.
   - Utilisation des méthodes officielles : `db.collection('...').insertMany()`, `createIndex()`.
   - Schéma de données avec identifiants natifs `ObjectId`.

2. **Fichiers PDF Réels Physiques** :
   - Chaque épreuve génère un vrai fichier `.pdf` stocké dans `backend/uploads/epreuves/`.
   - En-tête officiel universitaire, barème sur 20 points, questions et exercices complets.
   - Les documents MongoDB enregistrent le chemin réel (`/uploads/epreuves/...`) et la taille en octets.

## Exécution du seed

```bash
cd d:\Banque\backend
pnpm run seed
```

## Données créées et consultables dans MongoDB Compass

### 5 Matières (`db.matieres`)
| Code     | Nom                 | Département  | Couleur |
|----------|---------------------|--------------|---------|
| INFO101  | Algorithmique       | Informatique | Bleu    |
| INFO202  | Base de données     | Informatique | Violet  |
| INFO303  | Réseaux             | Informatique | Vert    |
| INFO404  | Programmation Web   | Informatique | Orange  |
| MATH101  | Mathématiques       | Mathématiques| Rouge   |

### 2 Utilisateurs (`db.utilisateurs`)
| Email                      | Mot de passe    | Rôle     |
|----------------------------|-----------------|----------|
| admin@universite.edu       | Admin1234!      | admin    |
| etudiant@universite.edu    | Etudiant1234!   | etudiant |

### 15 Épreuves avec Vrais PDF (`db.epreuves`)
15 vrais sujets d'examen au format PDF (Licence 1 à Master 1, années 2022 à 2025).
Consultables directement dans l'interface et enregistrés sur le disque dans `backend/uploads/epreuves/`.
