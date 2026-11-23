// Page d'ajout d'une nouvelle épreuve
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle, X, AlertCircle, Upload, FileCheck, FileText, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { creerEpreuve, obtenirMatieres } from '../services/api';
import useAuth from '../hooks/useAuth';
import Bouton from '../components/ui/Bouton';
import { genererAnnees, extraireMessageErreur } from '../utils/helpers';

// Constantes pour les options des sélecteurs
const NIVEAUX = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'];
const TYPES = ['Examen', 'Partiel', 'TP', 'TD', 'Rattrapage'];

/**
 * Page AjouterEpreuve - Formulaire de soumission d'une nouvelle épreuve
 * Protégée : accessible uniquement aux utilisateurs connectés
 */
const AjouterEpreuve = () => {
  const navigate = useNavigate();
  const { estConnecte } = useAuth();
  const annees = genererAnnees();

  // Redirection si non connecté
  useEffect(() => {
    if (!estConnecte) {
      toast.error('Vous devez être connecté pour soumettre une épreuve');
      navigate('/connexion', { state: { from: { pathname: '/ajouter-epreuve' } } });
    }
  }, [estConnecte, navigate]);

  // État du formulaire
  const [formulaire, setFormulaire] = useState({
    titre: '',
    description: '',
    matiere: '',
    annee: new Date().getFullYear(),
    niveau: '',
    type: '',
    fichierUrl: '',
    fichierNom: '',
  });

  // État du fichier physique réel sélectionné
  const [fichierPDF, setFichierPDF] = useState(null);

  // État des tags
  const [tags, setTags] = useState([]);
  const [tagSaisi, setTagSaisi] = useState('');

  // État global
  const [matieres, setMatieres] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [chargementMatieres, setChargementMatieres] = useState(true);
  const [erreur, setErreur] = useState('');
  const [erreursChamps, setErrreursChamps] = useState({});

  // Chargement de la liste des matières
  useEffect(() => {
    const chargerMatieres = async () => {
      try {
        const reponse = await obtenirMatieres();
        setMatieres(reponse.data.donnees);
      } catch (err) {
        toast.error('Impossible de charger les matières');
      } finally {
        setChargementMatieres(false);
      }
    };
    chargerMatieres();
  }, []);

  /**
   * Gère les changements dans les champs du formulaire
   */
  const gererChangement = (e) => {
    const { name, value } = e.target;
    setFormulaire((prev) => ({ ...prev, [name]: value }));
    if (erreursChamps[name]) {
      setErrreursChamps((prev) => ({ ...prev, [name]: '' }));
    }
    if (erreur) setErreur('');
  };

  /**
   * Ajoute un tag à la liste
   */
  const ajouterTag = () => {
    const tag = tagSaisi.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags((prev) => [...prev, tag]);
      setTagSaisi('');
    }
  };

  /**
   * Gère la touche Entrée pour ajouter un tag
   */
  const gererToucheTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      ajouterTag();
    }
  };

  /**
   * Supprime un tag de la liste
   */
  const supprimerTag = (tagASupprimer) => {
    setTags((prev) => prev.filter((t) => t !== tagASupprimer));
  };

  /**
   * Gère la sélection d'un fichier PDF physique
   */
  const gererChangementFichier = (e) => {
    const fichier = e.target.files[0];
    if (fichier) {
      if (fichier.type !== 'application/pdf' && !fichier.name.toLowerCase().endsWith('.pdf')) {
        toast.error('Seuls les fichiers PDF sont acceptés.');
        return;
      }
      setFichierPDF(fichier);
    }
  };

  /**
   * Validation du formulaire
   */
  const valider = () => {
    const errs = {};
    if (!formulaire.titre.trim()) errs.titre = 'Le titre est obligatoire';
    if (!formulaire.matiere) errs.matiere = 'La matière est obligatoire';
    if (!formulaire.annee) errs.annee = "L'année est obligatoire";
    return errs;
  };

  /**
   * Gère la soumission du formulaire avec FormData pour l'upload réel
   */
  const gererSoumission = async (e) => {
    e.preventDefault();

    const errs = valider();
    if (Object.keys(errs).length > 0) {
      setErrreursChamps(errs);
      return;
    }

    setChargement(true);
    setErreur('');

    try {
      // Utilisation de FormData pour envoyer le vrai fichier binaire
      const formData = new FormData();
      formData.append('titre', formulaire.titre.trim());
      formData.append('matiere', formulaire.matiere);
      formData.append('annee', formulaire.annee);
      if (formulaire.niveau) formData.append('niveau', formulaire.niveau);
      if (formulaire.type) formData.append('type', formulaire.type);
      if (formulaire.description.trim()) formData.append('description', formulaire.description.trim());
      formData.append('tags', JSON.stringify(tags));

      if (fichierPDF) {
        // Envoi du vrai fichier binaire au backend
        formData.append('fichier', fichierPDF);
      } else if (formulaire.fichierUrl.trim()) {
        formData.append('fichierUrl', formulaire.fichierUrl.trim());
        if (formulaire.fichierNom.trim()) formData.append('fichierNom', formulaire.fichierNom.trim());
      }

      const reponse = await creerEpreuve(formData);
      toast.success('Épreuve et fichier PDF enregistrés avec succès !');
      navigate(`/epreuves/${reponse.data.donnees._id}`);
    } catch (err) {
      const message = extraireMessageErreur(err);
      setErreur(message);
    } finally {
      setChargement(false);
    }
  };

  if (!estConnecte) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Bouton retour */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-blue-600" />
          Soumettre une épreuve
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Partagez une épreuve avec la communauté universitaire
        </p>
      </div>

      {/* Carte formulaire */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
        {/* Erreur globale */}
        {erreur && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{erreur}</span>
          </div>
        )}

        <form onSubmit={gererSoumission} noValidate className="space-y-5">
          {/* Titre */}
          <div>
            <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-1.5">
              Titre de l'épreuve *
            </label>
            <input
              id="titre"
              type="text"
              name="titre"
              value={formulaire.titre}
              onChange={gererChangement}
              placeholder="ex: Examen de Base de données - Session 1"
              className={`champ-formulaire ${erreursChamps.titre ? 'border-red-400' : ''}`}
              maxLength={200}
            />
            {erreursChamps.titre && (
              <p className="text-xs text-red-600 mt-1">{erreursChamps.titre}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-gray-400">(facultatif)</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formulaire.description}
              onChange={gererChangement}
              placeholder="Décrivez le contenu ou le contexte de l'épreuve..."
              rows={3}
              className="champ-formulaire resize-none"
              maxLength={1000}
            />
          </div>

          {/* Matière */}
          <div>
            <label htmlFor="matiere" className="block text-sm font-medium text-gray-700 mb-1.5">
              Matière *
            </label>
            <select
              id="matiere"
              name="matiere"
              value={formulaire.matiere}
              onChange={gererChangement}
              className={`champ-formulaire ${erreursChamps.matiere ? 'border-red-400' : ''}`}
              disabled={chargementMatieres}
            >
              <option value="">
                {chargementMatieres ? 'Chargement...' : '— Sélectionner une matière —'}
              </option>
              {matieres.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.nom} ({m.code})
                </option>
              ))}
            </select>
            {erreursChamps.matiere && (
              <p className="text-xs text-red-600 mt-1">{erreursChamps.matiere}</p>
            )}
          </div>

          {/* Année, Niveau, Type sur une grille */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Année */}
            <div>
              <label htmlFor="annee" className="block text-sm font-medium text-gray-700 mb-1.5">
                Année *
              </label>
              <select
                id="annee"
                name="annee"
                value={formulaire.annee}
                onChange={gererChangement}
                className={`champ-formulaire ${erreursChamps.annee ? 'border-red-400' : ''}`}
              >
                {annees.map((annee) => (
                  <option key={annee} value={annee}>{annee}</option>
                ))}
              </select>
            </div>

            {/* Niveau */}
            <div>
              <label htmlFor="niveau" className="block text-sm font-medium text-gray-700 mb-1.5">
                Niveau
              </label>
              <select
                id="niveau"
                name="niveau"
                value={formulaire.niveau}
                onChange={gererChangement}
                className="champ-formulaire"
              >
                <option value="">— Niveau —</option>
                {NIVEAUX.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1.5">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formulaire.type}
                onChange={gererChangement}
                className="champ-formulaire"
              >
                <option value="">— Type —</option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload du Vrai Fichier PDF Physique */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Fichier de l'épreuve (PDF réel physique)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Téléversez le vrai sujet d'examen depuis votre ordinateur (stocké dans <code>backend/uploads/</code>).
            </p>

            {fichierPDF ? (
              <div className="flex items-center justify-between bg-white border border-blue-300 rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-800 font-medium truncate">
                  <FileCheck className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="truncate">{fichierPDF.name}</span>
                  <span className="text-xs text-gray-400">({(fichierPDF.size / 1024).toFixed(0)} Ko)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFichierPDF(null)}
                  className="text-red-500 hover:text-red-700 p-1.5 rounded transition-colors"
                  title="Retirer ce fichier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-lg p-6 cursor-pointer bg-white transition-colors">
                  <Upload className="w-8 h-8 text-blue-500 mb-2" />
                  <span className="text-sm font-medium text-blue-600 hover:underline">
                    Parcourir les fichiers (choisir un PDF)
                  </span>
                  <span className="text-xs text-gray-400 mt-1">Format PDF uniquement (max 25 Mo)</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={gererChangementFichier}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tags <span className="text-gray-400">(facultatif, max 10)</span>
            </label>
            {/* Liste des tags ajoutés */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => supprimerTag(tag)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      aria-label={`Supprimer le tag "${tag}"`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {/* Champ de saisie des tags */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagSaisi}
                onChange={(e) => setTagSaisi(e.target.value)}
                onKeyDown={gererToucheTag}
                placeholder="Ajouter un tag (Entrée pour valider)"
                className="champ-formulaire flex-1"
                disabled={tags.length >= 10}
              />
              <Bouton
                type="button"
                variante="secondaire"
                onClick={ajouterTag}
                disabled={!tagSaisi.trim() || tags.length >= 10}
                taille="md"
              >
                Ajouter
              </Bouton>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Appuyez sur Entrée ou utilisez le bouton pour ajouter un tag
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-2">
            <Bouton
              type="button"
              variante="secondaire"
              onClick={() => navigate(-1)}
            >
              Annuler
            </Bouton>
            <Bouton
              type="submit"
              variante="primaire"
              chargement={chargement}
              className="flex-1"
            >
              {chargement ? 'Envoi en cours...' : 'Soumettre l\'épreuve'}
            </Bouton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AjouterEpreuve;
