# Google's Query Fan-Out: Research Adaptation

**Date:** December 15, 2024  
**Status:** Design Document - Ready for Implementation  
**Research Source:** Google's query variant generation methodology (Patent US 11663201 B2, related research)

---

## Executive Summary

This document outlines how we're adapting Google's query fan-out methodology for our content gap analysis use case. Google's approach uses trained generative models to expand user queries into multiple variants, leveraging contextual signals and iterative refinement. We're implementing a similar system using Claude Sonnet 4.5 via LLM prompting rather than neural network training.

**Key Decision:** Use LLM prompting with Claude Sonnet 4.5 instead of trained models for flexibility, faster iteration, and avoiding training data requirements.

---

## Source Research: Google's Methodology

### Core Approach

Google's system generates query variants through a "multitask model" that can produce different types of variants on demand. The system:

1. Takes an original query as input
2. Incorporates contextual signals (temporal, user profile, intent)
3. Generates multiple variant types simultaneously
4. Scores variants based on relevance and answer-finding capability
5. Uses iterative refinement with feedback loops

### Technical Architecture

**Input Features:**
- Original query text
- Context vector (temporal, user attributes, dialog history)
- Type value input (specifies which variant type to generate)
- Prior variants and search responses (for iterative refinement)

**Output:**
- Multiple query variants with response scores
- Grading based on answer retrieval success
- Filtering of misleading/irrelevant variants

---

## Query Variant Types: Google's Taxonomy

### The 8 Core Types

Based on Google's research and our analysis, we're implementing these variant types:

#### 1. **Follow-up Queries**
**Definition:** Logical next questions a user might ask after the original query.

**Google Example:**  
- Original: "What are the best protein powders for runners?"
- Follow-up: "best protein powder for post-run recovery"

**Our Adaptation:** Generate 3-5 follow-up queries that assume the user has consumed the content and wants to go deeper or explore related aspects.

---

#### 2. **Generalization Queries**
**Definition:** Broader versions of the original query that encompass the specific query within a larger context.

**Our Adaptation:** Create variants that zoom out from the specific keyword to related broader topics.

**Example:**
- Original: "direct drive sim racing wheels"
- Generalization: "sim racing wheels comparison", "force feedback racing wheels"

---

#### 3. **Specification Queries**
**Definition:** More detailed or specific versions that drill down into particular aspects.

**Our Adaptation:** Add qualifiers, brands, use cases, or technical details to make queries more specific.

**Example:**
- Original: "sim racing wheels"
- Specification: "Fanatec DD Pro wheel review", "best sim racing wheel for Formula 1", "direct drive vs belt driven racing wheels"

---

#### 4. **Entailment/Equivalent Queries**
**Definition:** Alternative phrasings with the same intent; logically implied questions.

**Google calls these:** "Canonicalization Queries" - standardized forms

**Our Adaptation:** Rephrase the keyword in different ways whilst maintaining semantic meaning.

**Example:**
- Original: "sim racing cockpit"
- Equivalent: "racing simulator rig", "sim rig setup", "racing seat and wheel stand"

---

#### 5. **Comparison Queries**
**Definition:** Queries seeking to compare options, alternatives, or competing solutions.

**Our Adaptation:** Generate "vs" queries, "best of" queries, and alternative exploration queries.

**Example:**
- Original: "sim racing wheels"
- Comparison: "Fanatec vs Thrustmaster wheels", "direct drive vs gear driven sim wheels", "best budget sim racing wheel"

---

#### 6. **Clarification Queries**
**Definition:** Questions seeking to understand concepts, definitions, or mechanisms.

**Our Adaptation:** "What is...", "How does...", "Why..." variants that address understanding gaps.

**Example:**
- Original: "direct drive sim racing wheels"
- Clarification: "what is direct drive technology", "how do direct drive wheels work", "why are direct drive wheels better"

---

#### 7. **Related Aspects Queries**
**Definition:** Connected topics or latent sub-intents not explicitly stated in the original query.

**Google Example:** For "Bluetooth headphones with comfortable over-ear design and long-lasting battery", fan-out recognizes facets like design, technology, then generates sub-queries about user reviews, expert reviews, comparisons.

**Our Adaptation:** Identify implicit facets and generate queries exploring those aspects.

