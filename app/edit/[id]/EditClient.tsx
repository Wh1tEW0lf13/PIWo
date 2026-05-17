"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc, addDoc, updateDoc, deleteDoc, collection } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function EditGamePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const isNew = params.id === "new";

    // Stan formularza
    const [formData, setFormData] = useState({
        title: "",
        publisher: "",
        type: "",
        min_players: 1,
        max_players: 4,
        avg_play_time_minutes: 60,
        price_pln: 100.00,
        images: [] as string[],
        description: [] as string[],
        owner_uid: "",
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // 1. Sprawdzanie stanu zalogowania użytkownika
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (!user) {
                setError("Musisz być zalogowany, aby dodać lub edytować grę.");
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Pobieranie danych gry (jeśli to edycja)
    useEffect(() => {
        let mounted = true;

        const fetchGame = async () => {
            if (isNew) {
                if (mounted) setIsLoading(false);
                return;
            }

            try {
                const docRef = doc(db, "board_games", params.id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && mounted) {
                    const data = docSnap.data();

                    if (currentUser && data.owner_uid !== currentUser.uid) {
                        setError("Nie masz uprawnień do edycji tej gry. To nie jest Twoja oferta.");
                    }

                    setFormData({
                        title: data.title || "",
                        publisher: data.publisher || "",
                        type: data.type || "",
                        min_players: data.min_players || 1,
                        max_players: data.max_players || 4,
                        avg_play_time_minutes: data.avg_play_time_minutes || 60,
                        price_pln: data.price_pln || 100.00,
                        images: data.images || [],
                        description: data.description || [],
                        owner_uid: data.owner_uid || "",
                    });
                } else {
                    if (mounted) setError("Nie znaleziono takiej gry.");
                }
            } catch (err) {
                console.error("Błąd pobierania gry z Firestore:", err);
                if (mounted) setError("Błąd podczas pobierania danych z serwera.");
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        if (!isNew && currentUser !== undefined) {
            fetchGame();
        } else if (isNew) {
            setIsLoading(false);
        }

        return () => {
            mounted = false;
        };
    }, [params.id, isNew, currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name.includes("players") || name.includes("time") || name.includes("price")
                ? Number(value)
                : value
        }));
    };

    // Obsługa zapisywania/aktualizacji
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            setError("Musisz się zalogować.");
            return;
        }

        if (!isNew && formData.owner_uid !== currentUser.uid) {
            setError("Nie możesz zapisać zmian w nie swojej grze.");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            if (isNew) {
                await addDoc(collection(db, "board_games"), {
                    ...formData,
                    owner_uid: currentUser.uid,
                    available: true,
                    created_at: new Date()
                });
            } else {
                const docRef = doc(db, "board_games", params.id);
                await updateDoc(docRef, formData);
            }

            router.push("/");
        } catch (err) {
            console.error("Błąd zapisywania do Firestore:", err);
            setError("Nie udało się zapisać gry. Spróbuj ponownie.");
            setIsSaving(false);
        }
    };

    // Obsługa usuwania
    const handleDelete = async () => {
        if (!currentUser || formData.owner_uid !== currentUser.uid) {
            setError("Nie masz uprawnień do usunięcia tej gry.");
            return;
        }

        const confirmDelete = window.confirm("Czy na pewno chcesz usunąć tę ofertę? Tej akcji nie można cofnąć.");
        if (!confirmDelete) return;

        setIsDeleting(true);
        setError(null);

        try {
            const docRef = doc(db, "board_games", params.id);
            await deleteDoc(docRef);

            // Po udanym usunięciu wracamy na stronę główną
            router.push("/");
        } catch (err) {
            console.error("Błąd podczas usuwania gry z Firestore:", err);
            setError("Nie udało się usunąć gry. Spróbuj ponownie.");
            setIsDeleting(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center p-8">Ładowanie formularza...</div>;

    if (error && (!isNew || !currentUser)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                <p className="text-red-600 font-medium mb-4 text-center max-w-md">{error}</p>
                <Link href="/" className="text-blue-500 hover:underline">Wróć na stronę główną</Link>
            </div>
        );
    }

    const isActionDisabled = isSaving || isDeleting;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-4 md:p-8">
            <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-800 p-6 md:p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{isNew ? "Dodaj nową grę" : "Edytuj grę"}</h1>
                    <Link href="/" className="text-sm text-zinc-500 hover:underline">Anuluj</Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tytuł gry *</label>
                        <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Wydawca</label>
                            <input type="text" name="publisher" value={formData.publisher} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Kategoria (np. rodzinna)</label>
                            <input type="text" name="type" value={formData.type} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Min. graczy</label>
                            <input type="number" min="1" name="min_players" value={formData.min_players} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Max. graczy</label>
                            <input type="number" min="1" name="max_players" value={formData.max_players} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Czas (min)</label>
                            <input type="number" min="1" name="avg_play_time_minutes" value={formData.avg_play_time_minutes} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Cena (Kup Teraz) PLN *</label>
                        <input required type="number" step="0.01" name="price_pln" value={formData.price_pln} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-zinc-900 dark:border-zinc-700" />
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={isActionDisabled}
                            className={`w-full py-3 text-white font-bold rounded-xl transition-colors ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isSaving ? "Zapisywanie..." : (isNew ? "Zapisz i dodaj grę" : "Zapisz zmiany")}
                        </button>

                        {/* Przycisk usuwania pojawia się tylko podczas edycji istniejącej gry */}
                        {!isNew && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isActionDisabled}
                                className={`w-full py-3 font-bold rounded-xl transition-colors border ${isDeleting ? 'bg-red-100 text-red-400 border-red-200 dark:bg-red-900/30 dark:border-red-800 cursor-not-allowed' : 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100 dark:text-red-500 dark:border-red-900/50 dark:bg-red-950/20 dark:hover:bg-red-900/40'}`}
                            >
                                {isDeleting ? "Usuwanie..." : "Usuń tę grę"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}