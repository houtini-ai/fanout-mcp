# Testing & Documentation Handover - Fan-Out MCP

**Date:** December 15, 2024  
**Status:** Testing Phase - Ready to Execute  
**Estimated Time:** 3-4 hours  

---

## Mission

Complete the Fan-Out MCP implementation by:
1. **Testing** all three analysis modes with systematic test scenarios
2. **Refactoring** the visual artifact based on test results
3. **Writing** a research explainer document in Houtini voice
4. **Updating** README and instructions based on findings

---

## Current State

**What's Complete:**
✅ Core implementation (keyword fan-out fully integrated)
✅ Type system with 8 variant types
✅ Three analysis modes (content-only, hybrid, keyword-only)
✅ MCP tool registration
✅ Basic documentation
✅ Research design document (technical)
✅ Code compiles and builds successfully

**What's Left:**
📋 Systematic testing of all modes
📋 Visual artifact refinement
📋 Houtini-voice research explainer
📋 README updates based on test findings
📋 Instruction improvements

**Repository:** `C:\MCP\fanout-mcp\`  
**Branch:** master  
**Latest Commit:** 9f0928e

---

## PHASE 1: Systematic Testing

### Test URL (Primary)

**URL:** https://simracingcockpit.gg/playstation-ps5-sim-racing-buyers-guide/

**Why this URL:**
- Real content from simracingcockpit.gg domain
- Product-focused (good for shopping intent testing)
- PS5-specific (good for specification variants)
- Buyer's guide format (comprehensive coverage expected)

### Test Scenarios

#### Test 1: Content-Only (Baseline)
**Purpose:** Verify existing functionality still works

**Command:**
```
analyze_content_gap({
  url: "https://simracingcockpit.gg/playstation-ps5-sim-racing-buyers-guide/",
  depth: "standard"
})
```

**What to Check:**
- ✓ Analysis completes without errors
- ✓ Query graph has prerequisite/core/follow-up tiers
- ✓ Coverage assessment produces COVERED/PARTIAL/GAP statuses
- ✓ Evidence quotes are extracted correctly
- ✓ Artifact displays properly
- ✓ Technical metrics show timing breakdown

**Expected Results:**
- ~15 queries (3 prerequisite, 8 core, 4 follow-up)
- Coverage score between 60-90%
- Some gaps around technical specifications
- Evidence from actual content

**Document:**
- Number of queries generated
- Coverage score
- Any errors or warnings
- Artifact quality (1-10 rating)
- Time to complete

---

#### Test 2: Hybrid Mode (Primary Test)
**Purpose:** Test keyword fan-out integration with content analysis

**Command:**
```
analyze_content_gap({
  url: "https://simracingcockpit.gg/playstation-ps5-sim-racing-buyers-guide/",
  target_keyword: "PS5 sim racing wheels",
  depth: "standard"
})
```

**What to Check:**
- ✓ Both content queries AND keyword variants generated
- ✓ 8 variant types present (equivalent, specification, generalization, followUp, comparison, clarification, relatedAspects, temporal)
- ✓ Variants are realistic and user-typed
- ✓ No duplicates between content and keyword queries
- ✓ Coverage assessment works for both types
- ✓ Artifact distinguishes between sources

**Expected Results:**
- ~15 content-inferred queries
- ~25-40 keyword fan-out variants (3-5 per type)
- Total: 40-55 queries
- Some overlap but mostly complementary
- Clear visual separation in artifact

**Variant Quality Check:**
For each variant type, note 2-3 examples and assess:
- **Realistic?** (Would a user actually type this?)
- **Relevant?** (Related to "PS5 sim racing wheels"?)
- **Diverse?** (Different from other variants in same type?)
- **Answerable?** (Could content potentially answer it?)

**Document:**
```
Variant Type: EQUIVALENT
- Examples: [list 2-3]
- Quality: [realistic? relevant? diverse?]
- Coverage: [how many covered by content?]

Variant Type: SPECIFICATION
- Examples: [list 2-3]
- Quality: [realistic? relevant? diverse?]
- Coverage: [how many covered by content?]

