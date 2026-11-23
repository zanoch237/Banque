// Page de liste des épreuves avec filtres et pagination
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, FileX } from 'lucide-react';
import { obtenirEpreuves, obtenirMatieres } from '../services/api';
import CarteEpreuve from '../components/epreuves/CarteEpreuve';
import FiltreEpreuves from '../components/epreuves/FiltreEpreuves';
import Chargement from '../components/ui/Chargement';

// Nombre d'épreuves par page
const LIMITE_PAR_PAGE = 10;

/**
 * Page Epreuves - Liste filtrée et paginée des épreuves
 */
const Epreuves = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // État des filtres synchronisé avec les paramètres d'URL
  const [filtres, setFiltres] = useState({
    q: searchParams.get('q') || '',
    matiere: searchParams.get('matiere') || '',
    niveau: searchParams.get('niveau') || '',
    annee: searchParams.get('annee') || '',
    type: searchParams.get('type') || '',
  });

  // État de la pagination
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  // Données
  const [epreuves, setEpreuves] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [chargement, setChargement] = useState(true);
  const [chargementMatieres, setChargementMatieres] = useState(true);

  // Chargement de la liste des matières (une seule fois)
  useEffect(() => {
    const chargerMatieres = async () => {
      try {
        const reponse = await obtenirMatieres();
        setMatieres(reponse.data.donnees);
      } catch (erreur) {
        console.error('Erreur lors du chargement des matières :', erreur);
      } finally {
        setChargementMatieres(false);
      }
    };
    chargerMatieres();
  }, []);

  /**
   * Charge les épreuves selon les filtres et la page actuels
   */
  const chargerEpreuves = useCallback(async () => {
    setChargement(true);
    try {
      // Construction des paramètres de requête (ne pas envoyer les valeurs vides)
      const params = { page, limite: LIMITE_PAR_PAGE };
      if (filtres.q) params.q = filtres.q;
      if (filtres.matiere) params.matiere = filtres.matiere;
      if (filtres.niveau) params.niveau = filtres.niveau;
      if (filtres.annee) params.annee = filtres.annee;
      if (filtres.type) params.type = filtres.type;

      const reponse = await obtenirEpreuves(params);
      setEpreuves(reponse.data.donnees);
      setTotal(reponse.data.total);
      setTotalPages(reponse.data.pages);
    } catch (erreur) {
      console.error('Erreur lors du chargement des épreuves :', erreur);
    } finally {
      setChargement(false);
    }
  }, [filtres, page]);

  // Rechargement quand les filtres ou la page changent
  useEffect(() => {
    chargerEpreuves();
  }, [chargerEpreuves]);

  // Mise à jour des paramètres d'URL quand les filtres changent
  useEffect(() => {
    const params = {};
    if (filtres.q) params.q = filtres.q;
    if (filtres.matiere) params.matiere = filtres.matiere;
    if (filtres.niveau) params.niveau = filtres.niveau;
    if (filtres.annee) params.annee = filtres.annee;
    if (filtres.type) params.type = filtres.type;
    if (page > 1) params.page = page.toString();
    setSearchParams(params, { replace: true });
  }, [filtres, page, setSearchParams]);

  /**
   * Gère le changement des filtres et remet la page à 1
   */
  const gererChangementFiltres = (nouveauxFiltres) => {
    setFiltres(nouveauxFiltres);
    setPage(1);
  };

  /**
   * Réinitialise tous les filtres
   */
  const reinitialiserFiltres = () => {
    setFiltres({ q: '', matiere: '', niveau: '', annee: '', type: '' });
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête de la page */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Épreuves</h1>
        <p className="text-gray-500">
          {total > 0
            ? `${total} épreuve${total > 1 ? 's' : ''} trouvée${total > 1 ? 's' : ''}`
            : 'Aucune épreuve trouvée'}
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <form
          onSubmit={(e) => { e.preventDefault(); }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={filtres.q}
            onChange={(e) => gererChangementFiltres({ ...filtres, q: e.target.value })}
            placeholder="Rechercher par titre ou description..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            aria-label="Rechercher une épreuve"
          />
        </form>
      </div>

      {/* Mise en page : filtres à gauche, contenu à droite */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Panneau de filtres latéraux */}
        <div className="lg:w-64 flex-shrink-0">
          {chargementMatieres ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-gray-200 rounded" />)}
              </div>
            </div>
          ) : (
            <FiltreEpreuves
              filtres={filtres}
              onChange={gererChangementFiltres}
              matieres={matieres}
              onReinitialiser={reinitialiserFiltres}
            />
          )}
        </div>

        {/* Zone principale : grille d'épreuves */}
        <div className="flex-1">
          {chargement ? (
            <Chargement type="cartes" />
          ) : epreuves.length === 0 ? (
            /* État vide */
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <FileX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-700 font-medium mb-2">Aucune épreuve trouvée</h3>
              <p className="text-gray-400 text-sm">
                Essayez de modifier vos critères de recherche.
              </p>
              {(filtres.q || filtres.matiere || filtres.niveau || filtres.annee || filtres.type) && (
                <button
                  onClick={reinitialiserFiltres}
                  className="mt-4 text-sm text-blue-600 hover:underline"
                >
                  Effacer tous les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Grille des cartes d'épreuves */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {epreuves.map((epreuve) => (
                  <CarteEpreuve key={epreuve._id} epreuve={epreuve} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  className="flex items-center justify-center gap-2 mt-8"
                  aria-label="Navigation des pages"
                >
                  {/* Bouton Précédent */}
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Précédent
                  </button>

                  {/* Numéros de pages */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((num) => {
                      // Afficher les 2 premières, 2 dernières et 2 autour de la page courante
                      return (
                        num <= 2 ||
                        num > totalPages - 2 ||
                        Math.abs(num - page) <= 1
                      );
                    })
                    .reduce((acc, num, idx, arr) => {
                      // Ajout de "..." pour indiquer les pages sautées
                      if (idx > 0 && num - arr[idx - 1] > 1) {
                        acc.push('...');
                      }
                      acc.push(num);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === '...' ? (
                        <span key={`dots-${idx}`} className="px-2 text-gray-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            page === item
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                          aria-current={page === item ? 'page' : undefined}
                        >
                          {item}
                        </button>
                      )
                    )}

                  {/* Bouton Suivant */}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Suivant →
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Epreuves;
