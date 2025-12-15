# Keyword Fan-Out Implementation - Handover Prompt

**Date:** December 15, 2024  
**Status:** Ready for Implementation  
**Estimated Time:** 3-4 hours  

---

## Mission

Enhance the Fan-Out MCP to support **hybrid analysis mode** that combines:
1. **Content-based query inference** (current implementation)
2. **Keyword-based fan-out** (Google's approach from research paper)

This will allow users to optionally provide a target keyword and receive query variants based on Google's methodology, validated against their content.

---

## Critical: Read and Apply Research Paper

**BEFORE implementing anything, you MUST:**

1. **Read this research paper thoroughly:**
   https://arxiv.org/pdf/2210.12084

2. **Understand Google's methodology:**
   - How they generate query variants
   - What types of variants they produce
   - How they use context and attributes
   - Their training methodology
   - Their iterative refinement approach

3. **Apply learnings to our implementation:**
   - Adopt their variant type taxonomy
   - Use their prompt engineering patterns
   - Incorporate contextual signals where feasible
   - Follow their quality assessment approach

4. **Document decisions:**
   - What we adopted from the paper
   - What we adapted for our use case
   - What we deliberately didn't implement (and why)

**Do NOT proceed until you've read and understood the paper.**

---

## Current State

**Repository:** `C:\MCP\fanout-mcp\`  
**Branch:** master  
**Last Commit:** "Add comprehensive technical metrics and interactive visual dashboard"

**Current Tool Signature:**
```typescript
analyze_content_gap({
  url: string,
  depth?: "quick" | "standard" | "comprehensive",
  focus_area?: string
})
```

**Current Flow:**
1. Fetch content from URL
2. Infer likely queries from content (prerequisite/core/follow-up)
3. Assess coverage with Self-RAG
4. Generate report with gaps and recommendations

---

## Target Implementation

### Enhanced Tool Signature

```typescript
analyze_content_gap({
  url: string,
  depth?: "quick" | "standard" | "comprehensive",
  focus_area?: string,
  target_keyword?: string,           // NEW: Enable fan-out mode
  fan_out_types?: string[],          // NEW: Which variant types
  include_context?: boolean          // NEW: Add contextual signals
})
```

### New Analysis Modes

**Mode 1: Content-Only (Current)**
```bash
analyze_content_gap({ url: "..." })
# Infers queries from content only
```

**Mode 2: Hybrid (New)**
```bash
analyze_content_gap({ 
  url: "...",
  target_keyword: "sim racing wheels"
})
# Content inference + keyword fan-out variants
```

**Mode 3: Keyword-Only (New)**
```bash
analyze_content_gap({
  url: "...",
  target_keyword: "sim racing wheels",
  fan_out_only: true  // Skip content inference
})
# Only keyword fan-out variants
```

---

## Implementation Tasks

### Phase 1: Research Integration (CRITICAL)

**Task 1.1: Paper Analysis**
- [ ] Read https://arxiv.org/pdf/2210.12084 completely
- [ ] Document Google's 8 variant types with examples
- [ ] Understand their attribute system (user, temporal, task)
- [ ] Note their iterative refinement approach
- [ ] Identify applicable techniques for our use case

**Task 1.2: Design Document**
Create `research/google-fanout-adaptation.md`:
- What we're adopting from the paper
- What we're adapting (and how)
- What we're not implementing (and why)
- How their approach fits our content analysis use case

**Deliverable:** Design document approved before coding

---

### Phase 2: Type System Enhancement

**File:** `src/types.ts`

**Add these types based on paper analysis:**

```typescript
// Based on Google's taxonomy from the paper
export type FanOutVariantType = 
  | "equivalent"      // Alternative phrasings (paper section X.X)
  | "specification"   // More specific versions (paper section X.X)
  | "generalization"  // Broader versions (paper section X.X)
  | "followUp"        // Logical next questions (paper section X.X)
  | "comparison"      // Versus/alternatives (adapted from paper)
  | "clarification"   // Understanding questions (paper section X.X)
  | "relatedAspects"  // Connected topics (adapted from paper)
  | "temporal";       // Time-specific versions (paper section X.X)

// Enhanced query item with fan-out metadata
export interface FanOutQuery extends QueryItem {
  variantType: FanOutVariantType;
  sourceKeyword: string;
  generationMethod: "fan-out" | "content-inference" | "hybrid";
  contextSignals?: {
    temporal?: string;     // From paper: time of day, season, etc.
    intent?: string;       // From paper: shopping, research, etc.
    specificity?: number;  // From paper: 0-1 scale
  };
}

// Enhanced query graph supporting both methods
export interface EnhancedQueryGraph extends QueryGraph {
  fanOutVariants?: {
    [key in FanOutVariantType]?: FanOutQuery[];
  };
  targetKeyword?: string;
  generationMetadata?: {
    contentInferenceTime: number;
    fanOutTime: number;
    totalVariants: number;
    variantDistribution: Record<FanOutVariantType, number>;
  };
}

// Context signals from paper
export interface AnalysisContext {
  temporal?: {
    currentDate?: string;
    season?: string;
    proximity_to_events?: string[];
  };
  intent?: "shopping" | "research" | "navigation" | "entertainment";
  specificity_preference?: "broad" | "specific" | "balanced";
}
```

**Task 2.1:**
- [ ] Extend `src/types.ts` with new interfaces
- [ ] Ensure backward compatibility (old code still works)
- [ ] Add JSDoc comments referencing paper sections

---

### Phase 3: Keyword Fan-Out Service

**File:** `src/services/keyword-fanout.ts` (NEW)

**Implementation Notes:**
- Use Claude Sonnet 4.5 for variant generation
- Apply prompt patterns from the paper
- Use `<thinking>` tags to prevent JSON parsing errors
- Include few-shot examples in prompts
- Generate 3-5 variants per type (configurable)

**Key Method:**
```typescript
async generateVariants(
  keyword: string,
  content: ContentData,
  variantTypes: FanOutVariantType[],
  context?: AnalysisContext
): Promise<FanOutQuery[]>
```

**Prompt Engineering (Based on Paper):**

The prompt should:
1. Explain each variant type with paper's definitions
2. Provide 2-3 examples per type from the paper
3. Emphasize realistic, user-typed queries
4. Include context signals (temporal, intent) if provided
5. Request JSON output with specific structure
6. Use `<thinking>` tags for reasoning

**Example Prompt Structure:**
```
<thinking>
You are generating query variants following Google's Query Fan-Out methodology 
from the paper "Training Query Fan-Out Models with Generative Neural Networks"
(https://arxiv.org/pdf/2210.12084).

Target Keyword: "{keyword}"
Content Context: {content summary}
{Optional: temporal/intent context}

Generate variants for these types:

1. EQUIVALENT (Paper Section X.X: "queries with the same intent")
   Definition: {from paper}
   Examples from paper:
   - "did roger moore drive an aston martin in the persuaders" 
     → "what car did roger moore drive in the persuaders"
   
   Your task: Generate 3-5 equivalent variants of "{keyword}"

2. SPECIFICATION (Paper Section X.X: "more specific versions")
   Definition: {from paper}
   Examples: {from paper}
   Your task: Generate 3-5 specification variants...

[Continue for all requested variant types]

Quality criteria from paper:
- Queries must be realistic (users would actually type them)
- Must maintain semantic relationship to source keyword
- Must vary in specificity and approach
- Must be answerable by the content (when checking coverage)

Return ONLY valid JSON:
{
  "equivalent": ["variant1", "variant2", "variant3"],
  "specification": ["variant1", "variant2", "variant3"],
  ...
}
</thinking>

Generate the variants now:
```

**Task 3.1:**
- [ ] Create `src/services/keyword-fanout.ts`
- [ ] Implement `KeywordFanOut` class with paper-based prompts
- [ ] Add method `generateVariants()`
- [ ] Add method `parseVariants()` with error handling
- [ ] Add method `validateVariants()` (check quality)
- [ ] Include extensive JSDoc with paper references

**Task 3.2: Testing**
- [ ] Test with simple keywords ("shoes", "recipes")
- [ ] Test with complex keywords ("direct drive sim racing wheels")
- [ ] Test with ambiguous keywords ("python", "java")
- [ ] Verify variant quality matches paper's criteria

---

### Phase 4: Enhanced Tool Integration

**File:** `src/tools/analyze-content-gap.ts`

**Modifications:**

1. **Update Schema:**
```typescript
const AnalyzeContentGapSchema = z.object({
  url: z.string().url(),
  depth: z.enum(["quick", "standard", "comprehensive"]).optional().default("standard"),
  focus_area: z.string().optional(),
  
  // NEW: Keyword fan-out parameters
  target_keyword: z.string().optional().describe(
    "Enable keyword fan-out mode: generates query variants based on Google's methodology"
  ),
  fan_out_types: z.array(z.enum([
    "equivalent", "specification", "generalization", "followUp",
    "comparison", "clarification", "relatedAspects", "temporal"
  ])).optional().describe(
    "Which variant types to generate (default: equivalent, specification, followUp, comparison, clarification)"
  ),
  fan_out_only: z.boolean().optional().default(false).describe(
    "Skip content inference, only generate keyword variants"
  ),
  
  // NEW: Context parameters (from paper)
  context: z.object({
    temporal: z.object({
      currentDate: z.string().optional(),
      season: z.string().optional()
    }).optional(),
    intent: z.enum(["shopping", "research", "navigation", "entertainment"]).optional(),
    specificity_preference: z.enum(["broad", "specific", "balanced"]).optional()
  }).optional()
});
```

2. **Update Main Function:**
```typescript
export async function analyzeContentGap(
  args: z.infer<typeof AnalyzeContentGapSchema>
): Promise<string> {
  const startTime = Date.now();
  
  // Phase 1: Content Fetching
  const content = await fetcher.fetchContent(args.url);
  
  // Phase 2: Query Generation
  let contentQueries = [];
  let fanOutQueries: FanOutQuery[] = [];
  
  if (!args.fan_out_only) {
    // Standard content-based inference
    contentQueries = await decomposer.decomposeQueries(
      content,
      args.depth,
      args.focus_area
    );
  }
  
  if (args.target_keyword) {
    // NEW: Keyword fan-out
    const fanOut = new KeywordFanOut(apiKey);
    const types = args.fan_out_types || [
      "equivalent", "specification", "followUp", 
      "comparison", "clarification"
    ];
    
    fanOutQueries = await fanOut.generateVariants(
      args.target_keyword,
      content,
      types as FanOutVariantType[],
      args.context
    );
  }
  
  // Phase 3: Combine and Categorize
  const combinedGraph = this.mergeQueryGraphs(
    contentQueries,
    fanOutQueries,
    args.target_keyword
  );
  
  // Phase 4: Coverage Assessment (all queries)
  const assessments = await assessor.assessCoverage(content, combinedGraph);
  
  // Phase 5: Generate Enhanced Report
  const report = formatter.formatEnhancedReport(
    content,
    combinedGraph,
    assessments,
    timings,
    {
      mode: args.fan_out_only ? "keyword-only" : 
            args.target_keyword ? "hybrid" : "content-only",
      targetKeyword: args.target_keyword,
      variantCounts: this.countVariantsByType(fanOutQueries)
    }
  );
  
  return report;
}

private mergeQueryGraphs(
  contentQueries: QueryGraph,
  fanOutQueries: FanOutQuery[],
  keyword?: string
): EnhancedQueryGraph {
  // Logic to intelligently merge both query sets
  // Distribute fan-out variants into appropriate tiers
  // Avoid duplicates
  // Maintain both sources for reporting
}
```

**Task 4.1:**
- [ ] Update `src/tools/analyze-content-gap.ts`
- [ ] Implement schema changes
- [ ] Add keyword fan-out integration
- [ ] Implement `mergeQueryGraphs()` method
- [ ] Handle all three modes (content-only, hybrid, keyword-only)

---

### Phase 5: Enhanced Report Formatter

**File:** `src/services/report-formatter.ts`

**New Method:**
```typescript
formatEnhancedReport(
  content: ContentData,
  queryGraph: EnhancedQueryGraph,
  assessments: CoverageAssessment[],
  timings: ProcessingTimings,
  fanOutMetadata?: FanOutMetadata
): string
```

**Enhanced Report Structure:**

```markdown
## Query Coverage Analysis

**URL:** {url}
**Title:** {title}
**Coverage Score:** {score}/100
**Analysis Mode:** {content-only | hybrid | keyword-only}
{if keyword: **Target Keyword:** {keyword}}

### Analysis Summary

**Total Queries Analyzed:** {total}
- Content-inferred: {count} queries
{if keyword:
- Keyword fan-out: {count} queries ({by variant type breakdown})
}

**Coverage by Source:**
- Content-inferred: {percentage}%
{if keyword:
- Keyword fan-out: {percentage}%
}

### Content-Inferred Queries
{Standard query graph output}

{if keyword:
### Keyword Fan-Out Analysis

**Source Keyword:** "{keyword}"
**Variant Types Generated:** {list types}

#### EQUIVALENT VARIANTS (Paper: Alternative Phrasings)
✅ "variant 1" - COVERED (90%)
   Evidence: "..."
⚠️ "variant 2" - PARTIAL (60%)
   Gap: ...

#### SPECIFICATION VARIANTS (Paper: More Specific)
...

#### COMPARISON VARIANTS
...

### Fan-Out Quality Metrics

**Variant Generation:**
- Total variants: {count}
- Avg per type: {avg}
- Generation time: {time}

**Coverage Analysis:**
- High coverage types: {types with >80%}
- Low coverage types: {types with <50%}
- Suggested priorities: {which types to improve}
}

### Technical Metrics
{Existing technical JSON}
```

**Task 5.1:**
- [ ] Create `formatEnhancedReport()` method
- [ ] Support all three analysis modes
- [ ] Include fan-out quality metrics
- [ ] Update technical metrics JSON to include fan-out timing
- [ ] Maintain backward compatibility (old reports still work)

---

### Phase 6: Artifact Instruction Updates

**File:** `src/tools/analyze-content-gap.ts` (artifact instruction section)

**Enhanced Instruction:**

```typescript
const instructionPrefix = `[INSTRUCTION TO CLAUDE: Please create an interactive HTML artifact to visualize this content gap analysis. 

{if keyword mode:
**HYBRID ANALYSIS MODE DETECTED**

This analysis combines content-based query inference with keyword fan-out variants. 
Display TWO main sections after the header:

1. **Content-Inferred Queries** (standard 3-tier layout)
2. **Keyword Fan-Out Analysis** (new section)

For the Keyword Fan-Out section:
- Show source keyword prominently
- Display variants grouped by type (matching paper taxonomy)
- Use different color scheme from content queries (e.g., teal/cyan gradient)
- Include variant type descriptions from Google's paper
- Show coverage distribution by variant type
- Add collapsible "About Fan-Out Method" section explaining Google's approach
}

Standard requirements:
- Modern shadcn-inspired design
- Color-coded sections (blue/purple/orange for tiers)
- Expandable query cards
- Technical analysis section at bottom
- Mobile-responsive

{if keyword mode:
Additional requirements:
- Clear visual separation between content vs keyword queries
- Fan-out variant type legend/glossary
- Coverage comparison: content queries vs keyword variants
- Actionable recommendations specific to keyword optimization
}

Make it visually appealing with good UX and smooth transitions]

---
`;
```

**Task 6.1:**
- [ ] Update artifact instruction for hybrid mode
- [ ] Design mockup for keyword section UI
- [ ] Test artifact creation with keyword mode

---

### Phase 7: Documentation

**Task 7.1: Update README.md**

Add sections:
- **Keyword Fan-Out Mode** (new feature)
- **Analysis Modes** (content-only, hybrid, keyword-only)
- **Based on Research** (link to paper)
- **Example Commands** for each mode
- **Use Cases** (when to use each mode)

**Task 7.2: Create Research Documentation**

File: `research/google-fanout-adaptation.md`

Content:
```markdown
# Google's Query Fan-Out: Research Adaptation

## Source Paper
Training Query Fan-Out Models with Generative Neural Networks
https://arxiv.org/pdf/2210.12084

## What We Adopted

### Variant Type Taxonomy
[Explain 8 types from paper and how we implement them]

### Prompt Engineering Patterns
[Show examples of how paper's examples inform our prompts]

### Quality Criteria
[Paper's criteria for good variants]

## What We Adapted

### For Content Analysis Use Case
[How we modified their approach for our specific use case]

### Simplifications
[What we simplified and why]

## What We Didn't Implement

### Neural Network Training
**Paper Approach:** Custom trained models
**Our Approach:** LLM prompting with Claude Sonnet 4.5
**Reasoning:** 
- Don't need training data
- LLM provides flexibility
- Faster iteration

### Iterative Refinement (Control Model)
**Paper Approach:** Critic model with up to 20 iterations
**Our Approach:** Single-pass generation
**Reasoning:**
- Simpler implementation
- Faster analysis
- Our use case doesn't need iterative search

### User Attributes System
**Paper Approach:** Rich user profiling (location, task, demographics)
**Our Approach:** Optional context parameters
**Reasoning:**
- Privacy concerns
- Content analysis focus vs user search
- Simpler UX

## Implementation Decisions

### Why Claude Sonnet 4.5
[Reasoning for model choice]

### Why These Variant Types
[Why we chose these specific types]

### Integration Strategy
[How fan-out complements content inference]

## Future Enhancements

### Possible Additions
- Iterative refinement
- Context prediction
- Cross-variant verification

### Research Opportunities
- Compare LLM vs trained model performance
- Optimal variant count per type
- Context signal effectiveness
```

**Task 7.3: Update TESTING-HANDOVER.md**

Add test scenarios for:
- Keyword-only mode
- Hybrid mode with various keywords
- Context parameter testing
- Variant quality validation

---

### Phase 8: Testing & Validation

**Test Suite:**

**Test 8.1: Variant Quality**
```bash
# Test with paper's examples
target_keyword: "did roger moore drive an aston martin in the persuaders"
Expected: Should generate appropriate equivalents like paper shows

# Test with our domain
target_keyword: "sim racing wheels"
Expected: Realistic, specific variants across all types

# Test edge cases
- Single word keywords
- Multi-word technical terms
- Ambiguous terms
- Brand names
```

**Test 8.2: Mode Switching**
```bash
# Same URL, three modes - compare results
1. Content-only (baseline)
2. Hybrid with keyword (combined)
3. Keyword-only (fan-out focus)

Validate:
- No duplicate queries across modes
- Proper categorization
- Coverage assessment accuracy
```

**Test 8.3: Context Parameters**
```bash
# Test temporal context
context: { temporal: { season: "winter", currentDate: "2024-12-15" }}
Expected: Should influence temporal variant generation

# Test intent context
context: { intent: "shopping" }
Expected: Should emphasize product/purchase variants
```

**Task 8.1:**
- [ ] Create test script `test/keyword-fanout.test.ts`
- [ ] Implement all test scenarios
- [ ] Document test results
- [ ] Fix any issues found

---

## Quality Gates

**Before Considering Complete:**

- [ ] Paper thoroughly read and understood
- [ ] Design document created and approved
- [ ] All 8 variant types implemented per paper
- [ ] Prompts reference paper methodology
- [ ] Code includes paper section references
- [ ] All three modes work correctly
- [ ] Tests pass for all scenarios
- [ ] README updated with examples
- [ ] Research documentation complete
- [ ] Backward compatibility maintained
- [ ] No regressions in existing functionality

---

## Success Criteria

**Functional:**
1. Can analyze with content-only (existing functionality preserved)
2. Can analyze with keyword to get fan-out variants
3. Can analyze with keyword-only (skip content inference)
4. Variants match paper's quality criteria
5. Coverage assessment works for both query types
6. Report clearly distinguishes sources

**Technical:**
1. Types properly extended
2. No breaking changes
3. Error handling for all new code paths
4. Timing tracked separately for fan-out
5. Technical metrics include fan-out stats

**Documentation:**
1. README explains all modes with examples
2. Research doc links implementation to paper
3. Code comments reference paper sections
4. Testing guide covers new functionality

---

## Example Usage After Implementation

```typescript
// Mode 1: Content-only (unchanged)
const result1 = await analyzeContentGap({
  url: "https://example.com/article",
  depth: "standard"
});

// Mode 2: Hybrid (new)
const result2 = await analyzeContentGap({
  url: "https://example.com/article",
  target_keyword: "sim racing wheels",
  fan_out_types: ["equivalent", "specification", "comparison"]
});

// Mode 3: Keyword-only (new)
const result3 = await analyzeContentGap({
  url: "https://example.com/article",
  target_keyword: "sim racing wheels",
  fan_out_only: true
});

// Mode 4: Hybrid with context (advanced)
const result4 = await analyzeContentGap({
  url: "https://example.com/article",
  target_keyword: "winter sim racing setup",
  context: {
    temporal: { season: "winter", currentDate: "2024-12-15" },
    intent: "shopping",
    specificity_preference: "specific"
  }
});
```

---

## Gotchas & Important Notes

**From Paper Analysis:**
- The paper uses trained neural networks; we use LLM prompting (document why this is okay)
- Paper's examples are gold standard - use them in prompts
- Variant quality is crucial - better 3 good variants than 10 mediocre ones
- Context signals matter - implement even if simplified

**Implementation Notes:**
- Always use `<thinking>` tags in prompts to prevent JSON parsing errors
- Fan-out timing should be tracked separately from content inference
- Maintain backward compatibility - old tool calls must still work
- Test with real URLs from simracingcockpit.gg domain

**Testing Notes:**
- Compare our variants to paper's examples for quality
- Ensure no duplicate queries between content and fan-out
- Validate that fan-out variants are actually answerable by content
- Check coverage assessment works correctly for both query types

---

## Commit Strategy

**Commit 1:** Types and interfaces
```
Add keyword fan-out type system based on Google's research paper

- Extended QueryItem with FanOutQuery interface
- Added 8 variant types from paper taxonomy
- Created EnhancedQueryGraph for hybrid mode
- Added AnalysisContext for optional context signals
- Includes JSDoc references to paper sections
```

**Commit 2:** KeywordFanOut service
```
Implement keyword fan-out variant generation service

- Created KeywordFanOut class with paper-based prompts
- Implements generateVariants() for all 8 types
- Uses <thinking> tags for reliable JSON parsing
- Includes paper examples in prompt templates
- Validates variant quality against paper criteria
```

**Commit 3:** Tool integration
```
Integrate keyword fan-out into main analysis tool

- Extended tool schema with target_keyword parameter
- Added fan_out_types and context parameters
- Implemented three analysis modes (content/hybrid/keyword-only)
- Added mergeQueryGraphs() for intelligent combination
- Maintains backward compatibility
```

**Commit 4:** Enhanced reporting
```
Add enhanced report format for hybrid analysis mode

- Created formatEnhancedReport() method
- Separate sections for content vs keyword queries
- Fan-out quality metrics in technical section
- Coverage comparison by query source
- Updated artifact instruction for hybrid mode
```

**Commit 5:** Documentation
```
Document keyword fan-out feature with research references

- Updated README with all three analysis modes
- Created research/google-fanout-adaptation.md
- Added paper reference and implementation decisions
- Included example commands for each mode
- Updated testing documentation
```

---

## Files to Create/Modify

**New Files:**
- `src/services/keyword-fanout.ts`
- `research/google-fanout-adaptation.md`
- `test/keyword-fanout.test.ts`

**Modified Files:**
- `src/types.ts` (extend interfaces)
- `src/tools/analyze-content-gap.ts` (integrate fan-out)
- `src/services/report-formatter.ts` (enhanced reports)
- `README.md` (document new feature)
- `TESTING-HANDOVER.md` (add test scenarios)
- `package.json` (if version bump needed)

---

## Working Directory

**Location:** `C:\MCP\fanout-mcp\`  
**Branch:** Create new branch `feature/keyword-fanout`  
**Merge to:** `master` after testing complete

---

## Final Checklist

- [ ] Read paper: https://arxiv.org/pdf/2210.12084
- [ ] Create design document with paper analysis
- [ ] Implement type extensions
- [ ] Create KeywordFanOut service
- [ ] Integrate into main tool
- [ ] Update report formatter
- [ ] Update artifact instructions
- [ ] Write tests
- [ ] Update README
- [ ] Create research documentation
- [ ] Test all three modes
- [ ] Verify backward compatibility
- [ ] Commit with clear messages
- [ ] Update this handover as COMPLETE

---

**END OF HANDOVER PROMPT**

When you pick this up, start by reading the paper thoroughly, then create the design document before writing any code. This ensures our implementation is properly grounded in the research.
