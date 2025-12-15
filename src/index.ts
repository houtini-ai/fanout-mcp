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
