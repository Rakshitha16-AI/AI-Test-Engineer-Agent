import { useState, useRef } from "react";
import {
  Upload,
  Brain,
  ListChecks,
  Database,
  AlertTriangle,
  GitMerge,
  FileText,
  CheckCircle2,
  FileCheck,
  HardDrive,
  Zap,
} from "lucide-react";
import AIOutputPanel from "@/components/AIOutputPanel";
import DuplicateDetector from "@/components/DuplicateDetector";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ACTION_BUTTONS = [
  {
    id: "analyze",
    label: "Analyze Requirement",
    icon: Brain,
    colorClass:
      "text-[#00d4aa] border-[#00d4aa]/30 bg-[#00d4aa]/5 hover:bg-[#00d4aa]/10 hover:border-[#00d4aa]/60 hover:shadow-[0_0_24px_rgba(0,212,170,0.25)]",
    iconBg: "bg-[#00d4aa]/15",
    action: "analyze",
  },
  {
    id: "testcases",
    label: "Generate Test Cases",
    icon: ListChecks,
    colorClass:
      "text-[#a855f7] border-[#a855f7]/30 bg-[#a855f7]/5 hover:bg-[#a855f7]/10 hover:border-[#a855f7]/60 hover:shadow-[0_0_24px_rgba(168,85,247,0.25)]",
    iconBg: "bg-[#a855f7]/15",
    action: "testcases",
  },
  {
    id: "testdata",
    label: "Generate Test Data",
    icon: Database,
    colorClass:
      "text-[#3b82f6] border-[#3b82f6]/30 bg-[#3b82f6]/5 hover:bg-[#3b82f6]/10 hover:border-[#3b82f6]/60 hover:shadow-[0_0_24px_rgba(59,130,246,0.25)]",
    iconBg: "bg-[#3b82f6]/15",
    action: "testdata",
  },
  {
    id: "predict",
    label: "Predict Defects",
    icon: AlertTriangle,
    colorClass:
      "text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/5 hover:bg-[#f59e0b]/10 hover:border-[#f59e0b]/60 hover:shadow-[0_0_24px_rgba(245,158,11,0.25)]",
    iconBg: "bg-[#f59e0b]/15",
    action: "predict",
  },
  {
    id: "duplicates",
    label: "Find Duplicate Defects",
    icon: GitMerge,
    colorClass:
      "text-[#ec4899] border-[#ec4899]/30 bg-[#ec4899]/5 hover:bg-[#ec4899]/10 hover:border-[#ec4899]/60 hover:shadow-[0_0_24px_rgba(236,72,153,0.25)]",
    iconBg: "bg-[#ec4899]/15",
    action: "duplicates",
  },
  {
    id: "report",
    label: "Generate Report",
    icon: FileText,
    colorClass:
      "text-[#10b981] border-[#10b981]/30 bg-[#10b981]/5 hover:bg-[#10b981]/10 hover:border-[#10b981]/60 hover:shadow-[0_0_24px_rgba(16,185,129,0.25)]",
    iconBg: "bg-[#10b981]/15",
    action: "report",
  },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selected: File) => {
    setFile(selected);
    setCurrentAction(null);
    toast.success("Document uploaded successfully", {
      description: `${selected.name} is ready for analysis.`,
      duration: 3000,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  };

  const triggerAction = (actionId: string) => {
    // Duplicate detector has its own file upload — no requirement doc needed
    if (actionId === "duplicates") {
      setCurrentAction("duplicates");
      return;
    }
    if (!file) {
      setCurrentAction("no_file");
      toast.error("No document uploaded", {
        description: "Please upload a requirements document first.",
        duration: 3000,
      });
      return;
    }
    setCurrentAction(null);
    setTimeout(() => setCurrentAction(actionId), 50);
  };

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto p-4 md:p-6 gap-5">

      {/* Upload Area */}
      <div
        className={cn(
          "relative rounded-xl border transition-all duration-300 cursor-pointer",
          isDragging
            ? "border-[#00d4aa] bg-[#00d4aa]/10 shadow-[0_0_32px_rgba(0,212,170,0.2)]"
            : file
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-white/10 bg-[#0d1326] hover:border-white/20 hover:bg-[#0d1326]"
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        data-testid="upload-zone"
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt"
          data-testid="input-file-upload"
        />

        {file ? (
          /* File uploaded state */
          <div className="p-5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <FileCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate mb-1">{file.name}</p>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-white/50">
                  <HardDrive className="w-3 h-3" />
                  {formatBytes(file.size)}
                </span>
                <span className="flex items-center gap-1.5 text-white/50">
                  <FileText className="w-3 h-3" />
                  {file.name.split(".").pop()?.toUpperCase() ?? "FILE"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">Ready for Analysis</span>
            </div>
            <p className="text-xs text-white/30 shrink-0 hidden md:block">Click to replace</p>
          </div>
        ) : (
          /* Empty upload state */
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center mb-4 border transition-all duration-300",
              isDragging
                ? "bg-[#00d4aa]/20 border-[#00d4aa]/60 scale-110"
                : "bg-[#00d4aa]/10 border-[#00d4aa]/30"
            )}>
              <Upload className="w-7 h-7 text-[#00d4aa]" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Upload Requirement Document</h3>
            <p className="text-white/40 text-sm">Drag & drop or click to browse — PDF, DOCX, TXT supported</p>
          </div>
        )}
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ACTION_BUTTONS.map((btn) => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              onClick={() => triggerAction(btn.action)}
              data-testid={`button-${btn.id}`}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-300 active:scale-[0.97]",
                btn.colorClass
              )}
            >
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", btn.iconBg)}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm text-center leading-tight">{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* Output Area — Duplicate Detector OR AI Output Panel */}
      <div className="flex-1 min-h-[380px] flex flex-col relative">
        {currentAction === "duplicates" ? (
          <DuplicateDetector />
        ) : (
          <>
            {!file && !currentAction && (
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-yellow-400 font-medium">Upload a document to begin</span>
              </div>
            )}
            <AIOutputPanel
              action={currentAction}
              fileName={file?.name ?? "document.pdf"}
              onClear={() => setCurrentAction(null)}
            />
          </>
        )}
      </div>
    </div>
  );
}
