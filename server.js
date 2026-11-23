const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const crypto = require("crypto");
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "kniznica_db"
});

db.connect(error => {
    if (error) console.log(error);
});

function hashHeslo(heslo) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(heslo, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

function overHeslo(heslo, ulozenyHash) {
    const [salt, key] = ulozenyHash.split(":");
    const hashBuffer = crypto.scryptSync(heslo, salt, 64);
    const keyBuffer = Buffer.from(key, "hex");
    return crypto.timingSafeEqual(hashBuffer, keyBuffer);
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "knihy.html"));
});

app.get("/api/knihy", (req, res) => {
    db.query("SELECT * FROM knihy", (error, results) => {
        if (error) return res.status(500).send("Error");
        res.json(results);
    });
});

app.post("/api/knihy", (req, res) => {
    const { nazov, autor, rok, cena } = req.body;
    db.query(
        "INSERT INTO knihy (nazov, autor, rok, cena) VALUES (?, ?, ?, ?)",
        [nazov, autor, rok, cena],
        error => {
            if (error) return res.status(500).send("Error");
            res.send("OK");
        }
    );
});

app.put("/api/knihy/:id", (req, res) => {
    const { nazov, autor, rok, cena } = req.body;
    const rokNum = Number(rok);
    const cenaNum = Number(cena);

    if (!nazov || nazov.trim() === "" || !autor || autor.trim() === "" || !Number.isInteger(rokNum) || !Number.isFinite(cenaNum)) {
        return res.status(400).send("Error");
    }

    db.query(
        "UPDATE knihy SET nazov = ?, autor = ?, rok = ?, cena = ? WHERE id = ?",
        [nazov.trim(), autor.trim(), rokNum, cenaNum, req.params.id],
        (error, result) => {
            if (error) return res.status(500).send("Error");
            if (!result.affectedRows) return res.sendStatus(404);
            res.send("OK");
        }
    );
});

app.delete("/api/knihy/:id", (req, res) => {
    db.query("DELETE FROM knihy WHERE id = ?", [req.params.id], error => {
        if (error) return res.status(500).send("Error");
        res.send("OK");
    });
});

app.patch("/api/knihy/:id/cena", (req, res) => {
    const zmena = Number(req.body.zmena);
    if (!Number.isFinite(zmena)) return res.status(400).send("Error");
    db.query("UPDATE knihy SET cena = cena + ? WHERE id = ?", [zmena, req.params.id], (error, result) => {
        if (error) return res.status(500).send("Error");
        if (!result.affectedRows) return res.sendStatus(404);
        res.send("OK");
    });
});

app.patch("/api/knihy/:id/nazov", (req, res) => {
    const nazov = req.body.nazov;
    if (!nazov || nazov.trim() === "") return res.status(400).send("Error");
    db.query("UPDATE knihy SET nazov = ? WHERE id = ?", [nazov.trim(), req.params.id], (error, result) => {
        if (error) return res.status(500).send("Error");
        if (!result.affectedRows) return res.sendStatus(404);
        res.send("OK");
    });
});

app.patch("/api/knihy/:id/autor", (req, res) => {
    const autor = req.body.autor;
    if (!autor || autor.trim() === "") return res.status(400).send("Error");
    db.query("UPDATE knihy SET autor = ? WHERE id = ?", [autor.trim(), req.params.id], (error, result) => {
        if (error) return res.status(500).send("Error");
        if (!result.affectedRows) return res.sendStatus(404);
        res.send("OK");
    });
});

app.patch("/api/knihy/:id/rok", (req, res) => {
    const rok = Number(req.body.rok);
    if (!Number.isInteger(rok)) return res.status(400).send("Error");
    db.query("UPDATE knihy SET rok = ? WHERE id = ?", [rok, req.params.id], (error, result) => {
        if (error) return res.status(500).send("Error");
        if (!result.affectedRows) return res.sendStatus(404);
        res.send("OK");
    });
});

app.post("/api/registracia", (req, res) => {
    const { meno, heslo } = req.body;
    if (!meno || !heslo || meno.trim() === "" || heslo.trim() === "") {
        return res.status(400).json({ sprava: "Vyplňte meno a heslo." });
    }

    const zahashovaneHeslo = hashHeslo(heslo);

    db.query(
        "INSERT INTO pouzivatelia (meno, heslo) VALUES (?, ?)",
        [meno.trim(), zahashovaneHeslo],
        error => {
            if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ sprava: "Používateľ už existuje." });
                }
                return res.status(500).json({ sprava: "Chyba servera." });
            }
            res.json({ sprava: "Registrácia úspešná! Teraz sa môžete prihlásiť." });
        }
    );
});

app.post("/api/prihlasenie", (req, res) => {
    const { meno, heslo } = req.body;
    if (!meno || !heslo) {
        return res.status(400).json({ sprava: "Vyplňte meno a heslo." });
    }

    db.query(
        "SELECT * FROM pouzivatelia WHERE meno = ?",
        [meno.trim()],
        (error, results) => {
            if (error) return res.status(500).json({ sprava: "Chyba servera." });
            if (results.length === 0) {
                return res.status(401).json({ sprava: "Nesprávne meno alebo heslo." });
            }

            const pouzivatel = results[0];
            if (!overHeslo(heslo, pouzivatel.heslo)) {
                return res.status(401).json({ sprava: "Nesprávne meno alebo heslo." });
            }

            res.json({ sprava: "Prihlásenie úspešné!", meno: pouzivatel.meno });
        }
    );
});

app.use((req, res) => {
    res.status(404).sendFile(__dirname + "/404.html");
});

app.listen(3000, () => {});