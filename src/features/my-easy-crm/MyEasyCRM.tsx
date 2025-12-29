// =============================================
// MyEasyCRM - Main Component
// =============================================
// This is the main entry point for the MyEasyCRM module.
// It manages all views, state, and routing within the CRM.
// =============================================

import { useState, useCallback } from 'react';
import type {
  CRMView,
  Contact,
  Company,
  Deal,
  Task,
  Activity,
  ContactFormData,
  CompanyFormData,
  DealFormData,
  TaskFormData,
  ActivityFormData,
  DealStage,
  ActivityType,
} from './types';

// Layout
import { CRMLayout } from './components/layout';

// Views
import { CRMDashboard } from './components/dashboard';
import { ContactList, ContactForm, ContactDetail } from './components/contacts';
import { CompanyList, CompanyForm, CompanyDetail } from './components/companies';
import { PipelineKanban, DealForm, DealDetail, LostReasonModal } from './components/deals';
import { TaskList, TaskForm } from './components/tasks';
import { ActivityList, ActivityForm } from './components/activities';
import { ConfirmDialog } from './components/shared';

// Hooks
import {
  useContacts,
  useContact,
  useCompanies,
  useCompany,
  usePipeline,
  useDeal,
  useTasks,
  useActivities,
} from './hooks';

interface MyEasyCRMProps {
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  onBackToMain?: () => void;
}

