export type AnalysisDepth = "quick" | "standard" | "comprehensive";

export type QueryImportance = "high" | "medium" | "low";

export type CoverageStatus = "covered" | "partial" | "gap";

export interface QueryItem {
  query: string;
  importance: QueryImportance;
  rationale: string;
}

export interface QueryGraph {
  prerequisite: QueryItem[];
  core: QueryItem[];
  followup: QueryItem[];
}

export interface CoverageAssessment {
  query: string;
  status: CoverageStatus;
  confidence: number;
  evidence: string | null;
  evidence_location: string | null;
  gap_description: string | null;
  recommendation: string;
}

export interface ContentData {
  url: string;
  title: string;
  markdown: string;
  description?: string;
  wordCount: number;
}

export interface AnalysisReport {
  url: string;
  title: string;
  coverageScore: number;
  analysisDate: string;
  queryGraph: QueryGraph;
  assessments: CoverageAssessment[];
  recommendations: {
    high: string[];
    medium: string[];
  };
  statistics: {
    totalQueries: number;
    covered: number;
    partial: number;
    gaps: number;
  };
}
