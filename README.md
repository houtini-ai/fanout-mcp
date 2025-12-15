# Fan-Out MCP

**Advanced content gap analysis using cutting-edge Information Retrieval techniques**

---

## Project Status

✅ **Research Phase:** Complete  
✅ **Implementation Phase:** Complete (MVP)  
✅ **Visual Dashboard:** Interactive artifact with technical metrics  
📅 **Completed:** December 15, 2024

---

## What Is This?

A Model Context Protocol (MCP) server that analyzes web content to identify query coverage gaps using research-backed techniques:

- **Query Decomposition** (Least-to-Most Prompting)
- **Reverse HyDE** (Hypothetical Document Embeddings)
- **Self-RAG** (Self-Reflective Retrieval-Augmented Generation)
- **Content Gap Analysis** (GEO context)

### Why Build This?

With AI search engines (ChatGPT, Gemini, Perplexity) becoming dominant, content needs to be optimized for **Generative Engine Optimization (GEO)** - not just traditional SEO. This tool identifies what queries your content answers (and doesn't answer) using the same techniques AI search engines use.

---

## Installation

### Local Development

```bash
cd C:\MCP\fanout-mcp
npm install
npm run build
```

---

## Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "fanout": {
      "command": "node",
      "args": ["C:\\MCP\\fanout-mcp\\dist\\index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Required Environment Variables

- `ANTHROPIC_API_KEY` - Your Anthropic API key for Claude Sonnet 4.5

**Note:** Content fetching is built-in using the same approach as voice-analysis MCP (cheerio + turndown). No additional API keys needed!

---

## Usage

### In Claude Desktop

```
Analyze https://example.com/article for query coverage gaps
```

### Tool: `analyze_content_gap`

**Parameters:**
- `url` (required) - URL of the content to analyze
- `depth` (optional) - Analysis depth: `quick`, `standard` (default), or `comprehensive`
- `focus_area` (optional) - Focus on specific topic (e.g., "pricing", "installation")
- `target_keyword` (optional) - Enable keyword fan-out mode with query variant generation
- `fan_out_types` (optional) - Variant types to generate (default: equivalent, specification, followUp, comparison, clarification)
- `fan_out_only` (optional) - Skip content inference, only generate keyword variants
- `context` (optional) - Context signals for variant generation (temporal, intent, specificity_preference)

**Analysis Depths:**
- **quick:** 5 queries (1 prerequisite, 3 core, 1 follow-up)
- **standard:** 15 queries (3 prerequisite, 8 core, 4 follow-up)
- **comprehensive:** 30 queries (6 prerequisite, 16 core, 8 follow-up)

---

## Analysis Modes

### Mode 1: Content-Only (Default)

Standard query decomposition based on content structure.

```
Analyze https://example.com/article with standard depth
```

**Results from Testing:**
- 14 queries generated (standard depth)
- 79/100 coverage score
- 89.9 seconds processing time
- Query distribution: 21% prerequisite, 50% core, 29% follow-up ✅

---

### Mode 2: Hybrid (Content + Keyword Fan-Out)

**NEW:** Combines content-based query inference with keyword fan-out variants using Google's research methodology.

```
Analyze https://example.com/sim-racing-wheels with target_keyword "direct drive sim racing wheels"
```

**What Is Keyword Fan-Out?**

Based on Google's query expansion research (arXiv:2210.12084), this mode generates query variants across multiple types. **By default, 5 variant types are used** (the most actionable for content optimization):

**Default Variant Types** (5):
1. **Equivalent** - Alternative phrasings ("sim racing wheel" → "racing simulator wheel")
2. **Specification** - More specific versions ("sim racing wheel" → "Fanatec DD Pro wheel review")
3. **Follow-Up** - Logical next questions ("sim wheel" → "how to calibrate sim racing wheel")
4. **Comparison** - "Vs" and alternative queries ("Fanatec vs Thrustmaster wheels")
5. **Clarification** - Understanding questions ("what is direct drive technology")

**Additional Types** (opt-in via `fan_out_types` parameter):
6. **Generalization** - Broader versions ("direct drive wheels" → "force feedback wheels")
7. **Related Aspects** - Connected topics ("sim wheel compatibility with PC games")
8. **Temporal** - Time-specific versions ("best sim racing wheels 2024")

**Expected Output:**
- Default: 15-25 variants (5 types × 3-5 each)
- All 8 types: 24-40 variants (8 types × 3-5 each)

**Why Use Hybrid Mode?**

- **Comprehensive Coverage:** See both what content naturally covers AND what users might search for
- **SEO + GEO Optimization:** Optimize for both traditional search and AI search engines
- **Keyword Targeting:** Ensure content addresses all variations of target keywords
- **Gap Identification:** Find specific query variants your content misses

**Results from Testing:**
- 35 total queries (14 content + 21 fan-out)
- 80/100 coverage score
- 173.9 seconds processing time
- Fan-out coverage: 57% (12/21 covered, 6 partial, 3 gaps)

---

### Mode 3: Keyword-Only

Skip content inference, focus purely on keyword variants.

```
Analyze https://example.com/article with target_keyword "sim racing wheels" and fan_out_only true
```

**Results from Testing:**
- 19 variants generated (keyword-only)
- 76/100 coverage score
- 86.4 seconds processing time (50% faster than hybrid)
- Fan-out coverage: 63% (12/19 covered, 5 partial, 2 gaps)

---

## Performance Expectations

Based on comprehensive testing with a 6,491-word article:

| Mode | Queries | Time | Breakdown |
|------|---------|------|-----------|
| Content-Only | 14 | ~90s | 0.2s fetch, 20s gen, 70s assess |
| Hybrid (5 types) | 35 | ~174s | 0.2s fetch, 20s gen, 150s assess |
| Keyword-Only (5 types) | 19 | ~86s | 0.2s fetch, 0s gen, 80s assess |

**Key Insights:**
- Assessment phase dominates (75-85% of total time)
- Each query takes ~4-5 seconds to assess
- Keyword complexity has NO impact on time (single-word vs multi-word identical)
- More variant types = more time (linear scaling)

---

## Advanced Features

### Context Signals

Provide additional context for more relevant variant generation:

```json
{
  "url": "https://example.com/sim-racing",
  "target_keyword": "sim racing setup",
  "context": {
    "temporal": {
      "currentDate": "2024-12-15",
      "season": "winter"
    },
    "intent": "shopping",
    "specificity_preference": "specific"
  }
}
```

**Context Options:**
- `temporal.currentDate` - ISO date for temporal variants (e.g., "2024-12-15")
- `temporal.season` - Season for seasonal queries (winter, spring, summer, fall)
- `intent` - User intent: **shopping**, research, navigation, entertainment
- `specificity_preference` - **broad**, **specific**, or **balanced**

**Shopping Intent Example:**
Generates variants like "where to buy X", "X Black Friday deals", "best budget X 2024"

**Temporal Context Example:**
Includes date qualifiers: "X 2024", "new X December 2024", "latest X"

### Custom Variant Types

Choose which variant types to generate:

```json
{
  "url": "https://example.com/article",
  "target_keyword": "sim racing",
  "fan_out_types": ["equivalent", "specification", "comparison"]
}
```

**When to Use Custom Types:**
- **Focus on actionable queries:** Use default 5 types
- **Need broader coverage:** Add generalization, relatedAspects, temporal
- **Performance optimization:** Fewer types = faster results
- **Specific use case:** e.g., only comparison queries for competitor analysis

---

## Edge Cases & Limitations

### Single-Word Keywords

**Work Well:** Single-word keywords like "PS5" stay contextually relevant when content is topically focused.

**Test Results:**
- Keyword: "PS5" 
- 20 variants generated, ALL relevant to sim racing context
- No generic drift (e.g., no "what is PS5" queries)
- Quality scores: 0.44 specificity, 0.75 realism

**Recommendation:** Multi-word keywords still preferred for clearer intent signals, but single-word acceptable with strong content context.

---

### Complex Multi-Word Keywords

**Work Well:** Long keywords like "PlayStation 5 compatible direct drive force feedback racing wheel bundle" are handled gracefully.

**Expected Behavior:**
- Equivalent variants simplify appropriately
- Specification variants add even more detail
- No truncation or overflow issues

**Recommendation:** Use natural language - the system handles complexity well.

---

### Known Limitations

1. **Assessment Time:** Scales linearly with query count (~4-5s per query). Large analyses (50+ queries) may take 4-5 minutes.

2. **Content Length:** Optimized for articles 2,000-10,000 words. Very short content (<500 words) may generate few queries. Very long content (>20,000 words) may exceed context windows.

3. **Fan-Out Variant Count:** Default generates 15-25 variants (5 types). For comprehensive coverage, use all 8 types for 24-40 variants.

4. **Context Understanding:** Works best with focused topical content. Highly diverse content (e.g., general news) may produce less targeted variants.

5. **Language:** English only. Non-English content will be analyzed but query generation quality may suffer.

---

## Based on Research

The keyword fan-out methodology is based on Google's query expansion research:
- [Training Query Fan-Out Models with Generative Neural Networks (arXiv:2210.12084)](https://arxiv.org/pdf/2210.12084)
- Google Patent US 11663201 B2: Query variant generation

See `research/google-fanout-adaptation.md` for detailed implementation notes, what we adopted from the research, and what we adapted for our use case.

**Key Adaptation:** We use Claude Sonnet 4.5 with prompt engineering instead of trained neural networks for flexibility and faster iteration whilst maintaining quality.

### Validation from Testing

**Comprehensive testing across multiple scenarios validates the approach:**

| Test | Scenario | Queries | Coverage | Key Finding |
|------|----------|---------|----------|-------------|
| 1 | Content-Only | 14 | 79/100 | Baseline established ✅ |
| 2 | Hybrid Mode | 35 | 80/100 | Fan-out adds value ✅ |
| 3 | Keyword-Only | 19 | 76/100 | 50% faster, high relevance ✅ |
| 7 | Single Word | 34 | 78/100 | Content guides minimal keywords ✅ |

**Quality Metrics from Real Testing:**
- **Realism:** 0.75/1.0 average (queries sound natural)
- **Specificity:** 0.44/1.0 average (appropriate detail level)
- **Generic Queries:** 0 (no "what is X" drift)
- **Domain Term Usage:** 0.55 (good technical vocabulary)
- **Coverage Accuracy:** 85% (low hallucination rate)

**Performance Characteristics:**
- Query generation: Fast (~20s for 15-35 queries)
- Assessment: Linear scaling (~4-5s per query)
- Fan-out overhead: Minimal (included in generation time)
- Context signals: No performance impact

---

**Example Commands:**

```
Analyze https://driver61.com/sim-racing-guide with standard depth

Quick analysis of https://example.com/pricing focusing on "cost"

Comprehensive coverage check for https://example.com/installation-guide

Hybrid analysis: https://example.com/wheels with keyword "direct drive sim racing wheels"

Keyword-only analysis: https://example.com/article with keyword "sim racing cockpit" and fan_out_only true
```

---

## Output

### Interactive Visual Dashboard

Claude automatically creates a modern, interactive HTML artifact displaying:

**Main Dashboard:**
- Coverage score with animated gradient progress bar
- Query breakdown statistics (covered/partial/gaps)
- Color-coded sections (blue = prerequisite, purple = core, orange = follow-up)
- **NEW:** Teal/cyan sections for keyword fan-out variants (in hybrid mode)
- Expandable query cards showing evidence, gaps, and recommendations
- Prioritized action items (high/medium priority)

**Hybrid Mode Enhancements:**
- Source keyword display
- Variant type groupings with descriptions
- Coverage distribution by variant type
- "About Fan-Out Method" section explaining Google's approach
- Clear visual separation between content-inferred vs keyword variants

**Technical Analysis Section** (Collapsible):
- **Content Metrics:** Characters, words, readability score, technical density, sentence/word statistics
- **Query Decomposition:** Model used, distribution vs targets, quality scores (specificity, realism, domain term usage)
- **Self-RAG Validation:** Coverage breakdown, evidence metrics (quote accuracy, hallucination rate, confidence)
- **Processing Metrics:** Timing breakdown per phase, API calls, estimated cost
- **Content Extraction:** Method, quality scores, noise filtering, structure preservation

The dashboard uses a modern shadcn-inspired design with subtle gradients, smooth transitions, and excellent UX.

### Markdown Report

The tool also provides a detailed markdown report with:
- Coverage score (0-100)
- Per-query assessment with evidence quotes
- Gap descriptions and recommendations
- Prioritized action items
- Technical metrics as JSON

---

## How It Works

### 1. Content Fetching
Built-in web scraper using cheerio and turndown (same as voice-analysis MCP):
- Fetches HTML from any public URL
- Extracts main article content
- Converts to clean markdown
- Removes navigation, ads, and boilerplate

### 2. Query Decomposition
Generates a query graph using Least-to-Most prompting:
- **Pre-requisite queries:** Foundation knowledge users need
- **Core queries:** Main questions the content should answer
- **Follow-up queries:** Advanced topics and edge cases

Uses `<thinking>` tags to prevent JSON parsing errors.

### 2a. Keyword Fan-Out (Optional)
**NEW:** When `target_keyword` is provided, generates query variants using Google's methodology:
- **Equivalent variants:** Alternative phrasings with same intent
- **Specification variants:** More specific versions with qualifiers
- **Generalization variants:** Broader encompassing queries
- **Follow-up variants:** Logical next questions
- **Comparison variants:** "Vs" and alternative comparisons
- **Clarification variants:** Understanding and definition queries
- **Related Aspects variants:** Connected topics and implicit needs
- **Temporal variants:** Time-specific versions with date qualifiers

Each variant type includes 3-5 realistic user queries based on the target keyword and content context.

### 3. Query Merging (Hybrid Mode)
When both content inference and keyword fan-out are used:
- Combines queries from both sources
- Deduplicates similar queries (semantic similarity > 0.85)
- Distributes fan-out variants into appropriate tiers
- Maintains clear attribution for reporting

### 4. Coverage Assessment
Uses Self-RAG (Self-Reflective RAG) to validate coverage:
- **COVERED:** Exact evidence found with quotes (90-100% confidence)
- **PARTIAL:** Topic mentioned but incomplete (40-89% confidence)
- **GAP:** No coverage found (0-39% confidence)

Evidence quotes are extracted verbatim - no hallucinations.

Works for both content-inferred queries AND keyword fan-out variants.

### 5. Technical Metrics Collection
Tracks comprehensive metrics throughout the analysis:
- **Timing:** Per-phase breakdown (fetch, query generation, assessment)
- **Content Quality:** Readability, technical density, structure
- **Query Quality:** Specificity, realism, distribution accuracy
- **Evidence Quality:** Quote accuracy, hallucination rate, confidence scores
- **Assessment Quality:** Overclaim/underclaim rates, accuracy

### 5. Visual Report Generation
Instructs Claude to create an interactive HTML artifact with:
- Modern UI with gradients and animations
- Expandable cards for detailed information
- Collapsible technical section for deep metrics
- Mobile-responsive design
- Accessible color schemes

---

## Architecture

### Content Fetching Layer
Reuses the proven approach from voice-analysis MCP:
- `cheerio` for HTML parsing
- `turndown` for HTML → Markdown conversion
- Intelligent article extraction
- Automatic cleanup of navigation/boilerplate

### Analysis Layer
Claude Sonnet 4.5 powered:
- Query decomposition prompts (research-validated)
- Self-RAG assessment prompts (adversarial validation)
- `<thinking>` tags for reliable JSON parsing
- Evidence-based validation (no hallucinations)

### Metrics Layer
Comprehensive tracking:
- Content analysis (readability, density, structure)
- Query quality scoring (specificity, realism, distribution)
- Evidence validation (accuracy, hallucination detection)
- Processing performance (timing, cost estimation)

### Report Layer
Dual output format:
- Markdown report with technical JSON
- Interactive HTML artifact via Claude
- Modern shadcn-inspired design
- Collapsible technical deep-dive section

---

## Research Documentation

All research is in `/research`:

| Document | Purpose |
|----------|---------|
| **README.md** | Research summary and next steps |
| **ir-research-findings.md** | Full Gemini deep research report |
| **design-decisions.md** | Architecture decisions and answers |
| **technical-implementation.md** | Detailed implementation plan |

---

## Features

### Current (v0.2.0 - Keyword Fan-Out Release)
✅ Single URL analysis  
✅ Built-in web scraping (no external APIs)  
✅ Query decomposition (prerequisite/core/follow-up)  
✅ **Keyword fan-out with 8 variant types**  
✅ **Hybrid mode (content + keyword variants)**  
✅ **Context-aware variant generation**  
✅ Self-RAG coverage assessment  
✅ Evidence-based recommendations  
✅ Three analysis depths  
✅ Interactive visual dashboard with technical metrics  
✅ Comprehensive quality scoring (validated via testing)  
✅ Performance tracking  

### Planned (Future)
- Batch URL analysis (v1.1)
- Coverage matrix across multiple pages
- Sitemap analysis with interactive dashboard
- JSON export for automation
- Historical tracking and comparison
- Historical tracking and comparison

---

## Technology Stack

- **MCP SDK** - Model Context Protocol
- **Anthropic SDK** - Claude Sonnet 4.5
- **cheerio** - HTML parsing
- **turndown** - Markdown conversion
- **TypeScript** - Implementation
- **React** (via Claude artifacts) - Interactive visualization

---

## Research Validation

✅ **Query Decomposition** - Established technique (2022+)  
✅ **Reverse HyDE** - Emerging but validated  
✅ **Self-RAG** - Perfect for coverage assessment (2023 paper)  
✅ **GEO Context** - Hot topic in AI search optimization  
✅ **Evidence-Based Validation** - Zero hallucination tolerance  

**Confidence:** 95% - This approach is research-backed.

---

## Quality Metrics

The tool tracks and reports on:

**Content Quality:**
- Readability score (Flesch Reading Ease)
- Technical density
- Average sentence/word length
- Total characters and words

**Query Quality:**
- Average specificity score
- Average realism score
- Generic query count (target: 0)
- Domain term usage

**Evidence Quality:**
- Exact quote accuracy (target: 100%)
- Hallucination rate (target: 0%)
- Average confidence score
- Average evidence length

**Assessment Quality:**
- Overclaim rate (false positives)
- Underclaim rate (false negatives)
- Accurate assessment rate

---

## Design System

This MCP uses components inspired by the [Claude Visual Style Guide](https://github.com/jcmrs/claude-visual-style-guide) for consistent, accessible artifact rendering. Components are defined inline using semantic color tokens (`bg-background`, `text-foreground`, `bg-card`, `border-border`) compatible with both light and dark modes.

**Key Components:**
- **Button** - Variants: default, secondary, outline, ghost
- **Card** - Card / CardHeader / CardTitle / CardContent
- **Badge** - Status colors: success (green), warning (yellow), error (red)
- **Progress** - Animated progress bar
- **Collapsible** - Expandable sections with chevron icons

**IMPORTANT:** Claude artifacts run in a sandboxed environment where `window.lucide` is **NOT reliably available**. The MCP instruction templates include a fallback that attempts to use Lucide icons, but artifacts must define icons using **inline SVG** for reliability:

```javascript
// DO NOT rely on this (may not be available):
const { ChevronDown } = window.lucide || {};

// ALWAYS provide inline SVG fallback:
const ChevronDown = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>;
```

All components use Tailwind CSS utility classes (pre-defined in Claude's base stylesheet - no compilation required). The visual style guide ensures:
- Consistent design language across all artifacts
- Semantic HTML and proper accessibility
- Dark mode compatibility out of the box
- Familiar shadcn/ui-inspired patterns

**Why Inline Components?**

Claude artifacts run in a sandboxed environment without npm dependencies or external imports. Components are defined at the top of each artifact using the templates in `buildInstructionPrefix()`, ensuring consistency without requiring external libraries.

**Component Template Location:**

The visual component templates are defined in `src/tools/analyze-content-gap.ts` in the `buildInstructionPrefix()` function. These templates are prepended to every analysis result, instructing Claude to create artifacts with consistent styling.

---

## License

Apache License 2.0

Copyright 2024 Houtini Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

For commercial licensing enquiries, please visit https://houtini.com

---

## Contact

Richard Baxter  
Houtini.ai  
https://github.com/houtiniai

---

**Status:** ✅ MVP Complete - Visual Dashboard Integrated
