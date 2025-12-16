import { z } from "zod";
import { ContentFetcher } from "../services/content-fetcher.js";
import { QueryDecomposer } from "../services/query-decomposer.js";
import { CoverageAssessor } from "../services/coverage-assessor.js";
import { ReportFormatter } from "../services/report-formatter.js";
import { KeywordFanOut } from "../services/keyword-fanout.js";
import {
  AnalysisDepth,
  FanOutVariantType,
  FanOutQuery,
  EnhancedQueryGraph,
  QueryGraph,
  AnalysisContext,
  FanOutMetadata,
} from "../types.js";

const AnalyzeContentGapSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  depth: z
    .enum(["quick", "standard", "comprehensive"])
    .optional()
    .default("standard"),
  focus_area: z.string().optional(),

  target_keyword: z
    .string()
    .optional()
    .describe(
      "Enable keyword fan-out mode: generates query variants based on Google's methodology"
    ),
  fan_out_types: z
    .array(
      z.enum([
        "equivalent",
        "specification",
        "generalization",
        "followUp",
        "comparison",
        "clarification",
        "relatedAspects",
        "temporal",
      ])
    )
    .optional()
    .describe(
      "Which variant types to generate (default: equivalent, specification, followUp, comparison, clarification)"
    ),
  fan_out_only: z
    .boolean()
    .optional()
    .default(false)
    .describe("Skip content inference, only generate keyword variants"),

  context: z
    .object({
      temporal: z
        .object({
          currentDate: z.string().optional(),
          season: z.string().optional(),
        })
        .optional(),
      intent: z
        .enum(["shopping", "research", "navigation", "entertainment"])
        .optional(),
      specificity_preference: z
        .enum(["broad", "specific", "balanced"])
        .optional(),
    })
    .optional(),
});

