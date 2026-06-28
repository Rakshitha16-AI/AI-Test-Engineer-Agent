import { useLocation } from "wouter";
import { FileText } from "lucide-react";

export default function Placeholder() {
  const [location] = useLocation();
  
  // Format the path nicely
  const title = location.replace("/", "").split("-").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");

  return (
    <div className="h-full w-full flex items-center justify-center p-6">
      <div className="flex flex-col items-center justify-center text-center max-w-md border border-white/5 bg-white/[0.02] p-12 rounded-2xl backdrop-blur-sm">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{title || "Page"}</h2>
        <p className="text-white/50 text-sm">
          Select a document in the Dashboard to get started with this tool.
        </p>
      </div>
    </div>
  );
}