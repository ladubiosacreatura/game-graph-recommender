import express from "express";
import cors from "cors";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../prisma/generated/client/index.js";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

const likeIncrement = 0.30;
const dislikeDecrement = 0.40;

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    throw new Error("Databse URL invalid");
}

const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

function calculateGenreSimilarity(genreA: string, genreB: string, devA:string, devB: string): number {
    const tagsA = genreA.split(",").map(t => t.trim().toLowerCase());
    const tagsB = genreB.split(",").map(t => t.trim().toLowerCase());
    const genreIntersection = tagsA.filter(t => tagsB.includes(t)).length;

    const sameDev = devA === devB;

    let score = 0.0;
    if (genreIntersection === 0){
        score = 0.1;
    } else {
        score = 0.5 + (genreIntersection * 0.25)
    }

    if (sameDev){
        score += 0.5;
    }

    return score;   
}

app.get("/api/graph", async (req, res) => {
    try {
        const nodes = await prisma.game.findMany();
        const edges = await prisma.edge.findMany();
        res.json({ nodes, edges });
    }
    catch (error){
        console.error("Graph failed to fetch");
        return res.status(500).json({ error: "Failed to fetch graph data" });
    }
});

app.post("/api/interact/", async (req, res) => {
    const { gameId, type } = req.body;

    if (!gameId || !type) {
        return res.status(400).json({ error: "Missing gameId or interaction type" });
    }

    try {
        const sourceGame = await prisma.game.findUnique({
            where: {
                id: gameId,
            }
        });

        if (!sourceGame){
            return res.status(400).json({ error: "Source game not found" });
        }

        const outgoingEdges = await prisma.edge.findMany({
            where: { sourceId: sourceGame.id },
            include: { targetGame: true },
        });

        const updatedEdges = [];
        const simmilarityThreshold = 0.5; // At least same dev

        for (const edge of outgoingEdges){
            const simmilarityFactor = calculateGenreSimilarity(sourceGame.genre, edge.targetGame.genre, sourceGame.developer, edge.targetGame.developer);
            const unsimmilarityFactor = 1.0 - simmilarityFactor;
            
            let newWeight = edge.weight;

            if (type === "LIKE"){
                if (simmilarityFactor >= simmilarityThreshold){
                    const buff = likeIncrement * simmilarityFactor;
                    newWeight = Math.min(3.0, Number((edge.weight + buff).toFixed(2)));
                } else {
                    const debuff = dislikeDecrement * unsimmilarityFactor;
                    newWeight = Math.max(0.0, Number((edge.weight - debuff).toFixed(2)));
                }
            }
            else{
                if (simmilarityFactor >= simmilarityThreshold){
                    const debuff = dislikeDecrement * simmilarityFactor;
                    newWeight = Math.max(0.0, Number((edge.weight - debuff).toFixed(2)));
                } else {
                    const buff = likeIncrement * unsimmilarityFactor;
                    newWeight = Math.min(3.0, Number((edge.weight + buff).toFixed(2)));
                }
            }

            const newEdge = await prisma.edge.update({
                where: {
                    graphLink: {
                        sourceId: edge.sourceId,
                        targetId: edge.targetId
                    }
                },
                data: { weight: newWeight }
            })
            updatedEdges.push(newEdge);
        }

        return res.json({ message: "Successfully updated edges", updatedCount: updatedEdges.length })

    } catch (error) {
        console.error("Failed to process game interaction:", error);
        return res.status(500).json({ error: "Failed to process game interaction" });
    }
});

app.get("/api/recommend/:gameId", async (req, res) => {
    const gameId = Number(req.params.gameId);

    try {
        const recs = await prisma.edge.findMany({
            where: { 
                sourceId: gameId,
                weight: { gte: 0.40 }
            },
            include: {
                targetGame: true,
            },
            orderBy: {
                weight: "desc",
            },
        });

        return res.json(recs);
    } catch (error) {
        console.log("Failed to retrieve recommendations");
        return res.status(500).json({ error: "Failed to retrieve recommendations" });
    }
});

app.listen(PORT, () => {
    console.log(`Mutation system running in ${PORT}`);
})