**Example:**
- Original: "sim racing wheels"
- Related Aspects: "sim racing wheel setup guide", "best pedals for sim racing", "wheel compatibility with PC games"

---

#### 8. **Temporal Queries**
**Definition:** Time-specific versions incorporating seasonal, current, or time-bound context.

**Our Adaptation:** When temporal context is provided, generate variants with time qualifiers.

**Example:**
- Original: "sim racing wheels"
- With context {season: "winter", year: "2024"}: "best sim racing wheels 2024", "sim racing black friday deals", "new sim racing wheels released in 2024"

---

## Context Signals and Attributes

### What Google Uses

**Temporal Context:**
- Time of query
- Season
- Proximity to events

**User-Specific Context:**
- Profile data
- Past queries
- Dialog history
- User attributes

**Task/Intent Context:**
- Dialog intent classification
- Query intent (research, commercial, comparison)
- Entity and variable identification

**Environmental Context:**
- Ambient noise
- Device type
- Input modality (spoken/typed)

### What We're Implementing

**Phase 1 (Immediate):**
```typescript
interface AnalysisContext {
  temporal?: {
    currentDate?: string;
    season?: string;
  };
  intent?: "shopping" | "research" | "navigation" | "entertainment";
  specificity_preference?: "broad" | "specific" | "balanced";
}
```

**Why Limited Context?**
1. Privacy - we don't have user profile data
2. Simplicity - content analysis doesn't need full user modeling
3. Extensibility - structure allows future expansion

**Phase 2 (Future Enhancement):**
- User location for regional queries
- Content language detection
- Topic domain classification

---

## Quality Criteria for Variants

### Google's Criteria

1. **Relevance:** Variants must relate to original intent
2. **Answer-Finding:** Must lead to retrievable answers
3. **Diversity:** Cover different facets without redundancy
4. **Factual Accuracy:** No hallucinated or misleading queries
5. **Response Scores:** Each variant gets scored for quality

### Our Implementation

**Validation Methods:**

1. **Relevance Check (Prompt-Level):**
   - Instruct Claude to maintain semantic relationship
   - Request realistic, user-typed queries only
   - Emphasize connection to source keyword

2. **Coverage Check (Self-RAG):**
   - Test each variant against actual content
   - Assess if content can answer the variant
   - Filter out variants with no content support

3. **Diversity Check (Post-Processing):**
   - Deduplicate near-identical variants
   - Ensure distribution across variant types
   - Check for complementary rather than overlapping coverage

4. **Quality Metrics:**
```typescript
interface VariantQuality {
  totalVariants: number;
  variantDistribution: Record<FanOutVariantType, number>;
  avgCoverageScore: number;
  uniquenessRatio: number;  // % of non-duplicate variants
  answerabilityRate: number; // % that content can answer
}
```

---

## Iterative Refinement Approach

### Google's Method

**Actor-Critic Model:**
- Actor (generative model) creates variants
- Critic (evaluation system) scores them
- Feedback from search responses informs next iteration
- Up to 20 iterations with reinforcement learning

**Feedback Loop:**
- Prior variants inform new generation
- Search system responses guide refinement
- User interactions update context vector

### Our Adaptation

**Single-Pass Generation (Phase 1):**

We're starting with single-pass generation for these reasons:

1. **Speed:** Content analysis needs fast results
2. **Simplicity:** Easier to implement and debug
3. **Cost:** Multiple LLM calls expensive at scale
4. **Use Case:** Our analysis doesn't require search-engine-level precision

**Quality Control Without Iteration:**
- Comprehensive prompt with examples
- Few-shot learning within prompt
- Post-generation validation
- Self-RAG coverage assessment

**Future Enhancement (Phase 2):**

If quality isn't sufficient, we can add:

```typescript
async generateVariantsIterative(
  keyword: string,
  content: ContentData,
  maxIterations: number = 3
): Promise<FanOutQuery[]> {
  let variants: FanOutQuery[] = [];
  let feedback: string = "";
  
  for (let i = 0; i < maxIterations; i++) {
    const newVariants = await this.generateVariants(
      keyword,
      content,
      variantTypes,
      context,
      feedback  // Include feedback from previous iteration
    );
    
    variants = this.mergeAndDeduplicate(variants, newVariants);
    feedback = await this.assessQuality(variants, content);
    
    if (this.qualityThresholdMet(variants)) break;
  }
  
  return variants;
}
```

