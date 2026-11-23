// Composant de filtres latéraux pour les épreuves
import React from 'react';
import { Filter, X } from 'lucide-react';
import { genererAnnees } from '../../utils/helpers';

// Constantes pour les options de filtre
const NIVEAUX = ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'];
const TYPES = ['Examen', 'Partiel', 'TP', 'TD', 'Rattrapage'];

/**
 * Composant FiltreEpreuves - Panneau latéral de filtres
 * Permet de filtrer les épreuves par matière, niveau, année et type
 */
const FiltreEpreuves = ({ filtres, onChange, matieres, onReinitialiser }) => {
  const annees = genererAnnees();

  /**
   * Gère le changement d'un filtre
   * @param {string} cle - Nom du filtre
   * @param {string} valeur - Nouvelle valeur
   */
  const gererChangement = (cle, valeur) => {
    onChange({ ...filtres, [cle]: valeur });
  };

  // Vérifie si des filtres sont actifs (hors recherche textuelle)
  const aDesFiltres = filtres.matiere || filtres.niveau || filtres.annee || filtres.type;

  return (
    <aside className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-6">
      {/* En-tête du panneau */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          Filtres
        </h2>
        {/* Bouton de réinitialisation (visible seulement si des filtres sont actifs) */}
        {aDesFiltres && (
          <button
            onClick={onReinitialiser}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            aria-label="Réinitialiser tous les filtres"
          >
            <X className="w-3 h-3" />
            Effacer
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Filtre par matière */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Matière
          </label>
          <select
            value={filtres.matiere || ''}
            onChange={(e) => gererChangement('matiere', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Toutes les matières</option>
            {matieres.map((matiere) => (
              <option key={matiere._id} value={matiere._id}>
                {matiere.nom} ({matiere.code})
              </option>
            ))}
          </select>
        </div>

        {/* Filtre par niveau */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Niveau
          </label>
          <div className="space-y-1.5">
            {NIVEAUX.map((niveau) => (
              <label key={niveau} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="niveau"
                  value={niveau}
                  checked={filtres.niveau === niveau}
                  onChange={(e) => gererChangement('niveau', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  {niveau}
                </span>
              </label>
            ))}
            {/* Option pour désélectionner un niveau */}
            {filtres.niveau && (
              <button
                onClick={() => gererChangement('niveau', '')}
                className="text-xs text-gray-400 hover:text-gray-600 ml-5 transition-colors"
              >
                Désélectionner
              </button>
            )}
          </div>
        </div>

        {/* Filtre par type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type d'épreuve
          </label>
          <div className="space-y-1.5">
            {TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={filtres.type === type}
                  onChange={(e) => gererChangement('type', e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  {type}
                </span>
              </label>
            ))}
            {filtres.type && (
              <button
                onClick={() => gererChangement('type', '')}
                className="text-xs text-gray-400 hover:text-gray-600 ml-5 transition-colors"
              >
                Désélectionner
              </button>
            )}
          </div>
        </div>

        {/* Filtre par année */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Année
          </label>
          <select
            value={filtres.annee || ''}
            onChange={(e) => gererChangement('annee', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Toutes les années</option>
            {annees.map((annee) => (
              <option key={annee} value={annee}>
                {annee}
              </option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  );
};

export default FiltreEpreuves;
