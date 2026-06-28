import { useState } from "react";
import { Database, Layers } from "lucide-react";
import AIOutputPanel from "@/components/AIOutputPanel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DOMAINS = [
  { id: "ecommerce", label: "E-Commerce", desc: "Users, products, orders, payments" },
  { id: "banking", label: "Banking", desc: "Accounts, transactions, cards" },
  { id: "healthcare", label: "Healthcare", desc: "Patients, appointments, prescriptions" },
  { id: "hr", label: "HR / Payroll", desc: "Employees, timesheets, salaries" },
  { id: "custom", label: "Custom / General", desc: "Generic test data" },
];

const DATA_TYPES = ["Valid Data", "Invalid Data", "Boundary Values", "All Three"];
const RECORD_COUNTS = ["5 records", "10 records", "25 records", "50 records"];
const FORMATS = ["Table", "JSON", "CSV"];

export default function TestDataGenerator() {
  const [domain, setDomain] = useState("ecommerce");
  const [dataType, setDataType] = useState("All Three");
  const [count, setCount] = useState("10 records");
  const [format, setFormat] = useState("Table");
  const [action, setAction] = useState<string | null>(null);

  const handleGenerate = () => {
    setAction(null);
    setTimeout(() => { setAction("testdata"); toast.success("Generating test data..."); }, 50);
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#3b82f6]/15 border border-[#3b82f6]/30 flex items-center justify-center shrink-0">
          <Database className="w-4 h-4 text-[#3b82f6]" />
        </div>
        <div>
          <h2 className="text-white font-semibold text-base">Test Data Generator</h2>
          <p className="text-white/40 text-xs">Generate valid, invalid, and boundary test data sets for your application domain.</p>
        </div>
      </div>

      <div className="bg-[#0d1326] border border-white/10 rounded-xl p-4 flex flex-col gap-5">
        {/* Domain Selector */}
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Application Domain</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {DOMAINS.map((d) => (
              <button key={d.id} onClick={() => setDomain(d.id)}
                className={cn("p-3 rounded-lg border text-left transition-all",
                  domain === d.id ? "bg-[#3b82f6]/15 border-[#3b82f6]/40" : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                )}>
                <p className={cn("text-xs font-semibold mb-0.5", domain === d.id ? "text-[#3b82f6]" : "text-white/70")}>{d.label}</p>
                <p className="text-[11px] text-white/30 leading-tight">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Record Count</p>
            <div className="flex flex-col gap-1">
              {RECORD_COUNTS.map((r) => (
                <button key={r} onClick={() => setCount(r)}
                  className={cn("px-3 py-1.5 rounded text-xs border transition-all text-left",
                    count === r ? "bg-[#3b82f6]/15 border-[#3b82f6]/40 text-[#3b82f6]" : "border-white/10 text-white/40 hover:text-white/60"
                  )}>{r}</button>
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
          <button onClick={handleGenerate}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-[#3b82f6]/15 border border-[#3b82f6]/40 text-[#3b82f6] hover:bg-[#3b82f6]/25 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
            <Layers className="w-4 h-4" /> Generate Test Data
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <AIOutputPanel action={action} fileName="test-data-config" onClear={() => setAction(null)} />
      </div>
    </div>
  );
}