export async function analyzeContentGap(
  args: z.infer<typeof AnalyzeContentGapSchema>
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is required");
  }

  const {
    url,
    depth,
    focus_area,
    target_keyword,
    fan_out_types,
    fan_out_only,
    context,
  } = args;

  const fetcher = new ContentFetcher();
  const decomposer = new QueryDecomposer(apiKey);
  const assessor = new CoverageAssessor(apiKey);
  const formatter = new ReportFormatter();
  const keywordFanOut = target_keyword ? new KeywordFanOut(apiKey) : null;

  try {
    const startTime = Date.now();

    const fetchStart = Date.now();
    const content = await fetcher.fetchContent(url);
    const fetchTime = Date.now() - fetchStart;

    let contentQueries: QueryGraph = {
      prerequisite: [],
      core: [],
      followup: [],
    };
    let fanOutQueries: FanOutQuery[] = [];
    let queryTime = 0;
    let fanOutTime = 0;

    if (!fan_out_only) {
      const queryStart = Date.now();
      contentQueries = await decomposer.decomposeQueries(
        content,
        depth as AnalysisDepth,
        focus_area
      );
      queryTime = Date.now() - queryStart;
    }

    if (target_keyword && keywordFanOut) {
      const fanOutStart = Date.now();
      const types =
        (fan_out_types as FanOutVariantType[]) ||
        ([
          "equivalent",
          "specification",
          "followUp",
          "comparison",
          "clarification",
        ] as FanOutVariantType[]);

      fanOutQueries = await keywordFanOut.generateVariants(
        target_keyword,
        content,
        types,
        context as AnalysisContext | undefined
      );
      fanOutTime = Date.now() - fanOutStart;
    }

    const combinedGraph = mergeQueryGraphs(
      contentQueries,
      fanOutQueries,
      target_keyword
    );

    const assessStart = Date.now();
    const assessments = await assessor.assessCoverage(content, combinedGraph);
    const assessTime = Date.now() - assessStart;

    const totalTime = Date.now() - startTime;

    const fanOutMetadata: FanOutMetadata | undefined = target_keyword
      ? {
          mode: fan_out_only
            ? "keyword-only"
            : target_keyword
            ? "hybrid"
            : "content-only",
          targetKeyword: target_keyword,
          variantCounts: countVariantsByType(fanOutQueries),
          totalVariants: fanOutQueries.length,
          generationTime: fanOutTime,
        }
      : undefined;

    const report = formatter.formatReport(content, combinedGraph, assessments, {
      fetchTime,
      queryTime,
      assessTime,
      totalTime,
    });

    const instructionPrefix = buildInstructionPrefix(
      target_keyword !== undefined
    );

    return instructionPrefix + report;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Content gap analysis failed: ${error.message}`);
    }
    throw new Error("Content gap analysis failed with unknown error");
  }
}

export { AnalyzeContentGapSchema };

function mergeQueryGraphs(
  contentQueries: QueryGraph,
  fanOutQueries: FanOutQuery[],
  keyword?: string
): EnhancedQueryGraph {
  const enhanced: EnhancedQueryGraph = {
    ...contentQueries,
    targetKeyword: keyword,
  };

  if (fanOutQueries.length > 0) {
    enhanced.fanOutVariants = {};

    for (const query of fanOutQueries) {
      const type = query.variantType;
      if (!enhanced.fanOutVariants[type]) {
        enhanced.fanOutVariants[type] = [];
      }
      enhanced.fanOutVariants[type]!.push(query);
    }

    const variantDistribution: Record<FanOutVariantType, number> = {
      equivalent: 0,
      specification: 0,
      generalization: 0,
      followUp: 0,
      comparison: 0,
      clarification: 0,
      relatedAspects: 0,
      temporal: 0,
    };

    for (const query of fanOutQueries) {
      variantDistribution[query.variantType]++;
    }

    enhanced.generationMetadata = {
      contentInferenceTime: 0,
      fanOutTime: 0,
      totalVariants: fanOutQueries.length,
      variantDistribution,
    };
  }

  return enhanced;
}

function countVariantsByType(
  queries: FanOutQuery[]
): Record<FanOutVariantType, number> {
  const counts: Record<FanOutVariantType, number> = {
    equivalent: 0,
    specification: 0,
    generalization: 0,
    followUp: 0,
    comparison: 0,
    clarification: 0,
    relatedAspects: 0,
    temporal: 0,
  };

  for (const query of queries) {
    counts[query.variantType]++;
  }

  return counts;
}

function buildInstructionPrefix(isHybridMode: boolean): string {
  const componentTemplates = `
VISUAL STYLE GUIDE COMPONENTS (Define at top):

\`\`\`javascript
const lucide = window.lucide;
const ChevronDown = lucide?.ChevronDown;
const ChevronUp = lucide?.ChevronUp;
const CheckCircle = lucide?.CheckCircle;
const AlertCircle = lucide?.AlertCircle;
const XCircle = lucide?.XCircle;
const Zap = lucide?.Zap;

const Button = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = { default: 'bg-blue-600 text-white hover:bg-blue-700', outline: 'border border-gray-300 bg-white hover:bg-gray-50' };
  return <button className={\`inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors \${variants[variant]} \${className}\`} {...props}>{children}</button>;
};
const Card = ({ children, className = '' }) => <div className={\`rounded-lg border border-gray-200 bg-white shadow-sm \${className}\`}>{children}</div>;
const Badge = ({ children, variant = 'default' }) => {
  const variants = { success: 'bg-green-100 text-green-800 border-green-200', warning: 'bg-yellow-100 text-yellow-800 border-yellow-200', error: 'bg-red-100 text-red-800 border-red-200' };
  return <span className={\`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold \${variants[variant]}\`}>{children}</span>;
};
const Progress = ({ value }) => <div className="relative h-4 w-full rounded-full bg-gray-200"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all" style={{ width: \`\${value}%\` }} /></div>;
\`\`\`
`;

  const baseInstruction = `═══════════════════════════════════════════════════════════════
CRITICAL INSTRUCTION - ARTIFACT REQUIRED
═══════════════════════════════════════════════════════════════

YOU MUST CREATE AN INTERACTIVE REACT ARTIFACT FOR THIS ANALYSIS.
DO NOT provide a text summary. DO NOT explain the data in prose.
IMMEDIATELY create the artifact using the specifications below.

${componentTemplates}

`;

  if (isHybridMode) {
    return (
      baseInstruction +
      `
**HYBRID ANALYSIS MODE DETECTED**

This analysis combines content-based query inference with keyword fan-out variants. 
Display TWO main sections after the header:

1. **Content-Inferred Queries** (standard 3-tier layout)
2. **Keyword Fan-Out Analysis** (new section)

STRUCTURE:
1. Header (gradient bg) - Title with Zap icon, URL, keyword Badge, Progress bar, stats
2. Content Queries - Collapsible sections (blue/purple/orange), Card components with status icons
3. Fan-Out Analysis - Keyword Badge header, variant sections (teal/cyan), coverage summary
4. About Fan-Out (Collapsible) - Link to https://arxiv.org/pdf/2210.12084, explain 8 types
5. Technical Analysis (Collapsible) - Grid layout, metrics

LAYOUT: min-h-screen bg-background p-6, max-w-6xl mx-auto, use Card components
DATA: Show ALL queries, NO placeholder text like "+ 3 more items"

REMINDER: This MUST be a React artifact, not a text response.

═══════════════════════════════════════════════════════════════
END CRITICAL INSTRUCTION
═══════════════════════════════════════════════════════════════

---

`
    );
  }

  return (
    baseInstruction +
    `
STRUCTURE:
1. Header (gradient) - Title, URL, Progress bar, stats
2. Query Sections (Collapsible) - Prerequisite (blue), Core (purple), Follow-up (orange)
3. Summary Recommendations - High/medium priority
4. Technical Analysis (Collapsible) - Grid metrics, JSON display

LAYOUT: min-h-screen bg-background p-6, max-w-5xl mx-auto
DATA: Show ALL queries, NO placeholder text or truncation

REMINDER: This MUST be a React artifact, not a text response.

═══════════════════════════════════════════════════════════════
END CRITICAL INSTRUCTION
═══════════════════════════════════════════════════════════════

---

`
  );
}
