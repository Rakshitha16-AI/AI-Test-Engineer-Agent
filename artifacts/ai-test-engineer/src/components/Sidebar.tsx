import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Brain, 
  ListChecks, 
  Database, 
  AlertTriangle, 
  GitMerge, 
  FileText 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/analysis", label: "Requirement Analysis", icon: Brain },
  { path: "/test-cases", label: "Test Case Generator", icon: ListChecks },
  { path: "/test-data", label: "Test Data Generator", icon: Database },
  { path: "/prediction", label: "Defect Prediction", icon: AlertTriangle },
  { path: "/duplicates", label: "Duplicate Detection", icon: GitMerge },
  { path: "/report", label: "Test Report", icon: FileText },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();

  return (
    <div className="w-[240px] flex-shrink-0 bg-background border-r border-white/5 flex flex-col hidden md:flex h-full">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center mr-3 border border-primary/30">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <span className="font-semibold text-white tracking-tight">AI Test Agent</span>
      </div>
      
      <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-medium text-white/40 uppercase tracking-wider">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 text-left",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,212,170,0.1)]" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-white/40")} />
              {item.label}
            </button>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-white/5 mt-auto">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-primary flex items-center justify-center text-xs font-bold text-white">
            QA
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Lead Engineer</span>
            <span className="text-xs text-white/50">Pro Tier</span>
          </div>
        </div>
      </div>
    </div>
  );
}