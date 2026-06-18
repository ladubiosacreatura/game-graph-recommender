import { PrismaClient } from "./generated/client/index.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    // Clean up first
    await prisma.edge.deleteMany({})
    await prisma.game.deleteMany({})

    await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name = 'Game'`;
    await prisma.$executeRaw`DELETE FROM sqlite_sequence WHERE name = 'Edge'`;

    // Create mock game datas
    const games = await prisma.game.createManyAndReturn({
        data: [
            { title: "Hollow Knight", genre: "Metroidvania, Platformer, Difficult, 2D", developer: "Team Cherry" },
            { title: "Elden Ring", genre: "Souls-like, Open World, Dark Fantasy, Difficult", developer: "FromSoftware" },
            { title: "Celeste", genre: "Platformer, Difficult, Indie, 2D", developer: "Extremely OK Games" },
            { title: "Persona 5 Royal", genre: "JRPG, Story Rich, Turn-Based, Anime", developer: "Atlus" },
            { title: "OMORI", genre: "Psychological Horror, RPG, Story Rich, Indie", developer: "OMOCAT" },
            { title: "Hades", genre: "Roguelike, Action, Hack and Slash, Isometric", developer: "Supergiant Games" },
            { title: "Stardew Valley", genre: "Farming Sim, RPG, Cozy, Sandbox, 2D", developer: "ConcernedApe" },
            { title: "Cyberpunk 2077", genre: "RPG, Cyberpunk, Open World, Sci-Fi", developer: "CD Projekt Red" },
            { title: "The Witcher 3: Wild Hunt", genre: "RPG, Story Rich, Open World, Dark Fantasy", developer: "CD Projekt Red" },
            { title: "Minecraft", genre: "Sandbox, Survival, Crafting, 3D", developer: "Mojang Studios" },
            { title: "Terraria", genre: "Sandbox, Survival, Adventure, 2D", developer: "Re-Logic" },
            { title: "Red Dead Redemption 2", genre: "Open World, Story Rich, Western, Action", developer: "Rockstar Games" },
            { title: "Grand Theft Auto V", genre: "Open World, Action, Crime, Multiplayer", developer: "Rockstar Games" },
            { title: "Portal 2", genre: "Puzzle, Co-op, Sci-Fi, First-Person", developer: "Valve" },
            { title: "Half-Life: Alyx", genre: "VR, Sci-Fi, Shooter, Story Rich", developer: "Valve" },
            { title: "Slay the Spire", genre: "Roguelike, Card Battler, Strategy, Deckbuilder", developer: "Mega Crit" },
            { title: "Dead Cells", genre: "Roguelike, Metroidvania, Action, 2D", developer: "Motion Twin" },
            { title: "Disco Elysium", genre: "RPG, Detective, Story Rich, Isometric", developer: "ZA/UM" },
            { title: "Outer Wilds", genre: "Mystery, Space, Exploration, Sci-Fi", developer: "Mobius Digital" },
            { title: "Subnautica", genre: "Survival, Underwater, Exploration, Crafting", developer: "Unknown Worlds" },
            { title: "Factorio", genre: "Automation, Strategy, Crafting, Resource Management", developer: "Wube Software" },
            { title: "RimWorld", genre: "Colony Sim, Strategy, Sci-Fi, Story Generator", developer: "Ludeon Studios" },
            { title: "Baldur's Gate 3", genre: "RPG, Turn-Based, Fantasy, Story Rich", developer: "Larian Studios" },
            { title: "Divinity: Original Sin 2", genre: "RPG, Turn-Based, Fantasy, Co-op", developer: "Larian Studios" },
            { title: "Cuphead", genre: "Run and Gun, Difficult, 2D, Hand-Drawn", developer: "Studio MDHR" },
            { title: "Resident Evil 4", genre: "Survival Horror, Action, Third-Person", developer: "Capcom" },
            { title: "Monster Hunter: World", genre: "Action RPG, Co-op, Multiplayer, Hunting", developer: "Capcom" },
            { title: "Doom Eternal", genre: "FPS, Fast-Paced, Action, Gore", developer: "id Software" },
            { title: "Sekiro: Shadows Die Twice", genre: "Action, Difficult, Stealth, Souls-like", developer: "FromSoftware" },
            { title: "Ori and the Will of the Wisps", genre: "Metroidvania, Platformer, Beautiful, 2D", developer: "Moon Studios" },
            { title: "Undertale", genre: "RPG, Indie, Story Rich, Choice Matters", developer: "Toby Fox" },
            { title: "Deltarune", genre: "RPG, Indie, Turn-Based, Choice Matters", developer: "Toby Fox" },
            { title: "Civilization VI", genre: "Strategy, Turn-Based, Historical, 4X", developer: "Firaxis Games" },
            { title: "Cities: Skylines", genre: "City Builder, Simulation, Management", developer: "Colossal Order" },
            { title: "Sea of Thieves", genre: "Pirates, Multiplayer, Open World, Adventure", developer: "Rare" },
            { title: "Apex Legends", genre: "Battle Royale, FPS, Multiplayer, Fast-Paced", developer: "Respawn Entertainment" },
            { title: "Titanfall 2", genre: "FPS, Sci-Fi, Mechs, Story Rich", developer: "Respawn Entertainment" },
            { title: "Dark Souls Remastered", genre: "Souls-like, Dark Fantasy, Difficult, RPG", developer: "FromSoftware" },
            { title: "Death Stranding", genre: "Sci-Fi, Walking Sim, Atmospheric, Story Rich", developer: "Kojima Productions" },
            { title: "It Takes Two", genre: "Co-op, Platformer, Adventure, Puzzle", developer: "Hazelight" },
            { title: "Vampire Survivors", genre: "Bullet Heaven, Roguelike, Casual, 2D", developer: "poncle" },
            { title: "Dave the Diver", genre: "RPG, Fishing, Management, Pixel Art", developer: "MINTROCKET" },
            { title: "Animal Crossing: New Horizons", genre: "Cozy, Life Sim, Social, Sandbox", developer: "Nintendo" },
            { title: "The Legend of Zelda: Breath of the Wild", genre: "Open World, Adventure, Fantasy, Physics", developer: "Nintendo" },
            { title: "Super Mario Odyssey", genre: "Platformer, 3D, Adventure, Sandbox", developer: "Nintendo" },
            { title: "God of War", genre: "Action, Story Rich, Mythology, Hack and Slash", developer: "Santa Monica Studio" },
            { title: "Marvel's Spider-Man Remastered", genre: "Action, Superhero, Open World, Parkour", developer: "Insomniac Games" },
            { title: "Ghost of Tsushima", genre: "Action, Open World, Samurai, Historical", developer: "Sucker Punch Productions" },
            { title: "Horizon Zero Dawn", genre: "Action RPG, Open World, Sci-Fi, Post-apocalyptic", developer: "Guerrilla Games" },
            { title: "Katana ZERO", genre: "Action, Cyberpunk, 2D, Hack and Slash", developer: "Askiisoft" },
        ],
    });

    let baseWeight = 0.20;

    for (const source of games) {
        for (const target of games) {
            if (source.id !== target.id) {
                await prisma.edge.create({
                data: {
                    sourceId: source.id,
                    targetId: target.id,
                    weight: baseWeight
                }
                });
            }
        }
    }

    console.log("Seeding completed!")
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });