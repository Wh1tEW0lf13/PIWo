"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [games, setGames] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    const localGames = localStorage.getItem("my_board_games");
    let hasValidLocalData = false;

    if (localGames) {
      try {
        const parsedGames = JSON.parse(localGames);
        if (Array.isArray(parsedGames) && parsedGames.length > 0) {
          setGames(parsedGames);
          hasValidLocalData = true;
          setIsLoading(false);
        }
      } catch (e) {
        console.error("Błąd odczytu z pamięci:", e);
      }
    }

    if (!hasValidLocalData) {
      fetch('https://szandala.github.io/piwo-api/board-games.json')
          .then((response) => response.json())
          .then((data) => {
            if (data && data.board_games) {
              setGames(data.board_games);
              localStorage.setItem("my_board_games", JSON.stringify(data.board_games));
            } else {
              setGames([]);
            }
            setIsLoading(false);
          })
          .catch((error) => console.error("Błąd pobierania:", error));
    }
  }, []);

  //Filtrujemy wszystkie gry
  const filteredGames = games.filter((game) =>
      game.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //Obliczamy paginację na podstawie przefiltrowanych gier
  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGames = filteredGames.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans p-4 md:p-8">
        <div className="max-w-6xl mx-auto">

          <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Planszówki do Piwa</h1>
            <input
                type="text"
                placeholder="Szukaj gry..."
                className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Resetujemy do 1 strony po wpisaniu nowej frazy!
                }}
            />
            <Link href="/edit/new" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 whitespace-nowrap">
              + Dodaj grę
            </Link>
          </header>

          <div className="flex flex-col md:flex-row gap-8">

            <main className="flex-1 flex flex-col min-h-[600px]">
              {isLoading ? (
                  <div className="text-center text-zinc-500 mt-10 text-lg font-medium animate-pulse">
                    Ładowanie gier z serwera...
                  </div>
              ) : filteredGames.length === 0 ? (
                  <p className="text-center text-zinc-500 mt-10">Brak gier spełniających kryteria.</p>
              ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {paginatedGames.map((game) => {
                        const imageUrl = game.images && game.images.length > 0
                            ? game.images[0]
                            : 'https://placehold.co/400x300/e4e4e7/a1a1aa?text=Brak+zdjecia';

                        return (
                            <div key={game.id} className="relative group">
                              <div className="absolute top-2 right-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/edit/${game.id}`}
                                    className="p-2 bg-white/90 dark:bg-black/80 hover:bg-white dark:hover:bg-black rounded-full shadow-sm text-blue-600 dark:text-blue-400 transition-colors"
                                >
                                  ✎
                                </Link>
                              </div>

                              <Link
                                  href={`/game/${game.id}`}
                                  className="bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-700 transition-transform hover:-translate-y-1 hover:shadow-md cursor-pointer block flex flex-col h-full"
                              >
                                <img
                                    src={imageUrl}
                                    alt={game.title}
                                    className="w-full h-48 object-cover bg-zinc-100 dark:bg-zinc-900"
                                />

                                <div className="p-4 flex flex-col flex-1">
                                  <div className="flex justify-between items-start mb-2 gap-2">
                                    <h3 className="text-lg font-bold leading-tight">{game.title}</h3>
                                    <span className="text-[10px] bg-zinc-200 dark:bg-zinc-700 px-2 py-1 rounded-full uppercase font-semibold whitespace-nowrap">
                                        {game.type}
                                      </span>
                                  </div>

                                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                                    {game.min_players}-{game.max_players} graczy • {game.avg_play_time_minutes} min
                                  </p>

                                  <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-700">
                                    {game.auction ? (
                                        <div>
                                          <p className="text-xs text-red-500 font-bold mb-0.5">TRWA LICYTACJA</p>
                                          <p className="text-xl font-bold">{game.auction.current_bid.toFixed(2)} zł</p>
                                        </div>
                                    ) : (
                                        <div>
                                          <p className="text-xs text-zinc-500 font-semibold mb-0.5">KUP TERAZ</p>
                                          <p className="text-xl font-bold">{game.price_pln.toFixed(2)} zł</p>
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