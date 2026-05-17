"use client";

import { auth } from "@/lib/firebase";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    User,
} from "firebase/auth";
import { useEffect, useState, FormEvent } from "react";

export default function Auth() {
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
        });
        return () => unsub();
    }, []);

    async function signInWithGoogle() {
        setError(null);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (e: unknown) {
            console.error(e);
            setError((e as Error).message || "Błąd logowania Google");
        }
    }

    async function handleSignOut() {
        try {
            await signOut(auth);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleEmailSignIn(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: unknown) {
            console.error(err);
            setError((err as Error).message || "Błąd logowania");
        } finally {
            setLoading(false);
        }
    }

    async function handleRegister(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (err: unknown) {
            console.error(err);
            setError((err as Error).message || "Błąd rejestracji");
        } finally {
            setLoading(false);
        }
    }

    if (user) {
        return (
            <div className="flex items-center gap-3">
                <div className="text-sm text-zinc-600 dark:text-zinc-300">Zalogowany jako <strong className="ml-1">{user.email || user.displayName}</strong></div>
                <button onClick={handleSignOut} className="px-3 py-2 bg-zinc-200 dark:bg-zinc-700 rounded-md text-sm">Wyloguj</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm">
            <div className="flex gap-2 items-center">
                <button onClick={signInWithGoogle} className="px-3 py-2 bg-white dark:bg-black/80 border rounded-md text-sm">Zaloguj przez Google</button>
            </div>

            <form onSubmit={handleEmailSignIn} className="mt-3 grid gap-2">
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="px-3 py-2 rounded-md border bg-white dark:bg-zinc-800 text-sm" />
                <input type="password" placeholder="Hasło" value={password} onChange={(e) => setPassword(e.target.value)} className="px-3 py-2 rounded-md border bg-white dark:bg-zinc-800 text-sm" />
                <div className="flex gap-2">
                    <button type="submit" disabled={loading} className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">Zaloguj</button>
                    <button onClick={handleRegister} className="px-3 py-2 bg-green-600 text-white rounded-md text-sm">Zarejestruj</button>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
            </form>
        </div>
    );
}
