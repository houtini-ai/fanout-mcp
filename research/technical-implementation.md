# Fan-Out MCP: Technical Implementation Plan

**Version:** 1.0  
**Date:** December 15, 2024  
**Status:** Design → Ready for Implementation

---

## Architecture Overview

### Core Philosophy

**Separation of Concerns:**
- MCP handles **data fetching and orchestration**
- Sonnet 4.5 handles **reasoning and critique**
- Tool responses provide **structured data for analysis**

This follows MCP best practices: tools provide context, models provide intelligence.

---

## Tool Design (MCP Server)

### Tool 1: `analyze_content_gap`

**Purpose:** Master orchestrator for single URL analysis  
**Mode:** Comprehensive, detailed output

```typescript
{
  name: "analyze_content_gap",
  description: "Analyze a webpage for query coverage gaps using advanced IR techniques",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "URL to analyze"
      },
      depth: {
        type: "string",
        enum: ["quick", "standard", "comprehensive"],
        default: "standard",
        description: "Analysis depth - quick (5 queries), standard (15 queries), comprehensive (30+ queries)"
      },
      focus_area: {
        type: "string",
        description: "Optional: Focus analysis on specific topic (e.g., 'pricing', 'installation')"
      }
    },
    required: ["url"]
  }
}
```

### Tool 2: `analyze_batch_urls`

**Purpose:** Batch processing with aggregate analysis  
**Mode:** Summary + downloadable data

```typescript
{
  name: "analyze_batch_urls",
  description: "Analyze multiple URLs and generate coverage matrix",
  inputSchema: {
    type: "object",
    properties: {
      urls: {
        type: "array",
        items: { type: "string" },
        minItems: 2,
        maxItems: 20,
        description: "Array of URLs to analyze (2-20 URLs)"
      },
      depth: {
        type: "string",
        enum: ["quick", "standard"],
        default: "quick",
        description: "Analysis depth per URL"
      }
    },
    required: ["urls"]
  }
}
```

### Tool 3: `analyze_sitemap`

**Purpose:** Full site analysis (future enhancement)  
**Mode:** Dashboard + downloadable report

```typescript
{
  name: "analyze_sitemap",
  description: "Analyze entire sitemap for content gaps",
  inputSchema: {
    type: "object",
    properties: {
      sitemap_url: {
        type: "string",
        description: "URL to XML sitemap"
      },
      max_pages: {
        type: "number",
        default: 100,
        maximum: 500,
        description: "Maximum pages to analyze"
      },
      sample_strategy: {
        type: "string",
        enum: ["random", "priority", "all"],
        default: "priority",
        description: "How to select pages if sitemap exceeds max_pages"
      }
    },
    required: ["sitemap_url"]
  }
}
```

---

## Internal Architecture

### Phase 1: Content Acquisition

```typescript
async function fetchContent(url: string): Promise<PageContent> {
  // Use Firecrawl or Supadata for reliable content extraction
  const response = await scrapeUrl(url);
  
  return {
    url,
    title: response.title,
    markdown: response.content,
    wordCount: countWords(response.content),
    extractedAt: new Date()
  };
}
```

### Phase 2: Query Decomposition (Least-to-Most)

```typescript
async function decomposeQueryGraph(
  content: PageContent,
  depth: "quick" | "standard" | "comprehensive"
): Promise<QueryGraph> {
  
  const queryCount = {
    quick: 5,
    standard: 15,
    comprehensive: 30
  }[depth];
  
  const prompt = `
Act as a Senior Information Retrieval Scientist.
Analyze this content and generate a query graph using Query Decomposition principles.

CONTENT:
Title: ${content.title}
Word Count: ${content.wordCount}
Text: ${content.markdown.slice(0, 8000)} [truncated if needed]

TASK:
Generate exactly ${queryCount} queries organized into three tiers:

1. PRE-REQUISITE QUERIES (Foundation knowledge needed before reading)
   - "What is..." questions
   - Background concepts
   - Required context
   
2. CORE QUERIES (Main content answers)
   - "How to..." questions
   - "Why..." questions
   - Direct topic coverage
   
3. FOLLOW-UP QUERIES (Advanced/edge cases)
   - "What about..." questions
   - "How much..." questions
   - Related concerns

DISTRIBUTION:
- Pre-requisite: ${Math.floor(queryCount * 0.2)} queries
- Core: ${Math.floor(queryCount * 0.5)} queries
- Follow-up: ${Math.floor(queryCount * 0.3)} queries

FORMAT:
Return as JSON:
{
  "prerequisite": [
    {"query": "What is X?", "importance": "high|medium|low", "rationale": "why this query matters"}
  ],
  "core": [...],
  "followup": [...]
}

IMPORTANT: Be specific and realistic. These should be actual user queries, not generic.
`;
  
  const response = await callSonnet(prompt);
  return JSON.parse(response);
}
```

