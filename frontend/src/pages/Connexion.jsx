// Page de connexion
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import Bouton from '../components/ui/Bouton';
import { extraireMessageErreur } from '../utils/helpers';

/**
 * Page Connexion - Formulaire d'authentification avec validation côté client
 */
const Connexion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { connecter, estConnecte } = useAuth();

  // Redirection si déjà connecté
  if (estConnecte) {
    navigate('/', { replace: true });
    return null;
  }

  // État du formulaire
  const [formulaire, setFormulaire] = useState({
    email: '',
    motDePasse: '',
  });

  // État de visibilité du mot de passe
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);
  // État de chargement pendant la connexion
  const [chargement, setChargement] = useState(false);
  // Message d'erreur global
  const [erreur, setErreur] = useState('');

  /**
   * Gère les changements dans les champs du formulaire
   */
  const gererChangement = (e) => {
    const { name, value } = e.target;
    setFormulaire((prev) => ({ ...prev, [name]: value }));
    if (erreur) setErreur(''); // Effacer l'erreur précédente
  };

  /**
   * Validation côté client avant soumission
   */
  const valider = () => {
    if (!formulaire.email.trim()) return "L'adresse email est obligatoire";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulaire.email)) return "Format d'email invalide";
    if (!formulaire.motDePasse) return 'Le mot de passe est obligatoire';
    return null;
  };

  /**
   * Gère la soumission du formulaire
   */
  const gererSoumission = async (e) => {
    e.preventDefault();

    // Validation côté client
    const messageErreur = valider();
    if (messageErreur) {
      setErreur(messageErreur);
      return;
    }

    setChargement(true);
    setErreur('');

    try {
      const reponse = await connecter({
        email: formulaire.email.toLowerCase().trim(),
        motDePasse: formulaire.motDePasse,
      });

      toast.success('Connexion réussie !');

      // Redirection contextuelle selon le rôle
      let destination = location.state?.from?.pathname;
      if (!destination || destination === '/') {
        destination = reponse.utilisateur?.role === 'admin' ? '/supervision' : '/apprentissage';
      }
      navigate(destination, { replace: true });
    } catch (err) {
      const message = extraireMessageErreur(err);
      setErreur(message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* En-tête */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-xl mb-2">
            <BookOpen className="w-7 h-7" />
            Banque d'Épreuves
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Connexion</h1>
          <p className="text-gray-500 text-sm mt-1">
            Accédez à votre espace personnel
          </p>
        </div>

        {/* Carte formulaire */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8">
          {/* Message d'erreur global */}
          {erreur && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-5 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{erreur}</span>
            </div>
          )}

          <form onSubmit={gererSoumission} noValidate className="space-y-5">
            {/* Champ email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formulaire.email}
                onChange={gererChangement}
                placeholder="votre@email.com"
                autoComplete="email"
                required
                className="champ-formulaire"
                aria-describedby={erreur ? 'erreur-connexion' : undefined}
              />
            </div>

            {/* Champ mot de passe */}
            <div>
              <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="motDePasse"
                  type={motDePasseVisible ? 'text' : 'password'}
                  name="motDePasse"
                  value={formulaire.motDePasse}
                  onChange={gererChangement}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="champ-formulaire pr-11"
                />
                {/* Bouton afficher/masquer le mot de passe */}
                <button
                  type="button"
                  onClick={() => setMotDePasseVisible((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={motDePasseVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {motDePasseVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <Bouton
              type="submit"
              variante="primaire"
              pleineLargeur
              chargement={chargement}
              taille="lg"
            >
              {chargement ? 'Connexion en cours...' : 'Se connecter'}
            </Bouton>
          </form>

          {/* Lien vers l'inscription */}
          <p className="text-center text-sm text-gray-500 mt-5">
            Pas encore de compte ?{' '}
            <Link
              to="/inscription"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              S'inscrire gratuitement
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Connexion;
