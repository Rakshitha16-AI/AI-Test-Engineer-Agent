import { useState, useEffect, useRef } from "react";
import { Terminal, Trash2, CheckCircle2, AlertTriangle, XCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AIOutputPanelProps {
  action: string | null;
  fileName?: string;
  onClear: () => void;
}

const PROCESSING_STEPS: Record<string, string[]> = {
  analyze: [
    "Parsing document structure...",
    "Extracting actors and stakeholders...",
    "Identifying functional requirements...",
    "Detecting business rules and assumptions...",
    "Running risk assessment engine...",
    "Compiling analysis report...",
  ],
  testcases: [
    "Loading requirement baseline...",
    "Mapping test scenarios to requirements...",
    "Generating test case templates...",
    "Applying equivalence partitioning...",
    "Calculating test priorities...",
    "Finalizing 12 test cases...",
  ],
  testdata: [
    "Analyzing data types from requirements...",
    "Generating valid input datasets...",
    "Constructing invalid/negative datasets...",
    "Computing boundary value analysis...",
    "Validating data constraints...",
    "Test data package ready...",
  ],
  predict: [
    "Loading historical defect database...",
    "Running ML risk classification model...",
    "Scanning requirement complexity score...",
    "Mapping known defect patterns...",
    "Generating risk heatmap...",
    "Defect prediction complete...",
  ],
  duplicates: [
    "Fetching defect repository index...",
    "Vectorizing requirement text...",
    "Computing cosine similarity scores...",
    "Filtering matches above 60% threshold...",
    "Ranking duplicates by confidence...",
    "Duplicate analysis complete...",
  ],
  report: [
    "Aggregating all session data...",
    "Calculating test coverage metrics...",
    "Computing automation readiness score...",
    "Assessing overall project health...",
    "Generating executive summary...",
    "Report compiled successfully...",
  ],
  no_file: [],
};

const ACTION_TITLES: Record<string, string> = {
  analyze: "Requirement Analysis",
  testcases: "Test Case Generation",
  testdata: "Test Data Generation",
  predict: "Defect Prediction",
  duplicates: "Duplicate Detection",
  report: "Test Report",
};

function RiskBadge({ level }: { level: "HIGH" | "MEDIUM" | "LOW" }) {
  const styles = {
    HIGH: "bg-red-500/20 text-red-400 border border-red-500/30",
    MEDIUM: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    LOW: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${styles[level]}`}>
      {level}
    </span>
  );
}

function PriorityBadge({ level }: { level: "P1" | "P2" | "P3" }) {
  const styles = {
    P1: "bg-red-500/20 text-red-400 border border-red-500/30",
    P2: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    P3: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  };
  const labels = { P1: "High", P2: "Medium", P3: "Low" };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${styles[level]}`}>
      {labels[level]}
    </span>
  );
}

