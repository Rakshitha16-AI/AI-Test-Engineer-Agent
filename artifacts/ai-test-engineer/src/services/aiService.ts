import type {
  AnalysisResult,
  TestCasesResult,
  TestDataResult,
  DefectPredictionResult,
  TestReportResult,
} from "@/types/aiResponses";

const API_BASE = "/api/ai";

async function callAI<T>(endpoint: string, requirementText: string): Promise<T> {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requirementText }),
  });

  const data = await response.json().catch(() => ({ error: "Invalid server response" }));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const aiService = {
  analyze: (text: string) => callAI<AnalysisResult>("analyze", text),
  testCases: (text: string) => callAI<TestCasesResult>("testcases", text),
  testData: (text: string) => callAI<TestDataResult>("testdata", text),
  predict: (text: string) => callAI<DefectPredictionResult>("predict", text),
  report: (text: string) => callAI<TestReportResult>("report", text),
};