---

## Prompt Engineering Methodology

### Structure Based on Google's Approach

**Our Prompt Template:**

```typescript
const VARIANT_GENERATION_PROMPT = `
<thinking>
You are implementing Google's Query Fan-Out methodology for content gap analysis.

CONTEXT:
- Target Keyword: "{keyword}"
- Content Topic: {contentSummary}
- Content Type: {article/guide/product page}
${temporal context if provided}
${intent context if provided}

YOUR TASK:
Generate query variants that real users would actually type when searching for information 
related to "{keyword}". Each variant must maintain semantic relationship to the keyword.

VARIANT TYPES TO GENERATE:

1. FOLLOW-UP QUERIES (3-5 variants)
Definition: Logical next questions after learning about {keyword}
Quality Criteria:
- Assumes user has basic knowledge from original query
- Explores deeper aspects or related topics
- Natural progression of learning/research

Examples from your domain:
- [Domain-specific few-shot examples]

Your follow-up variants:

2. SPECIFICATION QUERIES (3-5 variants)
Definition: More specific/detailed versions with added qualifiers
Quality Criteria:
- Add brands, models, use cases, or technical details
- Must be answerable with specific information
- Drill down into particular aspects

Examples:
- [Domain-specific few-shot examples]

Your specification variants:

[Continue for all 8 types...]

QUALITY REQUIREMENTS:
✅ Realistic (users would actually type these)
✅ Semantically related to "{keyword}"
✅ Answerable by content (when checking coverage)
✅ Diverse (different angles, not repetitive)
✅ No hallucinated brands/products
❌ No marketing jargon
❌ No overly complex queries
❌ No irrelevant tangents

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no explanation):
{
  "followUp": ["query1", "query2", "query3"],
  "specification": ["query1", "query2", "query3"],
  "generalization": ["query1", "query2"],
  "equivalent": ["query1", "query2", "query3"],
  "comparison": ["query1", "query2", "query3"],
  "clarification": ["query1", "query2"],
  "relatedAspects": ["query1", "query2", "query3"],
  "temporal": ["query1", "query2"]  // Only if temporal context provided
}
</thinking>

Generate the variants now:
`;
```

### Key Prompt Engineering Principles

**1. Few-Shot Examples:**
- Provide 2-3 examples per variant type
- Use domain-relevant examples (sim racing, in our case)
- Show both good and bad examples with explanation

**2. Explicit Quality Criteria:**
- List requirements inline for each type
- Reference Google's methodology where relevant
- Use checkmarks/crosses for visual clarity

**3. Output Structure Enforcement:**
- Request specific JSON format
- Use `<thinking>` tags to prevent JSON pollution
- Specify "no markdown, no explanation"

**4. Context Incorporation:**
- Inject temporal/intent context naturally
- Make context optional (fallback to generic if missing)
- Show how context influences generation

**5. Semantic Constraints:**
- Emphasize "realistic user queries"
- Require semantic relationship to source
- Prohibit hallucinations and jargon

---

## Implementation Decisions

### Why Claude Sonnet 4.5?

**Advantages:**
1. **Strong reasoning:** Can understand complex variant type definitions
2. **Few-shot learning:** Excellent at following examples
3. **JSON reliability:** With `<thinking>` tags, produces clean JSON
4. **Context window:** Can handle extensive prompt with examples
5. **Speed:** Fast enough for real-time analysis

**Comparison to Google's Approach:**
- Google: Custom-trained neural networks
- Us: General-purpose LLM with prompting
- Trade-off: We sacrifice some precision for flexibility and speed

### Why Skip Neural Network Training?

**Reasons:**
1. **No Training Data:** Don't have Google's query logs
2. **Flexibility:** LLM can adapt to new domains instantly
3. **Iteration Speed:** Prompt changes vs model retraining
4. **Resource Constraints:** Training expensive and time-consuming
5. **Generalization:** LLM handles diverse topics without domain-specific training

**Validation:**
- Google's patent shows LLMs work for this task
- We can match quality through prompt engineering
- If needed, future fine-tuning possible with collected data

### Why These 8 Variant Types?

**Selection Criteria:**
1. **Coverage:** These types cover all major search intents
2. **Google's Validation:** All types mentioned in their research
3. **Content Analysis Fit:** Relevant to gap identification
4. **Implementability:** Can be prompted effectively

