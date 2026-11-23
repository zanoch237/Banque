// Composant Badge réutilisable
import React from 'react';

/**
 * Composant Badge - Étiquette colorée pour les métadonnées
 * @param {string} couleur - Couleur hex personnalisée (prioritaire sur la variante)
 * @param {string} variante - 'gris' | 'bleu' | 'vert' | 'rouge' | 'orange' | 'violet'
 * @param {string} taille - 'sm' | 'md'
 */
const Badge = ({
  children,
  couleur,
  variante = 'gris',
  taille = 'sm',
  className = '',
}) => {
  // Classes selon la variante prédéfinie
  const classesVariante = {
    gris: 'bg-gray-100 text-gray-700',
    bleu: 'bg-blue-100 text-blue-800',
    vert: 'bg-green-100 text-green-800',
    rouge: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    violet: 'bg-purple-100 text-purple-800',
    indigo: 'bg-indigo-100 text-indigo-800',
  };

  const classesTaille = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  // Si une couleur hex personnalisée est fournie (depuis la matière)
  if (couleur) {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full ${classesTaille[taille] || classesTaille.sm} ${className}`}
        style={{
          backgroundColor: `${couleur}20`, // Couleur avec opacité 12%
          color: couleur,
        }}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${classesVariante[variante] || classesVariante.gris}
        ${classesTaille[taille] || classesTaille.sm}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;
