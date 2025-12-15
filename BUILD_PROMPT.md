# Fan-Out MCP: Construction Prompt

**Purpose:** Use this prompt with Claude to build the complete MCP server implementation.

---

## MASTER BUILD PROMPT

```
You are building a production-ready MCP server called "fanout-mcp" that performs advanced content gap analysis using cutting-edge Information Retrieval techniques.

### PROJECT CONTEXT

This MCP implements four research-validated techniques:
1. Query Decomposition (Least-to-Most Prompting) - Break content into query tiers
2. Reverse HyDE (Hypothetical Document Embeddings) - Intent prediction
3. Self-RAG (Self-Reflective RAG) - Coverage assessment with adversarial validation
4. Content Gap Analysis (GEO) - Optimize for AI search engines

Research documentation is in C:\MCP\fanout-mcp\research\:
- ir-research-findings.md - Full validation of approach
- design-decisions.md - Architecture decisions
- technical-implementation.md - Detailed implementation plan
- README.md - Research summary

### BUILD REQUIREMENTS

**Project Location:** C:\MCP\fanout-mcp\
**Language:** TypeScript
**Target:** MCP SDK server that works with Claude Desktop
**MVP Scope:** Single URL analysis tool only (batch/sitemap are future phases)

### EXACT FILE STRUCTURE TO CREATE

```
C:\MCP\fanout-mcp\
├── package.json
├── tsconfig.json
├── README.md (update existing)
├── .gitignore
├── src\
│   ├── index.ts              # MCP server entry point
│   ├── types.ts              # TypeScript interfaces
│   ├── tools\
│   │   └── analyze-content-gap.ts  # Main tool implementation
│   ├── services\
│   │   ├── content-fetcher.ts      # Supadata integration
│   │   ├── query-decomposer.ts     # Query graph generation
│   │   ├── coverage-assessor.ts    # Self-RAG validation
│   │   └── report-formatter.ts     # Output formatting
│   └── prompts\
│       ├── decomposition.ts        # Query decomposition prompt
│       └── assessment.ts           # Coverage assessment prompt
└── research\ (already exists)
```

### TOOL SPECIFICATION

**Tool Name:** `analyze_content_gap`

**Input Schema:**
```typescript
{
  url: string;           // URL to analyze
  depth?: "quick" | "standard" | "comprehensive";  // Default: "standard"
  focus_area?: string;   // Optional: e.g., "pricing", "installation"
}
```

**Query Counts by Depth:**
- quick: 5 queries (1 prerequisite, 3 core, 1 follow-up)
- standard: 15 queries (3 prerequisite, 8 core, 4 follow-up)
- comprehensive: 30 queries (6 prerequisite, 16 core, 8 follow-up)

**Output:** Formatted markdown report with:
- Coverage score (0-100)
- Query graph breakdown by tier
- Per-query coverage assessment with evidence
- Prioritized recommendations
- Summary statistics

### CRITICAL IMPLEMENTATION DETAILS

**1. Content Fetching (Use Supadata MCP)**
```typescript
// Call Supadata's supadata_scrape tool via MCP
const content = await server.callTool('supadata', 'supadata_scrape', {
  url,
  noLinks: false,
  lang: 'en'
});
```

**2. Query Decomposition Prompt (EXACT TEMPLATE)**
```typescript
const prompt = `
Act as a Senior Information Retrieval Scientist.
Analyze this content and generate a query graph using Query Decomposition principles.

CONTENT:
Title: ${content.title}
Word Count: ${wordCount}
Text: ${content.markdown.slice(0, 8000)}

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
    {
      "query": "What is X?",
      "importance": "high|medium|low",
      "rationale": "why this query matters"
    }
  ],
  "core": [...],
  "followup": [...]
}

IMPORTANT: Be specific and realistic. These should be actual user queries, not generic.
`;
```

**3. Coverage Assessment Prompt (EXACT TEMPLATE)**
```typescript
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
    "evidence_location": "approximate location" or null,
    "gap_description": "what's missing" or null,
    "recommendation": "specific action to fix"
  }
]

CRITICAL: If you cannot find EXACT evidence, mark as GAP. Don't hallucinate coverage.
`;
```

