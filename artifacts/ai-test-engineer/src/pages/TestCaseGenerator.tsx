import { useState, useRef, useEffect } from "react";
import { ListChecks, Upload, FileCheck, CheckCircle2 } from "lucide-react";
import AIOutputPanel from "@/components/AIOutputPanel";
import { useDocument } from "@/context/DocumentContext";
import { aiService } from "@/services/aiService";
import { extractFileText } from "@/services/extractService";
import type { TestCasesResult, TestCase } from "@/types/aiResponses";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PRIORITY_COLORS: Record<string, string> = {
  P1: "bg-red-500/20 text-red-400 border-red-500/30",
  P2: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  P3: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const TYPE_COLORS: Record<string, string> = {
  Positive: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Negative: "bg-red-500/15 text-red-400 border-red-500/30",
  Boundary: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Edge Case": "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

function TestCasesOutput({ data }: { data: TestCasesResult }) {
  const cases = data.testCases ?? [];
  const byType = cases.reduce<Record<string, number>>((acc, tc) => {
    const t = tc.type ?? "Other";
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="p-3 rounded-lg bg-[#a855f7]/10 border border-[#a855f7]/20 text-center">
          <p className="text-2xl font-bold text-[#a855f7]">{cases.length}</p>
          <p className="text-xs text-white/50 mt-0.5">Total Cases</p>
        </div>
        {Object.entries(byType).slice(0, 3).map(([type, count]) => (
          <div key={type} className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
            <p className="text-2xl font-bold text-white/80">{count}</p>
            <p className="text-xs text-white/50 mt-0.5">{type}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="text-left px-3 py-2 text-white/50 font-semibold w-20">ID</th>
              <th className="text-left px-3 py-2 text-white/50 font-semibold">Scenario</th>
              <th className="text-left px-3 py-2 text-white/50 font-semibold w-24">Type</th>
              <th className="text-left px-3 py-2 text-white/50 font-semibold w-16">Priority</th>
              <th className="text-left px-3 py-2 text-white/50 font-semibold">Expected Result</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((tc: TestCase, i: number) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] group">
                <td className="px-3 py-2.5 font-mono text-[#a855f7]/80 font-semibold">{tc.id}</td>
                <td className="px-3 py-2.5">
                  <p className="text-white/80 font-medium mb-1">{tc.scenario}</p>
                  {tc.preconditions && (
                    <p className="text-white/40 text-[11px]">Pre: {tc.preconditions}</p>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <span className={cn("px-2 py-0.5 rounded text-[11px] font-semibold border",
                    TYPE_COLORS[tc.type] ?? "bg-white/10 text-white/50 border-white/20"
                  )}>{tc.type}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={cn("px-2 py-0.5 rounded text-[11px] font-bold border",
                    PRIORITY_COLORS[tc.priority] ?? "bg-white/10 text-white/50 border-white/20"
                  )}>{tc.priority}</span>
                </td>
                <td className="px-3 py-2.5 text-white/55">{tc.expected}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TEST_TYPES = ["Functional", "Regression", "Smoke", "Integration", "Negative", "All"];
const PRIORITIES = ["P1 — High", "P2 — Medium", "P3 — Low", "All Priorities"];
const FORMATS = ["Table View", "Step-by-Step", "Gherkin (BDD)"];

export default function TestCaseGenerator() {
  const { fileName, fileContent, hasDocument, setDocument } = useDocument();
  const [testType, setTestType] = useState("All");
  const [priority, setPriority] = useState("All Priorities");
  const [format, setFormat] = useState("Table View");
  const [result, setResult] = useState<TestCasesResult | null>(null);
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

  const handleGenerate = async () => {
    if (!hasDocument) { toast.error("Please upload a requirement document first."); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await aiService.testCases(fileContent);
      setResult(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI generation failed";
      setError(msg);
      toast.error("Generation failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#a855f7]/15 border border-[#a855f7]/30 flex items-center justify-center shrink-0">
          <ListChecks className="w-4 h-4 text-[#a855f7]" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-base">Test Case Generator</h2>
          <p className="text-white/40 text-xs">Generate structured test cases from your requirements using Gemini AI.</p>
        </div>
      </div>

      <div className="bg-[#0d1326] border border-white/10 rounded-xl p-4 flex flex-col gap-4">
        {/* Document */}
        {hasDocument ? (
          <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
            <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{fileName}</p>
              <p className="text-xs text-white/40">Shared document</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <button onClick={() => fileRef.current?.click()} className="text-xs text-white/30 hover:text-white/60 transition-colors border border-white/10 hover:border-white/20 px-2 py-0.5 rounded">
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
              isDragging ? "border-[#a855f7] bg-[#a855f7]/10" : "border-white/10 hover:border-white/25 hover:bg-white/[0.02]"
            )}>
            <input ref={fileRef} type="file" className="hidden" accept=".txt,.md,.pdf,.doc,.docx"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />
            <Upload className="w-5 h-5 text-[#a855f7]/50 shrink-0" />
            <div>
              <p className="text-sm text-white/60 font-medium">Upload requirement document</p>
              <p className="text-xs text-white/30">TXT, PDF, DOCX · shared with all pages</p>
            </div>
          </div>
        )}

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Test Type</p>
            <div className="flex flex-wrap gap-1.5">
              {TEST_TYPES.map((t) => (
                <button key={t} onClick={() => setTestType(t)}
                  className={cn("px-2.5 py-1 rounded text-xs border transition-all",
                    testType === t ? "bg-[#a855f7]/15 border-[#a855f7]/40 text-[#a855f7]" : "border-white/10 text-white/40 hover:text-white/60"
                  )}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Priority</p>
            <div className="flex flex-col gap-1">
              {PRIORITIES.map((p) => (
                <button key={p} onClick={() => setPriority(p)}
                  className={cn("px-2.5 py-1 rounded text-xs border transition-all text-left",
                    priority === p ? "bg-[#a855f7]/15 border-[#a855f7]/40 text-[#a855f7]" : "border-white/10 text-white/40 hover:text-white/60"
                  )}>{p}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Output Format</p>
            <div className="flex flex-col gap-1">
              {FORMATS.map((f) => (
                <button key={f} onClick={() => setFormat(f)}
                  className={cn("px-2.5 py-1 rounded text-xs border transition-all text-left",
                    format === f ? "bg-[#a855f7]/15 border-[#a855f7]/40 text-[#a855f7]" : "border-white/10 text-white/40 hover:text-white/60"
                  )}>{f}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={() => void handleGenerate()} disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-[#a855f7]/15 border border-[#a855f7]/40 text-[#a855f7] hover:bg-[#a855f7]/25 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <ListChecks className="w-4 h-4" />
            {loading ? "Generating..." : "Generate Test Cases"}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <AIOutputPanel
          action={result || loading || error ? "testcases" : null}
          loading={loading}
          error={error}
          onClear={() => { setResult(null); setError(null); }}
        >
          {result && <TestCasesOutput data={result} />}
        </AIOutputPanel>
      </div>
    </div>
  );
}
