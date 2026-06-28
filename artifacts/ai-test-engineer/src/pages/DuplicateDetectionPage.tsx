import { GitMerge } from "lucide-react";
import DuplicateDetector from "@/components/DuplicateDetector";

export default function DuplicateDetectionPage() {
  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#ec4899]/15 border border-[#ec4899]/30 flex items-center justify-center shrink-0">
          <GitMerge className="w-4 h-4 text-[#ec4899]" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-base">Duplicate Detection</h2>
          <p className="text-white/40 text-xs">Upload your existing bug list and compare new bug titles to detect duplicates before logging.</p>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <DuplicateDetector />
      </div>
    </div>
  );
}
