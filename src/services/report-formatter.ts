import {
  AnalysisReport,
  QueryGraph,
  CoverageAssessment,
  ContentData,
} from "../types.js";

export class ReportFormatter {
  formatReport(
    content: ContentData,
    queryGraph: QueryGraph,
    assessments: CoverageAssessment[]
  ): string {
    const report = this.buildReport(content, queryGraph, assessments);
    return this.generateMarkdown(report);
  }

  private buildReport(
    content: ContentData,
    queryGraph: QueryGraph,
    assessments: CoverageAssessment[]
  ): AnalysisReport {
    const statistics = this.calculateStatistics(assessments);
    const coverageScore = this.calculateCoverageScore(assessments);
    const recommendations = this.extractRecommendations(assessments);

    return {
      url: content.url,
      title: content.title,
      coverageScore,
      analysisDate: new Date().toISOString().split("T")[0],
      queryGraph,
      assessments,
      recommendations,
      statistics,
    };
  }

  private calculateStatistics(assessments: CoverageAssessment[]) {
    const covered = assessments.filter((a) => a.status === "covered").length;
    const partial = assessments.filter((a) => a.status === "partial").length;
    const gaps = assessments.filter((a) => a.status === "gap").length;

    return {
      totalQueries: assessments.length,
      covered,
      partial,
      gaps,
    };
  }

  private calculateCoverageScore(assessments: CoverageAssessment[]): number {
    if (assessments.length === 0) return 0;

    const totalScore = assessments.reduce((sum, assessment) => {
      if (assessment.status === "covered") return sum + 100;
      if (assessment.status === "partial") return sum + 50;
      return sum;
    }, 0);

    return Math.round(totalScore / assessments.length);
  }

  private extractRecommendations(assessments: CoverageAssessment[]) {
    const high: string[] = [];
    const medium: string[] = [];

    assessments.forEach((assessment) => {
      if (assessment.status === "gap") {
        high.push(assessment.recommendation);
      } else if (assessment.status === "partial") {
        medium.push(assessment.recommendation);
      }
    });

    return { high, medium };
  }

  private generateMarkdown(report: AnalysisReport): string {
    const sections: string[] = [];

    sections.push(`## Query Coverage Analysis\n`);
    sections.push(`**URL:** ${report.url}`);
    sections.push(`**Title:** ${report.title}`);
    sections.push(`**Coverage Score:** ${report.coverageScore}/100`);
    sections.push(`**Analysis Date:** ${report.analysisDate}\n`);

    sections.push(`### Query Graph Breakdown\n`);

    sections.push(this.formatQuerySection(
      "PRE-REQUISITE QUERIES (Foundation)",
      report.queryGraph.prerequisite,
      report.assessments
    ));

    sections.push(this.formatQuerySection(
      "CORE QUERIES (Main Content)",
      report.queryGraph.core,
      report.assessments
    ));

    sections.push(this.formatQuerySection(
      "FOLLOW-UP QUERIES (Advanced)",
      report.queryGraph.followup,
      report.assessments
    ));

    sections.push(`### Summary Recommendations\n`);

    if (report.recommendations.high.length > 0) {
      sections.push(`**Immediate Actions** (Priority: HIGH)`);
      report.recommendations.high.forEach((rec, idx) => {
        sections.push(`${idx + 1}. ${rec}`);
      });
      sections.push("");
    }

    if (report.recommendations.medium.length > 0) {
      sections.push(`**Future Enhancements** (Priority: MEDIUM)`);
      report.recommendations.medium.forEach((rec, idx) => {
        sections.push(`${idx + 1}. ${rec}`);
      });
      sections.push("");
    }

    sections.push(`---\n`);
    sections.push(`**Coverage Breakdown:**`);
    sections.push(`- Total Queries: ${report.statistics.totalQueries}`);
    sections.push(
      `- Fully Covered: ${report.statistics.covered} (${Math.round(
        (report.statistics.covered / report.statistics.totalQueries) * 100
      )}%)`
    );
    sections.push(
      `- Partially Covered: ${report.statistics.partial} (${Math.round(
        (report.statistics.partial / report.statistics.totalQueries) * 100
      )}%)`
    );
    sections.push(
      `- Gaps Identified: ${report.statistics.gaps} (${Math.round(
        (report.statistics.gaps / report.statistics.totalQueries) * 100
      )}%)`
    );

    return sections.join("\n");
  }

  private formatQuerySection(
    title: string,
    queries: any[],
    assessments: CoverageAssessment[]
  ): string {
    const lines: string[] = [];
    lines.push(`#### ${title}\n`);

    queries.forEach((query) => {
      const assessment = assessments.find((a) => a.query === query.query);
      if (!assessment) return;

      const statusIcon =
        assessment.status === "covered"
          ? "✅"
          : assessment.status === "partial"
          ? "⚠️"
          : "❌";
      const statusText =
        assessment.status === "covered"
          ? "COVERED"
          : assessment.status === "partial"
          ? "PARTIAL"
          : "GAP";

      lines.push(
        `${statusIcon} "${query.query}" - **${statusText}** (${assessment.confidence}% confidence)`
      );

      if (assessment.evidence) {
        lines.push(`   Evidence: "${assessment.evidence}"`);
        if (assessment.evidence_location) {
          lines.push(`   Location: ${assessment.evidence_location}`);
        }
      }

      if (assessment.gap_description) {
        lines.push(`   Gap: ${assessment.gap_description}`);
      }

      if (assessment.recommendation) {
        lines.push(`   Recommendation: ${assessment.recommendation}`);
      }

      lines.push("");
    });

    return lines.join("\n");
  }
}