function SectionHeader({ icon, title, color = "text-[#00d4aa]" }: { icon: string; title: string; color?: string }) {
  return (
    <div className={`flex items-center gap-2 mb-3 pb-2 border-b border-white/10 ${color} font-semibold text-sm uppercase tracking-widest`}>
      <span>{icon}</span>
      <span>{title}</span>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 mb-5">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-white/5 border-b border-white/10">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left text-white/60 font-semibold uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2.5 text-white/70 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfoCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded-lg border ${color} p-3 flex flex-col gap-1`}>
      <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  );
}

function SimilarityBar({ pct }: { pct: number }) {
  const color = pct >= 85 ? "bg-red-500" : pct >= 65 ? "bg-yellow-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-white/80 w-8 text-right">{pct}%</span>
    </div>
  );
}

function AnalyzeOutput({ fileName }: { fileName: string }) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#00d4aa]/10 border border-[#00d4aa]/20 rounded-lg p-4">
        <SectionHeader icon="📄" title="Requirement Summary" color="text-[#00d4aa]" />
        <p className="text-white/70 text-sm leading-relaxed">
          The document <span className="text-white font-medium">"{fileName}"</span> describes a web-based e-commerce platform enabling customers to browse products, manage a shopping cart, and complete secure checkout. Administrators can manage inventory, view orders, and generate sales reports. A third-party payment gateway processes all financial transactions.
        </p>
      </div>

      <div>
        <SectionHeader icon="👤" title="Actors" color="text-[#a855f7]" />
        <Table
          headers={["#", "Actor", "Type", "Description"]}
          rows={[
            ["1", "Customer", "Primary", "Registered or guest user browsing and purchasing products"],
            ["2", "Admin", "Primary", "Internal staff managing inventory, orders, and reports"],
            ["3", "Payment Gateway", "External", "Third-party service handling payment authorization and settlement"],
            ["4", "Email Service", "External", "Sends order confirmations, shipping notifications, and alerts"],
          ]}
        />
      </div>

      <div>
        <SectionHeader icon="⚙️" title="Functional Requirements" color="text-[#3b82f6]" />
        {[
          ["FR-01", "Users shall be able to register with email and password."],
          ["FR-02", "The system shall authenticate users via JWT-based session tokens."],
          ["FR-03", "Customers shall search and filter products by category, price, and rating."],
          ["FR-04", "Customers shall add, update, and remove items from the shopping cart."],
          ["FR-05", "The checkout flow shall support credit/debit cards via the payment gateway."],
          ["FR-06", "The system shall send an order confirmation email within 60 seconds of payment."],
          ["FR-07", "Admins shall be able to create, update, and deactivate product listings."],
          ["FR-08", "Admins shall view and export order history in CSV format."],
        ].map(([id, desc]) => (
          <div key={id} className="flex gap-3 mb-2 items-start">
            <span className="text-[#00d4aa] font-mono text-xs font-bold mt-0.5 shrink-0">{id}</span>
            <span className="text-white/70 text-sm">{desc}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SectionHeader icon="📋" title="Business Rules" color="text-[#f59e0b]" />
          {[
            "Customers must be 18+ to complete a purchase.",
            "Orders above $500 require manual admin approval.",
            "Payment timeout threshold is 30 seconds.",
            "Guest checkout is allowed but order history is not retained.",
            "Products with 0 stock cannot be added to cart.",
          ].map((rule, i) => (
            <div key={i} className="flex gap-2 mb-2 items-start">
              <ChevronRight className="w-3 h-3 text-[#f59e0b] mt-0.5 shrink-0" />
              <span className="text-white/70 text-xs">{rule}</span>
            </div>
          ))}
        </div>
        <div>
          <SectionHeader icon="💡" title="Assumptions" color="text-[#10b981]" />
          {[
            "All users have a stable internet connection.",
            "The payment gateway SLA guarantees 99.9% uptime.",
            "Product images are hosted on a CDN.",
            "Admin users are pre-provisioned; no self-registration.",
          ].map((a, i) => (
            <div key={i} className="flex gap-2 mb-2 items-start">
              <ChevronRight className="w-3 h-3 text-[#10b981] mt-0.5 shrink-0" />
              <span className="text-white/70 text-xs">{a}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader icon="⚠️" title="Risks" color="text-[#ec4899]" />
        <Table
          headers={["Risk", "Likelihood", "Impact", "Mitigation"]}
          rows={[
            ["Payment timeout edge cases not fully specified", <RiskBadge level="HIGH" />, "High", "Define timeout + retry behavior in spec"],
            ["Session expiry during long checkout flows", <RiskBadge level="MEDIUM" />, "Medium", "Add session keep-alive mechanism"],
            ["Admin bulk actions lack confirmation dialogs", <RiskBadge level="MEDIUM" />, "Medium", "Require double-confirm for destructive ops"],
            ["No rate limiting on login endpoint defined", <RiskBadge level="LOW" />, "Low", "Add brute-force protection requirement"],
          ]}
        />
      </div>
    </div>
  );
}

function TestCasesOutput() {
  const cases = [
    ["TC-001", "User registration with valid credentials", "1. Navigate to /register\n2. Enter valid name, email, password\n3. Click Register", "Account created; redirect to dashboard; confirmation email sent", "P1"],
    ["TC-002", "User registration with duplicate email", "1. Navigate to /register\n2. Enter an already-registered email\n3. Click Register", "Error: 'Email already in use' displayed; no account created", "P1"],
    ["TC-003", "Login with correct credentials", "1. Navigate to /login\n2. Enter valid email and password\n3. Click Login", "User authenticated; JWT token issued; dashboard loaded", "P1"],
    ["TC-004", "Login with incorrect password", "1. Navigate to /login\n2. Enter valid email with wrong password\n3. Click Login", "Error: 'Invalid credentials' shown; access denied", "P1"],
    ["TC-005", "Add in-stock product to cart", "1. Browse to a product with stock > 0\n2. Click 'Add to Cart'", "Product appears in cart with quantity 1; cart count updates", "P2"],
    ["TC-006", "Attempt to add out-of-stock product to cart", "1. Browse to a product with stock = 0\n2. Verify Add to Cart button state", "Button is disabled; tooltip shows 'Out of Stock'", "P2"],
    ["TC-007", "Checkout with valid credit card", "1. Add item to cart\n2. Proceed to checkout\n3. Enter card: 4111111111111111 exp 12/26\n4. Click Pay", "Payment authorised; order confirmation page shown; email sent within 60s", "P1"],
    ["TC-008", "Checkout with expired credit card", "1. Add item to cart\n2. Proceed to checkout\n3. Enter expired card details\n4. Click Pay", "Payment declined; error: 'Card expired'; user stays on checkout page", "P1"],
    ["TC-009", "Payment gateway timeout (30s)", "1. Add item to cart\n2. Proceed to checkout\n3. Simulate gateway timeout", "Timeout error shown; order NOT created; user prompted to retry", "P1"],
    ["TC-010", "Search with valid keyword", "1. Enter 'laptop' in search bar\n2. Press Enter", "Products matching 'laptop' displayed; irrelevant products filtered out", "P2"],
    ["TC-011", "Filter products by price range $10–$50", "1. Open product list\n2. Set min price = 10, max price = 50\n3. Apply filter", "Only products priced $10–$50 are shown", "P2"],
    ["TC-012", "Admin deactivates a product listing", "1. Log in as admin\n2. Navigate to product management\n3. Select a product and click Deactivate", "Product status changes to Inactive; product hidden from customer view", "P2"],
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-lg p-4 mb-5">
        <div className="flex items-center justify-between">
          <SectionHeader icon="✅" title="Generated Test Cases" color="text-[#a855f7]" />
          <span className="text-xs text-white/50 mb-4">{cases.length} test cases generated</span>
        </div>
        <p className="text-white/60 text-xs">Scenarios derived from FR-01 through FR-08 using equivalence partitioning and boundary value analysis.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              {["TC ID", "Scenario", "Test Steps", "Expected Result", "Priority"].map((h, i) => (
                <th key={i} className="px-3 py-2 text-left text-white/60 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cases.map(([id, scenario, steps, expected, priority], ri) => (
              <tr key={ri} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-3 py-2.5 font-mono text-[#00d4aa] font-bold whitespace-nowrap">{id}</td>
                <td className="px-3 py-2.5 text-white/80 font-medium min-w-[160px]">{scenario}</td>
                <td className="px-3 py-2.5 text-white/60 whitespace-pre-line min-w-[220px]">{steps}</td>
                <td className="px-3 py-2.5 text-white/70 min-w-[200px]">{expected}</td>
                <td className="px-3 py-2.5">
                  <PriorityBadge level={priority as "P1" | "P2" | "P3"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TestDataOutput() {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <SectionHeader icon="✅" title="Valid Test Data" color="text-[#10b981]" />
        <Table
          headers={["Field", "Value", "Description"]}
          rows={[
            ["Email", "john.doe@example.com", "Properly formatted, unique email"],
            ["Password", "P@ssw0rd!2024", "Meets 8-char, uppercase, number, special char rules"],
            ["Card Number", "4111 1111 1111 1111", "Visa test card (always succeeds)"],
            ["Card Expiry", "12/27", "Future date, valid format"],
            ["CVV", "123", "3-digit valid CVV"],
            ["Phone", "+1-800-555-0101", "Valid US format with country code"],
            ["Zip Code", "10001", "Valid 5-digit US postal code"],
            ["Order Amount", "$249.99", "Within single-approval threshold"],
          ]}
        />
      </div>

      <div>
        <SectionHeader icon="❌" title="Invalid Test Data" color="text-[#ec4899]" />
        <Table
          headers={["Field", "Value", "Expected Error"]}
          rows={[
            ["Email", "plaintext@@", "Invalid email format"],
            ["Email", "", "Required field cannot be blank"],
            ["Password", "abc", "Too short — minimum 8 characters"],
            ["Card Number", "1234 5678 9012 3456", "Invalid card number (Luhn check fails)"],
            ["Card Expiry", "01/20", "Card expired"],
            ["CVV", "99999", "Exceeds max length"],
            ["Phone", "not-a-phone", "Invalid phone format"],
            ["Zip Code", "ABCDE", "Non-numeric zip code"],
          ]}
        />
      </div>

      <div>
        <SectionHeader icon="📐" title="Boundary Values" color="text-[#3b82f6]" />
        <Table
          headers={["Parameter", "Min Boundary", "Max Boundary", "Notes"]}
          rows={[
            ["Password length", "8 chars (valid)", "128 chars (valid)", "7 chars → error; 129 chars → error"],
            ["Product price", "$0.01 (valid)", "$9,999.99 (valid)", "$0.00 → error; negative → error"],
            ["Cart quantity", "1 (valid)", "99 (valid)", "0 → remove item; 100 → error"],
            ["Search keyword", "1 char (valid)", "100 chars (valid)", "Empty → no-op; 101 chars → truncated"],
            ["Order amount", "$0.01 (valid)", "$499.99 (no approval)", "$500.00 → admin approval required"],
            ["Session timeout", "1 min (configurable)", "30 min (max)", "After timeout → re-login required"],
          ]}
        />
      </div>
    </div>
  );
}

function PredictOutput() {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <InfoCard label="Modules Scanned" value="14" color="border-white/10" />
        <InfoCard label="High Risk" value="3" color="border-red-500/30" />
        <InfoCard label="Medium Risk" value="4" color="border-yellow-500/30" />
        <InfoCard label="Low Risk" value="7" color="border-emerald-500/30" />
      </div>

      <div>
        <SectionHeader icon="🚨" title="High Risk Areas" color="text-red-400" />
        <Table
          headers={["Module", "Risk Score", "Risk Level", "Reason"]}
          rows={[
            ["payment_gateway_integration", "89%", <RiskBadge level="HIGH" />, "High cyclomatic complexity; recent major refactor; 3 open regression bugs"],
            ["auth_session_management", "74%", <RiskBadge level="HIGH" />, "Historically buggy; JWT expiry edge cases not fully specified"],
            ["order_state_machine", "68%", <RiskBadge level="HIGH" />, "15 state transitions; insufficient negative path coverage in specs"],
          ]}
        />
      </div>

      <div>
        <SectionHeader icon="⚠️" title="Possible Defects" color="text-yellow-400" />
        <Table
          headers={["Defect ID", "Description", "Likelihood", "Module"]}
          rows={[
            ["PD-001", "Payment not rolled back on partial gateway timeout", <RiskBadge level="HIGH" />, "payment_gateway_integration"],
            ["PD-002", "Session token not invalidated on password change", <RiskBadge level="HIGH" />, "auth_session_management"],
            ["PD-003", "Concurrent cart updates causing quantity race condition", <RiskBadge level="MEDIUM" />, "cart_service"],
            ["PD-004", "Email notification not sent for orders requiring admin approval", <RiskBadge level="MEDIUM" />, "notification_service"],
            ["PD-005", "Filter price range allows non-numeric input client-side", <RiskBadge level="LOW" />, "product_search_ui"],
          ]}
        />
      </div>

      <div>
        <SectionHeader icon="🛡️" title="Recommended Actions" color="text-[#00d4aa]" />
        {[
          ["Immediate (Sprint)", "Add explicit timeout + rollback test cases to payment gateway module."],
          ["Immediate (Sprint)", "Write negative-path scenarios for session expiry and token invalidation."],
          ["Next Sprint", "Implement concurrency tests for the cart service using parallel API calls."],
          ["Next Sprint", "Add notification delivery confirmation to the order approval workflow."],
          ["Backlog", "Add client-side input sanitization for all search and filter fields."],
        ].map(([priority, action], i) => (
          <div key={i} className="flex gap-3 mb-3 items-start">
            <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 mt-0.5 ${priority === "Immediate (Sprint)" ? "bg-red-500/20 text-red-400" : priority === "Next Sprint" ? "bg-yellow-500/20 text-yellow-400" : "bg-white/10 text-white/50"}`}>{priority}</span>
            <span className="text-white/70 text-sm">{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DuplicatesOutput() {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#ec4899]/10 border border-[#ec4899]/20 rounded-lg p-4">
        <SectionHeader icon="🔍" title="Duplicate Detection Results" color="text-[#ec4899]" />
        <p className="text-white/60 text-xs">Scanned 1,247 historical defects. Found <span className="text-white font-semibold">5 potential duplicates</span> above the 60% similarity threshold.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              {["Bug ID", "Existing Defect Title", "Similarity", "Status", "Recommendation"].map((h, i) => (
                <th key={i} className="px-3 py-2 text-left text-white/60 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["BUG-4092", "Search filter ignores upper price bound on mobile devices", 94, "OPEN", "Link to existing; do not create new test case"],
              ["BUG-3871", "Payment gateway returns 200 on timeout, order incorrectly confirmed", 88, "IN PROGRESS", "Merge test coverage with BUG-3871 regression suite"],
              ["BUG-2955", "Session not invalidated after password reset flow", 81, "CLOSED", "Verify fix still covers new auth flow; re-test"],
              ["BUG-4110", "Cart quantity accepts negative values via API directly", 72, "OPEN", "Extend BUG-4110 with new boundary test cases"],
              ["BUG-3540", "Admin export CSV truncated for orders > 1000 rows", 63, "CLOSED", "Re-test in new environment; may have regressed"],
            ].map(([id, title, pct, status, rec], ri) => (
              <tr key={ri} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-3 py-2.5 font-mono text-[#ec4899] font-bold whitespace-nowrap">{id}</td>
                <td className="px-3 py-2.5 text-white/80 min-w-[220px]">{title}</td>
                <td className="px-3 py-2.5 min-w-[120px]"><SimilarityBar pct={pct as number} /></td>
                <td className="px-3 py-2.5">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${status === "OPEN" ? "bg-red-500/20 text-red-400" : status === "IN PROGRESS" ? "bg-yellow-500/20 text-yellow-400" : "bg-white/10 text-white/50"}`}>{status}</span>
                </td>
                <td className="px-3 py-2.5 text-white/60 min-w-[200px]">{rec}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <p className="text-xs text-white/50 font-mono">
          <span className="text-[#00d4aa]">AI INSIGHT:</span> 2 of 5 duplicates are currently OPEN. Merging test coverage rather than creating new tickets will reduce QA effort by an estimated <span className="text-white font-semibold">~35%</span> for these scenarios.
        </p>
      </div>
    </div>
  );
}

function ReportOutput({ fileName }: { fileName: string }) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg p-4">
        <SectionHeader icon="📊" title="AI Test Engineer — Executive Report" color="text-[#10b981]" />
        <div className="flex gap-4 text-xs text-white/50 font-mono">
          <span>Document: <span className="text-white/70">{fileName}</span></span>
          <span>Generated: <span className="text-white/70">{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <InfoCard label="Total Test Cases" value="12" color="border-[#a855f7]/30" />
        <InfoCard label="High Risk Items" value="3" color="border-red-500/30" />
        <InfoCard label="Duplicate Defects Found" value="5" color="border-[#ec4899]/30" />
        <InfoCard label="Automation Readiness" value="76%" color="border-[#3b82f6]/30" />
        <InfoCard label="Req Coverage" value="100%" color="border-[#10b981]/30" />
        <InfoCard label="Overall Project Health" value="GOOD" color="border-[#00d4aa]/30" />
      </div>

      <div>
        <SectionHeader icon="📈" title="Coverage Breakdown" color="text-[#3b82f6]" />
        {[
          ["Authentication & Auth", 100, "text-emerald-400"],
          ["Product Search & Filter", 91, "text-emerald-400"],
          ["Cart Management", 83, "text-emerald-400"],
          ["Checkout & Payment", 78, "text-yellow-400"],
          ["Admin Operations", 67, "text-yellow-400"],
          ["Notification Service", 50, "text-red-400"],
        ].map(([label, pct, color]) => (
          <div key={label as string} className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-white/70">{label}</span>
              <span className={`text-xs font-bold ${color}`}>{pct}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${(pct as number) >= 80 ? "bg-emerald-500" : (pct as number) >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <SectionHeader icon="🤖" title="AI Recommendation" color="text-[#00d4aa]" />
        <div className="bg-[#00d4aa]/5 border border-[#00d4aa]/20 rounded-lg p-4 space-y-3">
          {[
            { icon: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />, text: "Prioritise test execution for the payment gateway and auth modules — both are high-risk with open bugs. Block release if PD-001 or PD-002 are unresolved." },
            { icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />, text: "76% of the generated test cases are good candidates for Selenium/Playwright automation. Focus on the 12 P1 cases first for the regression suite." },
            { icon: <XCircle className="w-4 h-4 text-yellow-400 shrink-0" />, text: "Notification Service coverage is only 50%. Add at least 3 test cases covering email failure and retry scenarios before the next release cycle." },
          ].map(({ icon, text }, i) => (
            <div key={i} className="flex gap-3 items-start">
              {icon}
              <p className="text-sm text-white/70 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NoFileOutput() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-12 animate-in fade-in duration-300">
      <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-yellow-400" />
      </div>
      <div className="text-center">
        <p className="text-white/80 font-semibold mb-1">No Document Uploaded</p>
        <p className="text-white/40 text-sm">Please upload a requirements document before running an action.</p>
      </div>
    </div>
  );
}

const RENDER_OUTPUT: Record<string, (props: { fileName: string }) => React.ReactNode> = {
  analyze: ({ fileName }) => <AnalyzeOutput fileName={fileName} />,
  testcases: () => <TestCasesOutput />,
  testdata: () => <TestDataOutput />,
  predict: () => <PredictOutput />,
  duplicates: () => <DuplicatesOutput />,
  report: ({ fileName }) => <ReportOutput fileName={fileName} />,
};

const DEFAULT_MESSAGE = (
  <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
    <div className="w-14 h-14 rounded-full bg-[#00d4aa]/10 border border-[#00d4aa]/30 flex items-center justify-center">
      <Terminal className="w-7 h-7 text-[#00d4aa]" />
    </div>
    <div className="text-center">
      <p className="text-white/80 font-semibold mb-1">AI Test Engineer Agent</p>
      <p className="text-white/40 text-sm">Upload a requirements document and click an action to get started.</p>
    </div>
  </div>
);

export default function AIOutputPanel({ action, fileName = "document.pdf", onClear }: AIOutputPanelProps) {
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!action) {
      setPhase("idle");
      setStepIndex(0);
      return;
    }

    if (action === "no_file") {
      setPhase("done");
      return;
    }

    const steps = PROCESSING_STEPS[action] ?? [];
    setPhase("loading");
    setStepIndex(0);

    let idx = 0;
    const iv = setInterval(() => {
      idx++;
      setStepIndex(idx);
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      if (idx >= steps.length) {
        clearInterval(iv);
        setTimeout(() => {
          setPhase("done");
          toast.success(`${ACTION_TITLES[action] ?? "Action"} complete`, {
            description: "AI output is ready below.",
            duration: 3000,
          });
        }, 400);
      }
    }, 380);

    return () => clearInterval(iv);
  }, [action]);

  useEffect(() => {
    if (phase === "done" && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [phase]);

  const steps = action ? PROCESSING_STEPS[action] ?? [] : [];

  return (
    <div className="flex flex-col h-full bg-[#050814] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-white/50" />
          <span className="font-mono text-sm font-medium text-white/80">
            {action && action !== "no_file" ? ACTION_TITLES[action] ?? "AI Output" : "AI Output"}
          </span>
          {phase === "loading" && (
            <span className="flex items-center gap-1.5 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d4aa] animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          )}
          {phase === "done" && action && action !== "no_file" && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-2" />
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-7 text-xs text-white/50 hover:text-white hover:bg-white/10"
          data-testid="button-clear-output"
        >
          <Trash2 className="w-3 h-3 mr-1" /> Clear
        </Button>
      </div>

      {/* Content Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 scroll-smooth">
        {/* Loading phase */}
        {phase === "loading" && (
          <div className="space-y-2 font-mono text-sm">
            <p className="text-[#00d4aa]/60 text-xs mb-4 uppercase tracking-widest">
              ◎ AI Processing — {ACTION_TITLES[action!]}
            </p>
            {steps.slice(0, stepIndex).map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-white/60 text-xs">{step}</span>
              </div>
            ))}
            {stepIndex < steps.length && (
              <div className="flex items-center gap-2 mt-1">
                <span className="w-3.5 h-3.5 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="text-[#00d4aa] text-xs">{steps[stepIndex]}</span>
              </div>
            )}
          </div>
        )}

        {/* Idle state */}
        {phase === "idle" && DEFAULT_MESSAGE}

        {/* Done: no_file */}
        {phase === "done" && action === "no_file" && <NoFileOutput />}

        {/* Done: rich output */}
        {phase === "done" && action && action !== "no_file" && (
          <div>
            {RENDER_OUTPUT[action]?.({ fileName }) ?? (
              <p className="text-white/50 text-sm">Unknown action.</p>
            )}
          </div>
        )}
      </div>

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.05)_50%)] bg-[length:100%_4px] opacity-10 rounded-xl" />
    </div>
  );
}
