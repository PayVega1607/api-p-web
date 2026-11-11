import express from "express";

const app = express();
app.use(express.json());
app.set("json spaces", 2);

let articulos = [
    { id: 1, titulo: "Mango", valor: 410, existencias: 9500 },
    { id: 2, titulo: "Aguacate", valor: 750, existencias: 6200 },
    { id: 3, titulo: "Limón", valor: 220, existencias: 14000 },
    { id: 4, titulo: "Piña", valor: 600, existencias: 7800 },
    { id: 5, titulo: "Ajo", valor: 950, existencias: 4300 },
    { id: 6, titulo: "Pimentón", valor: 480, existencias: 11000 },
    { id: 7, titulo: "Lenteja", valor: 780, existencias: 16500 },
    { id: 8, titulo: "Maíz", valor: 310, existencias: 22000 },
];

let proximoId = 9;

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get("/articulos", (req, res) => {
    const { titulo } = req.query;
    if (titulo) {
        const coincidencias = articulos.filter((a) =>
            a.titulo.toLowerCase().includes(titulo.toLowerCase())
        );
        return res.status(200).json(coincidencias);
    }
    res.status(200).json(articulos);
});

app.get("/articulos/:id", (req, res) => {
    const id = Number(req.params.id);
    const articulo = articulos.find((a) => a.id === id);
    if (!articulo) return res.status(404).json({ error: "Artículo no encontrado" });
    res.json(articulo);
});

app.post("/articulos", (req, res) => {
    const { titulo, valor } = req.body;
    if (!titulo || valor === undefined) {
        return res.status(400).json({ error: "Datos incompletos: titulo y valor son requeridos" });
    }
    const creado = { id: proximoId++, titulo, valor, existencias: 0 };
    articulos.push(creado);
    res.status(201).json(creado);
});

app.put("/articulos/:id", (req, res) => {
    const id = Number(req.params.id);
    const pos = articulos.findIndex((a) => a.id === id);
    if (pos === -1) return res.status(404).json({ error: "Artículo no encontrado" });

    const { titulo, valor, existencias } = req.body;
    if (!titulo || valor === undefined || existencias === undefined) {
        return res.status(400).json({ error: "Datos incompletos: titulo, valor y existencias son requeridos" });
    }

    articulos[pos] = { id, titulo, valor, existencias };
    res.status(200).json(articulos[pos]);
});

app.patch("/articulos/:id", (req, res) => {
    const id = Number(req.params.id);
    const articulo = articulos.find((a) => a.id === id);
    if (!articulo) return res.status(404).json({ error: "Artículo no encontrado" });

    const { titulo, valor, existencias } = req.body;
    if (titulo !== undefined) articulo.titulo = titulo;
    if (valor !== undefined) articulo.valor = valor;
    if (existencias !== undefined) articulo.existencias = existencias;

    res.status(200).json(articulo);
});

app.delete("/articulos/:id", (req, res) => {
    const id = Number(req.params.id);
    const pos = articulos.findIndex((a) => a.id === id);
    if (pos === -1) return res.status(404).json({ error: "Artículo no encontrado" });
    articulos.splice(pos, 1);
    res.status(204).end();
});

app.listen(3002, () => console.log("Servidor corriendo en http://localhost:3002"));