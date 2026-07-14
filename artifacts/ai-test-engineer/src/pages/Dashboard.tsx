import { useRef } from "react";
import { useLocation } from "wouter";
import {
  Upload, Brain, ListChecks, Database, AlertTriangle,
  GitMerge, FileText, CheckCircle2, FileCheck, HardDrive,
  ArrowRight,
} from "lucide-react";
import { useDocument } from "@/context/DocumentContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NAV_CARDS = [
  {
    id: "analyze",
    label: "Requirement Analysis",
    desc: "Extract actors, functional requirements, business rules, and risks",
    icon: Brain,
    color: "#00d4aa",
    path: "/analysis",
  },
  {
    id: "testcases",
    label: "Test Case Generator",
    desc: "Generate positive, negative, boundary, and edge case test cases",
    icon: ListChecks,
    color: "#a855f7",
    path: "/test-cases",
  },
  {
    id: "testdata",
    label: "Test Data Generator",
    desc: "Generate valid, invalid, and boundary value test datasets",
    icon: Database,
    color: "#3b82f6",
    path: "/test-data",
  },
  {
    id: "predict",
    label: "Defect Prediction",
    desc: "Predict high-risk modules and probable defects before testing",
    icon: AlertTriangle,
    color: "#f59e0b",
    path: "/prediction",
  },
  {
    id: "duplicates",
    label: "Duplicate Detection",
    desc: "Find duplicate defects using Jaccard similarity analysis",
    icon: GitMerge,
    color: "#ec4899",
    path: "/duplicates",
  },
  {
    id: "report",
    label: "Test Report",
    desc: "Generate AI-powered coverage metrics and quality reports",
    icon: FileText,
    color: "#10b981",
    path: "/report",
  },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Dashboard() {
  const { fileName, hasDocument, setDocument } = useDocument();
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    try {
      const text = await f.text();
      setDocument(f.name, text);
      toast.success("Document uploaded", {
        description: `${f.name} is ready for analysis on all pages.`,
      });
    } catch {
      toast.error("Failed to read file. Try a .txt file or paste text in Requirement Analysis.");
    }
  };

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto p-4 md:p-6 gap-5">

      {/* Upload Zone */}
      <div
        className={cn(
          "rounded-xl border transition-all duration-300 cursor-pointer",
          hasDocument
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-white/10 bg-[#0d1326] hover:border-white/20"
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files[0];
          if (f) void handleFile(f);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".txt,.md,.pdf,.doc,.docx"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />

        {hasDocument ? (
          <div className="p-5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <FileCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate mb-1">{fileName}</p>
              <p className="text-xs text-white/40">Active on all pages — click to replace</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">Ready for Analysis</span>
            </div>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center mb-4">
              <Upload className="w-7 h-7 text-[#00d4aa]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Upload Requirement Document</h3>
            <p className="text-white/40 text-sm">Drag & drop or click — TXT, PDF, DOCX supported</p>
            <p className="text-white/25 text-xs mt-1">All modules below will use this document</p>
          </div>
        )}
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1">
        {NAV_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => navigate(card.path)}
              className="group flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-[#0d1326] hover:border-white/20 hover:bg-[#0d1326] text-left transition-all duration-200 active:scale-[0.98]"
              style={{
                ["--card-color" as string]: card.color,
              }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${card.color}18`, border: `1px solid ${card.color}40` }}
                >
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <ArrowRight
                  className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors mt-0.5"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{card.label}</p>
                <p className="text-xs text-white/35 leading-relaxed">{card.desc}</p>
              </div>
              {hasDocument && (
                <div
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full w-fit"
                  style={{ color: card.color, background: `${card.color}15`, border: `1px solid ${card.color}30` }}
                >
                  Document Ready
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
