const express = require("express");
const mysql = require("mysql2");
const path = require("path");
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

app.use((req, res) => {
    res.status(404).sendFile(__dirname + "/404.html");
});
app.listen(3000, () => {});