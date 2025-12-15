# Fan-Out MCP

**Advanced content gap analysis using cutting-edge Information Retrieval techniques**

---

## Project Status

✅ **Research Phase:** Complete  
✅ **Implementation Phase:** Complete (MVP)  
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

**Analysis Depths:**
- **quick:** 5 queries (1 prerequisite, 3 core, 1 follow-up)
- **standard:** 15 queries (3 prerequisite, 8 core, 4 follow-up)
- **comprehensive:** 30 queries (6 prerequisite, 16 core, 8 follow-up)

**Example Commands:**

```
Analyze https://driver61.com/sim-racing-guide with standard depth

Quick analysis of https://example.com/pricing focusing on "cost"

Comprehensive coverage check for https://example.com/installation-guide
```

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

### 3. Coverage Assessment
Uses Self-RAG (Self-Reflective RAG) to validate coverage:
- **COVERED:** Exact evidence found with quotes
- **PARTIAL:** Topic mentioned but incomplete
- **GAP:** No coverage found

### 4. Report Generation
Produces a markdown report with:
- Coverage score (0-100)
- Per-query assessment with evidence
- Prioritized recommendations
- Statistics breakdown

---

## Output Format

```markdown
## Query Coverage Analysis

**URL:** https://example.com/article
**Title:** Article Title
**Coverage Score:** 73/100
**Analysis Date:** 2024-12-15

### Query Graph Breakdown

#### PRE-REQUISITE QUERIES (Foundation)
✅ "What is X?" - **COVERED** (95% confidence)
   Evidence: "..." (line 15-23)

❌ "What is Y?" - **GAP**
   Recommendation: Add 2-3 sentence overview
   Priority: HIGH

#### CORE QUERIES (Main Content)
[...]

#### FOLLOW-UP QUERIES (Advanced)
[...]

### Summary Recommendations

**Immediate Actions** (Priority: HIGH)
1. Add definition of Y with examples (est. 200 words)
2. Include pricing comparison table

**Future Enhancements** (Priority: MEDIUM)
3. Add advanced configuration examples
4. Link to related troubleshooting guide

---

**Coverage Breakdown:**
- Total Queries: 15
- Fully Covered: 8 (53%)
- Partially Covered: 4 (27%)
- Gaps Identified: 3 (20%)
```

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
- Batched processing (5 queries per API call)

### Report Layer
Structured markdown output:
- Evidence quotes from actual content
- Actionable recommendations
- Clear priority levels

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

### Current (v0.1.0 - MVP)
✅ Single URL analysis  
✅ Built-in web scraping (no external APIs)  
✅ Query decomposition (prerequisite/core/follow-up)  
✅ Self-RAG coverage assessment  
✅ Evidence-based recommendations  
✅ Three analysis depths  

### Planned (Future)
- Batch URL analysis (v1.1)
- Coverage matrix across multiple pages
- Sitemap analysis with interactive dashboard
- JSON export for automation

---

## Technology Stack

- **MCP SDK** - Model Context Protocol
- **Anthropic SDK** - Claude Sonnet 4.5
- **cheerio** - HTML parsing
- **turndown** - Markdown conversion
- **TypeScript** - Implementation

---

## Research Validation

✅ **Query Decomposition** - Established technique (2022+)  
✅ **Reverse HyDE** - Emerging but validated  
✅ **Self-RAG** - Perfect for coverage assessment (2023 paper)  
✅ **GEO Context** - Hot topic in AI search optimization  

**Confidence:** 95% - This approach is research-backed.

---

## License

MIT

---

## Contact

Richard Baxter  
Houtini.ai  
https://github.com/houtiniai

---

**Status:** ✅ MVP Complete - Ready for Testing