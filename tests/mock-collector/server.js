import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Simple stockage en mémoire pour inspection
const store = { items: [] };

app.post("/ingest", (req, res) => {
    const { projectKey, items } = req.body || {};
    const when = new Date().toISOString();
    console.log("---- /ingest ----", when);
    console.log("projectKey:", projectKey);
    (items || []).forEach((it, i) => console.log(`#${i+1}`, it));
    store.items.push(...(items || []));
    res.json({ ok: true, received: items?.length || 0 });
});

app.get("/dump", (_, res) => res.json({ count: store.items.length, items: store.items }));

const port = 5055;
app.listen(port, () => console.log(`Mock collector on http://localhost:${port}`));
