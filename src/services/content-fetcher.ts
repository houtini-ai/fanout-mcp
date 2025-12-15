import fetch from "node-fetch";
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import { ContentData } from "../types.js";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  strongDelimiter: "**",
});

turndownService.remove([
  "script",
  "style",
  "nav",
  "footer",
  "header",
  "aside",
  "iframe",
  "form",
  "button",
]);

export class ContentFetcher {
  async fetchContent(url: string): Promise<ContentData> {
    try {
      const html = await this.fetchUrl(url);
      const extracted = this.extractContent(html, url);

      if (!extracted) {
        throw new Error("Failed to extract content from page");
      }

      if (extracted.content.length < 500) {
        throw new Error(
          "Content too short (minimum 500 characters required)"
        );
      }

      return {
        url,
        title: extracted.title,
        markdown: extracted.content,
        description: extracted.description,
        wordCount: extracted.wordCount,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("403") || error.message.includes("401")) {
          throw new Error(
            "Content is paywalled or requires authentication. Try a different URL."
          );
        }
        throw error;
      }
      throw new Error("Failed to fetch content");
    }
  }

  private async fetchUrl(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FanoutMCP/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    return response.text();
  }

  private extractContent(
    html: string,
    url: string
  ): {
    title: string;
    content: string;
    description?: string;
    wordCount: number;
  } | null {
    const $ = cheerio.load(html);

    $("script, style, nav, footer, header, aside, iframe, form, button, .comments, .sidebar, #comments").remove();

    $('[class*="shortcode"]').remove();

    const articleSelectors = [
      "article",
      '[role="main"]',
      ".post-content",
      ".entry-content",
      ".article-content",
      "main",
    ];

    let $article = null;
    for (const selector of articleSelectors) {
      $article = $(selector).first();
      if ($article.length > 0) break;
    }

    if (!$article || $article.length === 0) {
      $article = $("body");
    }

    let title = $("h1").first().text().trim();
    if (!title) {
      title = $("title").text().trim();
    }

    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content");

    const articleHtml = $article.html() || "";
    const markdown = turndownService.turndown(articleHtml);

    const cleanMarkdown = markdown
      .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, "")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const wordCount = cleanMarkdown
      .split(/\s+/)
      .filter((word: string) => word.length > 0).length;

    return {
      title: title || "Untitled",
      content: cleanMarkdown,
      description,
      wordCount,
    };
  }
}
