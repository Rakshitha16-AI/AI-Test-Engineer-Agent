import { useState, useRef } from "react";
import { ListChecks, Upload, FileCheck, X } from "lucide-react";
import AIOutputPanel from "@/components/AIOutputPanel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

const TEST_TYPES = ["Functional", "Regression", "Smoke", "Integration", "Negative", "All"];
const PRIORITIES = ["P1 — High", "P2 — Medium", "P3 — Low", "All Priorities"];
const FORMATS = ["Table View", "Step-by-Step", "Gherkin (BDD)"];

export default function TestCaseGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [testType, setTestType] = useState("All");
  const [priority, setPriority] = useState("All Priorities");
  const [format, setFormat] = useState("Table View");
  const [action, setAction] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => { setFile(f); setAction(null); toast.success(`${f.name} loaded`); };

  const handleGenerate = () => {
    if (!file) { toast.error("Upload a requirements document first."); return; }
    setAction(null);
    setTimeout(() => setAction("testcases"), 50);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#a855f7]/15 border border-[#a855f7]/30 flex items-center justify-center shrink-0">
          <ListChecks className="w-4 h-4 text-[#a855f7]" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-base">Test Case Generator</h2>
          <p className="text-white/40 text-xs">Generate structured test cases from your requirements using AI-powered analysis.</p>
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
              isDragging ? "border-[#a855f7] bg-[#a855f7]/10" : "border-white/10 hover:border-white/25 hover:bg-white/[0.02]"
            )}>
            <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            <Upload className="w-5 h-5 text-[#a855f7]/50 shrink-0" />
            <div>
              <p className="text-sm text-white/60 font-medium">Upload requirement document</p>
              <p className="text-xs text-white/30">PDF, DOCX, TXT</p>
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
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Priority Filter</p>
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
          <button onClick={handleGenerate}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-[#a855f7]/15 border border-[#a855f7]/40 text-[#a855f7] hover:bg-[#a855f7]/25 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all">
            <ListChecks className="w-4 h-4" /> Generate Test Cases
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <AIOutputPanel action={action} fileName={file?.name ?? "requirements.txt"} onClear={() => setAction(null)} />
      </div>
    </div>
  );
}