### Phase 3: Coverage Assessment (Self-RAG)

```typescript
async function assessCoverage(
  content: PageContent,
  queries: Query[]
): Promise<CoverageResult[]> {
  
  const results: CoverageResult[] = [];
  
  // Process in batches to avoid context overflow
  const batchSize = 5;
  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    
    const prompt = `
Act as an adversarial content critic using Self-RAG principles.

CONTENT:
${content.markdown}

QUERIES TO ASSESS:
${batch.map((q, idx) => `${idx + 1}. "${q.query}"`).join('\n')}

TASK:
For EACH query, determine coverage with STRICT validation:

COVERED (100% confidence):
- Quote EXACT sentence(s) that fully answer the query
- Evidence must be complete and unambiguous
- Example: "The cost is $49/month" → COVERED if this exact info exists

PARTIAL (50-80% confidence):
- Content touches the topic but incomplete
- Example: "We offer affordable pricing" → PARTIAL (no specific cost)
- Quote what exists, explain what's missing

GAP (0% confidence):
- Query is not addressed at all
- No related information found
- Be honest - don't force a match

FORMAT:
Return as JSON array:
[
  {
    "query": "How much does it cost?",
    "status": "covered|partial|gap",
    "confidence": 0-100,
    "evidence": "exact quote from content" or null,
    "evidence_location": "line 45-47" or null,
    "gap_description": "what's missing" or null,
    "recommendation": "specific action to fix"
  }
]

CRITICAL: If you cannot find EXACT evidence, mark as GAP. Don't hallucinate coverage.
`;
    
    const response = await callSonnet(prompt);
    const batchResults = JSON.parse(response);
    results.push(...batchResults);
  }
  
  return results;
}
```

### Phase 4: Gap Analysis & Recommendations

```typescript
async function generateRecommendations(
  content: PageContent,
  queryGraph: QueryGraph,
  coverage: CoverageResult[]
): Promise<GapAnalysisReport> {
  
  const gaps = coverage.filter(c => c.status === 'gap');
  const partial = coverage.filter(c => c.status === 'partial');
  
  // Calculate scores
  const totalQueries = coverage.length;
  const coveredCount = coverage.filter(c => c.status === 'covered').length;
  const coverageScore = Math.round((coveredCount / totalQueries) * 100);
  
  // Prioritize gaps
  const prioritized = prioritizeGaps(gaps, queryGraph);
  
  // Generate specific recommendations
  const recommendations = await generateActionItems(
    content,
    prioritized,
    partial
  );
  
  return {
    url: content.url,
    title: content.title,
    coverageScore,
    queryBreakdown: {
      total: totalQueries,
      covered: coveredCount,
      partial: partial.length,
      gaps: gaps.length
    },
    queryGraph,
    coverageResults: coverage,
    recommendations: recommendations,
    analyzedAt: new Date()
  };
}

function prioritizeGaps(gaps: CoverageResult[], graph: QueryGraph): CoverageResult[] {
  // Priority order:
  // 1. High-importance pre-requisite gaps (readers need foundation)
  // 2. High-importance core gaps (main content missing)
  // 3. High-importance follow-up gaps (edge cases)
  // 4. Medium-importance (any tier)
  // 5. Low-importance (any tier)
  
  return gaps.sort((a, b) => {
    const aQuery = findQueryInGraph(a.query, graph);
    const bQuery = findQueryInGraph(b.query, graph);
    
    const aTier = getTier(aQuery, graph);
    const bTier = getTier(bQuery, graph);
    
    // Tier weights: prerequisite=3, core=2, followup=1
    const tierWeight = { prerequisite: 3, core: 2, followup: 1 };
    const importanceWeight = { high: 3, medium: 2, low: 1 };
    
    const aScore = tierWeight[aTier] * importanceWeight[aQuery.importance];
    const bScore = tierWeight[bTier] * importanceWeight[bQuery.importance];
    
    return bScore - aScore;
  });
}
```

---

## Output Formatting

### Single URL Response (Markdown)

```typescript
function formatSingleUrlReport(report: GapAnalysisReport): string {
  return `
## Query Coverage Analysis

**URL:** ${report.url}
**Title:** ${report.title}
**Coverage Score:** ${report.coverageScore}/100
**Analysis Date:** ${report.analyzedAt.toISOString().split('T')[0]}

### Query Graph Breakdown

#### PRE-REQUISITE QUERIES (Foundation)
${formatQuerySection(report.queryGraph.prerequisite, report.coverageResults)}

#### CORE QUERIES (Main Content)
${formatQuerySection(report.queryGraph.core, report.coverageResults)}

#### FOLLOW-UP QUERIES (Advanced)
${formatQuerySection(report.queryGraph.followup, report.coverageResults)}

### Summary Recommendations

${formatRecommendations(report.recommendations)}

---

