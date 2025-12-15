import Anthropic from "@anthropic-ai/sdk";
import {
  FanOutVariantType,
  FanOutQuery,
  ContentData,
  AnalysisContext,
  QueryImportance,
} from "../types.js";

interface VariantGenerationResponse {
  equivalent?: string[];
  specification?: string[];
  generalization?: string[];
  followUp?: string[];
  comparison?: string[];
  clarification?: string[];
  relatedAspects?: string[];
  temporal?: string[];
}

export class KeywordFanOut {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async generateVariants(
    keyword: string,
    content: ContentData,
    variantTypes: FanOutVariantType[],
    context?: AnalysisContext
  ): Promise<FanOutQuery[]> {
    const startTime = Date.now();

    const prompt = this.buildPrompt(keyword, content, variantTypes, context);

    try {
      const response = await this.client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const rawText = response.content
        .filter((block) => block.type === "text")
        .map((block) => (block as { type: "text"; text: string }).text)
        .join("\n");

      const variants = this.parseVariants(rawText, keyword, context);
      const validated = this.validateVariants(variants, content);

      const generationTime = Date.now() - startTime;

      return validated;
    } catch (error) {
      throw error;
    }
  }

  private buildPrompt(
    keyword: string,
    content: ContentData,
    variantTypes: FanOutVariantType[],
    context?: AnalysisContext
  ): string {
    const contentSummary = this.generateContentSummary(content);
    const contextInfo = this.formatContextInfo(context);
    const typeInstructions = this.generateTypeInstructions(
      variantTypes,
      keyword
    );

    return `<thinking>
You are implementing Google's Query Fan-Out methodology for content gap analysis.

CONTEXT:
- Target Keyword: "${keyword}"
- Content Topic: ${contentSummary}
- Content Type: ${this.detectContentType(content)}
${contextInfo}

YOUR TASK:
Generate query variants that real users would actually type when searching for information 
related to "${keyword}". Each variant must maintain semantic relationship to the keyword.

${typeInstructions}

QUALITY REQUIREMENTS:
✅ Realistic (users would actually type these)
✅ Semantically related to "${keyword}"
✅ Answerable by content (when checking coverage)
✅ Diverse (different angles, not repetitive)
✅ No hallucinated brands/products
❌ No marketing jargon
❌ No overly complex queries
❌ No irrelevant tangents

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no explanation):
{
  "followUp": ["query1", "query2", "query3"],
  "specification": ["query1", "query2", "query3"],
  "generalization": ["query1", "query2"],
  "equivalent": ["query1", "query2", "query3"],
  "comparison": ["query1", "query2", "query3"],
  "clarification": ["query1", "query2"],
  "relatedAspects": ["query1", "query2", "query3"],
  "temporal": ["query1", "query2"]
}

Only include keys for the variant types requested. Generate 3-5 variants per type.
</thinking>

Generate the variants now:`;
  }

