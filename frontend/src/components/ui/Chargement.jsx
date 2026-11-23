// Composant de chargement animé
import React from 'react';

/**
 * Composant Chargement - Spinner animé et squelettes de chargement
 * @param {string} type - 'spinner' | 'page' | 'cartes'
 * @param {string} message - Message affiché sous le spinner
 */
const Chargement = ({ type = 'spinner', message = 'Chargement...' }) => {
  // Spinner simple
  if (type === 'spinner') {
    return (
      <div className="flex items-center justify-center gap-3 py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="text-gray-500">{message}</span>
      </div>
    );
  }

  // Chargement de page entière (centré verticalement)
  if (type === 'page') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <p className="text-gray-500 text-lg">{message}</p>
      </div>
    );
  }

  // Squelettes de cartes (placeholder de chargement)
  if (type === 'cartes') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 animate-pulse"
          >
            {/* Ligne titre */}
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
            {/* Ligne sous-titre */}
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-gray-200 rounded-full w-20" />
              <div className="h-6 bg-gray-200 rounded-full w-16" />
            </div>
            {/* Description */}
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default Chargement;
