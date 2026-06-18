# Game Graph Recommender 

A full-stack game recommendation system utilizing discrete mathematics concepts, specifically using a weighted directed complete graph to dynamically map and calibrate similarity factors between games based on real-time user interactions.

## Discrete Math Concepts Applied

- **Directed Complete Graph**: The system utilizes a network of 50 seeded games. Each node (game) is connected with every other node, generating exactly $50 \times 49 = 2,450$ directional similarity edges.
- **Dynamic Weight Calibration**: User interactions (`LIKE` or `DISLIKE`) act as triggers for matrix mutations, reinforcing or degrading the edge weights.
- **Live Adjacency Matrix**: The visualizer renders a live $50 \times 50$ mathematical matrix view showing real-time edge weight drifts directly from the SQLite graph data.

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS (Custom Dark Premium Theme)
- **Icons**: Lucide React

### Backend & Database
- **Runtime**: Node.js with Express.js
- **ORM**: Prisma ORM
- **Database**: SQLite (via `@prisma/adapter-better-sqlite3`)

## Folder Structure
```text
game-graph-recommender/
├── frontend/             # React Client
│   ├── src/
│   │   ├── App.tsx       # Main UI & Matrix Renderer
│   │   └── main.tsx
│   ├── vite.config.ts
│   └── package.json
├── backend/              # Express API Server
│   ├── src/
│   │   └── index.ts      # Graph API Controllers & Server entry
│   ├── prisma/
│   │   ├── schema.prisma # Graph Edge Database Schema
│   │   └── seed.ts       # N * (N-1) Complete Graph Seeding Engine
│   └── package.json
├── .gitignore            # Keeps your database & secrets safe
└── README.md             # You are here!
```

## How to Run

### 1. Clone Repo
```bash
git clone https://github.com/ladubiosacreatura/game-graph-recommender.git
cd game-graph-recommender
```

### 2. Setup Backend
```bash
cd backend
npm install

# Run migrations to create SQLite schema
npx prisma migrate dev --name init

# Run the seeding script to populate the database with 50 games and 2,450 edges
npx prisma db seed

# Start the Express API server (Running on http://localhost:5000)
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install

# Start the client (Running on http://localhost:5173)
npm run dev
```

The application should now be running at http://localhost:5173
