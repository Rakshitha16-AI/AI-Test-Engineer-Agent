import { useEffect, useState } from "react";
import { Terminal, Trash2, Loader2, AlertCircle, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIOutputPanelProps {
  action: string | null;
  loading: boolean;
  error: string | null;
  onClear: () => void;
  children?: React.ReactNode;
}

const ACTION_TITLES: Record<string, string> = {
  analyze: "Requirement Analysis",
  testcases: "Test Case Generation",
  testdata: "Test Data Generation",
  predict: "Defect Prediction",
  report: "Test Report",
};

const LOADING_MESSAGES: Record<string, string[]> = {
  analyze: [
    "Sending document to Gemini AI...",
    "Parsing document structure...",
    "Extracting actors and stakeholders...",
    "Identifying functional requirements...",
    "Running risk assessment...",
    "Compiling analysis report...",
  ],
  testcases: [
    "Sending requirement to Gemini AI...",
    "Mapping test scenarios...",
    "Generating test case templates...",
    "Applying equivalence partitioning...",
    "Calculating test priorities...",
    "Finalizing test cases...",
  ],
  testdata: [
    "Sending requirement to Gemini AI...",
    "Analyzing data types and constraints...",
    "Generating valid input datasets...",
    "Constructing invalid/negative data...",
    "Computing boundary values...",
    "Test data package ready...",
  ],
  predict: [
    "Sending requirement to Gemini AI...",
    "Running risk classification...",
    "Scanning requirement complexity...",
    "Mapping defect patterns...",
    "Generating risk heatmap...",
    "Prediction complete...",
  ],
  report: [
    "Sending requirement to Gemini AI...",
    "Calculating coverage metrics...",
    "Computing automation readiness...",
    "Assessing project health...",
    "Generating executive summary...",
    "Report compiled...",
  ],
};

export default function AIOutputPanel({
  action,
  loading,
  error,
  onClear,
  children,
}: AIOutputPanelProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!loading) { setMsgIndex(0); return; }
    const msgs = LOADING_MESSAGES[action ?? ""] ?? ["Processing..."];
    setMsgIndex(0);
    const iv = setInterval(() => {
      setMsgIndex((i) => (i + 1 < msgs.length ? i + 1 : i));
    }, 1800);
    return () => clearInterval(iv);
  }, [loading, action]);

  const title = action ? (ACTION_TITLES[action] ?? action) : "AI Output";
  const hasContent = !loading && !error && !!children;
  const showPanel = loading || error || hasContent;

  if (!showPanel) {
    return (
      <div className="h-full flex items-center justify-center rounded-xl border border-white/5 bg-[#080e1e]">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <Terminal className="w-6 h-6 text-white/20" />
          </div>
          <p className="text-white/30 text-sm font-medium">AI output will appear here</p>
          <p className="text-white/15 text-xs mt-1">Upload a document and click an action button</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-xl border border-white/10 bg-[#080e1e] overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0d1326] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#00d4aa]" />
            <span className="text-xs font-mono text-white/60">gemini-1.5-flash</span>
            <span className="text-white/20">·</span>
            <span className="text-xs font-semibold text-white/80">{title}</span>
          </div>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70 transition-colors px-2 py-1 rounded hover:bg-white/5"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-[#00d4aa]/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#00d4aa] animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#00d4aa]/60 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white/80 mb-1">
                {(LOADING_MESSAGES[action ?? ""] ?? ["Processing..."])[msgIndex]}
              </p>
              <p className="text-xs text-white/30">Powered by Google Gemini AI</p>
            </div>
            <div className="flex gap-1.5">
              {(LOADING_MESSAGES[action ?? ""] ?? [""]).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    i <= msgIndex ? "bg-[#00d4aa] w-4" : "bg-white/10 w-2"
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <div className="text-center max-w-md">
              <p className="text-sm font-semibold text-red-400 mb-2">AI Generation Failed</p>
              <p className="text-xs text-white/50 leading-relaxed">{error}</p>
            </div>
            <button
              onClick={onClear}
              className="text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
            >
              Dismiss
            </button>
          </div>
        )}

        {hasContent && children}
      </div>
    </div>
  );
}
