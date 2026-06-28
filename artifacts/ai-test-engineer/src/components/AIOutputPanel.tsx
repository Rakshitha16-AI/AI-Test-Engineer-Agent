import { useState, useEffect, useRef } from "react";
import { Terminal, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIOutputPanelProps {
  action: string | null;
  onClear: () => void;
}

const MOCK_OUTPUTS: Record<string, string> = {
  no_file: `[ERROR] No requirement document detected.
Please upload a file before requesting analysis.
Awaiting input...`,
  
  analyze: `[SYSTEM] Analyzing requirements document...
[SYSTEM] Extracting key entities and flows...

### EXTRACTED ACTORS:
1. End User (Customer)
2. Admin
3. Payment Gateway (External)

### IDENTIFIED FLOWS:
- User Registration & Auth
- Product Search & Filtering
- Checkout & Payment Processing
- Order Fulfillment (Admin)

### RISK ASSESSMENT:
- Payment Processing flow lacks detailed edge cases for timeouts.
- Recommended to clarify exact timeout threshold (defaulting to 30s).

Analysis complete. Ready for next command.`,

  testcases: `[SYSTEM] Generating Test Cases based on requirements...

TC-001: Verify user registration with valid data
- Precondition: User is on registration page
- Steps: Fill form -> Click submit
- Expected: Account created, redirect to dashboard

TC-002: Verify checkout flow with expired card
- Precondition: User has items in cart
- Steps: Proceed to checkout -> Enter expired card -> Submit
- Expected: Payment rejected, show specific error message

TC-003: Verify search filter by price range
- Precondition: User is on product list
- Steps: Set min=$10, max=$50 -> Apply
- Expected: Only products within $10-$50 are displayed

[INFO] Generated 45 total test cases. View full list in Test Case Generator tab.`,

  testdata: `[SYSTEM] Generating synthetic test data...

{
  "users": [
    { "id": "USR-991", "email": "test1@example.com", "role": "customer", "status": "active" },
    { "id": "USR-992", "email": "admin@example.com", "role": "admin", "status": "active" }
  ],
  "products": [
    { "sku": "PRD-A1", "price": 49.99, "stock": 120 },
    { "sku": "PRD-B2", "price": 199.50, "stock": 0 }
  ],
  "cards": [
    { "type": "valid", "number": "4111111111111111", "exp": "12/26" },
    { "type": "expired", "number": "4111111111111111", "exp": "01/20" }
  ]
}

[INFO] Data seeded to local mockup DB.`,

  predict: `[SYSTEM] Running Defect Prediction Model (v2.1)...

Analyzing code churn and historical bug data for associated flows...

🚨 HIGH RISK AREAS DETECTED:
1. module: payment_gateway_integration (Risk Score: 87%)
   - Reason: High complexity, recent major refactor.
2. module: auth_session_management (Risk Score: 72%)
   - Reason: Historically buggy area, multiple edge cases unhandled.

✅ LOW RISK AREAS:
- module: user_profile_ui (Risk Score: 12%)
- module: static_content_pages (Risk Score: 4%)

Recommendation: Allocate 60% of QA resources to payment flows.`,

  duplicates: `[SYSTEM] Scanning defect database for duplicates...

Comparing current requirements against historical tickets...

Found 1 potential duplicate:
- TICKET-4092: "Search filter ignores upper bound on mobile"
  Similarity Score: 92%
  Status: OPEN
  Assignee: j.smith@qa

Action recommended: Link current requirement to TICKET-4092 instead of creating new test cases for this specific edge case.`,

  report: `[SYSTEM] Generating Summary Report...

==================================================
  AI TEST ENGINEER - EXECUTIVE SUMMARY
==================================================

Document: cart_checkout_v3.pdf
Date: 2025-05-14

- Requirements Analyzed: 24
- Test Cases Generated: 45
- Predicted Defect Hotspots: 2
- Overall Test Coverage: 92%

Status: READY FOR EXECUTION
==================================================`
};

const DEFAULT_MESSAGE = `Welcome to AI Test Engineer Agent v2.4.
System initialized and standing by.

> Upload a requirements document and click an action to get started.`;

export default function AIOutputPanel({ action, onClear }: AIOutputPanelProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!action) {
      setDisplayedText(DEFAULT_MESSAGE);
      setIsGenerating(false);
      return;
    }

    const targetText = MOCK_OUTPUTS[action] || "Unknown command.";
    setDisplayedText("");
    setIsGenerating(true);
    
    let currentIndex = 0;
    
    // Typewriter effect
    const interval = setInterval(() => {
      setDisplayedText((prev) => {
        const nextContent = prev + targetText[currentIndex];
        currentIndex++;
        return nextContent;
      });

      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }

      if (currentIndex >= targetText.length - 1) {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 15); // Fast typewriter

    return () => clearInterval(interval);
  }, [action]);

  return (
    <div className="flex flex-col h-full bg-[#050814] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-white/50" />
          <span className="font-mono text-sm font-medium text-white/80">AI Output</span>
          {isGenerating && <Loader2 className="w-3 h-3 text-primary animate-spin ml-2" />}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClear}
          className="h-7 text-xs text-white/50 hover:text-white hover:bg-white/10"
        >
          <Trash2 className="w-3 h-3 mr-1" /> Clear
        </Button>
      </div>

      {/* Output Area */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto terminal-scroll font-mono text-sm leading-relaxed"
      >
        <div className="text-emerald-400/80 whitespace-pre-wrap">
          {displayedText}
          {isGenerating && <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse" />}
        </div>
      </div>
      
      {/* Scanline effect overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-20" />
    </div>
  );
}