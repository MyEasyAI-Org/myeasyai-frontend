/**
 * MyEasyContent Types
 *
 * Type definitions for the social media content creation module.
 */

/**
 * Supported social networks
 */
export type SocialNetwork =
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'twitter'
  | 'tiktok'
  | 'youtube';

/**
 * Content types that can be generated
 */
export type ContentType =
  | 'feed_post'
  | 'caption'
  | 'story'
  | 'reel'
  | 'calendar'
  | 'ideas'
  | 'hashtags'
  | 'best_times';

/**
 * Business niche for templates
 */
export type BusinessNiche =
  | 'restaurant'
  | 'retail'
  | 'consulting'
  | 'health'
  | 'beauty'
  | 'education'
  | 'technology'
  | 'fitness'
  | 'real_estate'
  | 'services'
  | 'other';

/**
 * Content tone/style
 */
export type ContentTone =
  | 'professional'
  | 'casual'
  | 'funny'
  | 'inspirational'
  | 'educational'
  | 'promotional';

/**
 * Generated content item
 */
export interface GeneratedContent {
  id: string;
  type: ContentType;
  network: SocialNetwork;
  title: string;
  content: string;
  hashtags?: string[];
  imageDescription?: string;
  bestTime?: string;
  variations?: string[];
  createdAt: Date;
}

/**
 * Calendar entry for editorial calendar
 */
export interface CalendarEntry {
  id: string;
  date: Date;
  dayOfWeek: string;
  network: SocialNetwork;
  contentType: ContentType;
  title: string;
  description: string;
  hashtags: string[];
  bestTime: string;
  status: 'planned' | 'draft' | 'ready' | 'published';
}

/**
 * Content idea
 */
export interface ContentIdea {
  id: string;
  title: string;
  description: string;
  networks: SocialNetwork[];
  contentTypes: ContentType[];
  tags: string[];
}

/**
 * Saved content library item
 */
export interface SavedContent {
  id: string;
  content: GeneratedContent;
  savedAt: Date;
  folder?: string;
  tags: string[];
  isFavorite: boolean;
}

/**
 * Template for content generation
 */
export interface ContentTemplate {
  id: string;
  name: string;
  niche: BusinessNiche;
  contentType: ContentType;
  network: SocialNetwork;
  structure: string;
  exampleOutput: string;
}

/**
 * Content data state for the module
 */
export interface ContentData {
  // Business info
  businessName: string;
  businessNiche: BusinessNiche;
  targetAudience: string;
  brandVoice: ContentTone;

  // Selected options
  selectedNetworks: SocialNetwork[];
  selectedContentTypes: ContentType[];

  // Generated content
  generatedContents: GeneratedContent[];
  calendar: CalendarEntry[];
  ideas: ContentIdea[];

  // Library
  savedContents: SavedContent[];

  // Current session
  currentTopic: string;
  currentObjective: string;
}

/**
 * Conversation message for the chat
 */
export interface ContentMessage {
  role: 'user' | 'assistant';
  content: string;
  options?: Array<{
    label: string;
    value: string;
    icon?: string;
    description?: string;
  }>;
  showNetworkSelector?: boolean;
  showContentTypeSelector?: boolean;
  showNicheSelector?: boolean;
  showToneSelector?: boolean;
  showGeneratedContent?: boolean;
  showCalendar?: boolean;
  generatedContent?: GeneratedContent;
  calendar?: CalendarEntry[];
}

/**
 * Best posting times by network
 */
export interface BestPostingTimes {
  network: SocialNetwork;
  times: Array<{
    day: string;
    time: string;
    engagement: 'high' | 'medium' | 'low';
  }>;
}

/**
 * Export format options
 */
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

/**
 * Business profile for multi-profile support
 * Mirrors D1 content_business_profiles table
 */
export interface ContentBusinessProfile {
  id: string;
  user_id: string;
  name: string;
  business_niche: BusinessNiche;
  target_audience: string | null;
  brand_voice: ContentTone;
  selected_networks: SocialNetwork[];
  preferred_content_types: ContentType[];
  icon: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string | null;
}

/**
 * Input for creating a new business profile
 */
export interface CreateContentProfileInput {
  name: string;
  business_niche: BusinessNiche;
  target_audience?: string;
  brand_voice?: ContentTone;
  selected_networks?: SocialNetwork[];
  preferred_content_types?: ContentType[];
  icon?: string;
  is_default?: boolean;
}

/**
 * Content generation request
 */
export interface ContentGenerationRequest {
  contentType: ContentType;
  network: SocialNetwork;
  topic: string;
  objective?: string;
  tone?: ContentTone;
  includeHashtags?: boolean;
  includeImageDescription?: boolean;
  includeBestTime?: boolean;
  generateVariations?: boolean;
  variationCount?: number;
}
