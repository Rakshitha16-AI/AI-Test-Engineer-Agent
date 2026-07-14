import { useState, useRef, useEffect } from "react";
import { Database, Layers, Upload, FileCheck, CheckCircle2 } from "lucide-react";
import AIOutputPanel from "@/components/AIOutputPanel";
import { useDocument } from "@/context/DocumentContext";
import { aiService } from "@/services/aiService";
import { extractFileText } from "@/services/extractService";
import type { TestDataResult } from "@/types/aiResponses";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function TestDataOutput({ data }: { data: TestDataResult }) {
  const [tab, setTab] = useState<"valid" | "invalid" | "boundary">("valid");

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
          <p className="text-2xl font-bold text-emerald-400">{(data.valid ?? []).length}</p>
          <p className="text-xs text-white/50 mt-0.5">Valid Records</p>
        </div>
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
          <p className="text-2xl font-bold text-red-400">{(data.invalid ?? []).length}</p>
          <p className="text-xs text-white/50 mt-0.5">Invalid Records</p>
        </div>
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
          <p className="text-2xl font-bold text-blue-400">{(data.boundary ?? []).length}</p>
          <p className="text-xs text-white/50 mt-0.5">Boundary Values</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(["valid", "invalid", "boundary"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize",
              tab === t
                ? t === "valid" ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                  : t === "invalid" ? "bg-red-500/15 border-red-500/40 text-red-400"
                  : "bg-blue-500/15 border-blue-500/40 text-blue-400"
                : "border-white/10 text-white/40 hover:text-white/60"
            )}>
            {t === "valid" ? "Valid Data" : t === "invalid" ? "Invalid Data" : "Boundary Values"}
          </button>
        ))}
      </div>

      {/* Tables */}
      {tab === "valid" && (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-xs">
            <thead><tr className="bg-white/5 border-b border-white/10">
              <th className="text-left px-3 py-2 text-white/50 font-semibold">Field</th>
              <th className="text-left px-3 py-2 text-white/50 font-semibold">Value</th>
              <th className="text-left px-3 py-2 text-white/50 font-semibold">Description</th>
            </tr></thead>
            <tbody>
              {(data.valid ?? []).map((r, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-2.5 text-white/80 font-medium">{r.field}</td>
                  <td className="px-3 py-2.5 font-mono text-emerald-400 bg-emerald-500/5">{r.value}</td>
                  <td className="px-3 py-2.5 text-white/50">{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "invalid" && (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-xs">
            <thead><tr className="bg-white/5 border-b border-white/10">
              <th className="text-left px-3 py-2 text-white/50 font-semibold">Field</th>
              <th className="text-left px-3 py-2 text-white/50 font-semibold">Invalid Value</th>
              <th className="text-left px-3 py-2 text-white/50 font-semibold">Expected Error</th>
            </tr></thead>
            <tbody>
              {(data.invalid ?? []).map((r, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-2.5 text-white/80 font-medium">{r.field}</td>
                  <td className="px-3 py-2.5 font-mono text-red-400 bg-red-500/5">{r.value}</td>
                  <td className="px-3 py-2.5 text-white/50">{r.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "boundary" && (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-xs">
            <thead><tr className="bg-white/5 border-b border-white/10">
              <th className="text-left px-3 py-2 text-white/50 font-semibold">Parameter</th>
              <th className="text-left px-3 py-2 text-white/50 font-semibold">Min Value</th>
              <th className="text-left px-3 py-2 text-white/50 font-semibold">Max Value</th>
              <th className="text-left px-3 py-2 text-white/50 font-semibold">Notes</th>
            </tr></thead>
            <tbody>
              {(data.boundary ?? []).map((r, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-2.5 text-white/80 font-medium">{r.parameter}</td>
                  <td className="px-3 py-2.5 font-mono text-blue-400">{r.min}</td>
                  <td className="px-3 py-2.5 font-mono text-blue-400">{r.max}</td>
                  <td className="px-3 py-2.5 text-white/50">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const DATA_TYPES = ["Valid Data", "Invalid Data", "Boundary Values", "All Three"];
const FORMATS = ["Table", "JSON", "CSV"];

export default function TestDataGenerator() {
  const { fileName, fileContent, hasDocument, setDocument } = useDocument();
  const [dataType, setDataType] = useState("All Three");
  const [format, setFormat] = useState("Table");
  const [result, setResult] = useState<TestDataResult | null>(null);
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
      const data = await aiService.testData(fileContent);
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
        <div className="w-9 h-9 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center shrink-0">
          <Database className="w-4 h-4 text-[#3b82f6]" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-base">Test Data Generator</h2>
          <p className="text-white/40 text-xs">Generate valid, invalid, and boundary test data based on your uploaded requirement document.</p>
        </div>
      </div>

      <div className="bg-[#0d1326] border border-white/10 rounded-xl p-4 flex flex-col gap-4">
        {/* Document */}
        {hasDocument ? (
          <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
            <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{fileName}</p>
              <p className="text-xs text-white/40">Shared document — test data will be based on this</p>
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
              isDragging ? "border-[#3b82f6] bg-[#3b82f6]/10" : "border-white/10 hover:border-white/25 hover:bg-white/[0.02]"
            )}>
            <input ref={fileRef} type="file" className="hidden" accept=".txt,.md,.pdf,.doc,.docx"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />
            <Upload className="w-5 h-5 text-[#3b82f6]/50 shrink-0" />
            <div>
              <p className="text-sm text-white/60 font-medium">Upload requirement document</p>
              <p className="text-xs text-white/30">Test data will be generated from your requirements</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Data Type</p>
            <div className="flex flex-col gap-1">
              {DATA_TYPES.map((t) => (
                <button key={t} onClick={() => setDataType(t)}
                  className={cn("px-3 py-1.5 rounded text-xs border transition-all text-left",
                    dataType === t ? "bg-[#3b82f6]/15 border-[#3b82f6]/40 text-[#3b82f6]" : "border-white/10 text-white/40 hover:text-white/60"
                  )}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Output Format</p>
            <div className="flex flex-col gap-1">
              {FORMATS.map((f) => (
                <button key={f} onClick={() => setFormat(f)}
                  className={cn("px-3 py-1.5 rounded text-xs border transition-all text-left",
                    format === f ? "bg-[#3b82f6]/15 border-[#3b82f6]/40 text-[#3b82f6]" : "border-white/10 text-white/40 hover:text-white/60"
                  )}>{f}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={() => void handleGenerate()} disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-[#3b82f6]/15 border border-[#3b82f6]/40 text-[#3b82f6] hover:bg-[#3b82f6]/25 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <Layers className="w-4 h-4" />
            {loading ? "Generating..." : "Generate Test Data"}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <AIOutputPanel
          action={result || loading || error ? "testdata" : null}
          loading={loading}
          error={error}
          onClear={() => { setResult(null); setError(null); }}
        >
          {result && <TestDataOutput data={result} />}
        </AIOutputPanel>
      </div>
    </div>
  );
}