  private generateTypeInstructions(
    variantTypes: FanOutVariantType[],
    keyword: string
  ): string {
    const instructions: Record<FanOutVariantType, string> = {
      equivalent: `1. EQUIVALENT VARIANTS (3-5 variants)
Definition: Alternative phrasings with the same intent; different ways to express "${keyword}"
Quality Criteria:
- Must have identical search intent
- Natural language variations
- Regional/dialect differences acceptable

Examples:
- "sim racing cockpit" → "racing simulator rig", "sim rig setup"
- "best protein powder" → "top protein supplements", "recommended protein powder"

Your equivalent variants:`,

      specification: `2. SPECIFICATION VARIANTS (3-5 variants)
Definition: More specific/detailed versions with added qualifiers
Quality Criteria:
- Add brands, models, use cases, or technical details
- Must be answerable with specific information
- Drill down into particular aspects

Examples:
- "sim racing wheels" → "Fanatec DD Pro wheel review", "best sim racing wheel for Formula 1"
- "protein powder" → "whey protein isolate for muscle gain", "vegan protein powder brands"

Your specification variants:`,

      generalization: `3. GENERALIZATION VARIANTS (2-3 variants)
Definition: Broader versions that encompass the keyword within larger context
Quality Criteria:
- Zoom out to related broader topics
- Must still be relevant to original intent
- Opens up to category-level questions

Examples:
- "direct drive sim racing wheels" → "sim racing wheels comparison", "force feedback racing wheels"
- "vegan protein powder" → "plant-based protein sources", "vegan supplements"

Your generalization variants:`,

      followUp: `4. FOLLOW-UP VARIANTS (3-5 variants)
Definition: Logical next questions after learning about "${keyword}"
Quality Criteria:
- Assumes user has basic knowledge from original query
- Explores deeper aspects or related topics
- Natural progression of learning/research

Examples:
- "sim racing wheels" → "how to calibrate sim racing wheel", "best pedals to pair with racing wheel"
- "protein powder" → "when to take protein powder", "protein powder side effects"

Your follow-up variants:`,

      comparison: `5. COMPARISON VARIANTS (3-5 variants)
Definition: Queries seeking to compare options, alternatives, or solutions
Quality Criteria:
- Must compare specific entities or approaches
- "vs", "versus", "compared to" patterns
- "best" for specific criteria

Examples:
- "sim racing wheels" → "Fanatec vs Thrustmaster wheels", "direct drive vs belt driven wheels"
- "protein powder" → "whey vs casein protein", "best budget protein powder"

Your comparison variants:`,

      clarification: `6. CLARIFICATION VARIANTS (2-3 variants)
Definition: Questions seeking to understand concepts, definitions, mechanisms
Quality Criteria:
- "What is...", "How does...", "Why..." patterns
- Address knowledge gaps
- Explain mechanisms or concepts

Examples:
- "direct drive wheels" → "what is direct drive technology", "how do direct drive wheels work"
- "protein powder" → "what is whey protein", "how is protein powder made"

Your clarification variants:`,

      relatedAspects: `7. RELATED ASPECTS VARIANTS (3-5 variants)
Definition: Connected topics or implicit facets not stated in original query
Quality Criteria:
- Identify underlying facets (setup, compatibility, maintenance, etc.)
- Natural extensions of the topic
- Address implicit user needs

Examples:
- "sim racing wheels" → "sim racing wheel setup guide", "wheel compatibility with PC games"
- "protein powder" → "protein powder recipes", "how to mix protein powder"

Your related aspects variants:`,

      temporal: `8. TEMPORAL VARIANTS (2-3 variants)
Definition: Time-specific versions with temporal qualifiers
Quality Criteria:
- Include year, season, or time-based context
- "latest", "new", "2024" qualifiers
- Current trends or releases

Examples:
- "sim racing wheels" → "best sim racing wheels 2024", "new sim racing wheels released 2024"
- "protein powder" → "protein powder black friday deals", "trending protein powders 2024"

Your temporal variants:`,
    };

    return variantTypes.map((type) => instructions[type]).join("\n\n");
  }

  private generateContentSummary(content: ContentData): string {
    const titleWords = content.title.split(" ");
    const descWords = content.description
      ? content.description.split(" ").slice(0, 20).join(" ")
      : "";
    return `${titleWords.slice(0, 10).join(" ")}... ${descWords}`;
  }

  private detectContentType(content: ContentData): string {
    const markdown = content.markdown.toLowerCase();
    if (markdown.includes("review") || markdown.includes("rating")) {
      return "review/comparison";
    }
    if (
      markdown.includes("how to") ||
      markdown.includes("guide") ||
      markdown.includes("tutorial")
    ) {
      return "guide/tutorial";
    }
    if (markdown.includes("buy") || markdown.includes("price")) {
      return "product page";
    }
    return "article/informational";
  }

