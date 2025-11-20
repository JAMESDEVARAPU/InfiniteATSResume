import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, ResumeData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "ATS compatibility score from 0 to 100" },
    summary: { type: Type.STRING, description: "Brief summary of the analysis" },
    matchingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Keywords found in both resume and JD" },
    missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Important keywords from JD missing in resume" },
    formattingIssues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of potential formatting issues" },
    contentRecommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable advice to improve the resume" },
  },
  required: ["score", "summary", "matchingKeywords", "missingKeywords", "formattingIssues", "contentRecommendations"]
};

const resumeDataSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING },
    contactInfo: {
      type: Type.OBJECT,
      properties: {
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        website: { type: Type.STRING },
        location: { type: Type.STRING }
      },
      required: ["email", "phone"]
    },
    summary: { type: Type.STRING },
    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          company: { type: Type.STRING },
          duration: { type: Type.STRING },
          details: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["role", "company", "duration", "details"]
      }
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          degree: { type: Type.STRING },
          school: { type: Type.STRING },
          year: { type: Type.STRING }
        },
        required: ["degree", "school", "year"]
      }
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          technologies: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  },
  required: ["fullName", "contactInfo", "summary", "skills", "experience", "education"]
};

type ResumeInput = {
  text: string;
  file: { data: string; mimeType: string } | null;
};

type JobContext = {
  description: string;
  role: string;
};

const getJobContextString = (context: JobContext): string => {
  if (context.description && context.description.trim().length > 20) {
    return `JOB DESCRIPTION:\n${context.description.substring(0, 15000)}`;
  }
  return `TARGET ROLE: ${context.role || "General Professional"}\n(No specific Job Description provided. Evaluate based on industry standards for this role.)`;
};

export const analyzeResumeWithGemini = async (resume: ResumeInput, context: JobContext): Promise<AnalysisResult> => {
  try {
    const jobContextStr = getJobContextString(context);
    const prompt = `
      You are an expert Applicant Tracking System (ATS) analyzer.
      Analyze the following Resume against the target Job Context.
      
      ${jobContextStr}
      
      Provide a strict assessment of how well the resume matches the requirements.
      Identify keywords, score the match, and provide specific recommendations.
    `;

    const parts = [];
    
    if (resume.file) {
      parts.push({
        inlineData: {
          mimeType: resume.file.mimeType,
          data: resume.file.data
        }
      });
    } else {
      parts.push({
        text: `RESUME TEXT:\n${resume.text.substring(0, 15000)}`
      });
    }
    
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error("Failed to analyze resume. Please try again.");
  }
};

export const generateImprovedResume = async (resume: ResumeInput, context: JobContext, currentAnalysis: AnalysisResult): Promise<ResumeData> => {
  try {
    const jobContextStr = getJobContextString(context);
    const prompt = `
      You are a professional Resume Writer. 
      Rewrite the following resume to perfectly target the Job Context provided.
      
      Goals:
      1. Incorporate these missing keywords naturally: ${currentAnalysis.missingKeywords.join(', ')}.
      2. Use strong action verbs.
      3. Quantify achievements where possible (infer reasonable metrics if context allows, or use placeholders like [X]%).
      4. Keep the format professional and clean.
      5. Ensure the Summary is punchy and relevant.
      
      ${jobContextStr}
      
      Return the data in a structured JSON format that fits the schema provided.
    `;

    const parts = [];
    
    if (resume.file) {
      parts.push({
        inlineData: {
          mimeType: resume.file.mimeType,
          data: resume.file.data
        }
      });
    } else {
      parts.push({
        text: `RESUME TEXT:\n${resume.text.substring(0, 15000)}`
      });
    }

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: resumeDataSchema,
        temperature: 0.4,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ResumeData;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Generation failed:", error);
    throw new Error("Failed to generate improved resume.");
  }
};
