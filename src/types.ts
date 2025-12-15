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
  markdown: string; // Actually cleaned HTML now, keeping name for compatibility
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


export type FanOutVariantType = 
  | "equivalent"      
  | "specification"   
  | "generalization"  
  | "followUp"        
  | "comparison"      
  | "clarification"   
  | "relatedAspects"  
  | "temporal";       

export interface FanOutQuery extends QueryItem {
  variantType: FanOutVariantType;
  sourceKeyword: string;
  generationMethod: "fan-out" | "content-inference" | "hybrid";
  contextSignals?: {
    temporal?: string;     
    intent?: string;       
    specificity?: number;  
  };
}

export interface EnhancedQueryGraph extends QueryGraph {
  fanOutVariants?: {
    [key in FanOutVariantType]?: FanOutQuery[];
  };
  targetKeyword?: string;
  generationMetadata?: {
    contentInferenceTime: number;
    fanOutTime: number;
    totalVariants: number;
    variantDistribution: Record<FanOutVariantType, number>;
  };
}

export interface AnalysisContext {
  temporal?: {
    currentDate?: string;
    season?: string;
    proximity_to_events?: string[];
  };
  intent?: "shopping" | "research" | "navigation" | "entertainment";
  specificity_preference?: "broad" | "specific" | "balanced";
}

export interface FanOutMetadata {
  mode: "content-only" | "hybrid" | "keyword-only";
  targetKeyword?: string;
  variantCounts?: Record<FanOutVariantType, number>;
  totalVariants?: number;
  generationTime?: number;
}

export interface EnhancedAnalysisReport extends AnalysisReport {
  queryGraph: EnhancedQueryGraph;
  fanOutMetadata?: FanOutMetadata;
}