export function MyEasyCRM({
  userName = 'Usuário',
  userEmail,
  onLogout,
  onBackToMain,
}: MyEasyCRMProps) {
  // Current view state
  const [currentView, setCurrentView] = useState<CRMView>('dashboard');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  // Form states
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [dealFormOpen, setDealFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [initialDealStage, setInitialDealStage] = useState<DealStage | undefined>();
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activityFormOpen, setActivityFormOpen] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>('note');
  const [activityContactId, setActivityContactId] = useState<string | undefined>();
  const [activityDealId, setActivityDealId] = useState<string | undefined>();

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'contact' | 'company' | 'deal' | 'task' | 'activity'>('contact');
  const [deleteTarget, setDeleteTarget] = useState<Contact | Company | Deal | Task | Activity | null>(null);

  // Lost reason modal
  const [lostReasonModalOpen, setLostReasonModalOpen] = useState(false);
  const [movingDeal, setMovingDeal] = useState<Deal | null>(null);

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data hooks
  const {
    contacts,
    isLoading: loadingContacts,
    error: contactsError,
    totalCount: contactsCount,
    filters: contactFilters,
    setFilters: setContactFilters,
    createContact,
    updateContact,
    deleteContact,
    refresh: refreshContacts,
  } = useContacts();

  const { contact: selectedContact, isLoading: loadingContact } = useContact(selectedContactId);

  const {
    companies,
    isLoading: loadingCompanies,
    error: companiesError,
    totalCount: companiesCount,
    searchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    refresh: refreshCompanies,
  } = useCompanies();

  const { company: selectedCompany, isLoading: loadingCompany } = useCompany(selectedCompanyId);

  const {
    pipeline,
    isLoading: loadingPipeline,
    error: pipelineError,
    moveDealToStage: moveDealToStagePipeline,
    createDeal: createDealPipeline,
    updateDeal: updateDealPipeline,
    deleteDeal: deleteDealPipeline,
  } = usePipeline();

  const { deal: selectedDeal, isLoading: loadingDeal, moveDealToStage } = useDeal(selectedDealId);

  const {
    tasks,
    isLoading: loadingTasks,
    error: tasksError,
    totalCount: tasksCount,
    filters: taskFilters,
    setFilters: setTaskFilters,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    refresh: refreshTasks,
  } = useTasks();

  const {
    activities,
    isLoading: loadingActivities,
    error: activitiesError,
    createActivity,
    deleteActivity,
    refresh: refreshActivities,
  } = useActivities();

  // Navigation handlers
  const handleViewChange = useCallback((view: CRMView) => {
    setCurrentView(view);
    setSelectedContactId(null);
    setSelectedCompanyId(null);
    setSelectedDealId(null);
  }, []);

  const handleQuickAction = useCallback((action: 'contact' | 'company' | 'deal' | 'task') => {
    switch (action) {
      case 'contact':
        setEditingContact(null);
        setContactFormOpen(true);
        break;
      case 'company':
        setEditingCompany(null);
        setCompanyFormOpen(true);
        break;
      case 'deal':
        setEditingDeal(null);
        setInitialDealStage(undefined);
        setDealFormOpen(true);
        break;
      case 'task':
        setEditingTask(null);
        setTaskFormOpen(true);
        break;
    }
  }, []);

  // Contact handlers
  const handleViewContact = useCallback((contact: Contact) => {
    setSelectedContactId(contact.id);
    setCurrentView('contact-detail');
  }, []);

  const handleEditContact = useCallback((contact: Contact) => {
    setEditingContact(contact);
    setContactFormOpen(true);
  }, []);

  const handleDeleteContact = useCallback((contact: Contact) => {
    setDeleteType('contact');
    setDeleteTarget(contact);
    setDeleteConfirmOpen(true);
  }, []);

  const handleContactSubmit = useCallback(async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      if (editingContact) {
        await updateContact(editingContact.id, data);
      } else {
        await createContact(data);
      }
      setContactFormOpen(false);
      setEditingContact(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [editingContact, createContact, updateContact]);

  // Company handlers
  const handleViewCompany = useCallback((company: Company) => {
    setSelectedCompanyId(company.id);
    setCurrentView('company-detail');
  }, []);

  const handleEditCompany = useCallback((company: Company) => {
    setEditingCompany(company);
    setCompanyFormOpen(true);
  }, []);

  const handleDeleteCompany = useCallback((company: Company) => {
    setDeleteType('company');
    setDeleteTarget(company);
    setDeleteConfirmOpen(true);
  }, []);

  const handleCompanySubmit = useCallback(async (data: CompanyFormData) => {
    setIsSubmitting(true);
    try {
      if (editingCompany) {
        await updateCompany(editingCompany.id, data);
      } else {
        await createCompany(data);
      }
      setCompanyFormOpen(false);
      setEditingCompany(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [editingCompany, createCompany, updateCompany]);

  // Deal handlers
  const handleCreateDeal = useCallback((stage?: DealStage) => {
    setEditingDeal(null);
    setInitialDealStage(stage);
    setDealFormOpen(true);
  }, []);

  const handleViewDeal = useCallback((deal: Deal) => {
    setSelectedDealId(deal.id);
    setCurrentView('deal-detail');
  }, []);

  const handleEditDeal = useCallback((deal: Deal) => {
    setEditingDeal(deal);
    setDealFormOpen(true);
  }, []);

  const handleDeleteDeal = useCallback((deal: Deal) => {
    setDeleteType('deal');
    setDeleteTarget(deal);
    setDeleteConfirmOpen(true);
  }, []);

  const handleMoveDealToStage = useCallback((deal: Deal, stage: DealStage) => {
    if (stage === 'closed_lost') {
      setMovingDeal(deal);
      setLostReasonModalOpen(true);
    } else {
      moveDealToStagePipeline(deal.id, stage);
    }
  }, [moveDealToStagePipeline]);

  const handleLostReasonConfirm = useCallback((reason: string) => {
    if (movingDeal) {
      moveDealToStagePipeline(movingDeal.id, 'closed_lost', reason);
      setLostReasonModalOpen(false);
      setMovingDeal(null);
    }
  }, [movingDeal, moveDealToStagePipeline]);

  const handleDealSubmit = useCallback(async (data: DealFormData) => {
    setIsSubmitting(true);
    try {
      if (editingDeal) {
        await updateDealPipeline(editingDeal.id, data);
      } else {
        await createDealPipeline(data);
      }
      setDealFormOpen(false);
      setEditingDeal(null);
    } catch (error) {
      console.error('Error submitting deal:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [editingDeal, createDealPipeline, updateDealPipeline]);

  // Task handlers
  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  }, []);

  const handleDeleteTask = useCallback((task: Task) => {
    setDeleteType('task');
    setDeleteTarget(task);
    setDeleteConfirmOpen(true);
  }, []);

  const handleTaskSubmit = useCallback(async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
      } else {
        await createTask(data);
      }
      setTaskFormOpen(false);
      setEditingTask(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [editingTask, createTask, updateTask]);

  // Activity handlers
  const handleCreateActivity = useCallback((type: ActivityType, contactId?: string, dealId?: string) => {
    setActivityType(type);
    setActivityContactId(contactId);
    setActivityDealId(dealId);
    setActivityFormOpen(true);
  }, []);

  const handleDeleteActivity = useCallback((activity: Activity) => {
    setDeleteType('activity');
    setDeleteTarget(activity);
    setDeleteConfirmOpen(true);
  }, []);

  const handleActivitySubmit = useCallback(async (data: ActivityFormData) => {
    setIsSubmitting(true);
    try {
      await createActivity(data);
      setActivityFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [createActivity]);

  // Delete confirmation handler
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    try {
      switch (deleteType) {
        case 'contact':
          await deleteContact(deleteTarget.id);
          if (currentView === 'contact-detail') {
            setCurrentView('contacts');
            setSelectedContactId(null);
          }
          break;
        case 'company':
          await deleteCompany(deleteTarget.id);
          if (currentView === 'company-detail') {
            setCurrentView('companies');
            setSelectedCompanyId(null);
          }
          break;
        case 'deal':
          await deleteDealPipeline(deleteTarget.id);
          if (currentView === 'deal-detail') {
            setCurrentView('deals');
            setSelectedDealId(null);
          }
          break;
        case 'task':
          await deleteTask(deleteTarget.id);
          break;
        case 'activity':
          await deleteActivity(deleteTarget.id);
          break;
      }
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } finally {
      setIsSubmitting(false);
    }
  }, [deleteType, deleteTarget, deleteContact, deleteCompany, deleteDealPipeline, deleteTask, deleteActivity, currentView]);

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <CRMDashboard onNavigate={handleViewChange} />;

      case 'contacts':
        return (
          <ContactList
            contacts={contacts}
            isLoading={loadingContacts}
            error={contactsError}
            totalCount={contactsCount}
            filters={contactFilters}
            onFiltersChange={setContactFilters}
            onCreateContact={() => handleQuickAction('contact')}
            onViewContact={handleViewContact}
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
            onLogActivity={(contact) => handleCreateActivity('note', contact.id)}
          />
        );

      case 'contact-detail':
        return (
          <ContactDetail
            contact={selectedContact}
            isLoading={loadingContact}
            onBack={() => handleViewChange('contacts')}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            onLogActivity={(type) => handleCreateActivity(type, selectedContactId || undefined)}
          />
        );

      case 'companies':
        return (
          <CompanyList
            companies={companies}
            isLoading={loadingCompanies}
            error={companiesError}
            totalCount={companiesCount}
            onSearch={searchCompanies}
            onCreateCompany={() => handleQuickAction('company')}
            onViewCompany={handleViewCompany}
            onEditCompany={handleEditCompany}
            onDeleteCompany={handleDeleteCompany}
          />
        );

      case 'company-detail':
        return (
          <CompanyDetail
            company={selectedCompany}
            isLoading={loadingCompany}
            onBack={() => handleViewChange('companies')}
            onEdit={handleEditCompany}
            onDelete={handleDeleteCompany}
            onViewContacts={() => {
              setContactFilters({ company_id: selectedCompanyId || undefined });
              handleViewChange('contacts');
            }}
            onViewDeals={() => handleViewChange('deals')}
          />
        );

      case 'deals':
        return (
          <PipelineKanban
            pipeline={pipeline}
            isLoading={loadingPipeline}
            error={pipelineError}
            onCreateDeal={handleCreateDeal}
            onViewDeal={handleViewDeal}
            onEditDeal={handleEditDeal}
            onDeleteDeal={handleDeleteDeal}
            onMoveDealToStage={handleMoveDealToStage}
          />
        );

      case 'deal-detail':
        return (
          <DealDetail
            deal={selectedDeal}
            isLoading={loadingDeal}
            onBack={() => handleViewChange('deals')}
            onEdit={handleEditDeal}
            onDelete={handleDeleteDeal}
            onMoveToStage={(deal, stage) => {
              if (stage === 'closed_lost') {
                setMovingDeal(deal);
                setLostReasonModalOpen(true);
              } else {
                moveDealToStage(stage);
              }
            }}
          />
        );

      case 'tasks':
        return (
          <TaskList
            tasks={tasks}
            isLoading={loadingTasks}
            error={tasksError}
            totalCount={tasksCount}
            filters={taskFilters}
            onFiltersChange={setTaskFilters}
            onCreateTask={() => handleQuickAction('task')}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onCompleteTask={(task) => completeTask(task.id)}
            onUncompleteTask={(task) => uncompleteTask(task.id)}
          />
        );

      case 'activities':
        return (
          <ActivityList
            activities={activities}
            isLoading={loadingActivities}
            error={activitiesError}
            onCreateActivity={handleCreateActivity}
            onDeleteActivity={handleDeleteActivity}
          />
        );

      default:
        return <CRMDashboard onNavigate={handleViewChange} />;
    }
  };

  return (
    <>
      <CRMLayout
        currentView={currentView}
        onViewChange={handleViewChange}
        onQuickAction={handleQuickAction}
        userName={userName}
        userEmail={userEmail}
        onLogout={onLogout}
        onSettings={onBackToMain}
      >
        {renderView()}
      </CRMLayout>

      {/* Forms */}
      <ContactForm
        contact={editingContact}
        isOpen={contactFormOpen}
        onClose={() => {
          setContactFormOpen(false);
          setEditingContact(null);
        }}
        onSubmit={handleContactSubmit}
        isSubmitting={isSubmitting}
      />

      <CompanyForm
        company={editingCompany}
        isOpen={companyFormOpen}
        onClose={() => {
          setCompanyFormOpen(false);
          setEditingCompany(null);
        }}
        onSubmit={handleCompanySubmit}
        isSubmitting={isSubmitting}
      />

      <DealForm
        deal={editingDeal}
        initialStage={initialDealStage}
        isOpen={dealFormOpen}
        onClose={() => {
          setDealFormOpen(false);
          setEditingDeal(null);
        }}
        onSubmit={handleDealSubmit}
        isSubmitting={isSubmitting}
      />

      <TaskForm
        task={editingTask}
        isOpen={taskFormOpen}
        onClose={() => {
          setTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        isSubmitting={isSubmitting}
      />

      <ActivityForm
        type={activityType}
        contactId={activityContactId}
        dealId={activityDealId}
        isOpen={activityFormOpen}
        onClose={() => setActivityFormOpen(false)}
        onSubmit={handleActivitySubmit}
        isSubmitting={isSubmitting}
      />

      {/* Modals */}
      <LostReasonModal
        isOpen={lostReasonModalOpen}
        dealTitle={movingDeal?.title || ''}
        onClose={() => {
          setLostReasonModalOpen(false);
          setMovingDeal(null);
        }}
        onConfirm={handleLostReasonConfirm}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Confirmar exclusão"
        message={`Tem certeza que deseja excluir ${
          deleteType === 'contact' ? 'este contato' :
          deleteType === 'company' ? 'esta empresa' :
          deleteType === 'deal' ? 'este deal' :
          deleteType === 'task' ? 'esta tarefa' :
          'esta atividade'
        }? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeleteTarget(null);
        }}
        isLoading={isSubmitting}
      />
    </>
  );
}

export default MyEasyCRM;
