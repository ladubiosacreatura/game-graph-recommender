import { useState, useEffect } from "react";
import { 
  ThumbsUp, 
  ThumbsDown, 
  Gamepad2, 
  Layers, 
  Grid, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Flame,
  Info,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface GameNode {
  id: number;
  title: string;
  genre: string;
  developer: string;
}

interface GameEdge {
  id: number;
  sourceId: number;
  targetId: number;
  weight: number;
}

interface Recommendation {
  id: number;
  weight: number;
  targetGame: GameNode;
}

export default function App() {
  const [nodes, setNodes] = useState<GameNode[]>([]);
  const [edges, setEdges] = useState<GameEdge[]>([]);
  const [focusedGame, setFocusedGame] = useState<GameNode | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showMatrix, setShowMatrix] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;

  const fetchGraphData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/graph");
      if (!res.ok) throw new Error("Gagal mengambil data graf dari server");
      const data = await res.json();
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchRecommendations = async (gameId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/recommend/${gameId}`);
      if (!res.ok) throw new Error("Gagal memuat rekomendasi untuk game ini");
      const data = await res.json();
      setRecommendations(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  useEffect(() => {
    if (focusedGame) {
      fetchRecommendations(focusedGame.id);
    } else if (nodes.length > 0) {
      setFocusedGame(nodes[0]);
    }
  }, [focusedGame, nodes, edges]);

  const handleGameFeedback = async (type: "LIKE" | "DISLIKE") => {
    if (!focusedGame) return;

    try {
      const res = await fetch("http://localhost:5000/api/interact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: focusedGame.id,
          type,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          `HTTP Error ${res.status}: Periksa apakah rute /api/interact/game sudah aktif.`
        );
      }
      
      setStatusMessage(
        type === "LIKE" 
          ? `👍 Sukses memperkuat relasi kesamaan untuk game ${focusedGame.title}!` 
          : `👎 Sukses memperlemah relasi kesamaan untuk game ${focusedGame.title}!`
      );
      setTimeout(() => setStatusMessage(null), 4000);

      await fetchGraphData();
    } catch (err: any) {
      alert(`Gagal mengirim feedback interaksi:\n${err.message}`);
    }
  };

  const totalPages = Math.ceil(nodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGames = nodes.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950 text-white font-mono">Menyiapkan Mesin Rekomendasi...</div>;
  if (error) return <div className="flex h-screen items-center justify-center bg-slate-950 text-rose-400 font-mono">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Untuk Webkit (Chrome, Safari, Edge) */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #020617; /* Sesuai slate-950 */
        }
        ::-webkit-scrollbar-thumb {
          background: #1e293b; /* Sesuai slate-800 */
          border-radius: 9999px;
          border: 2px solid #020617;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #4f46e5; /* Sesuai indigo-600 */
        }
        
        /* Untuk Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #1e293b #020617;
        }
      `}} />

      {/* Top Navigation / Brand */}
      <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/10 rounded-lg border border-indigo-500/20">
              <Gamepad2 className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Graph Match</h1>
              <p className="text-xs text-slate-400">Sistem Rekomendasi Game Berbasis Matematika Diskrit</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Database SQLite Connected
          </div>
        </div>
      </nav>

      {/* Main Grid Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Recommendation Area */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5 backdrop-blur">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold tracking-wider text-indigo-400 uppercase flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Recommended for You
              </h2>
              {focusedGame && (
                <span className="text-xs text-slate-400">
                  Based on: <strong className="text-slate-200">{focusedGame.title}</strong>
                </span>
              )}
            </div>

            {recommendations.length > 0 ? (
              <div className="space-y-3 max-h-125 overflow-y-auto pr-1">
                {recommendations.map((rec, idx) => (
                  <div 
                    key={rec.id} 
                    className="group bg-slate-950/50 hover:bg-slate-950 border border-slate-850 hover:border-indigo-500/40 p-4 rounded-xl transition-all duration-300 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                        <h3 className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors text-sm">
                          {rec.targetGame.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400">{rec.targetGame.genre}</p>
                    </div>

                    {/* Weight Progress */}
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
                        w = {rec.weight.toFixed(2)}
                      </span>
                      <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${(rec.weight / 3.0) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-slate-500 space-y-2">
                <Flame className="h-8 w-8 mx-auto text-slate-700" />
                <p className="text-xs">Tidak ada relasi kesamaan aktif.</p>
                <p className="text-[10px] text-slate-600 max-w-62.5 mx-auto">
                  Cobalah klik tombol "Like" pada game di sebelah kanan untuk melatih atau menghubungkan kembali graf kesamaan.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Dedicated Game Selector */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* Status Message Alert */}
          {statusMessage && (
            <div className="bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* DEDICATED GAME SECTION */}
          {focusedGame ? (
            <div className="bg-linear-to-br from-indigo-950/20 to-slate-900 border border-slate-850 rounded-2xl p-6 relative overflow-hidden shadow-xl shadow-indigo-950/10">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md">
                    Dedicated Game
                  </span>
                  <h2 className="text-2xl font-black text-white tracking-tight mt-3">
                    {focusedGame.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Developer: <span className="text-slate-200 font-semibold">{focusedGame.developer}</span>
                  </p>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400 block mb-1">Tags & Genre:</span>
                  {focusedGame.genre}
                </div>

                {/* LIKE / DISLIKE INTERACTION BUTTONS */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleGameFeedback("LIKE")}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer active:scale-95"
                  >
                    <ThumbsUp className="h-4 w-4" /> I Like This Game
                  </button>
                  <button
                    onClick={() => handleGameFeedback("DISLIKE")}
                    className="flex-1 bg-slate-900 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-500/30 text-rose-400 font-bold py-3.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <ThumbsDown className="h-4 w-4" /> Dislike / Not Interested
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 p-12 border border-dashed border-slate-800 rounded-2xl text-center text-slate-500">
              Pilih sebuah game di bawah untuk fokus.
            </div>
          )}

          {/* GAME SELECTOR CATALOG  */}
          <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                <Layers className="h-4 w-4" /> Switch Dedicated Game (Grid 4x3)
              </h2>
              
              {/* Pagination Control */}
              <div className="flex items-center gap-3">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="p-1.5 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 rounded-lg transition-all disabled:opacity-30 disabled:hover:border-slate-850 cursor-pointer"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-mono text-slate-400">
                  Page <strong className="text-indigo-400">{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="p-1.5 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 rounded-lg transition-all disabled:opacity-30 disabled:hover:border-slate-850 cursor-pointer"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Grid 4x3 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {paginatedGames.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setFocusedGame(game)}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer active:scale-95 flex flex-col justify-between h-19 ${
                    focusedGame?.id === game.id
                      ? "bg-indigo-600/15 border-indigo-500 text-white font-bold shadow-md shadow-indigo-950/40"
                      : "bg-slate-950/40 border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="text-xs line-clamp-2 font-semibold leading-tight">{game.title}</div>
                  <div className="text-[9px] text-slate-500 truncate mt-1">{game.developer}</div>
                </button>
              ))}
            </div>
          </div>

        </section>

      </main>

      {/* ADJACENCY MATRIX COLLAPSIBLE BOTTOM DRAWER */}
      <footer className="border-t border-slate-900 bg-slate-950 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button 
            onClick={() => setShowMatrix(!showMatrix)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-slate-200 uppercase tracking-wider py-2 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Grid className="h-4 w-4 text-indigo-400" /> Live Adjacency Matrix View (50 x 50 Graph Matrix)
            </span>
            {showMatrix ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showMatrix && (
            <div className="mt-4 overflow-x-auto border border-slate-850 rounded-xl bg-slate-900/30 p-4">
              <div className="max-h-87.5 overflow-y-auto pr-1">
                <table className="min-w-full text-center border-collapse text-[10px] font-mono">
                  <thead className="sticky top-0 bg-slate-950 z-10 shadow-sm shadow-slate-900">
                    <tr>
                      <th className="p-2 border border-slate-850 text-slate-500 text-left bg-slate-950">Source \ Target</th>
                      {nodes.map((n) => (
                        <th 
                          key={n.id} 
                          className={`p-2 border border-slate-850 text-[9px] min-w-13.75 max-w-13.75 truncate bg-slate-950 ${
                            focusedGame?.id === n.id ? "text-indigo-400 font-black" : "text-slate-500"
                          }`}
                          title={n.title}
                        >
                          G{n.id}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {nodes.map((rowNode) => (
                      <tr 
                        key={rowNode.id} 
                        className={`${focusedGame?.id === rowNode.id ? "bg-indigo-950/20" : "hover:bg-slate-900/10"}`}
                      >
                        <td className="p-2 border border-slate-850 text-left font-semibold text-slate-300 max-w-30 truncate bg-slate-950/30" title={rowNode.title}>
                          {rowNode.title}
                        </td>
                        {nodes.map((colNode) => {
                          const edge = edges.find((e) => e.sourceId === rowNode.id && e.targetId === colNode.id);
                          const isSelf = rowNode.id === colNode.id;
                          
                          return (
                            <td
                              key={colNode.id}
                              className={`p-2 border border-slate-850 ${
                                isSelf 
                                  ? "text-slate-700 bg-slate-950/80 font-bold" 
                                  : edge 
                                    ? "text-indigo-400 font-bold bg-indigo-500/5" 
                                    : "text-slate-600"
                              }`}
                            >
                              {isSelf ? "Ø" : edge ? edge.weight.toFixed(2) : "0.00"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-[10px] text-slate-500 mt-3 text-center">
                Ø melambangkan relasi ke diri sendiri (tidak dihitung). Nilai desimal menunjukkan bobot kesamaan antar simpul graf ($50 \times 50$ total $2.450$ relasi berbobot).
              </div>
            </div>
          )}
        </div>
      </footer>

    </div>
  );
}