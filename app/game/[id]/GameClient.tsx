"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import Auth from "@/app/components/Auth";
import { onAuthStateChanged } from "firebase/auth";

export default function GameDetailsPage({ params }: { params: { id: string } }) {
    const [game, setGame] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [processingBuy, setProcessingBuy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Śledzenie stanu zalogowania użytkownika
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const ref = doc(db, "board_games", params.id);
                const snap = await getDoc(ref);
                if (!snap.exists()) {
                    if (mounted) setGame(null);
                } else {
                    if (mounted) setGame({ id: snap.id, ...snap.data() });
                }
            } catch (e) {
                console.error("Błąd pobierania gry z Firestore:", e);
                if (mounted) setError("Błąd pobierania danych z serwera.");
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">Ładowanie...</div>
        );
    }

    if (error && !game) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8">
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <Link href="/" className="text-blue-500 hover:underline">Wróć na stronę główną</Link>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                <h1 className="text-2xl font-bold mb-4">Nie znaleziono takiej gry.</h1>
                <Link href="/" className="text-blue-500 hover:underline">Wróć na stronę główną</Link>
            </div>
        );
    }

    const hasImages = game.images && game.images.length > 0;
    const mainImageUrl = hasImages ? game.images[0] : 'https://placehold.co/800x400/e4e4e7/a1a1aa?text=Brak+zdjecia';

    // Gra jest dostępna do kupienia TYLKO jeśli available != false ORAZ zalogowany użytkownik nie jest właścicielem ogłoszenia
    const isOwner = currentUser && game.owner_uid === currentUser.uid;
    const isAvailable = game.available !== false && !isOwner;

    async function handleBuyNow() {
        if (!auth.currentUser) {
            setError("Musisz się zalogować, aby kupić ofertę.");
            return;
        }

        if (isOwner) {
            setError("Nie możesz kupić własnej oferty.");
            return;
        }

        setProcessingBuy(true);
        setError(null);

        try {
            const gameRef = doc(db, "board_games", game.id);

            await runTransaction(db, async (tx) => {
                const snap = await tx.get(gameRef);
                if (!snap.exists()) throw new Error("Dokument nie istnieje");
                const data = snap.data();
                if (data.available === false) throw new Error("Oferta już niedostępna");
                if (data.owner_uid === auth.currentUser?.uid) throw new Error("Nie możesz kupić własnej oferty");

                tx.update(gameRef, {
                    available: false,
                    buyer_uid: auth.currentUser?.uid || null,
                    sold_at: serverTimestamp(),
                });
            });

            // Odśwież lokalny stan
            const refreshed = await getDoc(doc(db, "board_games", game.id));
            setGame({ id: refreshed.id, ...refreshed.data() });
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Błąd podczas kupowania");
        } finally {
            setProcessingBuy(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">

                <div className="flex justify-between items-center mb-6">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
                        <span className="mr-2">←</span> Wróć do wyników
                    </Link>
                    <Auth />
                </div>

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

                        {/* Prawa kolumna: Panel zakupowy */}
                        <div className="w-full lg:w-[340px] flex-shrink-0">
                            <div className={`bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-6 rounded-2xl sticky top-8 shadow-sm ${(!isAvailable && game.available !== false) ? 'opacity-70' : game.available === false ? 'opacity-50' : ''}`}>
                                {game.auction ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                            <p className="text-sm text-red-500 font-bold uppercase tracking-wide">Trwa licytacja</p>
                                        </div>
                                        <p className="text-4xl font-bold mb-2 tracking-tight">{game.auction.current_bid?.toFixed(2) ?? '0.00'} zł</p>

                                        <div className="space-y-3">
                                            <button disabled className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors opacity-60 cursor-not-allowed">
                                                Licytuj
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-zinc-500 font-bold mb-2 uppercase tracking-wide">Kup teraz</p>
                                        <p className="text-4xl font-bold mb-6 tracking-tight">{game.price_pln?.toFixed(2) ?? '0.00'} zł</p>

                                        <div className="space-y-3">
                                            <button
                                                onClick={handleBuyNow}
                                                disabled={!isAvailable || processingBuy}
                                                className={`w-full py-3.5 ${isAvailable ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200' : 'bg-zinc-300 text-zinc-600 cursor-not-allowed'} font-semibold rounded-xl transition-colors`}
                                            >
                                                {processingBuy ? 'Przetwarzanie...' : game.available === false ? 'Niedostępne' : isOwner ? 'Twoja oferta' : 'Kup Teraz'}
                                            </button>

                                            {game.available === false && (
                                                <p className="text-center text-sm text-zinc-500">Oferta została już kupiona.</p>
                                            )}

                                            {isOwner && game.available !== false && (
                                                <p className="text-center text-sm text-zinc-500 font-medium text-amber-600 dark:text-amber-400">To jest Twoje ogłoszenie. Nie możesz go kupić.</p>
                                            )}

                                            {error && (
                                                <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
                                            )}
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