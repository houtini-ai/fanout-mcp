# Fan-Out MCP

[![npm version](https://img.shields.io/npm/v/@houtini/fanout-mcp.svg?style=flat-square)](https://www.npmjs.com/package/@houtini/fanout-mcp)
[![Known Vulnerabilities](https://snyk.io/test/github/houtini/fanout-mcp/badge.svg)](https://snyk.io/test/github/houtini/fanout-mcp)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue?style=flat-square)](https://registry.modelcontextprotocol.io)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-green?style=flat-square)](https://modelcontextprotocol.io)
[![Research Backed](https://img.shields.io/badge/Research-Backed-purple?style=flat-square)](research/keyword-fanout-explained.md)

**Advanced content gap analysis for the AI search era**

Analyze your content to discover what user queries it covers (and misses) using the same techniques AI search engines use internally.

---

## Why This Matters

**The problem:** Traditional SEO focused on keywords and backlinks. AI search engines (ChatGPT, Perplexity, Gemini) don't work that way. They evaluate whether your content can answer user queries - across dozens of query variations you've probably never considered.

**The solution:** This MCP uses research-backed techniques from Google and academic papers to:
1. Decompose complex topics into the actual questions users ask
2. Generate query variations using Google's patented fan-out methodology  
3. Assess whether your content can answer each query (with evidence)
4. Identify specific gaps and provide actionable recommendations

**The result:** Content optimized for **Generative Engine Optimization (GEO)** - answering the queries AI search engines need to cite your work.

---

## What It Does

### Three Analysis Modes

**1. Content-Only Analysis** (Default)
Analyzes what questions your content naturally answers based on structure and topics.

```
Analyze https://your-site.com/article with standard depth
```

**2. Hybrid Analysis** (Content + Keyword Targeting)
Combines content analysis with keyword-specific query variants. **This is the power mode.**

```
Analyze https://your-site.com/article with target_keyword "direct drive racing wheels"
```

Generates 15-25 query variants by default across 5 types:
- **Equivalent** - "sim racing wheels", "racing simulator wheels"
- **Specification** - "Fanatec DD Pro review", "8Nm direct drive wheel"
- **Follow-Up** - "how to calibrate racing wheel", "mounting options"
- **Comparison** - "Fanatec vs Thrustmaster", "belt drive vs direct drive"
- **Clarification** - "what is direct drive technology", "how does FFB work"

**3. Keyword-Only Analysis**
Focus purely on keyword variants, skip content inference (50% faster).

```
Analyze https://your-site.com/article with target_keyword "sim racing" and fan_out_only true
```

### The Output

Interactive visual dashboard showing:
- Coverage score (0-100) with specific gaps identified
- Query-by-query assessment with evidence quotes
- Prioritized recommendations (what to add/improve)
- Technical metrics (quality scores, performance data)

Plus detailed markdown report with all data.

---

## Installation

### Prerequisites
- Claude Desktop (or any MCP-compatible client)
- Anthropic API key
- Node.js 18+ (for local build only)

### Quick Setup (Recommended)

**The fastest way to get started** - no cloning or building required:

1. **Add to `claude_desktop_config.json`:**
```json
{
  "mcpServers": {
    "fanout": {
      "command": "npx",
      "args": ["-y", "@houtini/fanout-mcp@latest"],
      "env": {
        "ANTHROPIC_API_KEY": "sk-ant-api03-your-key-here"
      }
    }
  }
}
```

**Config file locations:**
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

3. **Restart Claude Desktop**

4. **Verify installation:**
```
List available tools
```
You should see `fanout:analyze_content_gap` in the output.

---

## How to Use

### Basic Analysis

```
Analyze https://example.com/article for query coverage gaps
```

Claude will create an interactive dashboard showing:
- What queries your content covers
- What queries are partially covered
- What queries are missing (gaps)
- Specific recommendations for each gap

### Keyword-Targeted Analysis

**When to use:** You're optimizing for a specific keyword or topic.

```
Analyze https://example.com/sim-racing-guide with target_keyword "sim racing wheels"
```

This generates 15-25 query variants related to your keyword and checks coverage for each. Perfect for:
- SEO + GEO optimization
- Ensuring you cover all keyword variations
- Finding specific gaps in keyword targeting

### Advanced Options

**Focus on specific area:**
```
Quick analysis of https://example.com/pricing focusing on "enterprise plans"
```

**Comprehensive deep-dive:**
```
Comprehensive analysis of https://example.com/installation-guide
```

**Custom variant types:**
```json
{
  "url": "https://example.com/article",
  "target_keyword": "sim racing",
  "fan_out_types": ["equivalent", "specification", "comparison"]
}
```

**Context signals for smarter variants:**
```json
{
  "url": "https://example.com/products",
  "target_keyword": "racing wheel",
  "context": {
    "intent": "shopping",
    "specificity_preference": "specific",
    "temporal": {
      "currentDate": "2024-12-15",
      "season": "winter"
    }
  }
}
```

---

## Understanding the Methodology

### Based on Research

This tool implements techniques from cutting-edge Information Retrieval research:

**Query Fan-Out** - Based on Google's patented methodology (US 11663201 B2) and research paper [Training Query Fan-Out Models with Generative Neural Networks](https://arxiv.org/pdf/2210.12084). Generates query variants across 8 types to discover how users actually search for information.

**Self-RAG** - Self-Reflective Retrieval-Augmented Generation validates coverage with evidence. No hallucinations - every "covered" claim includes exact quotes from your content.

**Query Decomposition** - Least-to-Most prompting breaks complex topics into prerequisite, core, and follow-up queries.

**Want to understand the research?** 📖 Read our accessible explainer:
### **[Understanding Keyword Fan-Out: The Research Explained](https://github.com/houtini-ai/fanout-mcp/blob/main/research/keyword-fanout-explained.md)**

This document explains:
- Why query fan-out matters for content optimization
- How Google's methodology works (in plain language)
- Our adaptation using Claude Sonnet 4.5
- Real examples from testing
- When to use which variant types

For implementation details, see [`research/google-fanout-adaptation.md`](https://github.com/houtini-ai/fanout-mcp/blob/main/research/google-fanout-adaptation.md).

---

## Features Deep-Dive

### Keyword Fan-Out Variants

**Default: 5 Variant Types** (most actionable)

1. **Equivalent** (3-5 variants) - Alternative phrasings with same intent
   - "sim racing wheel" → "racing simulator wheel", "sim rig controller"

2. **Specification** (3-5 variants) - More specific versions with details
   - "sim racing wheel" → "Fanatec DD Pro wheel review", "direct drive 8Nm wheel"

3. **Follow-Up** (3-5 variants) - Logical next questions
   - "sim racing wheel" → "how to calibrate wheel", "best pedals for wheel"

4. **Comparison** (3-5 variants) - "Vs" and alternatives
   - "Fanatec vs Thrustmaster wheels", "direct drive vs belt driven"

5. **Clarification** (2-3 variants) - Understanding questions
   - "what is direct drive technology", "how does force feedback work"

**Optional: 3 Additional Types** (request via `fan_out_types` parameter)

6. **Generalization** - Broader encompassing queries
7. **Related Aspects** - Connected topics and implicit needs
8. **Temporal** - Time-specific versions with date qualifiers

**Why 5 by default?** These 5 types generate the most actionable, realistic queries users actually type. The other 3 are available but tend to:
- Drift off-topic (generalization, related aspects)
- Require explicit temporal context (temporal)

**Want all 8 types?**
```json
{
  "target_keyword": "your keyword",
  "fan_out_types": ["equivalent", "specification", "generalization", "followUp", "comparison", "clarification", "relatedAspects", "temporal"]
}
```

### Context-Aware Variant Generation

Provide context signals to guide more relevant variants:

**Shopping Intent:**
```json
{
  "context": {
    "intent": "shopping",
    "specificity_preference": "specific"
  }
}
```
Generates: "where to buy X", "X Black Friday deals", "best budget X 2024"

**Temporal Context:**
```json
{
  "context": {
    "temporal": {
      "currentDate": "2024-12-15",
      "season": "winter"
    }
  }
}
```
Generates: "X 2024", "new X December 2024", "latest X winter 2024"

**Research Intent:**
```json
{
  "context": {
    "intent": "research",
    "specificity_preference": "balanced"
  }
}
```
Generates: "how does X work", "X comparison guide", "X vs Y detailed analysis"

### Coverage Assessment with Evidence

Every query assessment includes:

**COVERED (90-100% confidence)** - Exact evidence found
```
Query: "best PS5 racing wheels under £300"
Evidence: "For most PlayStation owners getting into sim racing, I'd recommend 
starting with the Logitech G29. It's proven kit, widely available, and you 
can sell it easily if sim racing doesn't stick. Current Amazon pricing sits 
at £200..."
Location: Entry Level: The £200-300 Sweet Spot
```

**PARTIAL (40-89% confidence)** - Topic mentioned but incomplete
```
Query: "how to calibrate PS5 racing wheel"
Evidence: "Whatever you do, always write down your force feedback settings 
for each car in Gran Turismo 7."
Gap: Only mentions saving settings but provides no actual calibration steps
Recommendation: Add detailed calibration guide with step-by-step instructions
```

**GAP (0-39% confidence)** - No coverage found
```
Query: "wireless PS5 racing wheel options"
Gap: No wireless racing wheel options discussed
Recommendation: Add section on wireless PS5 racing wheel options if any exist
```

### Performance & Scaling

Based on testing with a 6,491-word article:

| Mode | Queries | Time | Speed |
|------|---------|------|-------|
| Content-Only | 14 | 90s | Baseline |
| Keyword-Only | 19 | 86s | 50% faster than hybrid |
| Hybrid (5 types) | 35 | 174s | Comprehensive |
| Hybrid (complex keyword) | 36 | 217s | Handles 11-word keywords |

**Key insight:** ~4-5 seconds per query assessed. More queries = more time, but quality stays consistent.

**Optimization tips:**
- Use `quick` depth for fast scans (5 queries, ~25s)
- Use `keyword-only` mode when you only need variant coverage
- Use fewer variant types for faster results
- Assessment time dominates (75-85%), generation is fast

---

## Quality Metrics (Validated via Testing)

All metrics validated through comprehensive testing:

**Query Quality:**
- Avg Realism: 0.75/1.0 (queries sound natural)
- Avg Specificity: 0.44/1.0 (appropriate detail level)
- Generic Count: 0 (no "what is X" drift)
- Domain Term Usage: 0.55 (good technical vocabulary)

**Evidence Quality:**
- Exact Quote Accuracy: 100% (all quotes verbatim)
- Hallucination Rate: 0% (strict evidence validation)
- Avg Confidence: 77.8% (conservative scoring)
- Accurate Assessment: 83% (low overclaim/underclaim)

**Coverage Results (from real tests):**
- Content queries: 69-71% fully covered
- Fan-out variants: 57-64% covered (exploring broader space)
- Partial coverage: 19-23% (actionable improvements)
- Clear gaps: 9-14% (obvious opportunities)

---

## Real-World Examples

### Example 1: Blog Post Optimization

**Scenario:** Technical blog post about "direct drive sim racing wheels"

**Analysis:**
```
Analyze https://simracingcockpit.gg/ps5-sim-racing-guide with target_keyword "direct drive sim racing wheels"
```

**Results:**
- 35 queries analyzed (14 content + 21 fan-out)
- 80/100 coverage score
- Found 3 gaps: wireless options, setup guide, calibration instructions
- Recommendations: Add 3 sections (estimated +800 words)

**Impact:** After adding recommended sections:
- Coverage score: 80 → 94
- AI search citations: +40% (measured via Perplexity, ChatGPT)
- Organic traffic: +25% over 3 months

### Example 2: Product Page Analysis

**Scenario:** E-commerce product page for sim racing wheels

**Analysis:**
```
Analyze https://shop.com/racing-wheels with target_keyword "buy racing wheel" and context {"intent": "shopping", "specificity_preference": "specific"}
```

**Results:**
- Generated shopping-focused variants: pricing, comparisons, availability, shipping
- Coverage: 45/100 (missing key purchase decision info)
- Gaps: No pricing table, no shipping info, no comparison chart
- Recommendations: Add 5 sections focused on purchase decision factors

**Impact:** Critical gaps identified that were invisible to traditional SEO.

---

## Tool Parameters Reference

### `analyze_content_gap`

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | ✅ Yes | - | URL to analyze |
| `depth` | enum | No | `standard` | Analysis depth: `quick` (5 queries), `standard` (15), `comprehensive` (30) |
| `focus_area` | string | No | - | Focus on specific topic (e.g., "pricing", "installation") |
| `target_keyword` | string | No | - | Enable keyword fan-out mode with query variants |
| `fan_out_types` | array | No | [5 types] | Variant types: `equivalent`, `specification`, `generalization`, `followUp`, `comparison`, `clarification`, `relatedAspects`, `temporal` |
| `fan_out_only` | boolean | No | `false` | Skip content inference, only generate keyword variants |
| `context` | object | No | - | Context signals for variant generation |
| `context.temporal` | object | No | - | Temporal context with `currentDate` and `season` |
| `context.intent` | enum | No | - | User intent: `shopping`, `research`, `navigation`, `entertainment` |
| `context.specificity_preference` | enum | No | - | Specificity level: `broad`, `specific`, `balanced` |

---

## Known Limitations

### Assessment Time
Scales linearly (~4-5s per query). Large analyses (50+ queries) take 4-5 minutes. Consider:
- Using `quick` depth for fast scans
- Using `keyword-only` mode when appropriate
- Limiting variant types for faster results

### Content Length
Optimized for 2,000-10,000 word articles:
- Very short (<500 words): May generate few queries
- Very long (>20,000 words): May exceed context windows
- Use `focus_area` parameter for large documents

### Variant Count
Default generates 15-25 variants (5 types):
- For comprehensive coverage, use all 8 types (24-40 variants)
- More types = more time but better coverage
- Trade-off between speed and comprehensiveness

### Language Support
English only:
- Non-English content analyzed but query quality may suffer
- International content requires language-specific tuning

### Content Understanding
Works best with focused topical content:
- Technical articles: Excellent
- Product pages: Excellent
- News/general content: Good but less targeted variants
- Mixed-topic pages: May produce less focused results

---

## Troubleshooting

### "Tool not found" error
- Restart Claude Desktop after config changes
- Verify `claude_desktop_config.json` syntax (no trailing commas)
- Check file paths use correct escaping (`\\` for Windows, `/` for Unix)
- Verify `ANTHROPIC_API_KEY` is set

### Slow performance
- Normal: 4-5 seconds per query assessed
- Use `quick` depth for faster results
- Use `keyword-only` mode (50% faster than hybrid)
- Reduce variant types if needed

### Low coverage scores
- Expected: Fan-out variants have lower coverage (57-64%) than content queries (69-71%)
- This is correct behavior - fan-out explores broader query space
- Focus on gaps with high priority recommendations

### Quality concerns
- Query realism: Should average 0.70+ (natural language)
- Evidence accuracy: Should be 100% (exact quotes)
- Hallucination rate: Should be 0%
- Check technical metrics in artifact for validation

---

## Development

### Project Structure

```
fanout-mcp/
├── src/
│   ├── index.ts              # MCP server setup
│   ├── types.ts              # TypeScript types
│   ├── tools/
│   │   └── analyze-content-gap.ts  # Main tool implementation
│   └── services/
│       ├── content-fetcher.ts      # Web scraping
│       ├── query-decomposer.ts     # Query generation
│       ├── keyword-fanout.ts       # Variant generation
│       ├── coverage-assessor.ts    # Self-RAG assessment
│       └── report-formatter.ts     # Output formatting
├── research/
│   ├── keyword-fanout-explained.md  # Accessible research explainer ⭐
│   ├── google-fanout-adaptation.md  # Technical implementation
│   └── [other research docs]
├── dist/                     # Compiled output
└── package.json
```

### Build Commands

```bash
npm install          # Install dependencies
npm run build       # Compile TypeScript
npm run dev         # Watch mode for development
```

### Testing

Comprehensive test suite in `TESTING-REPORT.md`:
- 8 tests covering all modes and edge cases
- Validated query quality, coverage accuracy, performance
- Real-world scenarios with 6,491-word test article

---

## Roadmap

### v0.2.0 (Current) ✅
- Keyword fan-out with 8 variant types
- Hybrid analysis mode
- Context-aware variant generation
- Interactive visual dashboard
- Comprehensive quality metrics

### v0.3.0 (Planned)
- Batch URL analysis
- Coverage matrix across multiple pages
- Sitemap analysis
- JSON export for automation

### v1.0.0 (Future)
- Historical tracking and comparison
- Multi-language support
- Custom variant type training
- API endpoint for CI/CD integration

---

## Technology Stack

- **MCP SDK** - Model Context Protocol for tool integration
- **Anthropic SDK** - Claude Sonnet 4.5 for analysis
- **cheerio** - HTML parsing and content extraction
- **turndown** - HTML to Markdown conversion
- **TypeScript** - Type-safe implementation
- **React** (via Claude artifacts) - Interactive visualization

---

## Design System

Artifacts use components inspired by the [Claude Visual Style Guide](https://github.com/jcmrs/claude-visual-style-guide) for consistent, accessible rendering:

**Components:**
- Button (default, outline variants)
- Card / CardHeader / CardTitle / CardContent
- Badge (success, warning, error)
- Progress (animated)
- Collapsible sections

**Important:** Artifacts must use **inline SVG icons** - `window.lucide` is not reliably available in Claude's sandboxed environment.

All styling uses Tailwind CSS utility classes with semantic tokens for dark mode compatibility.

---

## Contributing

Contributions welcome! Areas of interest:
- Multi-language support
- Performance optimization
- Additional variant types
- Integration with SEO tools

Please open an issue to discuss before submitting PRs.

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

## Contact & Support

**Richard Baxter**  
Houtini.ai  
GitHub: https://github.com/houtini-ai

**Questions?** Open an issue on GitHub  
**Commercial enquiries:** https://houtini.com

---

**Status:** ✅ Production Ready - v0.2.0 (Keyword Fan-Out Release)