#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  analyzeContentGap,
  AnalyzeContentGapSchema,
} from "./tools/analyze-content-gap.js";

const server = new Server(
  {
    name: "fanout-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyze_content_gap",
        description:
          "Perform advanced content gap analysis using Query Decomposition and Self-RAG techniques. Analyzes a URL to identify what user queries the content covers and what gaps exist.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "URL of the content to analyze",
            },
            depth: {
              type: "string",
              enum: ["quick", "standard", "comprehensive"],
              description:
                "Analysis depth: quick (5 queries), standard (15 queries), comprehensive (30 queries)",
              default: "standard",
            },
            focus_area: {
              type: "string",
              description:
                "Optional focus area for query generation (e.g., 'pricing', 'installation')",
            },
            target_keyword: {
              type: "string",
              description:
                "Enable keyword fan-out mode: generates query variants based on Google's methodology",
            },
            fan_out_types: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "equivalent",
                  "specification",
                  "generalization",
                  "followUp",
                  "comparison",
                  "clarification",
                  "relatedAspects",
                  "temporal",
                ],
              },
              description:
                "Which variant types to generate (default: equivalent, specification, followUp, comparison, clarification)",
            },
            fan_out_only: {
              type: "boolean",
              description:
                "Skip content inference, only generate keyword variants",
              default: false,
            },
            context: {
              type: "object",
              properties: {
                temporal: {
                  type: "object",
                  properties: {
                    currentDate: {
                      type: "string",
                      description: "Current date in YYYY-MM-DD format",
                    },
                    season: {
                      type: "string",
                      description: "Current season (winter, spring, summer, fall)",
                    },
                  },
                },
                intent: {
                  type: "string",
                  enum: ["shopping", "research", "navigation", "entertainment"],
                  description: "User intent for contextual variant generation",
                },
                specificity_preference: {
                  type: "string",
                  enum: ["broad", "specific", "balanced"],
                  description: "Preferred level of query specificity",
                },
              },
              description: "Optional context signals for variant generation",
            },
          },
          required: ["url"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "analyze_content_gap") {
    try {
      const validatedArgs = AnalyzeContentGapSchema.parse(args);
      const result = await analyzeContentGap(validatedArgs);

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: "text",
            text: "An unknown error occurred",
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.stderr.write("Fanout MCP server running on stdio\n");
}

main().catch((error) => {
  process.stderr.write(`Fatal error: ${error}\n`);
  process.exit(1);
});
