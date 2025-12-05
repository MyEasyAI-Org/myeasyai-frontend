// =============================================
// MyEasyCRM - Main Module Export
// =============================================
// This is the public API for the MyEasyCRM module.
// Import from here when using the CRM in other parts of the app.
// =============================================

// Main component
export { MyEasyCRM, default } from './MyEasyCRM';

// Types (for external use)
export type {
  Contact,
  ContactFormData,
  ContactFilters,
  Company,
  CompanyFormData,
  Deal,
  DealFormData,
  DealFilters,
  DealStage,
  Pipeline,
  Task,
  TaskFormData,
  TaskFilters,
  TaskType,
  TaskPriority,
  Activity,
  ActivityFormData,
  ActivityType,
  CRMView,
} from './types';

// Constants (for external use if needed)
export {
  DEAL_STAGES,
  TASK_TYPES,
  TASK_PRIORITIES,
  ACTIVITY_TYPES,
  LEAD_SOURCES,
  INDUSTRY_TYPES,
} from './constants';

// Hooks (for advanced/custom usage)
export {
  useContacts,
  useContact,
  useCompanies,
  useCompany,
  useCompaniesSelect,
  useDeals,
  usePipeline,
  useDeal,
  useDealMetrics,
  useTasks,
  usePendingTasks,
  useTodayTasks,
  useOverdueTasks,
  useTaskCounts,
  useActivities,
  useContactActivities,
  useDealActivities,
  useRecentActivities,
  useActivityStats,
} from './hooks';

// Services (for advanced/custom usage)
export {
  ContactService,
  CompanyService,
  DealService,
  TaskService,
  ActivityService,
} from './services';
