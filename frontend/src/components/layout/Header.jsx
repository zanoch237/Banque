// Composant Header / Barre Supérieure (Design Universitaire Moderne)
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  PanelLeftClose,
  PanelLeft,
  Search,
  PlusCircle,
  GraduationCap,
  ShieldCheck,
  User,
  LogOut,
  Database,
  ArrowRight,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

/**
 * En-tête supérieur de l'application
 */
const Header = ({ repliee, onToggleReplie, onOuvrirMobile }) => {
  const { utilisateur, estConnecte, estAdmin, deconnecter } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Titre contextuel selon la route courante
  const obtenirTitrePage = () => {
    const chemin = location.pathname;
    if (chemin === '/') return 'Accueil & Recherche';
    if (chemin.startsWith('/epreuves/')) return 'Détail de l\'Épreuve';
    if (chemin === '/epreuves') return 'Banque d\'Épreuves Complète';
    if (chemin === '/apprentissage') return 'Espace d\'Apprentissage & Révisions';
    if (chemin === '/supervision') return 'Supervision Académique & Enseignant';
    if (chemin === '/ajouter-epreuve') return 'Dépôt d\'une Épreuve';
    if (chemin === '/connexion') return 'Portail d\'Authentification';
    if (chemin === '/inscription') return 'Création de Compte';
    return 'Portail Académique';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
      {/* ─── Côté Gauche : Contrôles de la Sidebar & Titre ─── */}
      <div className="flex items-center gap-3">
        {/* Bouton Hamburger Mobile */}
        <button
          onClick={onOuvrirMobile}
          className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Bouton Rétracter / Déplier Desktop */}
        <button
          onClick={onToggleReplie}
          className="hidden md:flex p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          title={repliee ? 'Agrandir la barre latérale' : 'Réduire la barre latérale'}
        >
          {repliee ? (
            <PanelLeft className="w-5 h-5 text-blue-600" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        {/* Titre de page dynamique */}
        <div className="hidden sm:block">
          <h1 className="text-base font-bold text-gray-800 leading-tight">
            {obtenirTitrePage()}
          </h1>
          <span className="text-[11px] text-gray-400 font-medium">
            Banque d'anciennes épreuves en ligne
          </span>
        </div>
      </div>

      {/* ─── Côté Droit : Badges, Actions et Profil ─── */}
      <div className="flex items-center gap-3">
        {/* Badge Base de données */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>MongoDB Natif</span>
        </div>

        {/* Bouton d'action rapide selon le rôle */}
        {estConnecte && (
          <Link
            to="/ajouter-epreuve"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl transition-all shadow-sm hover:shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{estAdmin ? 'Publier un sujet' : 'Déposer épreuve'}</span>
          </Link>
        )}

        {/* Profil utilisateur & Rôle */}
        {estConnecte ? (
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="flex flex-col text-right hidden sm:block">
              <span className="text-xs font-bold text-gray-800">
                {utilisateur?.prenom} {utilisateur?.nom}
              </span>
              <span className="text-[10px] font-semibold text-gray-500 flex items-center justify-end gap-1">
                {estAdmin ? (
                  <span className="text-indigo-600 font-bold">Enseignant / Admin</span>
                ) : (
                  <span className="text-blue-600 font-bold">Étudiant</span>
                )}
              </span>
            </div>

            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                estAdmin
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600'
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
              }`}
            >
              {utilisateur?.prenom ? utilisateur.prenom[0].toUpperCase() : 'U'}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/connexion"
              className="text-xs font-semibold text-gray-700 hover:text-blue-600 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Connexion
            </Link>
            <Link
              to="/inscription"
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl transition-all shadow-xs"
            >
              S'inscrire
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;