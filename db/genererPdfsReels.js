// Générateur de vrais fichiers PDF physiques d'examens et de corrigés universitaires
const fs = require('fs');
const path = require('path');

// Ajout du chemin des modules du backend
module.paths.push(path.join(__dirname, '../backend/node_modules'));
const PDFDocument = require('pdfkit');

const dossierUploads = path.join(__dirname, '../backend/uploads/epreuves');
const dossierCorriges = path.join(__dirname, '../backend/uploads/corriges');

[dossierUploads, dossierCorriges].forEach((dossier) => {
  if (!fs.existsSync(dossier)) {
    fs.mkdirSync(dossier, { recursive: true });
  }
});

/**
 * Génère un véritable fichier PDF de sujet d'examen universitaire format A4
 */
function genererFichierPDF({ fichierNom, titre, matiereNom, matiereCode, annee, niveau, type, questions }) {
  return new Promise((resolve, reject) => {
    const cheminComplet = path.join(dossierUploads, fichierNom);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const fluxSortie = fs.createWriteStream(cheminComplet);

    doc.pipe(fluxSortie);

    // En-tête universitaire
    doc.fontSize(10).fillColor('#4B5563')
      .text('UNIVERSITÉ DES SCIENCES ET TECHNOLOGIES', { align: 'center' })
      .text('Département d\'Informatique et de Mathématiques', { align: 'center' })
      .text(`Année Académique ${annee - 1} - ${annee}`, { align: 'center' });

    doc.moveDown(0.5);
    doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Bloc informations épreuve
    doc.fontSize(16).fillColor('#1E3A8A').font('Helvetica-Bold')
      .text(titre, { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#374151').font('Helvetica')
      .text(`Matière : ${matiereNom} (${matiereCode})  |  Niveau : ${niveau}`, { align: 'center' })
      .text(`Type d'évaluation : ${type}  |  Session Principale`, { align: 'center' })
      .text('Durée : 2 heures 00  |  Calculatrices et documents non autorisés', { align: 'center' });

    doc.moveDown(1);
    doc.strokeColor('#2563EB').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1.5);

    // Corps du sujet d'examen
    doc.fontSize(12).fillColor('#1F2937').font('Helvetica-Bold')
      .text('SUJET DE L\'ÉPREUVE (Barème sur 20 points)');
    doc.moveDown(0.8);

    questions.forEach((q, idx) => {
      doc.fontSize(11).fillColor('#1D4ED8').font('Helvetica-Bold')
        .text(`Exercice ${idx + 1} : ${q.titre} (${q.points} points)`);
      doc.moveDown(0.3);

      doc.fontSize(10).fillColor('#374151').font('Helvetica')
        .text(q.enonce, { lineGap: 3, indent: 15 });
      doc.moveDown(0.8);
    });

    // Bas de page
    doc.fontSize(9).fillColor('#9CA3AF')
      .text('Banque d\'Épreuves en Ligne — Copie conforme pour usage pédagogique.', 50, 780, { align: 'center' });

    doc.end();

    fluxSortie.on('finish', () => resolve(cheminComplet));
    fluxSortie.on('error', reject);
  });
}

/**
 * Génère un véritable fichier PDF de corrigé universitaire
 */
function genererCorrigePDF({ fichierNom, titre, matiereNom, matiereCode, annee, solutions }) {
  return new Promise((resolve, reject) => {
    const cheminComplet = path.join(dossierCorriges, fichierNom);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const fluxSortie = fs.createWriteStream(cheminComplet);

    doc.pipe(fluxSortie);

    // En-tête
    doc.fontSize(10).fillColor('#065F46')
      .text('UNIVERSITÉ DES SCIENCES ET TECHNOLOGIES — CORRIGÉ OFFICIEL', { align: 'center' })
      .text(`Matière : ${matiereNom} (${matiereCode})  |  Session ${annee}`, { align: 'center' });

    doc.moveDown(0.5);
    doc.strokeColor('#10B981').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    doc.fontSize(16).fillColor('#047857').font('Helvetica-Bold')
      .text(titre, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#4B5563').font('Helvetica')
      .text('Document de révision validé par l\'équipe pédagogique.', { align: 'center' });

    doc.moveDown(1.5);

    solutions.forEach((s, idx) => {
      doc.fontSize(12).fillColor('#065F46').font('Helvetica-Bold')
        .text(`Correction Exercice ${idx + 1} : ${s.titre}`);
      doc.moveDown(0.4);

      doc.fontSize(10).fillColor('#1F2937').font('Helvetica')
        .text(s.correction, { lineGap: 3, indent: 15 });
      doc.moveDown(1);
    });

    // Pied de page
    doc.fontSize(9).fillColor('#9CA3AF')
      .text('Banque d\'Épreuves en Ligne — Corrigé d\'entraînement pour le Contrôle Continu.', 50, 780, { align: 'center' });

    doc.end();

    fluxSortie.on('finish', () => resolve(cheminComplet));
    fluxSortie.on('error', reject);
  });
}

module.exports = { genererFichierPDF, genererCorrigePDF, dossierUploads, dossierCorriges };