[Continue for all 8 types...]
```

---

#### Test 3: Keyword-Only Mode
**Purpose:** Test pure keyword fan-out without content inference

**Command:**
```
analyze_content_gap({
  url: "https://simracingcockpit.gg/playstation-ps5-sim-racing-buyers-guide/",
  target_keyword: "PS5 racing setup",
  fan_out_only: true
})
```

**What to Check:**
- ✓ NO content-inferred queries generated
- ✓ ONLY keyword variants present
- ✓ All 8 variant types generated
- ✓ Faster completion (no query decomposition phase)
- ✓ Coverage assessment still works

**Expected Results:**
- ~25-40 keyword variants only
- Faster than hybrid mode
- Some gaps where content inference would have helped
- Clear focus on keyword variations

**Document:**
- Total variant count
- Time to complete vs Test 2
- Quality of variants without content context

---

#### Test 4: Custom Variant Types
**Purpose:** Test selective variant type generation

**Command:**
```
analyze_content_gap({
  url: "https://simracingcockpit.gg/playstation-ps5-sim-racing-buyers-guide/",
  target_keyword: "sim racing wheel",
  fan_out_types: ["equivalent", "specification", "comparison"]
})
```

**What to Check:**
- ✓ Only requested variant types generated
- ✓ No other variant types present
- ✓ Content queries still generated (hybrid mode)
- ✓ Proper variant distribution

**Expected Results:**
- ~15 content queries
- ~9-15 keyword variants (3-5 per requested type)
- Only equivalent, specification, comparison variants

**Document:**
- Variant counts per type
- Whether non-requested types accidentally included

---

#### Test 5: Context Signals - Shopping Intent
**Purpose:** Test context influence on variant generation

**Command:**
```
analyze_content_gap({
  url: "https://simracingcockpit.gg/playstation-ps5-sim-racing-buyers-guide/",
  target_keyword: "best PS5 racing wheel",
  context: {
    intent: "shopping",
    specificity_preference: "specific"
  }
})
```

**What to Check:**
- ✓ Variants reflect shopping intent (price, buy, best, vs)
- ✓ Higher specificity in variants (brand names, models)
- ✓ Comparison variants emphasize product alternatives

**Expected Variant Examples:**
- "where to buy PS5 racing wheel"
- "Logitech G29 vs Thrustmaster T248"
- "best budget PS5 racing wheel 2024"
- "PS5 racing wheel Black Friday deals"

**Document:**
- Count of shopping-related variants
- Specificity level (generic vs brand-specific)
- Whether context clearly influenced generation

---

#### Test 6: Context Signals - Temporal
**Purpose:** Test temporal context influence

**Command:**
```
analyze_content_gap({
  url: "https://simracingcockpit.gg/playstation-ps5-sim-racing-buyers-guide/",
  target_keyword: "PS5 racing accessories",
  context: {
    temporal: {
      currentDate: "2024-12-15",
      season: "winter"
    },
    intent: "research"
  }
})
```

**What to Check:**
- ✓ Temporal variants include date/season qualifiers
- ✓ Research intent (how-to, guides, comparisons)
- ✓ Winter-specific queries if relevant

**Expected Variant Examples:**
- "PS5 racing accessories 2024"
- "new PS5 racing wheels December 2024"
- "PS5 racing setup guide 2024"

**Document:**
- Count of temporal variants
- Whether season influenced generation
- Research vs shopping tone

---

#### Test 7: Edge Case - Single Word Keyword
**Purpose:** Test minimal keyword input

**Command:**
```
analyze_content_gap({
  url: "https://simracingcockpit.gg/playstation-ps5-sim-racing-buyers-guide/",
  target_keyword: "PS5"
})
```

**What to Check:**
- ✓ Variants stay relevant to content context
- ✓ Specification variants add detail
- ✓ No overly generic variants ("what is PS5")

**Document:**
- Whether single-word keyword produces quality variants
- Relevance to actual content topic

---

#### Test 8: Edge Case - Complex Multi-Word Keyword
**Purpose:** Test detailed keyword input

**Command:**
```
analyze_content_gap({
  url: "https://simracingcockpit.gg/playstation-ps5-sim-racing-buyers-guide/",
  target_keyword: "PlayStation 5 compatible direct drive force feedback racing wheel bundle"
})
```

**What to Check:**
- ✓ Equivalent variants simplify appropriately
- ✓ Specification variants add even more detail
- ✓ Clarification variants break down concepts

**Document:**
- Whether long keyword handled gracefully
- Quality of variants with complex input

---

### Testing Checklist

After running all 8 tests, compile findings:

**Functionality:**
- [ ] All three modes work without errors
- [ ] Keyword variants generated for all 8 types
- [ ] Coverage assessment works for both sources
- [ ] No crashes or timeout errors
- [ ] Timing metrics collected

**Quality:**
- [ ] Variants are realistic and user-typed
- [ ] No marketing jargon or AI clichés
- [ ] Proper diversity within variant types
- [ ] Semantic relationship to keyword maintained
- [ ] Context signals influence generation appropriately

**Artifact:**
- [ ] Displays both content and keyword queries
- [ ] Visual separation between sources
- [ ] Variant type groupings clear
- [ ] Technical metrics section works
- [ ] Mobile-responsive

**Issues Found:**
- Document any errors, warnings, or unexpected behavior
- Note any variant quality problems
- Identify any performance issues
- List any missing features discovered

---

## PHASE 2: Artifact Refactoring

Based on test results, refactor the artifact visualization.

### Current Artifact Instruction

Located in `src/tools/analyze-content-gap.ts` in the `buildInstructionPrefix()` function.

**Current hybrid mode instruction:**
```
This analysis combines content-based query inference with keyword fan-out variants. 
Display TWO main sections after the header:

