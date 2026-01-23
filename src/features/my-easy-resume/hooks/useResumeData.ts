import { useState, useCallback } from 'react';
import type {
  ResumeData,
  PersonalInfo,
  Experience,
  Education,
  Skill,
  Language,
  Certification,
  Project,
  ChatMessage,
  ConversationStep,
  ResumeProfile,
  GeneratedResume,
} from '../types';
import { DEFAULT_RESUME_DATA } from '../constants';

export function useResumeData(initialData?: Partial<ResumeData>) {
  const [data, setData] = useState<ResumeData>({
    ...DEFAULT_RESUME_DATA,
    ...initialData,
  });

  // Set Profile
  const setProfile = useCallback((profile: ResumeProfile | null) => {
    setData((prev) => ({ ...prev, profile }));
  }, []);

  // Personal Info
  const setPersonalInfo = useCallback((personalInfo: PersonalInfo) => {
    setData((prev) => ({ ...prev, personalInfo }));
  }, []);

  const updatePersonalInfo = useCallback((updates: Partial<PersonalInfo>) => {
    setData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...updates },
    }));
  }, []);

  // Experiences
  const addExperience = useCallback((experience: Experience) => {
    setData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, experience],
    }));
  }, []);

  const updateExperience = useCallback((id: string, updates: Partial<Experience>) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
    }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== id),
    }));
  }, []);

  const setExperiences = useCallback((experiences: Experience[]) => {
    setData((prev) => ({ ...prev, experiences }));
  }, []);

  // Education
  const addEducation = useCallback((education: Education) => {
    setData((prev) => ({
      ...prev,
      education: [...prev.education, education],
    }));
  }, []);

  const updateEducation = useCallback((id: string, updates: Partial<Education>) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, ...updates } : edu
      ),
    }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  }, []);

  const setEducation = useCallback((education: Education[]) => {
    setData((prev) => ({ ...prev, education }));
  }, []);

  // Skills
  const addSkill = useCallback((skill: Skill) => {
    setData((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));
  }, []);

  const addSkills = useCallback((skills: Skill[]) => {
    setData((prev) => ({
      ...prev,
      skills: [...prev.skills, ...skills],
    }));
  }, []);

  const updateSkill = useCallback((id: string, updates: Partial<Skill>) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) =>
        skill.id === id ? { ...skill, ...updates } : skill
      ),
    }));
  }, []);

  const removeSkill = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== id),
    }));
  }, []);

  const setSkills = useCallback((skills: Skill[]) => {
    setData((prev) => ({ ...prev, skills }));
  }, []);

  // Languages
  const addLanguage = useCallback((language: Language) => {
    setData((prev) => ({
      ...prev,
      languages: [...prev.languages, language],
    }));
  }, []);

  const updateLanguage = useCallback((id: string, updates: Partial<Language>) => {
    setData((prev) => ({
      ...prev,
      languages: prev.languages.map((lang) =>
        lang.id === id ? { ...lang, ...updates } : lang
      ),
    }));
  }, []);

  const removeLanguage = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      languages: prev.languages.filter((lang) => lang.id !== id),
    }));
  }, []);

  const setLanguages = useCallback((languages: Language[]) => {
    setData((prev) => ({ ...prev, languages }));
  }, []);

  // Certifications
  const addCertification = useCallback((certification: Certification) => {
    setData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, certification],
    }));
  }, []);

  const updateCertification = useCallback((id: string, updates: Partial<Certification>) => {
    setData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((cert) =>
        cert.id === id ? { ...cert, ...updates } : cert
      ),
    }));
  }, []);

  const removeCertification = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((cert) => cert.id !== id),
    }));
  }, []);

  const setCertifications = useCallback((certifications: Certification[]) => {
    setData((prev) => ({ ...prev, certifications }));
  }, []);

  // Projects
  const addProject = useCallback((project: Project) => {
    setData((prev) => ({
      ...prev,
      projects: [...prev.projects, project],
    }));
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === id ? { ...proj, ...updates } : proj
      ),
    }));
  }, []);

  const removeProject = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((proj) => proj.id !== id),
    }));
  }, []);

  const setProjects = useCallback((projects: Project[]) => {
    setData((prev) => ({ ...prev, projects }));
  }, []);

  // Professional Summary
  const setProfessionalSummary = useCallback((summary: string) => {
    setData((prev) => ({ ...prev, professionalSummary: summary }));
  }, []);

  // Generated Resume
  const setGeneratedResume = useCallback((resume: GeneratedResume | null) => {
    setData((prev) => ({ ...prev, generatedResume: resume }));
  }, []);

  // Conversation
  const setCurrentStep = useCallback((step: ConversationStep) => {
    setData((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setData((prev) => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, message],
    }));
  }, []);

  const clearConversation = useCallback(() => {
    setData((prev) => ({
      ...prev,
      conversationHistory: [],
      currentStep: 'welcome',
    }));
  }, []);

  // Reset all data
  const resetData = useCallback(() => {
    setData(DEFAULT_RESUME_DATA);
  }, []);

  // Load from existing resume
  const loadFromResume = useCallback((resume: GeneratedResume) => {
    setData((prev) => ({
      ...prev,
      personalInfo: resume.personalInfo,
      experiences: resume.experiences,
      education: resume.education,
      skills: resume.skills,
      languages: resume.languages || [],
      certifications: resume.certifications || [],
      projects: resume.projects || [],
      professionalSummary: resume.professionalSummary,
      generatedResume: resume,
    }));
  }, []);

  return {
    data,
    setProfile,
    personalInfo: {
      data: data.personalInfo,
      set: setPersonalInfo,
      update: updatePersonalInfo,
    },
    experiences: {
      data: data.experiences,
      add: addExperience,
      update: updateExperience,
      remove: removeExperience,
      set: setExperiences,
    },
    education: {
      data: data.education,
      add: addEducation,
      update: updateEducation,
      remove: removeEducation,
      set: setEducation,
    },
    skills: {
      data: data.skills,
      add: addSkill,
      addMultiple: addSkills,
      update: updateSkill,
      remove: removeSkill,
      set: setSkills,
    },
    languages: {
      data: data.languages,
      add: addLanguage,
      update: updateLanguage,
      remove: removeLanguage,
      set: setLanguages,
    },
    certifications: {
      data: data.certifications,
      add: addCertification,
      update: updateCertification,
      remove: removeCertification,
      set: setCertifications,
    },
    projects: {
      data: data.projects,
      add: addProject,
      update: updateProject,
      remove: removeProject,
      set: setProjects,
    },
    professionalSummary: {
      data: data.professionalSummary,
      set: setProfessionalSummary,
    },
    generatedResume: {
      data: data.generatedResume,
      set: setGeneratedResume,
    },
    conversation: {
      currentStep: data.currentStep,
      history: data.conversationHistory,
      setStep: setCurrentStep,
      addMessage,
      clear: clearConversation,
    },
    resetData,
    loadFromResume,
  };
}