**Coverage Breakdown:**
- Total Queries Assessed: ${report.queryBreakdown.total}
- Fully Covered: ${report.queryBreakdown.covered} (${Math.round(report.queryBreakdown.covered/report.queryBreakdown.total*100)}%)
- Partially Covered: ${report.queryBreakdown.partial} (${Math.round(report.queryBreakdown.partial/report.queryBreakdown.total*100)}%)
- Gaps Identified: ${report.queryBreakdown.gaps} (${Math.round(report.queryBreakdown.gaps/report.queryBreakdown.total*100)}%)
`.trim();
}

function formatQuerySection(queries: Query[], coverage: CoverageResult[]): string {
  return queries.map(q => {
    const result = coverage.find(c => c.query === q.query);
    const icon = {
      covered: '✅',
      partial: '⚠️',
      gap: '❌'
    }[result.status];
    
    let output = `${icon} "${q.query}" - **${result.status.toUpperCase()}**`;
    
    if (result.status === 'covered') {
      output += ` (${result.confidence}% confidence)\n`;
      output += `   Evidence: "${result.evidence}" (${result.evidence_location})`;
    } else if (result.status === 'partial') {
      output += ` (${result.confidence}% confidence)\n`;
      output += `   Evidence: "${result.evidence}" (${result.evidence_location})\n`;
      output += `   Missing: ${result.gap_description}\n`;
      output += `   Recommendation: ${result.recommendation}`;
    } else {
      output += `\n`;
      output += `   Recommendation: ${result.recommendation}\n`;
      output += `   Priority: ${q.importance.toUpperCase()}`;
    }
    
    return output;
  }).join('\n\n');
}
```

---

## Technology Stack

### Required Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest",
    "supadata": "latest",  // Or firecrawl-mcp for scraping
    "zod": "latest",       // Input validation
    "typescript": "latest"
  }
}
```

### External Services Needed

1. **Content Fetching:** Supadata or Firecrawl (already have access)
2. **LLM Reasoning:** Sonnet 4.5 (via Anthropic API or local if available)
3. **No embedding model needed** (Self-RAG uses text-based validation)

---

## Performance Considerations

### Token Usage Estimates

**Single URL (Standard Depth):**
- Content fetch: ~2K tokens (input)
- Query decomposition: ~3K tokens (input + output)
- Coverage assessment (15 queries in 3 batches): ~12K tokens total
- Recommendations: ~2K tokens
- **Total: ~19K tokens per URL**

**Batch (10 URLs, Quick Depth):**
- ~5K tokens per URL (quick mode)
- **Total: ~50K tokens**

**Conclusion:** Single URL analysis is very feasible within Claude Desktop's context. Batch mode might need pagination or streaming.

### Processing Time

**Single URL:** ~20-30 seconds (3-4 LLM calls)  
**Batch (10 URLs):** ~3-5 minutes (parallel processing possible)  
**Sitemap (100 URLs):** ~15-20 minutes (needs progress updates)

---

## Error Handling

### Common Failure Points

1. **Content fetch fails** → Return error with helpful message
2. **URL is paywalled** → Explain limitation, suggest copy-paste
3. **Content is too short** → "Insufficient content for analysis (minimum 500 words)"
4. **JSON parsing fails** → Retry with clarified prompt
5. **Query generation is generic** → Re-prompt with specificity requirement

### Graceful Degradation

If advanced techniques fail, fall back to simpler approach:
1. Try full analysis (decomposition + Self-RAG)
2. If fails → Try simple query generation
3. If fails → Return basic content statistics

---

## Testing Strategy

### Phase 1: Single URL (MVP)
1. Test on your own articles (known content)
2. Verify query quality (are they realistic?)
3. Validate coverage assessment (check evidence quotes)
4. Iterate on prompts until output is reliable

### Phase 2: Batch Processing
1. Test with 5 related articles
2. Verify aggregate scoring makes sense
3. Check recommendation prioritization

### Phase 3: Integration
1. Test with Content Machine pipeline
2. Verify output can feed into GEO Analyzer
3. Ensure tone analysis integration works

---

## Next Steps

1. ✅ Research complete
2. ✅ Architecture designed
3. **→ Create `fanout-mcp` repository**
4. **→ Implement `analyze_content_gap` tool**
5. **→ Test on real content**
6. **→ Iterate on prompt quality**
7. **→ Add batch processing**
8. **→ Publish as `@houtini/fanout-mcp`**

---

## Success Criteria

**MVP (Single URL Analysis):**
- ✅ Generates realistic, specific queries (not generic)
- ✅ Accurately identifies gaps (no false positives)
- ✅ Provides actionable recommendations (not vague)
- ✅ Completes in <30 seconds per URL

**Production Ready:**
- ✅ Batch processing works reliably
- ✅ Output integrates with Content Machine
- ✅ Prompts are stable (minimal hallucination)
- ✅ Error handling is robust

**Success Metric:** If content writers actually use it to improve their articles, we've succeeded.
