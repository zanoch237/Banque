// Application Express principale avec Driver MongoDB Natif et Multer
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import des routes
const routesEpreuves = require('./routes/epreuves');
const routesMatieres = require('./routes/matieres');
const routesAuth = require('./routes/auth');
const routesApprentissage = require('./routes/apprentissage');
const routesCorriges = require('./routes/corriges');
const routesCommentaires = require('./routes/commentaires');

// Import du gestionnaire d'erreurs global
const gestionnaireErreurs = require('./middleware/errorHandler');

const app = express();

// ─── Sécurité ───────────────────────────────────────────────────────────────

// En-têtes de sécurité HTTP (autorise le chargement des fichiers statiques PDF)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Configuration CORS : autorise le frontend React en développement
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

// Limitation du taux de requêtes — seuil généreux pour le développement local
// En production, réduire max à 100 et windowMs à 15 * 60 * 1000
const limiteurRequetes = rateLimit({
  windowMs: 15 * 60 * 1000,  // Fenêtre de 15 minutes
  max: process.env.NODE_ENV === 'production' ? 150 : 2000, // 2000 requêtes/15 min en dev
  message: {
    succes: false,
    message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV !== 'production', // Désactiver complètement en développement
});

app.use('/api/', limiteurRequetes);

// ─── Middleware généraux ────────────────────────────────────────────────────

// Journalisation des requêtes HTTP
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parsing du corps des requêtes JSON
app.use(express.json({ limit: '10mb' }));

// Parsing des données de formulaire encodées en URL
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Fichiers statiques : Distribution des vrais PDF physiques ──────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Routes API ─────────────────────────────────────────────────────────────

// Route de vérification de santé
app.get('/api/sante', (req, res) => {
  res.status(200).json({
    succes: true,
    message: 'API Banque d\'Épreuves opérationnelle (Driver MongoDB Natif)',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Montage des routes
app.use('/api/epreuves', routesEpreuves);
app.use('/api/matieres', routesMatieres);
app.use('/api/auth', routesAuth);
app.use('/api/apprentissage', routesApprentissage);
app.use('/api/corriges', routesCorriges);
app.use('/api/commentaires', routesCommentaires);

// Gestion des routes non trouvées (404)
app.use((req, res) => {
  res.status(404).json({
    succes: false,
    message: `Route introuvable : ${req.method} ${req.originalUrl}`,
  });
});

// Gestionnaire d'erreurs global
app.use(gestionnaireErreurs);

module.exports = app;
