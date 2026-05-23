"use client";

import { useState, useEffect, useReducer, useMemo } from "react";
import Link from "next/link";
import Auth from "./components/Auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

type FavoriteAction =
    | { type: 'INIT'; payload: string[] }
    | { type: 'TOGGLE'; payload: string };

interface FavoriteState {
  items: string[];
}

const favoritesReducer = (state: FavoriteState, action: FavoriteAction): FavoriteState => {
  switch (action.type) {
    case 'INIT':
      return { items: action.payload };
    case 'TOGGLE': {
      const isFavorite = state.items.includes(action.payload);
      const newItems = isFavorite
          ? state.items.filter(id => id !== action.payload)
          : [...state.items, action.payload];
      return { items: newItems };
    }
    default:
      return state;
  }
};

export default function Home() {
  const [games, setGames] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const [favoritesState, dispatchFavorites] = useReducer(favoritesReducer, { items: [] });

  useEffect(() => {
    const fetchGamesFromFirebase = async () => {
      setIsLoading(true);
      try {
        const gamesCollection = collection(db, "board_games");
        const gamesSnapshot = await getDocs(gamesCollection);
        const gamesList = gamesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGames(gamesList);
      } catch (error) {
        console.error("Błąd pobierania danych z Firebase:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGamesFromFirebase();
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const storedFavorites = localStorage.getItem('favoriteGames');
    if (storedFavorites) {
      try {
        dispatchFavorites({ type: 'INIT', payload: JSON.parse(storedFavorites) });
      } catch (e) {
        console.error("Błąd odczytu localStorage:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('favoriteGames', JSON.stringify(favoritesState.items));
    }
  }, [favoritesState.items, isMounted]);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = game.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFavorite = showFavoritesOnly ? favoritesState.items.includes(game.id) : true;
      return matchesSearch && matchesFavorite;
    });
  }, [games, searchTerm, showFavoritesOnly, favoritesState.items]);

  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGames = filteredGames.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleFavorite = (e: React.MouseEvent, gameId: string) => {
    e.preventDefault();
    e.stopPropagation();
    dispatchFavorites({ type: 'TOGGLE', payload: gameId });

    if (showFavoritesOnly && paginatedGames.length === 1 && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans p-4 md:p-8">
        <div className="max-w-6xl mx-auto">

          <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Planszówki do Piwa</h1>
              <Auth />
            </div>

            <input
                type="text"
                placeholder="Szukaj gry..."
                className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
            />

            <div className="flex gap-4 items-center w-full md:w-auto justify-between md:justify-end">

              {isMounted && (
                  <button
                      onClick={() => {
                        setShowFavoritesOnly(!showFavoritesOnly);
                        setCurrentPage(1);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors border ${
                          showFavoritesOnly
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400'
                              : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                      }`}
                      title={showFavoritesOnly ? "Pokaż wszystkie gry" : "Pokaż tylko ulubione"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-red-500 text-red-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-semibold">{favoritesState.items.length}</span>
                  </button>
              )}

              <Link href="/edit/new" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 whitespace-nowrap">
                + Dodaj grę
              </Link>
            </div>
          </header>

          <div className="flex flex-col md:flex-row gap-8">
            <main className="flex-1 flex flex-col min-h-[600px]">

              {showFavoritesOnly && (
                  <div className="mb-4 text-lg font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                    Przeglądasz swoje ulubione gry
                  </div>
              )}

              {isLoading ? (
                  <div className="text-center text-zinc-500 mt-10 text-lg font-medium animate-pulse">
                    Ładowanie gier z bazy danych...
                  </div>
              ) : filteredGames.length === 0 ? (
                  <p className="text-center text-zinc-500 mt-10">
                    {showFavoritesOnly ? "Twoja lista ulubionych jest pusta." : "Brak gier spełniających kryteria."}
                  </p>
              ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {paginatedGames.map((game) => {
                        const imageUrl = game.images && game.images.length > 0
                            ? game.images[0]
                            : 'https://placehold.co/400x300/e4e4e7/a1a1aa?text=Brak+zdjecia';

                        const isFav = favoritesState.items.includes(game.id);

                        return (
                            <div key={game.id} className="relative group">

                              <div className="absolute top-2 right-2 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/edit/${game.id}`}
                                    className="p-2 bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black rounded-full shadow-sm text-blue-600 dark:text-blue-400 transition-colors"
                                >
                                  ✎
                                </Link>
                              </div>

                              {isMounted && (
                                  <button
                                      onClick={(e) => toggleFavorite(e, game.id)}
                                      className="absolute top-2 left-2 p-2 z-20 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black rounded-full shadow-sm backdrop-blur-sm transition-all"
                                      title={isFav ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
                                  >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`w-5 h-5 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'fill-transparent text-zinc-600 dark:text-zinc-300'}`}
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                  </button>
                              )}

                              <Link
                                  href={`/game/${game.id}`}
                                  className={`bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-700 transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer block flex flex-col h-full ${!game.available ? 'opacity-50' : ''}`}
                              >
                                <img
                                    src={imageUrl}
                                    alt={game.title}
                                    className="w-full h-48 object-cover bg-zinc-100 dark:bg-zinc-900"
                                />

                                <div className="p-4 flex flex-col flex-1">
                                  <div className="flex justify-between items-start mb-2 gap-2">
                                    <h3 className="text-lg font-bold leading-tight">{game.title}</h3>
                                    {game.type && (
                                        <span className="text-[10px] bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded-full uppercase font-semibold whitespace-nowrap">
                                          {game.type}
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                                    {game.min_players}-{game.max_players} graczy • {game.avg_play_time_minutes} min
                                  </p>

                                  <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-700">
                                    {game.auction ? (
                                        <div>
                                          <p className="text-xs text-red-500 font-bold mb-0.5">TRWA LICYTACJA</p>
                                          <p className="text-xl font-bold">
                                            {game.auction.current_bid !== undefined ? game.auction.current_bid.toFixed(2) : "0.00"} zł
                                          </p>
                                        </div>
                                    ) : (
                                        <div>
                                          <p className="text-xs text-zinc-500 font-semibold mb-0.5">KUP TERAZ</p>
                                          <p className="text-xl font-bold">
                                            {game.price_pln !== undefined ? game.price_pln.toFixed(2) : "0.00"} zł
                                          </p>
                                        </div>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            </div>
                        );
                      })}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-auto flex justify-center items-center gap-4 py-4 border-t border-zinc-200 dark:border-zinc-700">
                          <button
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                          >
                            Poprzednia
                          </button>

                          <span className="text-sm font-medium">
                          Strona {currentPage} z {totalPages}
                        </span>

                          <button
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                          >
                            Następna
                          </button>
                        </div>
                    )}
                  </>
              )}
            </main>
          </div>
        </div>
      </div>
  );
}