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
  const baseInstruction = `[INSTRUCTION TO CLAUDE: Please create an interactive HTML artifact to visualize this content gap analysis.`;

  if (isHybridMode) {
    return (
      baseInstruction +
      ` 

**HYBRID ANALYSIS MODE DETECTED**

This analysis combines content-based query inference with keyword fan-out variants. 
Display TWO main sections after the header:

1. **Content-Inferred Queries** (standard 3-tier layout)
2. **Keyword Fan-Out Analysis** (new section)

For the Keyword Fan-Out section:
- Show source keyword prominently
- Display variants grouped by type (matching Google's taxonomy)
- Use different color scheme from content queries (e.g., teal/cyan gradient)
- Include variant type descriptions
- Show coverage distribution by variant type
- Add collapsible "About Fan-Out Method" section explaining Google's approach

Standard requirements:
- Modern shadcn-inspired design
- Color-coded sections (blue/purple/orange for tiers, teal/cyan for fan-out)
- Expandable query cards
- Technical analysis section at bottom
- Mobile-responsive

Additional requirements for hybrid mode:
- Clear visual separation between content vs keyword queries
- Fan-out variant type legend/glossary
- Coverage comparison: content queries vs keyword variants
- Actionable recommendations specific to keyword optimization

Make it visually appealing with good UX and smooth transitions]

---

`
    );
  }

  return (
    baseInstruction +
    ` The artifact should include:
- A header with the URL, title, and coverage score with a gradient progress bar
- Color-coded sections for prerequisite/core/follow-up queries (blue/purple/orange)
- Expandable query cards showing coverage status, evidence, and recommendations
- A summary section with prioritized action items
- A collapsible "Technical Analysis" section at the bottom showing:
  * Content metrics (characters, words, readability, technical density)
  * Query decomposition metrics (model, distribution, quality scores)
  * Self-RAG validation metrics (evidence quality, hallucination rate, confidence)
  * Processing metrics (timing breakdown, API calls, estimated cost)
  * Content extraction quality scores
- Use a modern shadcn-inspired design with subtle gradients, borders, and hover effects
- Make it visually appealing with good UX and smooth transitions]

---

`
  );
}
