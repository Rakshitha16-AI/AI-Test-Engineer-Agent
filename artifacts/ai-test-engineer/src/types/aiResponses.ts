export interface Actor {
  name: string;
  type: string;
  description: string;
}

export interface Requirement {
  id: string;
  description: string;
}

export interface Risk {
  risk: string;
  likelihood: "HIGH" | "MEDIUM" | "LOW";
  impact: string;
  mitigation: string;
}

export interface AnalysisResult {
  summary: string;
  actors: Actor[];
  functionalRequirements: Requirement[];
  nonFunctionalRequirements: Requirement[];
  businessRules: string[];
  assumptions: string[];
  risks: Risk[];
}

export interface TestCase {
  id: string;
  scenario: string;
  preconditions: string;
  steps: string;
  expected: string;
  priority: "P1" | "P2" | "P3";
  type: string;
}

export interface TestCasesResult {
  testCases: TestCase[];
}

export interface TestDataRow {
  field: string;
  value: string;
  description: string;
}

export interface InvalidDataRow {
  field: string;
  value: string;
  error: string;
}

export interface BoundaryRow {
  parameter: string;
  min: string;
  max: string;
  notes: string;
}

export interface TestDataResult {
  valid: TestDataRow[];
  invalid: InvalidDataRow[];
  boundary: BoundaryRow[];
}

export interface HighRiskModule {
  module: string;
  score: string;
  reason: string;
}

export interface PossibleDefect {
  id: string;
  description: string;
  likelihood: "HIGH" | "MEDIUM" | "LOW";
  module: string;
}

export interface DefectRecommendation {
  priority: string;
  action: string;
}

export interface DefectPredictionResult {
  summary: { scanned: number; high: number; medium: number; low: number };
  highRisk: HighRiskModule[];
  possibleDefects: PossibleDefect[];
  recommendations: DefectRecommendation[];
}

export interface CoverageArea {
  area: string;
  pct: number;
}

export interface ReportRecommendation {
  type: "warning" | "success" | "info";
  text: string;
}

export interface TestReportResult {
  stats: {
    testCases: number;
    highRisk: number;
    automationReadiness: string;
    coverage: string;
    health: string;
  };
  coverage: CoverageArea[];
  recommendations: ReportRecommendation[];
}
