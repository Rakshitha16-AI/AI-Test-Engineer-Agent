import { useState } from "react";
import { FileText, BarChart2 } from "lucide-react";
import AIOutputPanel from "@/components/AIOutputPanel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SECTIONS = [
  { id: "summary", label: "Executive Summary", default: true },
  { id: "testcases", label: "Test Case Results", default: true },
  { id: "coverage", label: "Coverage Breakdown", default: true },
  { id: "defects", label: "Defect Analysis", default: true },
  { id: "automation", label: "Automation Readiness", default: true },
  { id: "recommendation", label: "AI Recommendation", default: true },
];

const FORMATS = ["Detailed", "Executive (1-page)", "Technical"];
const SPRINT_OPTIONS = ["Sprint 1", "Sprint 2", "Sprint 3", "Release 1.0", "Current Sprint"];

export default function TestReport() {
  const [sections, setSections] = useState<Record<string, boolean>>(
    Object.fromEntries(SECTIONS.map((s) => [s.id, s.default]))
  );
  const [reportFormat, setReportFormat] = useState("Detailed");
  const [sprint, setSprint] = useState("Current Sprint");
  const [projectName, setProjectName] = useState("");
  const [action, setAction] = useState<string | null>(null);

  const toggleSection = (id: string) => setSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleGenerate = () => {
    const selected = Object.entries(sections).filter(([, v]) => v).length;
    if (selected === 0) { toast.error("Select at least one report section."); return; }
    setAction(null);
    setTimeout(() => { setAction("report"); toast.success("Generating test report..."); }, 50);
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
        {/* Project name + Sprint */}
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
                  <div className={cn("w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all",
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
                <span className="text-xs text-white/50 font-medium">Report Preview</span>
              </div>
              <div className="space-y-1">
                {Object.entries(sections).filter(([, v]) => v).map(([id]) => {
                  const s = SECTIONS.find((sec) => sec.id === id);
                  return s ? <p key={id} className="text-[11px] text-white/30 flex items-center gap-1.5"><span className="text-[#10b981]">✓</span>{s.label}</p> : null;
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleGenerate}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-[#10b981]/15 border border-[#10b981]/40 text-[#10b981] hover:bg-[#10b981]/25 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all">
            <FileText className="w-4 h-4" /> Generate Report
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[260px]">
        <AIOutputPanel action={action} fileName={projectName || "project-report"} onClear={() => setAction(null)} />
      </div>
    </div>
  );
}
