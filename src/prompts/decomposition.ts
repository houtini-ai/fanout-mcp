import { ContentData } from "../types.js";

export function createDecompositionPrompt(
  content: ContentData,
  queryCount: number
): string {
  const prereqCount = Math.floor(queryCount * 0.2);
  const coreCount = Math.floor(queryCount * 0.5);
  const followupCount = Math.floor(queryCount * 0.3);

  return `Act as a Senior Information Retrieval Scientist.
Analyze this content and generate a query graph using Query Decomposition principles.

CONTENT:
Title: ${content.title}
Word Count: ${content.wordCount}
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
- Pre-requisite: ${prereqCount} queries
- Core: ${coreCount} queries
- Follow-up: ${followupCount} queries

WORKFLOW:
1. First, analyze the content and plan your queries in <thinking> tags
2. Then output ONLY the JSON with absolutely no other text

OUTPUT FORMAT:
After your thinking, output ONLY a valid JSON object. No preamble, no explanation, no markdown code blocks.
Start your response with { and end with }

CRITICAL JSON RULES:
1. NO text before the opening {
2. NO text after the closing }
3. NO markdown code fences (no backticks)
4. NO trailing commas after last item
5. NO comments in the JSON
6. Use double quotes for all strings
7. importance must be exactly: "high", "medium", or "low"
8. All three arrays must exist: prerequisite, core, followup

Example valid response structure:
<thinking>
[Your analysis here]
</thinking>

{
  "prerequisite": [
    {
      "query": "What is X?",
      "importance": "high",
      "rationale": "why this query matters"
    }
  ],
  "core": [
    {
      "query": "How to do Y?",
      "importance": "high",
      "rationale": "why this query matters"
    }
  ],
  "followup": [
    {
      "query": "What about Z?",
      "importance": "medium",
      "rationale": "why this query matters"
    }
  ]
}

REQUIRED COUNTS:
- Generate exactly ${prereqCount} prerequisite queries
- Generate exactly ${coreCount} core queries  
- Generate exactly ${followupCount} followup queries

IMPORTANT: 
- Be specific and realistic
- These should be actual user queries, not generic
- Focus on what users would really search for`;
}
