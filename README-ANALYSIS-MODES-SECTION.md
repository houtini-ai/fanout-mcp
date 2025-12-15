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

---

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