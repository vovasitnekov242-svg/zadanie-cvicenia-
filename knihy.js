function nacitajKnihy() {
    fetch("/api/knihy")
        .then(res => res.json())
        .then(knihy => {
            const zoznam = document.getElementById("zoznam");
            zoznam.innerHTML = "";
            knihy.forEach(kniha => {
                const riadok = document.createElement("tr");
                [kniha.id, kniha.nazov, kniha.autor, kniha.rok, Number(kniha.cena).toFixed(2)].forEach(hodnota => {
                    const bunka = document.createElement("td");
                    bunka.textContent = hodnota;
                    riadok.appendChild(bunka);
                });

                const akcie = document.createElement("td");

                const btnVymazat = document.createElement("button");
                btnVymazat.textContent = "Vymazať";
                btnVymazat.onclick = () => {
                    fetch(`/api/knihy/${kniha.id}`, { method: "DELETE" }).then(() => nacitajKnihy());
                };
                akcie.appendChild(btnVymazat);

                const btnUpravit = document.createElement("button");
                btnUpravit.textContent = "Upraviť";
                btnUpravit.onclick = () => {
                    const nazov = prompt("Nový názov:", kniha.nazov);
                    if (!nazov || nazov.trim() === "") return;
                    const autor = prompt("Nový autor:", kniha.autor);
                    if (!autor || autor.trim() === "") return;
                    const rokVstup = prompt("Nový rok:", kniha.rok);
                    const rok = Number(rokVstup);
                    if (!rokVstup || !Number.isInteger(rok)) return alert("Neplatný rok");
                    const cenaVstup = prompt("Nová cena (€):", kniha.cena);
                    const cena = Number(String(cenaVstup).replace(",", "."));
                    if (!cenaVstup || !Number.isFinite(cena)) return alert("Neplatná cena");

                    fetch(`/api/knihy/${kniha.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ nazov, autor, rok, cena })
                    }).then(() => nacitajKnihy());
                };
                akcie.appendChild(btnUpravit);

                const btnNazov = document.createElement("button");
                btnNazov.textContent = "Zmeniť názov";
                btnNazov.onclick = () => {
                    const vstup = prompt("Nový názov knihy:", kniha.nazov);
                    if (!vstup || vstup.trim() === "") return;
                    fetch(`/api/knihy/${kniha.id}/nazov`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ nazov: vstup })
                    }).then(() => nacitajKnihy());
                };
                akcie.appendChild(btnNazov);

                const btnAutor = document.createElement("button");
                btnAutor.textContent = "Zmeniť autora";
                btnAutor.onclick = () => {
                    const vstup = prompt("Nový autor:", kniha.autor);
                    if (!vstup || vstup.trim() === "") return;
                    fetch(`/api/knihy/${kniha.id}/autor`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ autor: vstup })
                    }).then(() => nacitajKnihy());
                };
                akcie.appendChild(btnAutor);

                const btnRok = document.createElement("button");
                btnRok.textContent = "Zmeniť rok";
                btnRok.onclick = () => {
                    const vstup = prompt("Nový rok vydania:", kniha.rok);
                    if (!vstup || vstup.trim() === "") return;
                    const rok = Number(vstup);
                    if (!Number.isInteger(rok)) return alert("Neplatný rok");
                    fetch(`/api/knihy/${kniha.id}/rok`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ rok })
                    }).then(() => nacitajKnihy());
                };
                akcie.appendChild(btnRok);

                const btnZmenit = document.createElement("button");
                btnZmenit.textContent = "Zmeniť cenu";
                btnZmenit.onclick = () => {
                    const vstup = prompt("O koľko € zmeniť cenu?", "5");
                    if (!vstup || vstup.trim() === "") return;
                    const zmena = Number(vstup.replace(",", "."));
                    if (!Number.isFinite(zmena)) return alert("Neplatné číslo");
                    fetch(`/api/knihy/${kniha.id}/cena`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ zmena })
                    }).then(() => nacitajKnihy());
                };
                akcie.appendChild(btnZmenit);

                riadok.appendChild(akcie);
                zoznam.appendChild(riadok);
            });
        });
}

document.getElementById("formKniha").addEventListener("submit", e => {
    e.preventDefault();
    const nazov = document.getElementById("nazov").value;
    const autor = document.getElementById("autor").value;
    const rok = document.getElementById("rok").value;
    const cena = document.getElementById("cena").value;

    fetch("/api/knihy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nazov, autor, rok, cena })
    }).then(() => {
        e.target.reset();
        nacitajKnihy();
    });
});

document.addEventListener("DOMContentLoaded", nacitajKnihy);