**Types We Considered But Excluded:**
- **Language Translation:** Not relevant for English content analysis
- **Latent Topics (as separate type):** Covered by "Related Aspects"
- **Canonicalization (as separate):** Merged into "Equivalent"

### Why Single-Pass Generation?

**Decision:** Start with single-pass, add iteration if needed

**Reasoning:**
1. **Speed Matters:** Content analysis should be fast
2. **Cost Control:** Each LLM call has API cost
3. **YAGNI Principle:** Don't build iteration until we prove we need it
4. **Quality First Pass:** Good prompting can produce quality without iteration

**Success Criteria for Single-Pass:**
- 80%+ variants are relevant
- 60%+ variants are answerable by content
- <10% duplicate/near-duplicate variants

**Trigger for Adding Iteration:**
- Relevance drops below 70%
- Duplication exceeds 20%
- User feedback indicates quality issues

---

## Integration Strategy

### Hybrid Mode Philosophy

**Three Analysis Modes:**

1. **Content-Only (Original):**
   - Infer queries from content structure
   - No external keyword input
   - Pure content-based decomposition

2. **Hybrid (New Primary):**
   - Content inference + keyword fan-out
   - Merge both query sets intelligently
   - Show clear attribution in report

3. **Keyword-Only (New Optional):**
   - Skip content inference entirely
   - Focus purely on keyword variants
   - Faster for targeted analysis

### Merging Strategy

**Challenge:** Avoid duplicates between content-inferred and keyword variants

**Solution:**
```typescript
mergeQueryGraphs(
  contentQueries: QueryGraph,
  fanOutQueries: FanOutQuery[]
): EnhancedQueryGraph {
  // 1. Normalize all queries (lowercase, remove punctuation)
  // 2. Calculate semantic similarity (cosine similarity on embeddings)
  // 3. Deduplicate if similarity > 0.85
  // 4. Distribute fan-out variants into tiers based on specificity
  // 5. Mark source clearly for reporting
}
```

**Distribution Logic:**
- **Tier 1 (Prerequisite):** Clarification, Generalization variants
- **Tier 2 (Core):** Equivalent, Specification variants
- **Tier 3 (Follow-up):** Follow-up, Comparison, Related Aspects variants
- **Temporal:** Distributed based on specificity

### Report Presentation

**Two-Section Layout:**

**Section 1: Content-Inferred Queries**
- Standard 3-tier layout
- Queries generated from content analysis
- Shows how well content addresses natural progression

**Section 2: Keyword Fan-Out Analysis**
- Grouped by variant type
- Color-coded differently (teal/cyan vs blue/purple/orange)
- Includes variant type descriptions
- Shows coverage by type

**Synthesis Section:**
- Combined coverage score
- Recommendations prioritized by source
- Gap analysis considering both methods

---

## What We're NOT Implementing (And Why)

### 1. User Profiling System

**Google Has:** Rich user profiles (location, demographics, history)

**We Don't Need:**
- **Privacy Concerns:** Don't want to track user data
- **Use Case Difference:** Analyzing content, not personalizing search
- **Complexity:** Adds significant overhead for minimal benefit

**What We Do Instead:** Optional basic context (intent, temporal)

---

### 2. Reinforcement Learning / Neural Network Training

**Google Has:** Trained models with RL optimization

**We Don't Need:**
- **No Training Data:** Don't have query logs at scale
- **Flexibility:** LLM adapts instantly without retraining
- **Maintenance:** No model versioning/deployment overhead

**What We Do Instead:** Prompt engineering with Claude Sonnet 4.5

---

### 3. Multi-Iteration Refinement (Initially)

**Google Has:** Up to 20 iterations with actor-critic architecture

**We Don't Need (Yet):**
- **Speed:** Single-pass is faster
- **Cost:** Multiple LLM calls expensive
- **YAGNI:** Build it if quality isn't good enough

**What We Do Instead:** High-quality single-pass with thorough prompting

---

### 4. Search System Integration

**Google Has:** Feedback loop with actual search results

**We Don't Need:**
- **Different Use Case:** Analyzing content, not searching web
- **Complexity:** Would require search API integration
- **Self-RAG Sufficient:** Coverage assessment handles validation

