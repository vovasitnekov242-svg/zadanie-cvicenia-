const spravaEl = document.getElementById("sprava");

document.getElementById("formLogin").addEventListener("submit", e => {
    e.preventDefault();
    const meno = document.getElementById("meno").value;
    const heslo = document.getElementById("heslo").value;

    fetch("/api/prihlasenie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meno, heslo })
    })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.sprava);
            localStorage.setItem("prihlasenyPouzivatel", data.meno);
            window.location.href = "knihy.html";
        })
        .catch(err => {
            spravaEl.style.color = "#ff6b6b";
            spravaEl.textContent = err.message;
        });
});

document.getElementById("btnRegistracia").addEventListener("click", () => {
    const meno = document.getElementById("meno").value;
    const heslo = document.getElementById("heslo").value;

    fetch("/api/registracia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meno, heslo })
    })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.sprava);
            spravaEl.style.color = "#51cf66";
            spravaEl.textContent = data.sprava;
        })
        .catch(err => {
            spravaEl.style.color = "#ff6b6b";
            spravaEl.textContent = err.message;
        });
});