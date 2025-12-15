import { z } from "zod";
import { ContentFetcher } from "../services/content-fetcher.js";
import { QueryDecomposer } from "../services/query-decomposer.js";
import { CoverageAssessor } from "../services/coverage-assessor.js";
import { ReportFormatter } from "../services/report-formatter.js";
import { AnalysisDepth } from "../types.js";

const AnalyzeContentGapSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  depth: z
    .enum(["quick", "standard", "comprehensive"])
    .optional()
    .default("standard"),
  focus_area: z.string().optional(),
});

export async function analyzeContentGap(
  args: z.infer<typeof AnalyzeContentGapSchema>
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY environment variable is required"
    );
  }

  const { url, depth, focus_area } = args;

  const fetcher = new ContentFetcher();
  const decomposer = new QueryDecomposer(apiKey);
  const assessor = new CoverageAssessor(apiKey);
  const formatter = new ReportFormatter();

  try {
    const content = await fetcher.fetchContent(url);

    const queryGraph = await decomposer.decomposeQueries(
      content,
      depth as AnalysisDepth,
      focus_area
    );

    const assessments = await assessor.assessCoverage(content, queryGraph);

    const report = formatter.formatReport(content, queryGraph, assessments);

    // Add instruction for Claude to create an artifact
    const instructionPrefix = `[INSTRUCTION TO CLAUDE: Please create an interactive HTML artifact to visualize this content gap analysis. The artifact should include:
- A header with the URL, title, and coverage score
- Color-coded sections for prerequisite/core/follow-up queries
- Expandable query cards showing coverage status, evidence, and recommendations
- A summary section with prioritized action items
- Make it visually appealing with good UX]

---

`;

    return instructionPrefix + report;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Content gap analysis failed: ${error.message}`);
    }
    throw new Error("Content gap analysis failed with unknown error");
  }
}

export { AnalyzeContentGapSchema };
