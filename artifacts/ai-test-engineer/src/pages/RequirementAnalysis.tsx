import { useState, useRef } from "react";
import { Brain, Upload, FileCheck, HardDrive, FileText, X, ChevronRight } from "lucide-react";
import AIOutputPanel from "@/components/AIOutputPanel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

const FOCUS_OPTIONS = [
  { id: "all", label: "Full Analysis" },
  { id: "actors", label: "Actors & Roles" },
  { id: "functional", label: "Functional Reqs" },
  { id: "risks", label: "Risks Only" },
];

export default function RequirementAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [focus, setFocus] = useState("all");
  const [action, setAction] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setAction(null);
    toast.success(`${f.name} ready for analysis`);
  };

  const handleAnalyze = () => {
    if (mode === "upload" && !file) { toast.error("Upload a requirements document first."); return; }
    if (mode === "paste" && !pastedText.trim()) { toast.error("Paste your requirements text first."); return; }
    setAction(null);
    setTimeout(() => setAction("analyze"), 50);
  };

  const fileName = file?.name ?? (pastedText ? "pasted-requirements.txt" : "requirements.txt");

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#00d4aa]/15 border border-[#00d4aa]/30 flex items-center justify-center shrink-0">
          <Brain className="w-4 h-4 text-[#00d4aa]" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-base">Requirement Analysis</h2>
          <p className="text-white/40 text-xs">Extract actors, functional requirements, business rules, and risks from your document.</p>
        </div>
      </div>

      {/* Controls Row */}
      <div className="bg-[#0d1326] border border-white/10 rounded-xl p-4 flex flex-col gap-4">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          {(["upload", "paste"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={cn("px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                mode === m ? "bg-[#00d4aa]/15 border-[#00d4aa]/40 text-[#00d4aa]" : "border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
              )}>
              {m === "upload" ? "Upload File" : "Paste Text"}
            </button>
          ))}
        </div>

        {mode === "upload" ? (
          file ? (
            <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                <p className="text-xs text-white/40">{formatBytes(file.size)}</p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full bg-emerald-500/10">Ready</span>
              <button onClick={() => setFile(null)} className="text-white/30 hover:text-white/70"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              className={cn("border-2 border-dashed rounded-lg p-5 flex items-center gap-4 cursor-pointer transition-all",
                isDragging ? "border-[#00d4aa] bg-[#00d4aa]/10" : "border-white/10 hover:border-white/25 hover:bg-white/[0.02]"
              )}>
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              <Upload className="w-5 h-5 text-[#00d4aa]/50 shrink-0" />
              <div>
                <p className="text-sm text-white/60 font-medium">Drop your requirement document here</p>
                <p className="text-xs text-white/30">PDF, DOCX, TXT supported</p>
              </div>
            </div>
          )
        ) : (
          <textarea value={pastedText} onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your requirements text here..."
            className="w-full h-28 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#00d4aa]/40 resize-none transition-all" />
        )}

        <div className="flex items-center gap-3">
          <div className="flex gap-2 flex-wrap flex-1">
            {FOCUS_OPTIONS.map((opt) => (
              <button key={opt.id} onClick={() => setFocus(opt.id)}
                className={cn("px-3 py-1 rounded text-xs border transition-all",
                  focus === opt.id ? "bg-[#00d4aa]/15 border-[#00d4aa]/40 text-[#00d4aa]" : "border-white/10 text-white/40 hover:text-white/60"
                )}>
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={handleAnalyze}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-[#00d4aa]/15 border border-[#00d4aa]/40 text-[#00d4aa] hover:bg-[#00d4aa]/25 hover:shadow-[0_0_20px_rgba(0,212,170,0.2)] transition-all shrink-0">
            <Brain className="w-4 h-4" /> Analyze
          </button>
        </div>
      </div>

      {/* Output */}
      <div className="flex-1 min-h-[300px]">
        <AIOutputPanel action={action} fileName={fileName} onClear={() => setAction(null)} />
      </div>
    </div>
  );
}
