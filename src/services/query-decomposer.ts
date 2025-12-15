import Anthropic from "@anthropic-ai/sdk";
import { ContentData, QueryGraph, AnalysisDepth } from "../types.js";
import { createDecompositionPrompt } from "../prompts/decomposition.js";

const QUERY_COUNTS = {
  quick: 5,
  standard: 15,
  comprehensive: 30,
};

export class QueryDecomposer {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async decomposeQueries(
    content: ContentData,
    depth: AnalysisDepth = "standard",
    focusArea?: string
  ): Promise<QueryGraph> {
    const queryCount = QUERY_COUNTS[depth];
    let prompt = createDecompositionPrompt(content, queryCount);

    if (focusArea) {
      prompt += `\n\nFOCUS AREA: Generate queries specifically related to "${focusArea}".`;
    }

    try {
      const response = await this.client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content_block = response.content[0];
      if (content_block.type !== "text") {
        throw new Error("Unexpected response type from Claude");
      }

      const text = content_block.text;
      
      // Remove thinking tags if present
      const cleanText = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '').trim();
      
      // Extract JSON object - look for complete structure
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error(`Failed to extract JSON from response. Response text: ${cleanText.substring(0, 500)}`);
      }

      // Clean up common JSON issues
      let jsonStr = jsonMatch[0];
      
      // Remove trailing commas before closing braces/brackets
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
      
      // Try to parse
      let queryGraph: QueryGraph;
      try {
        queryGraph = JSON.parse(jsonStr);
      } catch (parseError) {
        throw new Error(`JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. JSON: ${jsonStr.substring(0, 500)}`);
      }

      if (
        !queryGraph.prerequisite ||
        !queryGraph.core ||
        !queryGraph.followup
      ) {
        throw new Error("Invalid query graph structure");
      }

      return queryGraph;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Query decomposition failed: ${error.message}`);
      }
      throw new Error("Query decomposition failed");
    }
  }
}
