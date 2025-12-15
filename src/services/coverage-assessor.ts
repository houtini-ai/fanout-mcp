import Anthropic from "@anthropic-ai/sdk";
import {
  ContentData,
  QueryItem,
  CoverageAssessment,
  QueryGraph,
} from "../types.js";
import { createAssessmentPrompt } from "../prompts/assessment.js";

const BATCH_SIZE = 5;

export class CoverageAssessor {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async assessCoverage(
    content: ContentData,
    queryGraph: QueryGraph
  ): Promise<CoverageAssessment[]> {
    const allQueries = [
      ...queryGraph.prerequisite,
      ...queryGraph.core,
      ...queryGraph.followup,
    ];

    const assessments: CoverageAssessment[] = [];

    for (let i = 0; i < allQueries.length; i += BATCH_SIZE) {
      const batch = allQueries.slice(i, i + BATCH_SIZE);
      const batchAssessments = await this.assessBatch(content, batch);
      assessments.push(...batchAssessments);
    }

    return assessments;
  }

  private async assessBatch(
    content: ContentData,
    queries: QueryItem[]
  ): Promise<CoverageAssessment[]> {
    const prompt = createAssessmentPrompt(content, queries);

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
      
      // Extract JSON array - try to find the most complete match
      const jsonMatch = cleanText.match(/\[\s*\{[\s\S]*\}\s*\]/);

      if (!jsonMatch) {
        throw new Error(`Failed to extract JSON from response. Response text: ${cleanText.substring(0, 500)}`);
      }

      // Clean up common JSON issues
      let jsonStr = jsonMatch[0];
      
      // Remove trailing commas before closing braces/brackets
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
      
      // Try to parse
      let assessments: CoverageAssessment[];
      try {
        assessments = JSON.parse(jsonStr);
      } catch (parseError) {
        throw new Error(`JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. JSON: ${jsonStr.substring(0, 500)}`);
      }

      if (!Array.isArray(assessments)) {
        throw new Error("Invalid assessment structure");
      }

      return assessments;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Coverage assessment failed: ${error.message}`);
      }
      throw new Error("Coverage assessment failed");
    }
  }
}
