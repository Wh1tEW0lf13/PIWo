import Link from "next/link";

export default async function GameDetailsPage({ params }: { params: { id: string } }) {
    const response = await fetch(`https://szandala.github.io/piwo-api/board-games.json`);

    if (!response.ok) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Nie udało się połączyć z bazą danych.</h1>
                <Link href="/" className="text-blue-500 hover:underline">Wróć na stronę główną</Link>
            </div>
        );
    }

    const data = await response.json();
    const allGames = data.board_games || [];
    const game = allGames.find((g: any) => g.id.toString() === params.id);

    if (!game) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                <h1 className="text-2xl font-bold mb-4">Nie znaleziono takiej gry.</h1>
                <Link href="/" className="text-blue-500 hover:underline">Wróć na stronę główną</Link>
            </div>
        );
    }

    const hasImages = game.images && game.images.length > 0;
    const mainImageUrl = hasImages
        ? game.images[0]
        : 'https://placehold.co/800x400/e4e4e7/a1a1aa?text=Brak+zdjecia';

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">

                <Link href="/" className="inline-flex items-center mb-6 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                    <span className="mr-2">←</span> Wróć do wyników
                </Link>

                <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">

                    <div className="w-full bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-700">
                        <img
                            src={mainImageUrl}
                            alt={game.title}
                            className="w-full h-64 md:h-96 object-contain"
                        />

                        {hasImages && game.images.length > 1 && (
                            <div className="flex gap-4 p-4 overflow-x-auto">
                                {game.images.map((imgUrl: string, index: number) => (
                                    <div key={index} className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 cursor-pointer transition-colors">
                                        <img
                                            src={imgUrl}
                                            alt={`Miniaturka ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-10">

                        <div className="flex-1">
                            <div className="mb-8">
                                <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">{game.title}</h1>
                                <p className="text-sm text-zinc-500 font-medium">Wydawca: <span className="text-zinc-700 dark:text-zinc-300">{game.publisher}</span></p>
                            </div>

                            <h2 className="text-xl font-bold mb-4 border-b border-zinc-100 dark:border-zinc-700 pb-2">Opis gry</h2>
                            <div className="space-y-3 mb-10 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                {/* Zabezpieczenie, gdyby opis też okazał się pusty w JSON-ie */}
                                {game.description && game.description.length > 0 ? (
                                    game.description.map((sentence: string, index: number) => (
                                        <p key={index}>{sentence}</p>
                                    ))
                                ) : (
                                    <p className="italic text-zinc-500">Brak opisu dla tej gry.</p>
                                )}
                            </div>

                            <h2 className="text-xl font-bold mb-4 border-b border-zinc-100 dark:border-zinc-700 pb-2">Szczegóły</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-zinc-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <div className="flex flex-col">
                                    <span className="text-zinc-500 mb-1 text-xs uppercase tracking-wider font-semibold">Liczba graczy</span>
                                    <span className="font-medium text-base">{game.min_players} - {game.max_players} osób</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-zinc-500 mb-1 text-xs uppercase tracking-wider font-semibold">Czas rozgrywki</span>
                                    <span className="font-medium text-base">ok. {game.avg_play_time_minutes} min</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-zinc-500 mb-1 text-xs uppercase tracking-wider font-semibold">Kategoria</span>
                                    <span className="font-medium text-base capitalize">{game.type}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-zinc-500 mb-1 text-xs uppercase tracking-wider font-semibold">Rodzaj wydania</span>
                                    <span className="font-medium text-base">{game.is_expansion ? "Dodatek (wymaga podstawki)" : "Gra podstawowa"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Prawa kolumna: Panel zakupowy (jak na Allegro) */}
                        <div className="w-full lg:w-[340px] flex-shrink-0">
                            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-6 rounded-2xl sticky top-8 shadow-sm">
                                {game.auction ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                            <p className="text-sm text-red-500 font-bold uppercase tracking-wide">Trwa licytacja</p>
                                        </div>
                                        <p className="text-4xl font-bold mb-2 tracking-tight">{game.auction.current_bid.toFixed(2)} zł</p>
                                        <p className="text-xs text-zinc-500 mb-6 font-medium">Najwyższa oferta: <span className="text-zinc-800 dark:text-zinc-200">{game.auction.highest_bidder_uid}</span></p>

                                        <div className="space-y-3">
                                            <button className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors cursor-not-allowed opacity-60 flex justify-center items-center gap-2">
                                                Licytuj
                                            </button>
                                            <p className="text-center text-[10px] text-zinc-400 uppercase tracking-wider">Aplikacja w trybie Read-Only</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-zinc-500 font-bold mb-2 uppercase tracking-wide">Kup teraz</p>
                                        <p className="text-4xl font-bold mb-6 tracking-tight">{game.price_pln.toFixed(2)} zł</p>

                                        <div className="space-y-3">
                                            <button className="w-full py-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold rounded-xl transition-colors cursor-not-allowed opacity-60">
                                                Dodaj do koszyka
                                            </button>
                                            <p className="text-center text-[10px] text-zinc-400 uppercase tracking-wider">Aplikacja w trybie Read-Only</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}