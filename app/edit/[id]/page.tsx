"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Pobieramy gry z localStorage
        const savedGames = localStorage.getItem("my_board_games");

        if (savedGames) {
            const parsedGames = JSON.parse(savedGames);
            if (!isNew) {
                // Jeśli edytujemy, szukamy gry po ID i ładujemy do formularza
                const gameToEdit = parsedGames.find((g: any) => g.id.toString() === params.id);
                if (gameToEdit) {
                    setFormData(gameToEdit);
                }
            }
        }
        setIsLoading(false);
    }, [params.id, isNew]);

    // Obsługa zmiany w polach tekstowych
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name.includes("players") || name.includes("time") || name.includes("price")
                ? Number(value)
                : value
        }));
    };

    // Zapisywanie
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const savedGames = localStorage.getItem("my_board_games");
        let gamesArray = savedGames ? JSON.parse(savedGames) : [];

        if (isNew) {
            // Tworzymy nowe ID
            const newId = gamesArray.length > 0 ? Math.max(...gamesArray.map((g: any) => g.id)) + 1 : 1;
            const newGame = { ...formData, id: newId };
            gamesArray.push(newGame);
        } else {
            // Podmieniamy zedytowaną grę w tablicy
            gamesArray = gamesArray.map((g: any) => g.id.toString() === params.id ? formData : g);
        }
        localStorage.setItem("my_board_games", JSON.stringify(gamesArray));
        router.push("/");
    };

    if (isLoading) return <div className="p-8 text-center">Ładowanie formularza...</div>;

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

                    <button type="submit" className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors">
                        {isNew ? "Zapisz i dodaj grę" : "Zapisz zmiany"}
                    </button>
                </form>
            </div>
        </div>
    );
}