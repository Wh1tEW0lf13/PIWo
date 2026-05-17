#!/usr/bin/env node
/**
 * Skrypt dodający testowe gry do Firestore
 * Uruchom: node scripts/seed-firestore.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Załaduj dane testowe
const sampleGames = [
  {
    title: "Catan",
    description: ["Catan to klasyczna gra planszowa o kolonizacji wyspy.", "Uczestnicy rywalizują o zasoby, budując osady i miasta."],
    min_players: 3,
    max_players: 4,
    avg_play_time_minutes: 60,
    type: "strategy",
    is_expansion: false,
    publisher: "Klaus Teuber",
    price_pln: 99.99,
    available: true,
    images: ["https://placehold.co/800x400"],
    auction: null
  },
  {
    title: "Azul",
    description: ["Piękna gra o zbieraniu płytek", "Gra familii rocka i sztuki."],
    min_players: 2,
    max_players: 4,
    avg_play_time_minutes: 30,
    type: "family",
    is_expansion: false,
    publisher: "Plan B Games",
    price_pln: 89.99,
    available: true,
    images: ["https://placehold.co/800x400"],
    auction: null
  },
  {
    title: "Ticket to Ride",
    description: ["Podróż koleją przez różne kraje", "Gra o budowaniu połączeń kolejowych."],
    min_players: 2,
    max_players: 5,
    avg_play_time_minutes: 90,
    type: "strategy",
    is_expansion: false,
    publisher: "Days of Wonder",
    price_pln: 119.99,
    available: true,
    images: ["https://placehold.co/800x400"],
    auction: null
  },
  {
    title: "Chess Set",
    description: ["Drewniany zestaw szachowy.", "Wysokiej jakości figury szachowe."],
    min_players: 2,
    max_players: 2,
    avg_play_time_minutes: 45,
    type: "classic",
    is_expansion: false,
    publisher: "Traditional",
    price_pln: 49.99,
    available: true,
    images: ["https://placehold.co/800x400"],
    auction: null
  },
  {
    title: "Poker Chips Set",
    description: ["Zestaw żetonów pokerowych.", "Kompletny zestaw do gry w pokera."],
    min_players: 2,
    max_players: 10,
    avg_play_time_minutes: 45,
    type: "classic",
    is_expansion: false,
    publisher: "Gaming Pro",
    price_pln: 29.99,
    available: false,
    images: ["https://placehold.co/800x400"],
    auction: null
  }
];

async function seedFirestore() {
  try {
    // Załaduj service account (jeśli potrzebny - na lokalnym dev Firebase emulator)
    // Dla produkcji użyj: gcloud auth application-default login

    const firebaseConfig = {
      apiKey: "AIzaSyDtbUsd1VCDfgU-kJTdJ1oHk6R1b5eU4S4",
      authDomain: "piwo-a76ce.firebaseapp.com",
      projectId: "piwo-a76ce",
      storageBucket: "piwo-a76ce.firebasestorage.app",
      messagingSenderId: "483481913062",
      appId: "1:483481913062:web:22bb16b52d67a7e2859d27",
    };

    // Inicjalizuj Admin SDK
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: firebaseConfig.projectId,
      });
    }

    const db = admin.firestore();
    const collection = db.collection('board_games');

    console.log('🔄 Dodawanie testowych gier do Firestore...');

    for (const game of sampleGames) {
      await collection.add({
        ...game,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`✅ Dodano: ${game.title}`);
    }

    console.log(`\n🎉 Dodano ${sampleGames.length} gier! Aplikacja powinna teraz działać.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Błąd:', error.message);
    process.exit(1);
  }
}

seedFirestore();

