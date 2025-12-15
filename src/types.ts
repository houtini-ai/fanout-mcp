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

export interface TechnicalMetrics {
  contentMetrics: {
    totalCharacters: number;
    totalWords: number;
    readabilityScore: number;
    technicalDensity: number;
    avgSentenceLength: number;
    avgWordLength: number;
  };
  queryDecomposition: {
    modelUsed: string;
    decompositionMethod: string;
    totalQueries: number;
    distribution: {
      prerequisite: { count: number; percentage: number; targetRange: string };
      core: { count: number; percentage: number; targetRange: string };
      followup: { count: number; percentage: number; targetRange: string };
    };
    queryQualityMetrics: {
      avgSpecificity: number;
      avgRealism: number;
      genericQueryCount: number;
      domainTermUsage: number;
    };
  };
  selfRAG: {
    modelUsed: string;
    validationMethod: string;
    coverageBreakdown: {
      fullyCovered: { count: number; percentage: number };
      partiallyCovered: { count: number; percentage: number };
      gaps: { count: number; percentage: number };
    };
    evidenceMetrics: {
      avgEvidenceLength: number;
      exactQuoteAccuracy: number;
      hallucinationRate: number;
      avgConfidenceScore: number;
    };
    assessmentQuality: {
      overclaimRate: number;
      underclaimRate: number;
      accurateAssessmentRate: number;
    };
  };
  processingMetrics: {
    totalProcessingTime: string;
    contentFetchTime: string;
    queryGenerationTime: string;
    assessmentTime: string;
    apiCalls: number;
    estimatedCost: string;
  };
  contentExtraction: {
    method: string;
    mainContentFound: boolean;
    extractionQuality: number;
    noiseFilteringScore: number;
    structurePreservation: number;
  };
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
  technical?: TechnicalMetrics;
}
