import { useState, useRef } from "react";
import {
  Upload,
  Search,
  FileCheck,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  GitMerge,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Bug {
  id: string;
  title: string;
}

interface MatchResult extends Bug {
  similarity: number;
}

function jaccard(a: string, b: string): number {
  const tokenize = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
    );
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  setA.forEach((w) => { if (setB.has(w)) intersection++; });
  const union = new Set([...setA, ...setB]).size;
  return Math.round((intersection / union) * 100);
}

function parseBugs(text: string): Bug[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((line, i) => {
      const m =
        line.match(/^([A-Z]+-\d+)[:\s,]+(.+)$/) ||
        line.match(/^(\d+)[:\s,]+(.+)$/);
      if (m) return { id: m[1].trim(), title: m[2].trim() };
      return { id: `BUG-${String(i + 1).padStart(3, "0")}`, title: line };
    });
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

function SimilarityBar({ pct }: { pct: number }) {
  const color = pct >= 65 ? "bg-red-500" : pct >= 35 ? "bg-yellow-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-white/80 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function DuplicateDetector() {
  const [bugsFile, setBugsFile] = useState<File | null>(null);
  const [bugsList, setBugsList] = useState<Bug[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [phase, setPhase] = useState<"idle" | "comparing" | "done">("idle");
  const [results, setResults] = useState<MatchResult[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    const text = await f.text();
    const parsed = parseBugs(text);
    if (parsed.length === 0) {
      toast.error("Could not parse bugs from file", { description: "Make sure each line contains a bug title." });
      return;
    }
    setBugsFile(f);
    setBugsList(parsed);
    setPhase("idle");
    setResults([]);
    toast.success(`Loaded ${parsed.length} bugs from ${f.name}`);
  };

  const handleCompare = () => {
    if (!bugsList.length) {
      toast.error("Upload a bugs list first.");
      return;
    }
    if (!newTitle.trim()) {
      toast.error("Enter a bug title to compare.");
      return;
    }
    setPhase("comparing");
    setResults([]);

    setTimeout(() => {
      const matches = bugsList
        .map((bug) => ({ ...bug, similarity: jaccard(newTitle, bug.title) }))
        .filter((r) => r.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity);
      setResults(matches);
      setPhase("done");
      const top = matches[0];
      if (top && top.similarity >= 65) {
        toast.error("Duplicate detected!", { description: `${top.id} is ${top.similarity}% similar.` });
      } else if (top && top.similarity >= 35) {
        toast.warning("Possible duplicate found", { description: `Review ${top.id} before creating.` });
      } else {
        toast.success("No duplicates found", { description: "This appears to be a new bug." });
      }
    }, 1800);
  };

  const reset = () => {
    setBugsFile(null);
    setBugsList([]);
    setNewTitle("");
    setPhase("idle");
    setResults([]);
  };

  const topMatch = results[0];
  const verdict =
    !topMatch || topMatch.similarity < 35
      ? "new"
      : topMatch.similarity >= 65
      ? "duplicate"
      : "possible";

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* Step 1: Upload Bugs List */}
      <div className="bg-[#0d1326] border border-white/10 rounded-xl p-4">
        <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#ec4899]/20 border border-[#ec4899]/40 text-[#ec4899] text-[10px] font-bold flex items-center justify-center">1</span>
          Upload Existing Bugs List
        </p>

        {bugsFile ? (
          <div className="flex items-center gap-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <FileCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{bugsFile.name}</p>
              <p className="text-xs text-white/40 flex gap-3">
                <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" />{formatBytes(bugsFile.size)}</span>
                <span className="flex items-center gap-1"><GitMerge className="w-3 h-3" />{bugsList.length} bugs loaded</span>
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shrink-0">Ready</span>
            <button onClick={reset} className="text-white/30 hover:text-white/70 transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className={cn(
              "border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200",
              isDragging ? "border-[#ec4899] bg-[#ec4899]/10" : "border-white/10 hover:border-white/25 hover:bg-white/[0.02]"
            )}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".txt,.csv,.md"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <Upload className="w-6 h-6 text-[#ec4899]/60 mb-2" />
            <p className="text-sm text-white/60 font-medium">Upload bugs list</p>
            <p className="text-xs text-white/30 mt-0.5">TXT or CSV — one bug per line (e.g. BUG-001: Login fails)</p>
          </div>
        )}
      </div>

      {/* Step 2: Enter New Bug Title */}
      <div className="bg-[#0d1326] border border-white/10 rounded-xl p-4">
        <p className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#ec4899]/20 border border-[#ec4899]/40 text-[#ec4899] text-[10px] font-bold flex items-center justify-center">2</span>
          Enter New Bug Title
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCompare()}
            placeholder="e.g. Login button not responding on mobile"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ec4899]/50 focus:bg-white/[0.07] transition-all"
            data-testid="input-new-bug-title"
          />
          <button
            onClick={handleCompare}
            disabled={phase === "comparing"}
            data-testid="button-compare-bugs"
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shrink-0",
              phase === "comparing"
                ? "bg-[#ec4899]/20 text-[#ec4899]/50 cursor-not-allowed"
                : "bg-[#ec4899]/15 border border-[#ec4899]/40 text-[#ec4899] hover:bg-[#ec4899]/25 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]"
            )}
          >
            {phase === "comparing" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Comparing...</>
            ) : (
              <><Search className="w-4 h-4" /> Compare</>
            )}
          </button>
        </div>
      </div>

      {/* Step 3: Results */}
      <div className="flex-1 bg-[#050814] border border-white/10 rounded-xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center gap-2 shrink-0">
          <GitMerge className="w-4 h-4 text-[#ec4899]/60" />
          <span className="text-sm font-medium text-white/70 font-mono">Duplicate Analysis Output</span>
          {phase === "comparing" && (
            <span className="flex items-center gap-1.5 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ec4899] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#ec4899] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#ec4899] animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          )}
          {phase === "done" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-2" />}
        </div>

        <div className="flex-1 overflow-y-auto p-4">

          {phase === "idle" && (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#ec4899]/10 border border-[#ec4899]/20 flex items-center justify-center">
                <GitMerge className="w-5 h-5 text-[#ec4899]/50" />
              </div>
              <p className="text-white/40 text-sm">Upload your bugs list, enter a new bug title, and click Compare.</p>
            </div>
          )}

          {phase === "comparing" && (
            <div className="space-y-2 font-mono text-xs">
              <p className="text-[#ec4899]/60 uppercase tracking-widest mb-4">◎ AI Similarity Engine — Running</p>
              {[
                "Parsing uploaded bug database...",
                "Tokenizing and normalising text...",
                "Computing Jaccard similarity scores...",
                "Ranking matches by confidence...",
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${i * 350}ms` }}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-white/50">{s}</span>
                </div>
              ))}
            </div>
          )}

          {phase === "done" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Verdict Banner */}
              <div className={cn(
                "rounded-lg border p-4 flex items-start gap-3",
                verdict === "duplicate"
                  ? "bg-red-500/10 border-red-500/30"
                  : verdict === "possible"
                  ? "bg-yellow-500/10 border-yellow-500/30"
                  : "bg-emerald-500/10 border-emerald-500/30"
              )}>
                {verdict === "duplicate" && <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                {verdict === "possible" && <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />}
                {verdict === "new" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
                <div>
                  <p className={cn(
                    "font-bold text-sm mb-1",
                    verdict === "duplicate" ? "text-red-400" : verdict === "possible" ? "text-yellow-400" : "text-emerald-400"
                  )}>
                    {verdict === "duplicate" && "DUPLICATE DETECTED"}
                    {verdict === "possible" && "POSSIBLE DUPLICATE — REVIEW BEFORE CREATING"}
                    {verdict === "new" && "NEW BUG — SAFE TO CREATE"}
                  </p>
                  <p className="text-white/60 text-xs leading-relaxed">
                    {verdict === "duplicate" && `"${newTitle}" is highly similar to an existing bug. Link to the existing entry instead of creating a new one.`}
                    {verdict === "possible" && `"${newTitle}" has some overlap with existing bugs. Review the matches below before deciding.`}
                    {verdict === "new" && `"${newTitle}" does not closely match any existing bug. You can safely create a new entry.`}
                  </p>
                </div>
              </div>

              {/* New Bug Title Reference */}
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-white/40 mb-1 uppercase tracking-wider">New Bug Title</p>
                <p className="text-sm text-white font-medium">"{newTitle}"</p>
              </div>

              {/* Match Table */}
              {results.length > 0 ? (
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-2">
                    Similarity Matches ({results.length} bug{results.length !== 1 ? "s" : ""} checked)
                  </p>
                  <div className="rounded-lg border border-white/10 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                          {["Bug ID", "Existing Bug Title", "Similarity", "Recommendation"].map((h) => (
                            <th key={h} className="px-3 py-2 text-left text-white/50 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.slice(0, 10).map((r) => {
                          const rec =
                            r.similarity >= 65
                              ? { label: "Link to this bug", color: "text-red-400 bg-red-500/10 border-red-500/20" }
                              : r.similarity >= 35
                              ? { label: "Review before creating", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" }
                              : { label: "Likely distinct", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
                          return (
                            <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="px-3 py-2.5 font-mono text-[#ec4899] font-bold whitespace-nowrap">{r.id}</td>
                              <td className="px-3 py-2.5 text-white/70 min-w-[180px]">{r.title}</td>
                              <td className="px-3 py-2.5 min-w-[130px]"><SimilarityBar pct={r.similarity} /></td>
                              <td className="px-3 py-2.5">
                                <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${rec.color}`}>{rec.label}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-white/30 text-sm">
                  No word overlap found with any existing bug.
                </div>
              )}

              {/* Re-run hint */}
              <p className="text-xs text-white/25 text-center">
                Change the title above and click Compare again to re-run the analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
