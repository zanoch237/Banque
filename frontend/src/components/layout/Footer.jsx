// Composant pied de page
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github } from 'lucide-react';

/**
 * Composant Footer - Pied de page de l'application
 */
const Footer = () => {
  const anneeActuelle = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo et description */}
          <div className="flex items-center gap-2 text-gray-700">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">Banque d'Épreuves en Ligne</span>
          </div>

          {/* Liens rapides */}
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-900 transition-colors">
              Accueil
            </Link>
            <Link to="/epreuves" className="hover:text-gray-900 transition-colors">
              Épreuves
            </Link>
            <Link to="/connexion" className="hover:text-gray-900 transition-colors">
              Connexion
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-gray-400">
            © {anneeActuelle} Banque d'Épreuves. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
