const inputWpis = document.getElementById("wpis");
const kategoriaWpis = document.getElementById("kategoriaWpis");
const przyciskDodaj = document.getElementById("przyciskDodaj");
const kontenerList = document.getElementById("kontenerList");
const przyciskCofnij = document.getElementById("cofnij");
const komunikatBledu = document.getElementById("komunikatBledu");
const wyszukiwarka = document.getElementById("wyszukiwarka");
const ignorujWielkosc = document.getElementById("ignorujWielkosc");

const modalElement = document.getElementById("modalPotwierdzenia");
const bsModal = new bootstrap.Modal(modalElement);
const tekstModala = document.getElementById("tekstModala");
const btnTak = document.getElementById("btnTak");

let ostatnioUsuniete = null;
let zadanieDoUsuniecia = null;

function pobierzLubStworzListe(nazwaKategorii) {
    const idListy = "lista-" + nazwaKategorii.replace(/\s+/g, '-').toLowerCase();
    let grupaListy = document.getElementById(idListy);

    if (!grupaListy) {
        grupaListy = document.createElement("div");
        grupaListy.id = idListy;
        grupaListy.className = "mb-4 kategoria-grupa";

        const naglowek = document.createElement("h5");
        naglowek.className = "cursor-pointer bg-light p-2 rounded border d-flex justify-content-between align-items-center";
        naglowek.innerHTML = `<span>${nazwaKategorii}</span>`;

        const ul = document.createElement("ul");
        ul.className = "list-group";

        naglowek.addEventListener("click", () => {
            ul.classList.toggle("d-none");
            const znacznik = naglowek.querySelector(".znacznik-zwijania");
        });

        grupaListy.appendChild(naglowek);
        grupaListy.appendChild(ul);
        kontenerList.appendChild(grupaListy);
    }

    return grupaListy.querySelector("ul");
}

function filtrujZadania() {
    const zapytanie = wyszukiwarka.value;
    const ignoruj = ignorujWielkosc.checked;
    const szukanyTekst = ignoruj ? zapytanie.toLowerCase() : zapytanie;

    const wszystkieZadania = document.querySelectorAll("#kontenerList li");
    wszystkieZadania.forEach(li => {
        const tekstElementu = li.querySelector(".tresc-zadania").textContent;
        const tekstDoPorownania = ignoruj ? tekstElementu.toLowerCase() : tekstElementu;

        if (tekstDoPorownania.includes(szukanyTekst)) {
            li.classList.remove("d-none");
            li.classList.add("d-flex");
        } else {
            li.classList.remove("d-flex");
            li.classList.add("d-none");
        }
    });

    const grupyKategorii = document.querySelectorAll(".kategoria-grupa");
    grupyKategorii.forEach(grupa => {
        const widoczneZadania = grupa.querySelectorAll("li.d-flex");
        if (widoczneZadania.length === 0 && szukanyTekst !== "") {
            grupa.classList.add("d-none");
        } else {
            grupa.classList.remove("d-none");
        }
    });
}

function dodajPozycje() {
    const tekst = inputWpis.value.trim();
    let kategoria = kategoriaWpis.value.trim() || "Inne";

    if (tekst !== "") {
        komunikatBledu.classList.add("d-none");
        const ul = pobierzLubStworzListe(kategoria);

        const nowyElement = document.createElement("li");
        nowyElement.className = "list-group-item d-flex justify-content-between align-items-center cursor-pointer";
        nowyElement.dataset.kategoria = kategoria;

        const trescZadania = document.createElement("span");
        trescZadania.className = "tresc-zadania flex-grow-1";
        trescZadania.textContent = tekst;

        const usuwanie = document.createElement("button");
        usuwanie.textContent = "X";
        usuwanie.className = "btn btn-danger btn-sm btn-usun ms-3";

        nowyElement.appendChild(trescZadania);
        nowyElement.appendChild(usuwanie);
        ul.appendChild(nowyElement);
        
        inputWpis.value = "";
        filtrujZadania();
    } else {
        komunikatBledu.classList.remove("d-none");
    }
}

przyciskDodaj.addEventListener("click", dodajPozycje);
wyszukiwarka.addEventListener("input", filtrujZadania);
ignorujWielkosc.addEventListener("change", filtrujZadania);

kontenerList.addEventListener("click", function (event) {
    const li = event.target.closest("li");
    if (!li) return;

    if (event.target.classList.contains("btn-usun")) {
        zadanieDoUsuniecia = li;
        const tekstZadania = li.querySelector(".tresc-zadania").textContent;
        tekstModala.textContent = `Czy na pewno chcesz usunąć zadanie: "${tekstZadania}"?`;
        bsModal.show();
        return;
    }

    const zrobione = li.classList.toggle("done");
    if (zrobione) {
        const now = new Date();
        const spanData = document.createElement("span");
        spanData.className = "data-wykonania ms-2";
        spanData.textContent = ` (Wykonano: ${now.toLocaleString()})`;
        li.querySelector(".tresc-zadania").after(spanData);
    } else {
        const staraData = li.querySelector(".data-wykonania");
        if (staraData) staraData.remove();
    }
});

btnTak.addEventListener("click", () => {
    if (zadanieDoUsuniecia) {
        ostatnioUsuniete = zadanieDoUsuniecia;
        przyciskCofnij.disabled = false;
        
        const ul = zadanieDoUsuniecia.parentElement;
        zadanieDoUsuniecia.remove();
        
        if (ul.children.length === 0) {
            ul.parentElement.remove();
        }
        
        zadanieDoUsuniecia = null;
    }
    bsModal.hide();
});

przyciskCofnij.addEventListener("click", () => {
    if (ostatnioUsuniete) {
        const kategoria = ostatnioUsuniete.dataset.kategoria;
        const ul = pobierzLubStworzListe(kategoria);
        ul.appendChild(ostatnioUsuniete);
        
        ostatnioUsuniete = null;
        przyciskCofnij.disabled = true;
        filtrujZadania();
    }
});