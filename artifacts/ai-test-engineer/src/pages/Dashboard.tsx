import { useState } from "react";
import { 
  Upload, 
  Brain, 
  ListChecks, 
  Database, 
  AlertTriangle, 
  GitMerge, 
  FileText,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AIOutputPanel from "@/components/AIOutputPanel";
import { cn } from "@/lib/utils";

const ACTION_BUTTONS = [
  {
    id: "analyze",
    label: "Analyze Requirement",
    icon: Brain,
    colorClass: "text-[#00d4aa] border-[#00d4aa]/30 bg-[#00d4aa]/5 hover:bg-[#00d4aa]/10 hover:border-[#00d4aa]/50 hover:shadow-[0_0_20px_rgba(0,212,170,0.2)]",
    iconBg: "bg-[#00d4aa]/20",
    action: "analyze"
  },
  {
    id: "testcases",
    label: "Generate Test Cases",
    icon: ListChecks,
    colorClass: "text-[#a855f7] border-[#a855f7]/30 bg-[#a855f7]/5 hover:bg-[#a855f7]/10 hover:border-[#a855f7]/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]",
    iconBg: "bg-[#a855f7]/20",
    action: "testcases"
  },
  {
    id: "testdata",
    label: "Generate Test Data",
    icon: Database,
    colorClass: "text-[#3b82f6] border-[#3b82f6]/30 bg-[#3b82f6]/5 hover:bg-[#3b82f6]/10 hover:border-[#3b82f6]/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]",
    iconBg: "bg-[#3b82f6]/20",
    action: "testdata"
  },
  {
    id: "predict",
    label: "Predict Defects",
    icon: AlertTriangle,
    colorClass: "text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/5 hover:bg-[#f59e0b]/10 hover:border-[#f59e0b]/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]",
    iconBg: "bg-[#f59e0b]/20",
    action: "predict"
  },
  {
    id: "duplicates",
    label: "Find Duplicate Defects",
    icon: GitMerge,
    colorClass: "text-[#ec4899] border-[#ec4899]/30 bg-[#ec4899]/5 hover:bg-[#ec4899]/10 hover:border-[#ec4899]/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]",
    iconBg: "bg-[#ec4899]/20",
    action: "duplicates"
  },
  {
    id: "report",
    label: "Generate Report",
    icon: FileText,
    colorClass: "text-[#10b981] border-[#10b981]/30 bg-[#10b981]/5 hover:bg-[#10b981]/10 hover:border-[#10b981]/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    iconBg: "bg-[#10b981]/20",
    action: "report"
  }
];

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setCurrentAction(null); // Reset action when new file uploaded
    }
  };

  const triggerAction = (actionId: string) => {
    if (!file) {
      // In a real app we might show a toast, but here we just trigger the output to show a warning
      setCurrentAction("no_file");
      return;
    }
    setCurrentAction(actionId);
  };

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto p-4 md:p-6 lg:p-8 gap-6">
      
      {/* Top Controls Section */}
      <div className="flex flex-col gap-6">
        
        {/* Upload Box */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative bg-[#0d1326] border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary/50 transition-colors">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.txt"
            />
            {file ? (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{file.name}</h3>
                <p className="text-white/50 text-sm">Ready for analysis. Select an action below.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/30 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Upload Requirement Document</h3>
                <p className="text-white/50 text-sm">Drag and drop or click to browse (PDF, DOCX, TXT)</p>
              </>
            )}
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {ACTION_BUTTONS.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={() => triggerAction(btn.action)}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border transition-all duration-300",
                  btn.colorClass
                )}
              >
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", btn.iconBg)}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-sm text-center">{btn.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Bottom Output Section */}
      <div className="flex-1 min-h-[400px] flex flex-col">
        <AIOutputPanel action={currentAction} onClear={() => setCurrentAction(null)} />
      </div>

    </div>
  );
}