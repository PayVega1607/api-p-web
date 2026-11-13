import { db } from "./db.js";
import express from "express";

const app = express();
app.use(express.json());
app.set("json spaces", 2);

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get("/articulos", async (req, res) => {
    try {
        const { titulo } = req.query;
        if (titulo) {
            const [filas] = await db.query("SELECT * FROM productos WHERE titulo LIKE ?", [`%${titulo}%`]);
            return res.status(200).json(filas);
        }
        const [filas] = await db.query("SELECT * FROM productos");
        res.status(200).json(filas);
    } catch (error) {
        res.status(500).json({ error: "Error en la base de datos" });
    }
});

app.get("/articulos/:id", async (req, res) => {
    try {
        const [filas] = await db.query("SELECT * FROM productos WHERE id = ?", [req.params.id]);
        if (filas.length === 0) {
            return res.status(404).json({ error: "Artículo no encontrado" });
        }
        res.status(200).json(filas[0]);
    } catch (error) {
        res.status(500).json({ error: "Error en la base de datos" });
    }
});

app.post("/articulos", async (req, res) => {
    try {
        const { titulo, valor, existencias } = req.body;
        if (!titulo || valor === undefined) {
            return res.status(400).json({ error: "Datos incompletos: titulo y valor son requeridos" });
        }
        const stock = existencias !== undefined ? existencias : 0;
        
        const [resultado] = await db.query(
            "INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)",
            [titulo, valor, stock]
        );
        
        res.status(201).json({ id: resultado.insertId, titulo, valor, existencias: stock });
    } catch (error) {
        res.status(500).json({ error: "Error en la base de datos" });
    }
});

app.put("/articulos/:id", async (req, res) => {
    try {
        const { titulo, valor, existencias } = req.body;
        if (!titulo || valor === undefined || existencias === undefined) {
            return res.status(400).json({ error: "Datos incompletos: titulo, valor y existencias son requeridos" });
        }

        const [resultado] = await db.query(
            "UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?",
            [titulo, valor, existencias, req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Artículo no encontrado" });
        }

        res.status(200).json({ id: Number(req.params.id), titulo, valor, existencias });
    } catch (error) {
        res.status(500).json({ error: "Error en la base de datos" });
    }
});

app.patch("/articulos/:id", async (req, res) => {
    try {
        const { titulo, valor, existencias } = req.body;
        
        const [filas] = await db.query("SELECT * FROM productos WHERE id = ?", [req.params.id]);
        if (filas.length === 0) {
            return res.status(404).json({ error: "Artículo no encontrado" });
        }

        const actual = filas[0];
        const nuevoTitulo = titulo !== undefined ? titulo : actual.nombre;
        const nuevoValor = valor !== undefined ? valor : actual.precio;
        const nuevasExistencias = existencias !== undefined ? existencias : actual.stock;

        await db.query(
            "UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?",
            [nuevoTitulo, nuevoValor, nuevasExistencias, req.params.id]
        );

        res.status(200).json({ id: Number(req.params.id), titulo: nuevoTitulo, valor: nuevoValor, existencias: nuevasExistencias });
    } catch (error) {
        res.status(500).json({ error: "Error en la base de datos" });
    }
});

app.delete("/articulos/:id", async (req, res) => {
    try {
        const [resultado] = await db.query("DELETE FROM productos WHERE id = ?", [req.params.id]);
        
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: "Artículo no encontrado" });
        }
        
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: "Error en la base de datos" });
    }
});

app.listen(3002, () => console.log("Servidor corriendo en http://localhost:3002"));