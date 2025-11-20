export enum AnalysisStage {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  GENERATING = 'GENERATING',
  EDIT_PREVIEW = 'EDIT_PREVIEW'
}

export interface ResumeData {
  fullName: string;
  contactInfo: {
    email: string;
    phone: string;
    linkedin?: string;
    website?: string;
    location?: string;
  };
  summary: string;
  skills: string[];
  experience: {
    role: string;
    company: string;
    duration: string;
    details: string[];
  }[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
  projects?: {
    name: string;
    description: string;
    technologies: string[];
  }[];
}

export interface AnalysisResult {
  score: number;
  summary: string;
  matchingKeywords: string[];
  missingKeywords: string[];
  formattingIssues: string[];
  contentRecommendations: string[];
}

export interface UserSession {
  originalResumeText: string;
  resumeFile: {
    data: string;
    mimeType: string;
    name: string;
  } | null;
  jobDescription: string;
  targetRole: string;
  analysis: AnalysisResult | null;
  improvedResume: ResumeData | null;
}
