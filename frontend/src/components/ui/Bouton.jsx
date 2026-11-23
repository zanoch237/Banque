// Composant bouton réutilisable
import React from 'react';

/**
 * Composant Bouton - Bouton stylisé avec variantes
 * @param {string} variante - 'primaire' | 'secondaire' | 'danger' | 'fantome'
 * @param {string} taille - 'sm' | 'md' | 'lg'
 * @param {boolean} chargement - Affiche un spinner si true
 * @param {boolean} pleineLargeur - Bouton en pleine largeur si true
 */
const Bouton = ({
  children,
  variante = 'primaire',
  taille = 'md',
  chargement = false,
  pleineLargeur = false,
  disabled = false,
  className = '',
  ...props
}) => {
  // Classes de base communes à tous les boutons
  const classesBase = `
    inline-flex items-center justify-center gap-2 font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${pleineLargeur ? 'w-full' : ''}
  `;

  // Classes selon la variante
  const classesVariante = {
    primaire: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondaire: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    fantome: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  };

  // Classes selon la taille
  const classesTaille = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`
        ${classesBase}
        ${classesVariante[variante] || classesVariante.primaire}
        ${classesTaille[taille] || classesTaille.md}
        ${className}
      `}
      disabled={disabled || chargement}
      {...props}
    >
      {/* Spinner de chargement */}
      {chargement && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Bouton;