**4. Output Format (EXACT TEMPLATE)**
```markdown
## Query Coverage Analysis

**URL:** ${url}
**Title:** ${title}
**Coverage Score:** ${score}/100
**Analysis Date:** ${date}

### Query Graph Breakdown

#### PRE-REQUISITE QUERIES (Foundation)
✅ "What is X?" - **COVERED** (95% confidence)
   Evidence: "..." (line 15-23)

❌ "What is Y?" - **GAP**
   Recommendation: Add 2-3 sentence overview
   Priority: HIGH

#### CORE QUERIES (Main Content)
[... same format ...]

#### FOLLOW-UP QUERIES (Advanced)
[... same format ...]

### Summary Recommendations

**Immediate Actions** (Priority: HIGH)
1. [Specific recommendation with word count estimate]
2. [...]

**Future Enhancements** (Priority: MEDIUM)
3. [...]

**Estimated Work:** X hours
**Expected Coverage Improvement:** Y% → Z%

---

**Coverage Breakdown:**
- Total Queries: ${total}
- Fully Covered: ${covered} (X%)
- Partially Covered: ${partial} (X%)
- Gaps Identified: ${gaps} (X%)
```

### PACKAGE.JSON STRUCTURE

```json
{
  "name": "@houtini/fanout-mcp",
  "version": "0.1.0",
  "description": "Advanced content gap analysis using cutting-edge Information Retrieval techniques",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "fanout-mcp": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "prepare": "npm run build"
  },
  "keywords": [
    "mcp",
    "content-analysis",
    "seo",
    "geo",
    "query-generation",
    "rag"
  ],
  "author": "Richard Baxter <richard@houtini.ai>",
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  }
}
```

### TSCONFIG.JSON

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### ERROR HANDLING REQUIREMENTS

**Must Handle:**
1. Content fetch failures (return clear error message)
2. Paywalled content (suggest copy-paste alternative)
3. Content too short (<500 words) - return minimum length error
4. JSON parsing failures (retry with simplified prompt)
5. Query generation too generic (re-prompt with specificity requirement)

### CRITICAL CONSTRAINTS

1. **NO localStorage/sessionStorage** - Not supported in Claude.ai
2. **Avoid console.log** - Breaks JSON-RPC in MCP
3. **Use stderr for logging** - If logging needed
4. **No emojis in JSONRPC** - Causes parsing issues
5. **Proper error responses** - Use MCP error format

### TESTING CHECKLIST

After building, test with:
1. Your own article: https://driver61.com/[some-article]
2. Verify queries are specific (not "How do I use this?")
3. Check evidence quotes are exact (no hallucination)
4. Confirm recommendations are actionable (not vague)
5. Validate coverage score makes sense

### BUILD EXECUTION STEPS

1. **Create all files in exact structure above**
2. **Implement core functionality:**
   - Content fetching via Supadata MCP call
   - Query decomposition with exact prompt template
   - Coverage assessment in batches of 5 queries
   - Report formatting with exact markdown template
3. **Add TypeScript types for all interfaces**
4. **Implement error handling for all failure points**
5. **Build and test locally**
6. **Update README.md with usage examples**

### SUCCESS CRITERIA

✅ Tool registers successfully in Claude Desktop
✅ Can analyze a URL in <30 seconds
✅ Generates specific, realistic queries
✅ Coverage assessment includes evidence quotes
✅ Recommendations are actionable (not vague)
✅ No errors or warnings in console

### FINAL NOTES

- This is MVP - focus on SINGLE URL analysis only
- Batch and sitemap modes are future phases (don't implement yet)
- Keep prompts EXACT as specified (they're research-validated)
- Prioritize correctness over performance
- Use Anthropic API for LLM calls (not local models for MVP)

---

**NOW BUILD IT:** Create all files, implement all functionality, and ensure it works end-to-end.
```

---

## HOW TO USE THIS PROMPT

1. **Copy the entire prompt above** (everything in the code block)
2. **Paste into a new Claude chat** (or continue in this one)
3. **Claude will create all files and implement the complete MCP server**
4. **After build, test with:** `npx @houtini/fanout-mcp` in claude_desktop_config.json

---

## EXPECTED OUTPUT

Claude should create:
- ✅ Complete TypeScript project structure
- ✅ All source files with implementations
- ✅ Package.json and tsconfig.json configured
- ✅ Working MCP server that can be tested locally
- ✅ Updated README with usage instructions

---

## NEXT STEPS AFTER BUILD

1. **Test locally** - Add to claude_desktop_config.json
2. **Restart Claude Desktop**
3. **Try command:** "Analyze https://example.com/article for query coverage"
4. **Iterate on prompt quality** if needed
5. **Publish to npm** when stable
6. **Write article** documenting the process

---

**Estimated Build Time:** 15-20 minutes  
**Estimated Test/Debug Time:** 10-15 minutes  
**Total Time to Working MCP:** 30-35 minutes