1. Content-Inferred Queries (standard 3-tier layout)
2. Keyword Fan-Out Analysis (new section)

For the Keyword Fan-Out section:
- Show source keyword prominently
- Display variants grouped by type (matching Google's taxonomy)
- Use different color scheme from content queries (e.g., teal/cyan gradient)
- Include variant type descriptions
- Show coverage distribution by variant type
- Add collapsible "About Fan-Out Method" section explaining Google's approach
```

### Refactoring Tasks

**Task 2.1: Enhance Instruction Based on Test Results**

**What to update:**
1. **Visual hierarchy** - Based on how artifact actually displays
2. **Color scheme** - If teal/cyan doesn't work well
3. **Variant grouping** - If grouping by type isn't clear
4. **Coverage indicators** - If status isn't obvious
5. **Technical metrics** - If fan-out timing not displayed

**Questions to answer:**
- Does the two-section layout work well?
- Are variant types clearly labeled?
- Is coverage status obvious for each variant?
- Do colors distinguish sources effectively?
- Is the "About Fan-Out Method" section useful?

**File to edit:** `src/tools/analyze-content-gap.ts`
**Function:** `buildInstructionPrefix()`

**Create updated instruction based on:**
- Test results (what works, what doesn't)
- Visual clarity issues
- Information hierarchy problems
- Any missing elements

**Task 2.2: Add Specific UI Guidance**

Based on tests, add specific UI elements:

```typescript
const instructionPrefix = `
**HYBRID ANALYSIS MODE DETECTED**

[Based on testing, add specific guidance like:]

LAYOUT:
- Header: URL, title, coverage score, mode indicator
- Section 1: Content-Inferred Queries (3-tier: blue/purple/orange)
- Section 2: Keyword Fan-Out Variants (teal/cyan)
- Footer: Technical Analysis (collapsible)

KEYWORD SECTION SPECIFICS:
- Keyword badge at top: "{keyword}" with teal background
- Variant cards grouped by type with type descriptions
- Each card shows: query text, coverage badge, evidence snippet
- Coverage distribution chart: bar chart showing coverage by type

VISUAL HIERARCHY:
- H2 for main sections
- H3 for variant type groups
- Cards with shadow for individual queries
- Color-coded badges for status (green=covered, yellow=partial, red=gap)

INTERACTIONS:
- Click variant type header to collapse/expand group
- Click query card to show full evidence
- Hover query for quick coverage preview
`;
```

---

## PHASE 3: Research Explainer Document

### Purpose

Create a Houtini-voice document explaining the keyword fan-out research for users who want to understand the methodology.

**Target Audience:** Technical users who want to know "why does this work?"
**Tone:** Houtini voice (authentic, personal, British English)
**Location:** `research/keyword-fanout-explained.md`

### Voice Profile Reference

**Critical file:** `C:\dev\content-machine\templates\houtini-voice-profile.md`

**Key requirements:**
- Mandatory opening pattern (bold personal statement + time marker)
- First-person authority (1.5-2.5 per 100 words)
- Equipment specificity (Claude Sonnet 4.5, not "the model")
- British English (optimise, whilst, colour)
- Strong opinions (3-5 per article)
- Parenthetical asides (2-3 per 1,000 words)
- Zero AI clichés (no "delve", "leverage", "unlock")

### Document Structure

**File:** `research/keyword-fanout-explained.md`

**Outline:**

```markdown
# How Keyword Fan-Out Actually Works
*Or: Why Google's query expansion research matters for content optimisation*

**I've been building content analysis tools for the past few months, and the gap between traditional SEO and AI search optimisation is... massive. Not because keywords don't matter anymore – they absolutely do – but because AI search engines need extractable, specific answers to query variants you've probably never considered. Here's how we're using Google's query fan-out research to identify those gaps.**

[Opening follows mandatory pattern from voice profile]

## The Problem with Traditional Keyword Research

[Personal experience with keyword tools]
[What doesn't work anymore]
[Why AI search is different]

## What Google Actually Does

[Explain Google's methodology in plain English]
[The 8 variant types with real examples]
[Why this matters for content creators]

## How We Adapted It

[Our implementation decisions]
[Claude Sonnet 4.5 vs trained models]
[Single-pass vs iterative refinement]
[Why we made these choices]

## The 8 Variant Types (With Real Examples)

### 1. Equivalent Variants
**What they are:** [Personal explanation]
**Example:** [From actual tests]
**Why it matters:** [Practical impact]

[Continue for all 8 types...]

## When to Use Each Mode

**Content-Only Mode:**
[When I use this]
[What it's good for]

**Hybrid Mode:**
[When I use this]
[What it's good for]

**Keyword-Only Mode:**
[When I use this]
[What it's good for]

## What We Learned from Testing

[Insert findings from Phase 1]
[Actual examples of what works]
[What surprised me]

## The Research Behind It

[Link to paper]
[Key findings that influenced us]
[What we deliberately didn't implement]

## Practical Implications

[How to use this for content optimisation]
[What to look for in results]
[Red flags that indicate gaps]

---

**References:**
- Google's Query Fan-Out Research: [link to paper]
- Our Design Document: [link to google-fanout-adaptation.md]
- Implementation: [link to GitHub if public]
```

### Writing Guidelines

**From voice profile:**

**Mandatory opening pattern:**
```
**Bold personal statement with time marker**, technical qualification (what it's NOT), practical impact statement.
```

**First-person frequency:**
- 8-15 first-person statements in first 500 words
- Use "I've been", "I use", "I built", "I found"
- Equipment specificity: "Claude Sonnet 4.5" not "the LLM"

**Parenthetical asides (2-3 per 1,000 words):**
```
"(to their detriment, I might add)"
"(the purists are going to hate this)"
"(fair enough)"
```

**Strong opinions (3-5 per article):**
```
"The free tier is useless for production work."
"This approach is fundamentally flawed because..."
"Horrendous feature."
```

**British English:**
- optimise (not optimize)
- whilst (not while)
- colour (not color)
- analyse (not analyze)

**Zero AI clichés:**
❌ "delve into", "leverage", "unlock", "seamless", "robust"
✓ "use", "enable", "make possible", "straightforward", "reliable"

---

## PHASE 4: README Updates

Based on test results and research explainer, update the README.

### What to Update

**File:** `README.md`

**Section 1: Update "Analysis Modes" section**
- Add test findings
- Include real examples from tests
- Update success rates if different from expectations
- Add "When to use" guidance based on testing

**Section 2: Add "Understanding the Research" link**
```markdown
## Understanding the Research

Want to know how keyword fan-out actually works? Read our [in-depth explainer](./research/keyword-fanout-explained.md) that breaks down Google's methodology in plain English.

**Key Concepts:**
- Why AI search engines need query variants
- How we adapted Google's research
- When to use each analysis mode
- Real examples from testing
```

**Section 3: Update "Example Commands" with test learnings**
- Add successful test commands
- Include context examples that worked well
- Show variant counts for transparency

**Section 4: Add "Known Limitations" section**
```markdown
## Known Limitations

Based on testing with real content:

**Variant Quality:**
- Specification variants work best with concrete keywords
- Temporal variants require explicit date context
- Clarification variants may be too generic for niche topics

**Performance:**
- Hybrid mode: ~30-60 seconds for standard depth
- Keyword-only mode: ~15-30 seconds
- Add 10-15 seconds for each context signal

**Coverage Assessment:**
- Some keyword variants may not be answerable by content (expected)
- False negatives possible for implicit coverage
- Evidence quotes limited to exact matches
```

**Section 5: Update "How It Works" with actual timings**
```markdown
### Performance Metrics (From Testing)

**Content-Only Mode:**
- Fetch: ~2-3 seconds
- Query Generation: ~5-10 seconds
- Assessment: ~15-25 seconds
- Total: ~25-40 seconds

**Hybrid Mode:**
- Fetch: ~2-3 seconds
- Content Queries: ~5-10 seconds
- Keyword Fan-Out: ~10-20 seconds
- Assessment: ~20-35 seconds
- Total: ~40-70 seconds

**Keyword-Only Mode:**
- Fetch: ~2-3 seconds
- Keyword Fan-Out: ~10-20 seconds
- Assessment: ~15-25 seconds
- Total: ~30-50 seconds
```

---

## PHASE 5: Instruction Improvements

Based on test results, improve user-facing instructions.

### What to Improve

**1. Update MCP Tool Description**

**File:** `src/index.ts`

**Current:**
```typescript
description: "Perform advanced content gap analysis using Query Decomposition and Self-RAG techniques. Analyzes a URL to identify what user queries the content covers and what gaps exist."
```

**Enhanced (based on tests):**
```typescript
description: "Analyze content coverage with three modes: content-only (traditional), hybrid (content + keyword variants), or keyword-only. Generates 8 types of query variants using Google's research methodology. Returns coverage assessment with evidence quotes and gap recommendations."
```

**2. Update Parameter Descriptions**

Make descriptions more helpful based on test learnings:

```typescript
target_keyword: {
  type: "string",
  description: "Enable keyword fan-out: generates 25-40 realistic query variants across 8 types (equivalent, specification, comparison, etc.). Best for: targeted keyword optimization, identifying variant coverage gaps."
}

context: {
  type: "object",
  description: "Context signals for variant generation. 'shopping' intent emphasizes price/buy variants. 'research' intent focuses on how-to/guides. Temporal context adds date qualifiers. Specificity affects detail level."
}
```

**3. Add Usage Tips Comment Block**

Add to top of `src/tools/analyze-content-gap.ts`:

```typescript
/**
 * Fan-Out Content Gap Analysis
 * 
 * USAGE TIPS (from testing):
 * 
 * 1. Start with content-only mode to establish baseline
 * 2. Use hybrid mode for comprehensive keyword variant coverage
 * 3. Use keyword-only mode for quick keyword exploration
 * 
 * VARIANT QUALITY:
 * - Best with 2-4 word keywords (e.g., "PS5 racing wheel")
 * - Specification variants require concrete nouns
 * - Context signals significantly improve relevance
 * 
 * PERFORMANCE:
 * - Standard depth: 40-70 seconds (hybrid mode)
 * - Quick depth: 20-35 seconds (hybrid mode)
 * - Keyword-only: ~30-50 seconds
 * 
 * LIMITATIONS:
 * - Some keyword variants may not be answerable (expected)
 * - Coverage assessment based on exact evidence matching
 * - Temporal variants require explicit date context
 */
```

---

## Testing Output Format

Create a testing report document as you go.

### File: `TESTING-REPORT.md`

```markdown
# Fan-Out MCP Testing Report

**Date:** [Date]
**Tester:** [Name]
**Test URL:** https://simracingcockpit.gg/playstation-ps5-sim-racing-buyers-guide/

---

## Test 1: Content-Only (Baseline)

**Command:** [exact command used]

**Results:**
- Queries Generated: [number]
- Coverage Score: [percentage]
- Time to Complete: [seconds]
- Errors: [none/description]

**Quality Assessment:**
- Query relevance: [1-10]
- Evidence quality: [1-10]
- Artifact display: [1-10]

**Notes:**
[Any observations]

---

## Test 2: Hybrid Mode

**Command:** [exact command used]

**Results:**
- Content Queries: [number]
- Keyword Variants: [number by type]
- Total Queries: [number]
- Coverage Score: [percentage]
- Time to Complete: [seconds]

**Variant Quality by Type:**

**Equivalent:**
- Examples: [list 2-3]
- Realistic: [yes/no + notes]
- Covered: [X out of Y]

**Specification:**
- Examples: [list 2-3]
- Realistic: [yes/no + notes]
- Covered: [X out of Y]

[Continue for all 8 types...]

**Quality Assessment:**
- Variant realism: [1-10]
- Variant diversity: [1-10]
- Coverage assessment: [1-10]
- Artifact display: [1-10]

**Issues Found:**
- [List any problems]

---

[Continue for all 8 tests...]

---

## Overall Findings

**What Works Well:**
- [List successes]

**What Needs Improvement:**
- [List issues]

**Recommendations:**
- [List suggested changes]

---

## Artifact Quality

**Visual Hierarchy:** [assessment]
**Color Scheme:** [assessment]
**Information Clarity:** [assessment]
**Mobile Responsive:** [yes/no]

**Suggested Changes:**
- [List improvements]

---

## Performance

**Timing Breakdown:**
| Mode | Avg Time | Range |
|------|----------|-------|
| Content-Only | [X]s | [Y-Z]s |
| Hybrid | [X]s | [Y-Z]s |
| Keyword-Only | [X]s | [Y-Z]s |

**Bottlenecks:**
- [Identify slow phases]

---

## Recommendations

**Priority 1 (Critical):**
- [List must-fix issues]

**Priority 2 (Important):**
- [List should-fix issues]

**Priority 3 (Nice-to-have):**
- [List could-fix issues]

---

**Testing Complete:** [Date/Time]
**Next Steps:** [What to do with findings]
```

---

## Success Criteria

### Phase 1: Testing
- [ ] All 8 test scenarios executed
- [ ] TESTING-REPORT.md created with findings
- [ ] Variant quality assessed for all 8 types
- [ ] Performance metrics collected
- [ ] Issues documented

### Phase 2: Artifact Refactoring
- [ ] Instruction updated based on test results
- [ ] Visual hierarchy improved
- [ ] Specific UI guidance added
- [ ] Changes tested with one rerun

### Phase 3: Research Explainer
- [ ] `research/keyword-fanout-explained.md` created
- [ ] Follows Houtini voice profile (mandatory opening, first-person, British English)
- [ ] Explains all 8 variant types with examples
- [ ] Includes test learnings
- [ ] Links to research paper
- [ ] Zero AI clichés verified

### Phase 4: README Updates
- [ ] "Understanding the Research" section added
- [ ] "Analysis Modes" updated with test findings
- [ ] "Known Limitations" section added
- [ ] Performance metrics added
- [ ] Example commands updated

### Phase 5: Instruction Improvements
- [ ] MCP tool description enhanced
- [ ] Parameter descriptions improved
- [ ] Usage tips comment block added
- [ ] Changes committed

---

## Commit Strategy

**Commit 1: Testing Report**
```
Add comprehensive testing report for all three modes

- Tested content-only, hybrid, and keyword-only modes
- Assessed variant quality for all 8 types
- Documented performance metrics and bottlenecks
- Identified artifact improvements needed
- [Summary of key findings]
```

**Commit 2: Artifact Refactoring**
```
Refactor artifact instruction based on testing

- Updated visual hierarchy guidance
- Enhanced color scheme specifications
- Added specific UI element requirements
- Improved keyword section layout
- Based on [specific test findings]
```

**Commit 3: Research Explainer**
```
Add Houtini-voice research explainer document

- Created keyword-fanout-explained.md in research/
- Explains Google methodology in plain English
- Documents all 8 variant types with real examples
- Includes test learnings and practical guidance
- Follows Houtini voice profile guidelines
```

**Commit 4: README and Instructions**
```
Update README and instructions based on testing

- Added "Understanding the Research" section
- Updated Analysis Modes with test findings
- Added Known Limitations section
- Enhanced MCP tool descriptions
- Added performance metrics from testing
- Improved parameter descriptions
```

---

## Files to Create/Modify

**New Files:**
- `TESTING-REPORT.md` (testing results)
- `research/keyword-fanout-explained.md` (Houtini-voice explainer)

**Modified Files:**
- `src/tools/analyze-content-gap.ts` (artifact instruction)
- `src/index.ts` (tool descriptions)
- `README.md` (documentation updates)

---

## Working Directory

**Location:** `C:\MCP\fanout-mcp\`  
**Branch:** master  
**Prerequisites:** 
- npm run build (to compile latest changes)
- Restart Claude Desktop (to load updated MCP)

---

## Important Notes

### Testing Environment

**Claude Desktop:**
- Restart after building to load updated MCP
- Check Claude Desktop logs if tool doesn't appear
- Test artifact in Claude's UI (not exported HTML)

**Test URL:**
- Real production URL (not staging)
- Content-rich buyer's guide format
- Good for variant testing (specific product focus)

### Voice Profile Compliance

**When writing research explainer:**
- Load voice profile: `C:\dev\content-machine\templates\houtini-voice-profile.md`
- Follow mandatory opening pattern (bold + time marker)
- Use first-person (1.5-2.5 per 100 words)
- British English throughout
- Zero AI clichés
- Strong opinions (3-5 per article)
- Parenthetical asides (2-3 per 1,000 words)

**Validation:**
Check against voice profile checklist before committing:
- [ ] Mandatory opening pattern
- [ ] First-person authority (8-15 in first 500 words)
- [ ] Equipment specificity (Claude Sonnet 4.5, not "the model")
- [ ] British English (optimise, whilst, colour)
- [ ] Zero AI clichés
- [ ] Strong opinions with technical reasoning
- [ ] Parenthetical asides present

### Performance Expectations

**From implementation:**
- Content-only: ~25-40 seconds
- Hybrid: ~40-70 seconds
- Keyword-only: ~30-50 seconds

**If tests show different timing:**
- Document actual timings in report
- Update README with real metrics
- Investigate bottlenecks if >90 seconds

---

## Final Checklist

**Before Starting:**
- [ ] Latest code compiled (`npm run build`)
- [ ] Claude Desktop restarted
- [ ] Test URL accessible
- [ ] Voice profile loaded for reference

**After Testing:**
- [ ] All 8 tests completed
- [ ] TESTING-REPORT.md created
- [ ] Key findings documented
- [ ] Performance metrics recorded

**After Artifact Refactoring:**
- [ ] Instruction updated in code
- [ ] Changes tested with one rerun
- [ ] Improvements verified

**After Research Explainer:**
- [ ] Document follows voice profile
- [ ] All 8 variant types explained
- [ ] Test examples included
- [ ] Voice checklist verified

**After Documentation:**
- [ ] README updated
- [ ] Instructions improved
- [ ] All commits made
- [ ] Changes pushed

---

**END OF HANDOVER PROMPT**

When you pick this up, start with Phase 1 testing. Run all 8 test scenarios systematically and document findings in TESTING-REPORT.md. This will inform all subsequent phases.
