// Page d'inscription
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import Bouton from '../components/ui/Bouton';
import { extraireMessageErreur } from '../utils/helpers';

/**
 * Page Inscription - Formulaire de création de compte avec validation
 */
const Inscription = () => {
  const navigate = useNavigate();
  const { inscrire, estConnecte } = useAuth();

  // Redirection si déjà connecté
  if (estConnecte) {
    navigate('/', { replace: true });
    return null;
  }

  // État du formulaire
  const [formulaire, setFormulaire] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    confirmationMotDePasse: '',
  });

  // État de visibilité des mots de passe
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  // Erreurs par champ
  const [erreursChamps, setErrreursChamps] = useState({});

  /**
   * Gère les changements dans les champs
   */
  const gererChangement = (e) => {
    const { name, value } = e.target;
    setFormulaire((prev) => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ modifié
    if (erreursChamps[name]) {
      setErrreursChamps((prev) => ({ ...prev, [name]: '' }));
    }
    if (erreur) setErreur('');
  };

  /**
   * Validation complète du formulaire
   * @returns {Object} Objet d'erreurs par champ, vide si tout est valide
   */
  const valider = () => {
    const errs = {};
    if (!formulaire.prenom.trim()) errs.prenom = 'Le prénom est obligatoire';
    if (!formulaire.nom.trim()) errs.nom = 'Le nom est obligatoire';
    if (!formulaire.email.trim()) {
      errs.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulaire.email)) {
      errs.email = "Format d'email invalide";
    }
    if (!formulaire.motDePasse) {
      errs.motDePasse = 'Le mot de passe est obligatoire';
    } else if (formulaire.motDePasse.length < 6) {
      errs.motDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (formulaire.motDePasse !== formulaire.confirmationMotDePasse) {
      errs.confirmationMotDePasse = 'Les mots de passe ne correspondent pas';
    }
    return errs;
  };

  // Indicateur de force du mot de passe
  const forceMotDePasse = () => {
    const mdp = formulaire.motDePasse;
    if (!mdp) return { niveau: 0, label: '', couleur: '' };
    let score = 0;
    if (mdp.length >= 6) score++;
    if (mdp.length >= 10) score++;
    if (/[A-Z]/.test(mdp)) score++;
    if (/[0-9]/.test(mdp)) score++;
    if (/[^A-Za-z0-9]/.test(mdp)) score++;
    if (score <= 2) return { niveau: score, label: 'Faible', couleur: 'bg-red-500' };
    if (score <= 3) return { niveau: score, label: 'Moyen', couleur: 'bg-orange-500' };
    return { niveau: score, label: 'Fort', couleur: 'bg-green-500' };
  };

  /**
   * Gère la soumission du formulaire
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
      await inscrire({
        nom: formulaire.nom.trim(),
        prenom: formulaire.prenom.trim(),
        email: formulaire.email.toLowerCase().trim(),
        motDePasse: formulaire.motDePasse,
      });

      toast.success('Compte créé avec succès ! Bienvenue 🎉');
      navigate('/', { replace: true });
    } catch (err) {
      const message = extraireMessageErreur(err);
      setErreur(message);
    } finally {
      setChargement(false);
    }
  };

  const force = forceMotDePasse();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* En-tête */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-xl">
            <BookOpen className="w-7 h-7" />
            Banque d'Épreuves
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Créer un compte</h1>
          <p className="text-gray-500 text-sm mt-1">Rejoignez la plateforme gratuitement</p>
        </div>

        {/* Carte formulaire */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
          {/* Erreur globale */}
          {erreur && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-5 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{erreur}</span>
            </div>
          )}

          <form onSubmit={gererSoumission} noValidate className="space-y-4">
            {/* Prénom et Nom sur la même ligne */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Prénom *
                </label>
                <input
                  id="prenom"
                  type="text"
                  name="prenom"
                  value={formulaire.prenom}
                  onChange={gererChangement}
                  placeholder="Alice"
                  autoComplete="given-name"
                  className={`champ-formulaire ${erreursChamps.prenom ? 'border-red-400 focus:ring-red-500' : ''}`}
                />
                {erreursChamps.prenom && (
                  <p className="text-xs text-red-600 mt-1">{erreursChamps.prenom}</p>
                )}
              </div>
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom *
                </label>
                <input
                  id="nom"
                  type="text"
                  name="nom"
                  value={formulaire.nom}
                  onChange={gererChangement}
                  placeholder="Dupont"
                  autoComplete="family-name"
                  className={`champ-formulaire ${erreursChamps.nom ? 'border-red-400 focus:ring-red-500' : ''}`}
                />
                {erreursChamps.nom && (
                  <p className="text-xs text-red-600 mt-1">{erreursChamps.nom}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse email *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formulaire.email}
                onChange={gererChangement}
                placeholder="alice.dupont@etudiant.univ.fr"
                autoComplete="email"
                className={`champ-formulaire ${erreursChamps.email ? 'border-red-400 focus:ring-red-500' : ''}`}
              />
              {erreursChamps.email && (
                <p className="text-xs text-red-600 mt-1">{erreursChamps.email}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  id="motDePasse"
                  type={motDePasseVisible ? 'text' : 'password'}
                  name="motDePasse"
                  value={formulaire.motDePasse}
                  onChange={gererChangement}
                  placeholder="Au moins 6 caractères"
                  autoComplete="new-password"
                  className={`champ-formulaire pr-11 ${erreursChamps.motDePasse ? 'border-red-400 focus:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setMotDePasseVisible((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={motDePasseVisible ? 'Masquer' : 'Afficher'}
                >
                  {motDePasseVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Indicateur de force du mot de passe */}
              {formulaire.motDePasse && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${force.couleur}`}
                      style={{ width: `${(force.niveau / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Force : <span className="font-medium">{force.label}</span>
                  </p>
                </div>
              )}
              {erreursChamps.motDePasse && (
                <p className="text-xs text-red-600 mt-1">{erreursChamps.motDePasse}</p>
              )}
            </div>

            {/* Confirmation du mot de passe */}
            <div>
              <label htmlFor="confirmationMotDePasse" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <input
                  id="confirmationMotDePasse"
                  type={confirmVisible ? 'text' : 'password'}
                  name="confirmationMotDePasse"
                  value={formulaire.confirmationMotDePasse}
                  onChange={gererChangement}
                  placeholder="Répétez le mot de passe"
                  autoComplete="new-password"
                  className={`champ-formulaire pr-11 ${erreursChamps.confirmationMotDePasse ? 'border-red-400 focus:ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setConfirmVisible((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={confirmVisible ? 'Masquer' : 'Afficher'}
                >
                  {confirmVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {/* Indicateur de correspondance */}
                {formulaire.confirmationMotDePasse && formulaire.motDePasse === formulaire.confirmationMotDePasse && (
                  <CheckCircle className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>
              {erreursChamps.confirmationMotDePasse && (
                <p className="text-xs text-red-600 mt-1">{erreursChamps.confirmationMotDePasse}</p>
              )}
            </div>

            {/* Bouton de soumission */}
            <Bouton
              type="submit"
              variante="primaire"
              pleineLargeur
              chargement={chargement}
              taille="lg"
              className="mt-2"
            >
              {chargement ? 'Création du compte...' : 'Créer mon compte'}
            </Bouton>
          </form>

          {/* Lien vers la connexion */}
          <p className="text-center text-sm text-gray-500 mt-5">
            Déjà inscrit ?{' '}
            <Link to="/connexion" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Inscription;
