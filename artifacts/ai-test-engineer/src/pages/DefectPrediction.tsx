import { useState, useRef } from "react";
import { AlertTriangle, Upload, FileCheck, X, Zap } from "lucide-react";
import AIOutputPanel from "@/components/AIOutputPanel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

const RISK_AREAS = [
  { id: "all", label: "All Areas" },
  { id: "auth", label: "Authentication" },
  { id: "payment", label: "Payment Flow" },
  { id: "api", label: "API / Integration" },
  { id: "ui", label: "UI / Frontend" },
  { id: "data", label: "Data Handling" },
];

const MODELS = [
  { id: "ml", label: "ML Risk Classifier", desc: "Pattern-based prediction" },
  { id: "heuristic", label: "Heuristic Engine", desc: "Rules + complexity score" },
  { id: "combined", label: "Combined (Best)", desc: "ML + Heuristics merged" },
];

export default function DefectPrediction() {
  const [file, setFile] = useState<File | null>(null);
  const [riskArea, setRiskArea] = useState("all");
  const [model, setModel] = useState("combined");
  const [action, setAction] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => { setFile(f); setAction(null); toast.success(`${f.name} loaded for analysis`); };

  const handlePredict = () => {
    if (!file) { toast.error("Upload a module description or requirement doc first."); return; }
    setAction(null);
    setTimeout(() => setAction("predict"), 50);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-base">Defect Prediction</h2>
          <p className="text-white/40 text-xs">Predict high-risk defect areas before testing begins using AI risk classification.</p>
        </div>
      </div>

      <div className="bg-[#0d1326] border border-white/10 rounded-xl p-4 flex flex-col gap-4">
        {/* Upload */}
        {file ? (
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
              isDragging ? "border-[#f59e0b] bg-[#f59e0b]/10" : "border-white/10 hover:border-white/25 hover:bg-white/[0.02]"
            )}>
            <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <Upload className="w-5 h-5 text-[#f59e0b]/50 shrink-0" />
            <div>
              <p className="text-sm text-white/60 font-medium">Upload module description or requirement doc</p>
              <p className="text-xs text-white/30">PDF, DOCX, TXT</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Risk Focus */}
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Risk Focus Area</p>
            <div className="flex flex-wrap gap-1.5">
              {RISK_AREAS.map((r) => (
                <button key={r.id} onClick={() => setRiskArea(r.id)}
                  className={cn("px-3 py-1 rounded text-xs border transition-all",
                    riskArea === r.id ? "bg-[#f59e0b]/15 border-[#f59e0b]/40 text-[#f59e0b]" : "border-white/10 text-white/40 hover:text-white/60"
                  )}>{r.label}</button>
              ))}
            </div>
          </div>
          {/* Model */}
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Prediction Model</p>
            <div className="flex flex-col gap-1.5">
              {MODELS.map((m) => (
                <button key={m.id} onClick={() => setModel(m.id)}
                  className={cn("flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all",
                    model === m.id ? "bg-[#f59e0b]/10 border-[#f59e0b]/30" : "border-white/10 hover:border-white/20"
                  )}>
                  <div className={cn("w-2 h-2 rounded-full shrink-0", model === m.id ? "bg-[#f59e0b]" : "bg-white/20")} />
                  <div>
                    <p className={cn("text-xs font-semibold", model === m.id ? "text-[#f59e0b]" : "text-white/60")}>{m.label}</p>
                    <p className="text-[11px] text-white/30">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handlePredict}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#f59e0b] hover:bg-[#f59e0b]/25 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all">
            <Zap className="w-4 h-4" /> Predict Defects
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <AIOutputPanel action={action} fileName={file?.name ?? "module.txt"} onClear={() => setAction(null)} />
      </div>
    </div>
  );
}
