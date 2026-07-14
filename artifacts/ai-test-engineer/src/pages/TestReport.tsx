import { useState, useRef, useEffect } from "react";
import { FileText, BarChart2, Upload, FileCheck, CheckCircle2, TrendingUp, AlertCircle, Info } from "lucide-react";
import AIOutputPanel from "@/components/AIOutputPanel";
import { useDocument } from "@/context/DocumentContext";
import { aiService } from "@/services/aiService";
import type { TestReportResult, ReportRecommendation } from "@/types/aiResponses";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function HealthBadge({ health }: { health: string }) {
  const s: Record<string, string> = {
    GOOD: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    FAIR: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    POOR: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase border ${s[health] ?? s.FAIR}`}>
      {health}
    </span>
  );
}

function RecommendationIcon({ type }: { type: ReportRecommendation["type"] }) {
  if (type === "warning") return <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />;
  if (type === "success") return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
  return <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />;
}

const REC_STYLES: Record<string, string> = {
  warning: "bg-yellow-500/5 border-yellow-500/20",
  success: "bg-emerald-500/5 border-emerald-500/20",
  info: "bg-blue-500/5 border-blue-500/20",
};

function ReportOutput({ data }: { data: TestReportResult }) {
  const st = data.stats ?? { testCases: 0, highRisk: 0, automationReadiness: "0%", coverage: "0%", health: "FAIR" };

  return (
    <div className="space-y-5">
      {/* Header Stats */}
      <div className="p-4 rounded-lg bg-[#10b981]/5 border border-[#10b981]/20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Overall Health</p>
          <HealthBadge health={st.health} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Test Cases", value: String(st.testCases), color: "#10b981" },
            { label: "High Risk", value: String(st.highRisk), color: "#ef4444" },
            { label: "Automation", value: st.automationReadiness, color: "#a855f7" },
            { label: "Coverage", value: st.coverage, color: "#3b82f6" },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <p className="text-xl font-bold" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[11px] text-white/40">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage Breakdown */}
      {(data.coverage ?? []).length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-4 h-4 text-[#10b981]" />
            <h4 className="text-sm font-semibold text-white/90">Coverage Breakdown</h4>
          </div>
          <div className="space-y-2.5">
            {(data.coverage ?? []).map((c, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-white/70">{c.area}</span>
                  <span className="text-xs font-bold" style={{
                    color: c.pct >= 80 ? "#10b981" : c.pct >= 60 ? "#f59e0b" : "#ef4444"
                  }}>{c.pct}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${c.pct}%`,
                      background: c.pct >= 80 ? "#10b981" : c.pct >= 60 ? "#f59e0b" : "#ef4444",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {(data.recommendations ?? []).length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-[#00d4aa]" />
            <h4 className="text-sm font-semibold text-white/90">AI Recommendations</h4>
          </div>
          <div className="space-y-2">
            {(data.recommendations ?? []).map((r, i) => (
              <div key={i} className={cn("flex items-start gap-3 p-3 rounded-lg border", REC_STYLES[r.type] ?? REC_STYLES.info)}>
                <RecommendationIcon type={r.type} />
                <p className="text-xs text-white/65 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const SECTIONS = [
  { id: "summary", label: "Executive Summary" },
  { id: "testcases", label: "Test Case Results" },
  { id: "coverage", label: "Coverage Breakdown" },
  { id: "defects", label: "Defect Analysis" },
  { id: "automation", label: "Automation Readiness" },
  { id: "recommendation", label: "AI Recommendation" },
];

const FORMATS = ["Detailed", "Executive (1-page)", "Technical"];
const SPRINT_OPTIONS = ["Sprint 1", "Sprint 2", "Sprint 3", "Release 1.0", "Current Sprint"];

export default function TestReport() {
  const { fileName, fileContent, hasDocument, setDocument } = useDocument();
  const [sections, setSections] = useState<Record<string, boolean>>(
    Object.fromEntries(SECTIONS.map((s) => [s.id, true]))
  );
  const [reportFormat, setReportFormat] = useState("Detailed");
  const [sprint, setSprint] = useState("Current Sprint");
  const [projectName, setProjectName] = useState("");
  const [result, setResult] = useState<TestReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
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
      toast.success(`${f.name} uploaded and shared`);
    } catch {
      toast.error("Failed to read file. Try a .txt file.");
    }
  };

  const toggleSection = (id: string) => setSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleGenerate = async () => {
    if (!hasDocument) { toast.error("Please upload a requirement document first."); return; }
    const selected = Object.values(sections).filter(Boolean).length;
    if (selected === 0) { toast.error("Select at least one report section."); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await aiService.report(fileContent);
      setResult(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI generation failed";
      setError(msg);
      toast.error("Report generation failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 text-[#10b981]" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-base">Test Report Generator</h2>
          <p className="text-white/40 text-xs">Generate an AI-powered test report with coverage metrics, defect analysis, and recommendations.</p>
        </div>
      </div>

      <div className="bg-[#0d1326] border border-white/10 rounded-xl p-4 flex flex-col gap-4">
        {/* Document */}
        {hasDocument ? (
          <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
            <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{fileName}</p>
              <p className="text-xs text-white/40">Report will be generated based on this document</p>
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
              isDragging ? "border-[#10b981] bg-[#10b981]/10" : "border-white/10 hover:border-white/25 hover:bg-white/[0.02]"
            )}>
            <input ref={fileRef} type="file" className="hidden" accept=".txt,.md,.pdf,.doc,.docx"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />
            <Upload className="w-5 h-5 text-[#10b981]/50 shrink-0" />
            <div>
              <p className="text-sm text-white/60 font-medium">Upload requirement document</p>
              <p className="text-xs text-white/30">Report will be generated from your requirements</p>
            </div>
          </div>
        )}

        {/* Project + Sprint */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Project / Module Name</p>
            <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. E-Commerce Checkout v3.1"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#10b981]/40 transition-all" />
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Sprint / Release</p>
            <div className="flex flex-wrap gap-1.5">
              {SPRINT_OPTIONS.map((s) => (
                <button key={s} onClick={() => setSprint(s)}
                  className={cn("px-2.5 py-1 rounded text-xs border transition-all",
                    sprint === s ? "bg-[#10b981]/15 border-[#10b981]/40 text-[#10b981]" : "border-white/10 text-white/40 hover:text-white/60"
                  )}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sections */}
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Include Sections</p>
            <div className="flex flex-col gap-1.5">
              {SECTIONS.map((s) => (
                <button key={s.id} onClick={() => toggleSection(s.id)}
                  className={cn("flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all",
                    sections[s.id] ? "bg-[#10b981]/10 border-[#10b981]/30" : "border-white/10 hover:border-white/20"
                  )}>
                  <div className={cn("w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0",
                    sections[s.id] ? "bg-[#10b981] border-[#10b981]" : "border-white/30"
                  )}>
                    {sections[s.id] && <div className="w-1.5 h-1 border-b-2 border-r-2 border-white rotate-45 mb-0.5" />}
                  </div>
                  <span className={cn("text-xs", sections[s.id] ? "text-white/80" : "text-white/40")}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Report Format</p>
            <div className="flex flex-col gap-1.5">
              {FORMATS.map((f) => (
                <button key={f} onClick={() => setReportFormat(f)}
                  className={cn("flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all",
                    reportFormat === f ? "bg-[#10b981]/10 border-[#10b981]/30" : "border-white/10 hover:border-white/20"
                  )}>
                  <div className={cn("w-2 h-2 rounded-full shrink-0", reportFormat === f ? "bg-[#10b981]" : "bg-white/20")} />
                  <span className={cn("text-xs", reportFormat === f ? "text-[#10b981]" : "text-white/50")}>{f}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 className="w-3.5 h-3.5 text-[#10b981]" />
                <span className="text-xs text-white/50 font-medium">Sections Preview</span>
              </div>
              <div className="space-y-1">
                {Object.entries(sections).filter(([, v]) => v).map(([id]) => {
                  const s = SECTIONS.find((sec) => sec.id === id);
                  return s ? (
                    <p key={id} className="text-[11px] text-white/30 flex items-center gap-1.5">
                      <span className="text-[#10b981]">✓</span>{s.label}
                    </p>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={() => void handleGenerate()} disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-[#10b981]/15 border border-[#10b981]/40 text-[#10b981] hover:bg-[#10b981]/25 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <FileText className="w-4 h-4" />
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[260px]">
        <AIOutputPanel
          action={result || loading || error ? "report" : null}
          loading={loading}
          error={error}
          onClear={() => { setResult(null); setError(null); }}
        >
          {result && <ReportOutput data={result} />}
        </AIOutputPanel>
      </div>
    </div>
  );
}
