import { useState, useRef, useEffect } from "react";
import { AlertTriangle, Upload, FileCheck, CheckCircle2, Zap, TrendingUp, Bug } from "lucide-react";
import AIOutputPanel from "@/components/AIOutputPanel";
import { useDocument } from "@/context/DocumentContext";
import { aiService } from "@/services/aiService";
import { extractFileText } from "@/services/extractService";
import type { DefectPredictionResult } from "@/types/aiResponses";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function RiskBadge({ level }: { level: "HIGH" | "MEDIUM" | "LOW" }) {
  const s = {
    HIGH: "bg-red-500/20 text-red-400 border-red-500/30",
    MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    LOW: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${s[level]}`}>
      {level}
    </span>
  );
}

function PredictOutput({ data }: { data: DefectPredictionResult }) {
  const s = data.summary ?? { scanned: 0, high: 0, medium: 0, low: 0 };
  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
          <p className="text-2xl font-bold text-white/80">{s.scanned}</p>
          <p className="text-xs text-white/40 mt-0.5">Modules Scanned</p>
        </div>
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
          <p className="text-2xl font-bold text-red-400">{s.high}</p>
          <p className="text-xs text-white/40 mt-0.5">High Risk</p>
        </div>
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
          <p className="text-2xl font-bold text-yellow-400">{s.medium}</p>
          <p className="text-xs text-white/40 mt-0.5">Medium Risk</p>
        </div>
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
          <p className="text-2xl font-bold text-emerald-400">{s.low}</p>
          <p className="text-xs text-white/40 mt-0.5">Low Risk</p>
        </div>
      </div>

      {/* High Risk Modules */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-red-400" />
          <h4 className="text-sm font-semibold text-white/90">High-Risk Modules</h4>
        </div>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-xs">
            <thead><tr className="bg-white/5 border-b border-white/10">
              <th className="text-left px-3 py-2 text-white/50 font-semibold">Module</th>
              <th className="text-left px-3 py-2 text-white/50 font-semibold">Risk Score</th>
              <th className="text-left px-3 py-2 text-white/50 font-semibold">Reason</th>
            </tr></thead>
            <tbody>
              {(data.highRisk ?? []).map((r, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-2.5 text-white/80 font-medium">{r.module}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full max-w-[80px]">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: r.score }}
                        />
                      </div>
                      <span className="text-red-400 font-bold">{r.score}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-white/50">{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Possible Defects */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bug className="w-4 h-4 text-yellow-400" />
          <h4 className="text-sm font-semibold text-white/90">Predicted Defects</h4>
        </div>
        <div className="space-y-2">
          {(data.possibleDefects ?? []).map((d, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="text-[11px] font-bold text-[#f59e0b] bg-[#f59e0b]/15 px-2 py-0.5 rounded border border-[#f59e0b]/30 shrink-0 mt-0.5">{d.id}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/75 mb-1">{d.description}</p>
                <p className="text-[11px] text-white/35">Module: {d.module}</p>
              </div>
              <RiskBadge level={d.likelihood} />
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-[#00d4aa]" />
          <h4 className="text-sm font-semibold text-white/90">Recommendations</h4>
        </div>
        <div className="space-y-2">
          {(data.recommendations ?? []).map((r, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#00d4aa]/5 border border-[#00d4aa]/15">
              <span className="text-[11px] font-bold text-[#00d4aa] bg-[#00d4aa]/15 px-2 py-0.5 rounded border border-[#00d4aa]/30 shrink-0 mt-0.5 whitespace-nowrap">{r.priority}</span>
              <p className="text-xs text-white/65">{r.action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
  const { fileName, fileContent, hasDocument, setDocument } = useDocument();
  const [riskArea, setRiskArea] = useState("all");
  const [model, setModel] = useState("combined");
  const [result, setResult] = useState<DefectPredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setResult(null);
    setError(null);
  }, [fileContent]);

  const handleFile = async (f: File) => {
    const tid = toast.loading(`Extracting text from ${f.name}…`);
    try {
      const text = await extractFileText(f);
      toast.dismiss(tid);
      setDocument(f.name, text);
      setResult(null);
      toast.success(`${f.name} uploaded and shared`);
    } catch (err) {
      toast.dismiss(tid);
      const msg = err instanceof Error ? err.message : "Failed to read file";
      toast.error("Upload failed", { description: msg });
    }
  };

  const handlePredict = async () => {
    if (!hasDocument) { toast.error("Please upload a requirement document first."); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await aiService.predict(fileContent);
      setResult(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI generation failed";
      setError(msg);
      toast.error("Prediction failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-base">Defect Prediction</h2>
          <p className="text-white/40 text-xs">Predict high-risk defect areas before testing begins using Gemini AI risk classification.</p>
        </div>
      </div>

      <div className="bg-[#0d1326] border border-white/10 rounded-xl p-4 flex flex-col gap-4">
        {/* Document */}
        {hasDocument ? (
          <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
            <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{fileName}</p>
              <p className="text-xs text-white/40">Shared document — defects predicted from this</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <button onClick={() => fileRef.current?.click()} className="text-xs text-white/30 hover:text-white/60 border border-white/10 hover:border-white/20 px-2 py-0.5 rounded transition-all">
              Change
            </button>
            <input ref={fileRef} type="file" className="hidden" accept=".txt,.md,.pdf,.doc,.docx"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }} />
          </div>
        ) : (
          <div onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) void handleFile(f); }}
            className={cn("border-2 border-dashed rounded-lg p-5 flex items-center gap-4 cursor-pointer transition-all",
              isDragging ? "border-[#f59e0b] bg-[#f59e0b]/10" : "border-white/10 hover:border-white/25 hover:bg-white/[0.02]"
            )}>
            <input ref={fileRef} type="file" className="hidden" accept=".txt,.md,.pdf,.doc,.docx"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />
            <Upload className="w-5 h-5 text-[#f59e0b]/50 shrink-0" />
            <div>
              <p className="text-sm text-white/60 font-medium">Upload requirement document</p>
              <p className="text-xs text-white/30">Defects will be predicted from your requirements</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <button onClick={() => void handlePredict()} disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-[#f59e0b]/15 border border-[#f59e0b]/40 text-[#f59e0b] hover:bg-[#f59e0b]/25 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <Zap className="w-4 h-4" />
            {loading ? "Predicting..." : "Predict Defects"}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <AIOutputPanel
          action={result || loading || error ? "predict" : null}
          loading={loading}
          error={error}
          onClear={() => { setResult(null); setError(null); }}
        >
          {result && <PredictOutput data={result} />}
        </AIOutputPanel>
      </div>
    </div>
  );
}
