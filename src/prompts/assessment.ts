import { ContentData, QueryItem } from "../types.js";

export function createAssessmentPrompt(
  content: ContentData,
  queries: QueryItem[]
): string {
  const queriesList = queries
    .map((q, idx) => `${idx + 1}. "${q.query}"`)
    .join("\n");

  return `Act as an adversarial content critic using Self-RAG principles.

CONTENT (Cleaned HTML with structure preserved):
${content.markdown}

QUERIES TO ASSESS:
${queriesList}

TASK:
For EACH query, determine coverage with STRICT validation.
The content uses HTML structure - use tags like <p>, <h2>, <section> to help locate evidence.

COVERED (100% confidence):
- Quote EXACT sentence(s) that fully answer the query (MAX 200 characters)
- Evidence must be complete and unambiguous
- If quote is longer than 200 chars, truncate and add "..."
- Example: "The cost is $49/month" -> COVERED if this exact info exists

PARTIAL (50-80% confidence):
- Content touches the topic but incomplete
- Example: "We offer affordable pricing" -> PARTIAL (no specific cost)
- Quote what exists, explain what's missing

GAP (0% confidence):
- Query is not addressed at all
- No related information found
- Be honest - don't force a match

WORKFLOW:
1. First, analyze each query and find evidence in <thinking> tags
2. Then output ONLY the JSON array with absolutely no other text

OUTPUT FORMAT:
After your thinking, output ONLY a valid JSON array. No preamble, no explanation, no markdown code blocks.
Start your response with [ and end with ]

CRITICAL JSON RULES:
1. NO text before the opening [
2. NO text after the closing ]
3. NO markdown code fences (no backticks)
4. NO trailing commas after last item
5. NO comments in the JSON
6. Use double quotes for all strings
7. Use null (not "null") for missing values
8. ESCAPE ALL SPECIAL CHARACTERS in evidence strings:
   - Backslash: \\ 
   - Quote: \"
   - Newline: \\n
   - Tab: \\t
9. If evidence is very long, truncate to 200 chars and add "..."
10. Strip HTML tags from evidence quotes - extract plain text only

Example valid response structure:
<thinking>
[Your analysis of each query here]
</thinking>

[
  {
    "query": "exact query text here",
    "status": "covered",
    "confidence": 95,
    "evidence": "exact quote from content (plain text, no HTML tags)",
    "evidence_location": "section name or heading",
    "gap_description": null,
    "recommendation": "specific action if needed"
  },
  {
    "query": "another query",
    "status": "gap",
    "confidence": 0,
    "evidence": null,
    "evidence_location": null,
    "gap_description": "what is missing",
    "recommendation": "add this content"
  }
]

CRITICAL: 
- If you cannot find EXACT evidence, mark as GAP
- Don't hallucinate coverage
- Return one object per query in the exact order given`;
}
