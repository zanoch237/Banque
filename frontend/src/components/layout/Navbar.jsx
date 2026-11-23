// Composant de barre de navigation principale
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, LogOut, User, PlusCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

/**
 * Composant Navbar - Barre de navigation principale
 * Affiche les liens de navigation et les options d'authentification
 */
const Navbar = () => {
  // État pour le menu mobile
  const [menuOuvert, setMenuOuvert] = useState(false);
  const { utilisateur, estConnecte, deconnecter } = useAuth();
  const navigate = useNavigate();

  /**
   * Gère la déconnexion de l'utilisateur
   */
  const gererDeconnexion = () => {
    deconnecter();
    setMenuOuvert(false);
    navigate('/');
  };

  // Classes pour les liens actifs de la navigation
  const classesLienActif = ({ isActive }) =>
    isActive
      ? 'text-blue-600 font-semibold'
      : 'text-gray-600 hover:text-gray-900 transition-colors';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et nom de l'application */}
          <Link
            to="/"
            className="flex items-center gap-2 text-blue-600 font-bold text-lg hover:text-blue-700 transition-colors"
          >
            <BookOpen className="w-6 h-6" />
            <span className="hidden sm:block">Banque d'Épreuves</span>
          </Link>

          {/* Navigation principale (desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={classesLienActif} end>
              Accueil
            </NavLink>
            <NavLink to="/epreuves" className={classesLienActif}>
              Épreuves
            </NavLink>
            {/* Liens visibles pour les utilisateurs connectés */}
            {estConnecte && (
              <>
                <NavLink to="/apprentissage" className={classesLienActif}>
                  Mon Apprentissage
                </NavLink>
                <NavLink to="/ajouter-epreuve" className={classesLienActif}>
                  Ajouter
                </NavLink>
              </>
            )}
          </div>

          {/* Actions utilisateur (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {estConnecte ? (
              <>
                {/* Bouton d'ajout d'épreuve */}
                <Link
                  to="/ajouter-epreuve"
                  className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  Soumettre
                </Link>
                {/* Informations utilisateur */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{utilisateur?.prenom}</span>
                </div>
                {/* Bouton de déconnexion */}
                <button
                  onClick={gererDeconnexion}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  aria-label="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/connexion"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Bouton menu mobile */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOuvert(!menuOuvert)}
            aria-label={menuOuvert ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {menuOuvert ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu mobile déroulant */}
        {menuOuvert && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block py-2 text-sm ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'}`
              }
              onClick={() => setMenuOuvert(false)}
              end
            >
              Accueil
            </NavLink>
            <NavLink
              to="/epreuves"
              className={({ isActive }) =>
                `block py-2 text-sm ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'}`
              }
              onClick={() => setMenuOuvert(false)}
            >
              Épreuves
            </NavLink>

            {estConnecte ? (
              <>
                <NavLink
                  to="/apprentissage"
                  className={({ isActive }) =>
                    `block py-2 text-sm ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'}`
                  }
                  onClick={() => setMenuOuvert(false)}
                >
                  Mon Apprentissage
                </NavLink>
                <NavLink
                  to="/ajouter-epreuve"
                  className={({ isActive }) =>
                    `block py-2 text-sm ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'}`
                  }
                  onClick={() => setMenuOuvert(false)}
                >
                  Soumettre une épreuve
                </NavLink>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">
                    Connecté en tant que <strong>{utilisateur?.prenom} {utilisateur?.nom}</strong>
                  </p>
                  <button
                    onClick={gererDeconnexion}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  to="/connexion"
                  className="text-sm text-gray-700 hover:text-gray-900"
                  onClick={() => setMenuOuvert(false)}
                >
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg text-center hover:bg-blue-700 transition-colors"
                  onClick={() => setMenuOuvert(false)}
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
