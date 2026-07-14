import { useState, useRef, useEffect } from "react";
import {
  Brain, Upload, FileCheck, X, ChevronRight,
  Users, List, Shield, BookOpen, AlertTriangle,
} from "lucide-react";
import AIOutputPanel from "@/components/AIOutputPanel";
import { useDocument } from "@/context/DocumentContext";
import { aiService } from "@/services/aiService";
import type { AnalysisResult, Risk } from "@/types/aiResponses";
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

function Section({ icon: Icon, title, color, children }: {
  icon: React.ElementType; title: string; color: string; children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" style={{ color }} />
        <h4 className="text-sm font-semibold text-white/90">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function AnalysisOutput({ data }: { data: AnalysisResult }) {
  return (
    <div className="space-y-1">
      {/* Summary */}
      <div className="p-4 rounded-lg bg-[#00d4aa]/5 border border-[#00d4aa]/20 mb-5">
        <p className="text-xs text-[#00d4aa] font-semibold uppercase tracking-wider mb-2">Summary</p>
        <p className="text-sm text-white/80 leading-relaxed">{data.summary}</p>
      </div>

      {/* Actors */}
      <Section icon={Users} title="Actors & Roles" color="#a855f7">
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="text-left px-3 py-2 text-white/50 font-semibold">Name</th>
                <th className="text-left px-3 py-2 text-white/50 font-semibold">Type</th>
                <th className="text-left px-3 py-2 text-white/50 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {(data.actors ?? []).map((a, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-2 text-white/80 font-medium">{a.name}</td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/30">{a.type}</span>
                  </td>
                  <td className="px-3 py-2 text-white/50">{a.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Functional Requirements */}
      <Section icon={List} title="Functional Requirements" color="#3b82f6">
        <div className="space-y-1.5">
          {(data.functionalRequirements ?? []).map((r) => (
            <div key={r.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="text-[11px] font-bold text-[#3b82f6] bg-[#3b82f6]/15 px-2 py-0.5 rounded border border-[#3b82f6]/30 shrink-0 mt-0.5">{r.id}</span>
              <p className="text-xs text-white/70 leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Non-functional */}
      <Section icon={Shield} title="Non-Functional Requirements" color="#f59e0b">
        <div className="space-y-1.5">
          {(data.nonFunctionalRequirements ?? []).map((r) => (
            <div key={r.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
              <span className="text-[11px] font-bold text-[#f59e0b] bg-[#f59e0b]/15 px-2 py-0.5 rounded border border-[#f59e0b]/30 shrink-0 mt-0.5">{r.id}</span>
              <p className="text-xs text-white/70 leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Business Rules + Assumptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <Section icon={BookOpen} title="Business Rules" color="#00d4aa">
          <ul className="space-y-1.5">
            {(data.businessRules ?? []).map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                <ChevronRight className="w-3 h-3 text-[#00d4aa] shrink-0 mt-0.5" />
                {rule}
              </li>
            ))}
          </ul>
        </Section>
        <Section icon={BookOpen} title="Assumptions" color="#ec4899">
          <ul className="space-y-1.5">
            {(data.assumptions ?? []).map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                <ChevronRight className="w-3 h-3 text-[#ec4899] shrink-0 mt-0.5" />
                {a}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {/* Risks */}
      <Section icon={AlertTriangle} title="Risk Analysis" color="#ef4444">
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="text-left px-3 py-2 text-white/50 font-semibold">Risk</th>
                <th className="text-left px-3 py-2 text-white/50 font-semibold">Likelihood</th>
                <th className="text-left px-3 py-2 text-white/50 font-semibold">Impact</th>
                <th className="text-left px-3 py-2 text-white/50 font-semibold">Mitigation</th>
              </tr>
            </thead>
            <tbody>
              {(data.risks ?? []).map((r: Risk, i: number) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-2 text-white/70">{r.risk}</td>
                  <td className="px-3 py-2"><RiskBadge level={r.likelihood} /></td>
                  <td className="px-3 py-2 text-white/60">{r.impact}</td>
                  <td className="px-3 py-2 text-white/50">{r.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

const FOCUS_OPTIONS = [
  { id: "all", label: "Full Analysis" },
  { id: "actors", label: "Actors & Roles" },
  { id: "functional", label: "Functional Reqs" },
  { id: "risks", label: "Risks Only" },
];

export default function RequirementAnalysis() {
  const { fileName, fileContent, hasDocument, setDocument } = useDocument();
  const [focus, setFocus] = useState("all");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [pastedText, setPastedText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setResult(null);
    setError(null);
  }, [fileContent]);

  const handleFile = async (f: File) => {
    try {
      const text = await f.text();
      setDocument(f.name, text);
      setResult(null);
      toast.success(`${f.name} uploaded and ready`);
    } catch {
      toast.error("Failed to read file. Try a .txt file.");
    }
  };

  const handlePasteApply = () => {
    if (!pastedText.trim()) { toast.error("Paste some requirement text first."); return; }
    setDocument("pasted-requirements.txt", pastedText.trim());
    setResult(null);
    toast.success("Requirement text saved");
  };

  const handleAnalyze = async () => {
    if (!hasDocument) {
      if (mode === "paste" && !pastedText.trim()) {
        toast.error("Paste your requirement text first.");
        return;
      }
      if (mode === "paste") { handlePasteApply(); return; }
      toast.error("Please upload a requirement document first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await aiService.analyze(fileContent);
      setResult(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI generation failed";
      setError(msg);
      toast.error("Analysis failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#00d4aa]/15 border border-[#00d4aa]/30 flex items-center justify-center shrink-0">
          <Brain className="w-4 h-4 text-[#00d4aa]" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-base">Requirement Analysis</h2>
          <p className="text-white/40 text-xs">Extract actors, functional requirements, business rules, and risks from your document.</p>
        </div>
      </div>

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
          hasDocument ? (
            <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
              <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{fileName}</p>
                <p className="text-xs text-white/40">Shared across all pages</p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full bg-emerald-500/10">Ready</span>
              <button onClick={() => fileRef.current?.click()} className="text-white/30 hover:text-white/70 transition-colors">
                <Upload className="w-4 h-4" />
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
                isDragging ? "border-[#00d4aa] bg-[#00d4aa]/10" : "border-white/10 hover:border-white/25 hover:bg-white/[0.02]"
              )}>
              <input ref={fileRef} type="file" className="hidden" accept=".txt,.md,.pdf,.doc,.docx"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />
              <Upload className="w-5 h-5 text-[#00d4aa]/50 shrink-0" />
              <div>
                <p className="text-sm text-white/60 font-medium">Drop your requirement document here</p>
                <p className="text-xs text-white/30">TXT files work best · PDF/DOCX: paste text instead</p>
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col gap-2">
            <textarea value={pastedText} onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your requirements text here..."
              className="w-full h-28 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#00d4aa]/40 resize-none transition-all" />
            <div className="flex justify-end">
              <button onClick={handlePasteApply}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-all">
                Save as document
              </button>
            </div>
          </div>
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
          <button onClick={() => void handleAnalyze()} disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-[#00d4aa]/15 border border-[#00d4aa]/40 text-[#00d4aa] hover:bg-[#00d4aa]/25 hover:shadow-[0_0_20px_rgba(0,212,170,0.2)] transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
            <Brain className="w-4 h-4" />
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <AIOutputPanel
          action={result || loading || error ? "analyze" : null}
          loading={loading}
          error={error}
          onClear={() => { setResult(null); setError(null); }}
        >
          {result && <AnalysisOutput data={result} />}
        </AIOutputPanel>
      </div>
    </div>
  );
}
