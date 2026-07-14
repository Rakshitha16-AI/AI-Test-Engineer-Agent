import { Router, type IRouter } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router: IRouter = Router();

function getModel() {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add it to your Replit Secrets."
    );
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
    },
  });
}

async function geminiJSON<T>(prompt: string): Promise<T> {
  const model = getModel();
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text) as T;
}

router.post("/analyze", async (req, res) => {
  try {
    const { requirementText } = req.body as { requirementText?: string };
    if (!requirementText?.trim()) {
      return res.status(400).json({ error: "requirementText is required" });
    }

    const prompt = `You are an expert software testing engineer. Analyze the following requirement document and return a JSON object with this EXACT structure (no markdown, pure JSON):

{
  "summary": "2-3 sentence overview of what the system does",
  "actors": [
    {"name": "...", "type": "Primary|Secondary|External", "description": "..."}
  ],
  "functionalRequirements": [
    {"id": "FR-01", "description": "..."}
  ],
  "nonFunctionalRequirements": [
    {"id": "NFR-01", "description": "..."}
  ],
  "businessRules": ["rule 1", "rule 2"],
  "assumptions": ["assumption 1", "assumption 2"],
  "risks": [
    {"risk": "...", "likelihood": "HIGH|MEDIUM|LOW", "impact": "High|Medium|Low", "mitigation": "..."}
  ]
}

Extract at least 5 functional requirements, 2 non-functional requirements, 3 business rules, 2 assumptions, and 3 risks from the document.

REQUIREMENT DOCUMENT:
${requirementText}`;

    const data = await geminiJSON(prompt);
    return res.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return res.status(500).json({ error: message });
  }
});

router.post("/testcases", async (req, res) => {
  try {
    const { requirementText } = req.body as { requirementText?: string };
    if (!requirementText?.trim()) {
      return res.status(400).json({ error: "requirementText is required" });
    }

    const prompt = `You are an expert QA engineer. Generate comprehensive test cases from the following requirement document. Return a JSON object with this EXACT structure (no markdown, pure JSON):

{
  "testCases": [
    {
      "id": "TC-001",
      "scenario": "clear scenario name",
      "preconditions": "precondition text",
      "steps": "1. Step one\\n2. Step two\\n3. Step three",
      "expected": "expected outcome",
      "priority": "P1|P2|P3",
      "type": "Positive|Negative|Boundary|Edge Case"
    }
  ]
}

Generate at least 12-15 test cases covering:
- Positive test cases (happy path)
- Negative test cases (invalid inputs, error paths)
- Boundary value test cases
- Edge cases

Base ALL test cases strictly on the provided requirement document.

REQUIREMENT DOCUMENT:
${requirementText}`;

    const data = await geminiJSON(prompt);
    return res.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return res.status(500).json({ error: message });
  }
});

router.post("/testdata", async (req, res) => {
  try {
    const { requirementText } = req.body as { requirementText?: string };
    if (!requirementText?.trim()) {
      return res.status(400).json({ error: "requirementText is required" });
    }

    const prompt = `You are an expert QA engineer. Generate test data sets based on the following requirement document. Return a JSON object with this EXACT structure (no markdown, pure JSON):

{
  "valid": [
    {"field": "field name", "value": "sample value", "description": "why this is valid"}
  ],
  "invalid": [
    {"field": "field name", "value": "bad value", "error": "expected error message"}
  ],
  "boundary": [
    {"parameter": "parameter name", "min": "minimum boundary value", "max": "maximum boundary value", "notes": "boundary notes"}
  ]
}

Generate at least 6 valid data rows, 6 invalid data rows, and 4 boundary value rows.
Base ALL test data strictly on the fields, constraints, and rules in the provided requirement document.

REQUIREMENT DOCUMENT:
${requirementText}`;

    const data = await geminiJSON(prompt);
    return res.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return res.status(500).json({ error: message });
  }
});

router.post("/predict", async (req, res) => {
  try {
    const { requirementText } = req.body as { requirementText?: string };
    if (!requirementText?.trim()) {
      return res.status(400).json({ error: "requirementText is required" });
    }

    const prompt = `You are an expert software quality analyst. Analyze the following requirement document and predict potential defects and high-risk areas. Return a JSON object with this EXACT structure (no markdown, pure JSON):

{
  "summary": {
    "scanned": <number of modules/features identified>,
    "high": <number of high-risk areas>,
    "medium": <number of medium-risk areas>,
    "low": <number of low-risk areas>
  },
  "highRisk": [
    {
      "module": "module or feature name",
      "score": "XX%",
      "reason": "why this is high risk"
    }
  ],
  "possibleDefects": [
    {
      "id": "PD-001",
      "description": "specific defect description",
      "likelihood": "HIGH|MEDIUM|LOW",
      "module": "affected module name"
    }
  ],
  "recommendations": [
    {
      "priority": "Immediate (Sprint)|Next Sprint|Backlog",
      "action": "specific action to take"
    }
  ]
}

Identify at least 3 high-risk areas, 5 possible defects, and 5 recommendations.
Base all predictions strictly on the provided requirement document.

REQUIREMENT DOCUMENT:
${requirementText}`;

    const data = await geminiJSON(prompt);
    return res.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return res.status(500).json({ error: message });
  }
});

router.post("/report", async (req, res) => {
  try {
    const { requirementText } = req.body as { requirementText?: string };
    if (!requirementText?.trim()) {
      return res.status(400).json({ error: "requirementText is required" });
    }

    const prompt = `You are an expert QA manager. Generate a comprehensive test report based on the following requirement document. Return a JSON object with this EXACT structure (no markdown, pure JSON):

{
  "stats": {
    "testCases": <estimated number of test cases>,
    "highRisk": <number of high risk items>,
    "automationReadiness": "XX%",
    "coverage": "XX%",
    "health": "GOOD|FAIR|POOR"
  },
  "coverage": [
    {"area": "feature or module name", "pct": <0-100>}
  ],
  "recommendations": [
    {
      "type": "warning|success|info",
      "text": "specific recommendation text"
    }
  ]
}

Generate coverage for at least 5-6 areas/modules from the requirement document.
Provide at least 3 recommendations.
Base all statistics and recommendations strictly on the provided requirement document.

REQUIREMENT DOCUMENT:
${requirementText}`;

    const data = await geminiJSON(prompt);
    return res.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return res.status(500).json({ error: message });
  }
});

export default router;
