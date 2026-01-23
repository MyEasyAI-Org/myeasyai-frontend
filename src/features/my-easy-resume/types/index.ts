// Enums and Types for MyEasyResume

export type CareerLevel = 'entry' | 'mid' | 'senior' | 'executive';

export type TemplateStyle = 'traditional' | 'modern' | 'ats' | 'creative';

export type ResumeLanguage = 'pt-BR' | 'en-US' | 'es-ES';

export type ResumeContentType =
  | 'professional_summary'
  | 'experience_description'
  | 'skills_suggestion'
  | 'achievement_quantify'
  | 'full_resume';

export type ConversationStep =
  | 'welcome'
  | 'career_level'
  | 'target_role'
  | 'industry'
  | 'template_style'
  | 'language'
  | 'personal_info'
  | 'contact_email'
  | 'contact_phone'
  | 'contact_location'
  | 'contact_links'
  | 'experience_input'
  | 'education_input'
  | 'skills_input'
  | 'review'
  | 'generating'
  | 'result';

// Personal Information
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string; // City, State/Country
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
}

// Experience Entry
export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string; // YYYY-MM
  endDate: string | null; // null = current
  description: string;
  achievements: string[];
  isCurrentJob: boolean;
}

// Education Entry
export interface Education {
  id: string;
  institution: string;
  degree: string; // "Bachelor's", "Master's", etc.
  field: string; // "Computer Science", etc.
  location: string;
  startDate: string; // YYYY-MM
  endDate: string | null;
  gpa?: string;
  honors?: string;
  isCurrentlyEnrolled: boolean;
}

// Skill
export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'tool';
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

// Language
export interface Language {
  id: string;
  name: string;
  proficiency: 'basic' | 'intermediate' | 'advanced' | 'fluent' | 'native';
}

// Certification
export interface Certification {
  id: string;
  name: string;
  issuer: string;
  dateObtained: string; // YYYY-MM
  expiryDate?: string; // YYYY-MM
  credentialUrl?: string;
}

// Project
export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

// Generated Resume
export interface GeneratedResume {
  id: string;
  personalInfo: PersonalInfo;
  professionalSummary: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages?: Language[];
  certifications?: Certification[];
  projects?: Project[];
  createdAt: Date;
}

// Resume Profile
export interface ResumeProfile {
  id: string;
  user_id: string;
  name: string;
  career_level: CareerLevel;
  target_role: string;
  industry: string;
  template_style: TemplateStyle;
  preferred_language: ResumeLanguage;
  is_default: boolean;
  created_at: string;
  updated_at: string | null;
}

// Create Resume Profile Input
export interface CreateResumeProfileInput {
  name: string;
  career_level: CareerLevel;
  target_role: string;
  industry: string;
  template_style: TemplateStyle;
  preferred_language: ResumeLanguage;
  is_default: boolean;
}

// Resume Library Item (saved resume)
export interface ResumeLibraryItem {
  id: string;
  user_id: string;
  profile_id: string;
  version_name: string;
  personalInfo: PersonalInfo;
  professionalSummary: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  projects: Project[];
  is_favorite: boolean;
  tags: string[];
  created_at: string;
  updated_at: string | null;
}

// D1 Database Types
export interface D1ResumeProfile {
  id: string;
  user_id: string;
  name: string;
  career_level: string;
  target_role: string;
  industry: string;
  template_style: string;
  preferred_language: string;
  is_default: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface D1Resume {
  id: string;
  user_id: string;
  profile_id: string;
  version_name: string;
  personal_info: string; // JSON
  professional_summary: string;
  experiences: string; // JSON array
  education: string; // JSON array
  skills: string; // JSON array
  languages: string; // JSON array
  certifications: string; // JSON array
  projects: string; // JSON array
  is_favorite: boolean;
  tags: string; // JSON array
  created_at: string;
  updated_at: string | null;
}

// Chat Message
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  step?: ConversationStep;
  timestamp: Date;
}

// Resume Generation Request
export interface ResumeGenerationRequest {
  profile: ResumeProfile;
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages?: Language[];
  certifications?: Certification[];
  projects?: Project[];
  contentType: ResumeContentType;
}

// Resume Data State
export interface ResumeData {
  profile: ResumeProfile | null;
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  projects: Project[];
  professionalSummary: string;
  generatedResume: GeneratedResume | null;
  currentStep: ConversationStep;
  conversationHistory: ChatMessage[];
}
