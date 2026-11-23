// Middleware d'upload de fichiers PDF avec Multer pour épreuves et corrigés
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dossiers de destination
const dossierEpreuves = path.join(__dirname, '../../uploads/epreuves');
const dossierCorriges = path.join(__dirname, '../../uploads/corriges');

[dossierEpreuves, dossierCorriges].forEach((dossier) => {
  if (!fs.existsSync(dossier)) {
    fs.mkdirSync(dossier, { recursive: true });
  }
});

// Créateur de stockage selon le sous-dossier
const creerStockage = (dossierCible) =>
  multer.diskStorage({
    destination: (req, fichier, cb) => {
      cb(null, dossierCible);
    },
    filename: (req, fichier, cb) => {
      const extension = path.extname(fichier.originalname).toLowerCase();
      const nomBase = path.basename(fichier.originalname, extension)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 30);
      const nomUnique = `${nomBase}_${Date.now()}${extension}`;
      cb(null, nomUnique);
    },
  });

// Filtre pour autoriser uniquement les fichiers PDF
const filtreFichier = (req, fichier, cb) => {
  if (fichier.mimetype === 'application/pdf' || path.extname(fichier.originalname).toLowerCase() === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers au format PDF sont acceptés.'), false);
  }
};

// Upload pour les épreuves
const upload = multer({
  storage: creerStockage(dossierEpreuves),
  fileFilter: filtreFichier,
  limits: { fileSize: 25 * 1024 * 1024 },
});

// Upload pour les corrigés
const uploadCorrige = multer({
  storage: creerStockage(dossierCorriges),
  fileFilter: filtreFichier,
  limits: { fileSize: 25 * 1024 * 1024 },
});

module.exports = upload;
module.exports.uploadCorrige = uploadCorrige;