**What We Do Instead:** Self-RAG against content for validation

---

### 5. Real-Time Query Log Analysis

**Google Has:** Massive query logs for pattern learning

**We Don't Need:**
- **Scale:** Not building search engine
- **Privacy:** Don't collect user queries
- **LLM Handles It:** General model understands query patterns

**What We Do Instead:** Rely on LLM's training on web-scale text

---

## Future Enhancement Opportunities

### Phase 2 Additions (If Needed)

**1. Iterative Refinement:**
```typescript
// Add if single-pass quality insufficient
async generateVariantsIterative(...) {
  // Actor-critic loop with feedback
}
```

**2. Semantic Deduplication:**
```typescript
// Use embeddings for better duplicate detection
async deduplicateWithEmbeddings(variants: string[]) {
  // Calculate cosine similarity
  // Cluster near-duplicates
}
```

**3. Context Prediction:**
```typescript
// Auto-infer intent from content
async inferContext(content: ContentData): Promise<AnalysisContext> {
  // Classify content type
  // Detect temporal signals
  // Predict user intent
}
```

**4. Cross-Variant Verification:**
```typescript
// Check variants against each other for coherence
async verifyVariantCoherence(variants: FanOutQuery[]) {
  // Ensure no contradictions
  // Validate logical relationships
}
```

### Research Opportunities

**1. LLM vs Trained Model Comparison:**
- Collect quality metrics from our system
- Compare to benchmarks from Google's research
- Publish findings if novel insights emerge

**2. Optimal Variant Count Study:**
- Test 3 vs 5 vs 10 variants per type
- Measure coverage improvement per additional variant
- Find diminishing returns point

**3. Context Signal Effectiveness:**
- A/B test with/without context
- Measure quality improvement per signal type
- Identify most valuable signals for content analysis

---

## Success Criteria

### MVP Success (Phase 1)

**Functional Requirements:**
✅ Generates variants for all 8 types
✅ Variants are realistic and user-typed
✅ Coverage assessment works for both content and keyword queries
✅ Reports clearly distinguish query sources
✅ No performance regression from current system

**Quality Metrics:**
- **Relevance:** 80%+ variants semantically related to keyword
- **Answerability:** 60%+ variants answerable by content
- **Diversity:** <10% duplicate/near-duplicate variants
- **Speed:** Complete analysis in <60 seconds for standard depth

### Long-Term Success (Phase 2+)

**Enhancement Triggers:**
- User feedback requests iteration
- Quality metrics below targets consistently
- New use cases require advanced features

---

## Implementation Checklist

**Design Phase (This Document):**
- [x] Read and analyze Google's research
- [x] Document variant type taxonomy
- [x] Define context signal structure
- [x] Design prompt engineering approach
- [x] Identify what we're NOT implementing
- [x] Establish success criteria

**Implementation Phase (Next Steps):**
- [ ] Extend TypeScript types (src/types.ts)
- [ ] Create KeywordFanOut service (src/services/keyword-fanout.ts)
- [ ] Update analyze-content-gap tool (src/tools/analyze-content-gap.ts)
- [ ] Enhance report formatter (src/services/report-formatter.ts)
- [ ] Update artifact instructions
- [ ] Write comprehensive tests
- [ ] Update README with examples
- [ ] Validate against quality criteria

**Documentation Phase:**
- [ ] Update TESTING-HANDOVER.md with new scenarios
- [ ] Add "Based on Research" section to README
- [ ] Create example outputs for all three modes
- [ ] Document prompt engineering decisions

---

## Conclusion

We're adapting Google's sophisticated query fan-out methodology for a focused content analysis use case. By using LLM prompting instead of neural network training, we achieve flexibility and fast iteration whilst maintaining the core principles of Google's approach:

1. **Multiple variant types** for comprehensive coverage
2. **Context signals** to improve relevance
3. **Quality criteria** to filter poor variants
4. **Systematic methodology** grounded in research

The design prioritizes pragmatism—implementing what's necessary for our use case whilst leaving room for future enhancement based on real-world usage.

**Next Step:** Begin Phase 1 implementation, starting with type system extensions.

---

**Document Version:** 1.0  
**Last Updated:** December 15, 2024  
**Author:** Richard Baxter (with Claude)  
**Review Status:** ✅ Ready for Implementation