  private formatContextInfo(context?: AnalysisContext): string {
    if (!context) return "";

    const lines: string[] = [];

    if (context.temporal) {
      if (context.temporal.currentDate) {
        lines.push(`- Current Date: ${context.temporal.currentDate}`);
      }
      if (context.temporal.season) {
        lines.push(`- Season: ${context.temporal.season}`);
      }
    }

    if (context.intent) {
      lines.push(`- User Intent: ${context.intent}`);
    }

    if (context.specificity_preference) {
      lines.push(`- Specificity Preference: ${context.specificity_preference}`);
    }

    return lines.length > 0 ? "\nADDITIONAL CONTEXT:\n" + lines.join("\n") : "";
  }

  private parseVariants(
    rawText: string,
    keyword: string,
    context?: AnalysisContext
  ): FanOutQuery[] {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed: VariantGenerationResponse = JSON.parse(jsonMatch[0]);
    const queries: FanOutQuery[] = [];

    const typeMapping: Array<[keyof VariantGenerationResponse, FanOutVariantType]> = [
      ["equivalent", "equivalent"],
      ["specification", "specification"],
      ["generalization", "generalization"],
      ["followUp", "followUp"],
      ["comparison", "comparison"],
      ["clarification", "clarification"],
      ["relatedAspects", "relatedAspects"],
      ["temporal", "temporal"],
    ];

    for (const [key, variantType] of typeMapping) {
      const variants = parsed[key];
      if (variants && Array.isArray(variants)) {
        for (const query of variants) {
          queries.push({
            query: query.trim(),
            importance: this.assignImportance(variantType),
            rationale: `Generated via keyword fan-out (${variantType} variant of "${keyword}")`,
            variantType,
            sourceKeyword: keyword,
            generationMethod: "fan-out",
            contextSignals: context
              ? {
                  temporal: context.temporal?.currentDate,
                  intent: context.intent,
                  specificity: this.calculateSpecificity(
                    variantType,
                    context.specificity_preference
                  ),
                }
              : undefined,
          });
        }
      }
    }

    return queries;
  }

  private assignImportance(variantType: FanOutVariantType): QueryImportance {
    const importanceMap: Record<FanOutVariantType, QueryImportance> = {
      equivalent: "high",
      specification: "high",
      comparison: "high",
      clarification: "medium",
      generalization: "medium",
      followUp: "medium",
      relatedAspects: "low",
      temporal: "low",
    };

    return importanceMap[variantType];
  }

  private calculateSpecificity(
    variantType: FanOutVariantType,
    preference?: "broad" | "specific" | "balanced"
  ): number {
    const baseSpecificity: Record<FanOutVariantType, number> = {
      specification: 0.9,
      equivalent: 0.7,
      comparison: 0.7,
      clarification: 0.5,
      followUp: 0.6,
      generalization: 0.3,
      relatedAspects: 0.5,
      temporal: 0.6,
    };

    let specificity = baseSpecificity[variantType];

    if (preference === "broad") {
      specificity *= 0.7;
    } else if (preference === "specific") {
      specificity *= 1.3;
    }

    return Math.min(1, Math.max(0, specificity));
  }

  private validateVariants(
    variants: FanOutQuery[],
    content: ContentData
  ): FanOutQuery[] {
    const deduplicated = this.deduplicateVariants(variants);
    const realistic = this.filterUnrealisticQueries(deduplicated);
    return realistic;
  }

  private deduplicateVariants(variants: FanOutQuery[]): FanOutQuery[] {
    const seen = new Set<string>();
    const unique: FanOutQuery[] = [];

    for (const variant of variants) {
      const normalized = variant.query.toLowerCase().trim();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        unique.push(variant);
      }
    }

    return unique;
  }

  private filterUnrealisticQueries(variants: FanOutQuery[]): FanOutQuery[] {
    return variants.filter((variant) => {
      const query = variant.query.toLowerCase();

      if (query.length < 5 || query.length > 150) return false;

      if (query.split(" ").length > 15) return false;

      const marketingWords = [
        "revolutionary",
        "game-changing",
        "cutting-edge",
        "state-of-the-art",
        "next-generation",
      ];
      if (marketingWords.some((word) => query.includes(word))) return false;

      return true;
    });
  }
}
