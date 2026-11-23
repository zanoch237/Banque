// Composant carte d'épreuve
import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Calendar, BookOpen } from 'lucide-react';
import Badge from '../ui/Badge';
import { couleurType, couleurNiveau, formaterNombre } from '../../utils/helpers';

/**
 * Composant CarteEpreuve - Affiche un résumé cliquable d'une épreuve
 * Lié à la page de détail de l'épreuve
 */
const CarteEpreuve = ({ epreuve }) => {
  const { _id, titre, matiere, type, niveau, annee, vues, description } = epreuve;

  return (
    <Link
      to={`/epreuves/${_id}`}
      className="block group"
      aria-label={`Voir l'épreuve : ${titre}`}
    >
      <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 h-full flex flex-col">
        {/* En-tête : matière et type */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Badge matière avec couleur personnalisée */}
          {matiere && (
            <Badge couleur={matiere.couleur}>
              {matiere.code} — {matiere.nom}
            </Badge>
          )}
          {/* Badge type d'épreuve */}
          {type && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${couleurType(type)}`}>
              {type}
            </span>
          )}
        </div>

        {/* Titre de l'épreuve */}
        <h3 className="text-gray-900 font-semibold text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors duration-200 tronquer-2 flex-1">
          {titre}
        </h3>

        {/* Description courte */}
        {description && (
          <p className="text-gray-500 text-sm mb-3 tronquer-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Pied de carte : métadonnées */}
        <div className="flex flex-wrap items-center gap-3 mt-auto pt-3 border-t border-gray-100">
          {/* Niveau académique */}
          {niveau && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${couleurNiveau(niveau)}`}>
              {niveau}
            </span>
          )}

          {/* Année */}
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            {annee}
          </span>

          {/* Compteur de vues */}
          <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
            <Eye className="w-3.5 h-3.5" />
            {formaterNombre(vues)}
          </span>
        </div>
      </article>
    </Link>
  );
};

export default CarteEpreuve;
