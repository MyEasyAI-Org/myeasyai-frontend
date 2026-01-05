// CRM API Routes - CRUD para MyEasyCRM
// Gerencia empresas, contatos, deals, tarefas e atividades

import { Hono } from 'hono';
import { eq, and, desc, asc, like, lte, gte, inArray, sql } from 'drizzle-orm';
import {
  crmCompanies,
  crmContacts,
  crmDeals,
  crmTasks,
  crmActivities,
  type NewCrmCompany,
  type NewCrmContact,
  type NewCrmDeal,
  type NewCrmTask,
  type NewCrmActivity,
} from '../db/schema';
import type { Env, Variables } from '../index';

export const crmRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// =============================================================================
// COMPANIES
// =============================================================================

/**
 * GET /crm/companies/user/:userId
 * Lista todas as empresas de um usuário
 */
crmRoutes.get('/companies/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');

  const companies = await db.query.crmCompanies.findMany({
    where: eq(crmCompanies.user_id, userId),
    orderBy: desc(crmCompanies.created_at),
  });

  return c.json({ data: companies });
});

/**
 * GET /crm/companies/:id
 * Busca empresa por ID
 */
crmRoutes.get('/companies/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const company = await db.query.crmCompanies.findFirst({
    where: eq(crmCompanies.id, id),
  });

  if (!company) {
    return c.json({ error: 'Company not found' }, 404);
  }

  return c.json({ data: company });
});

/**
 * POST /crm/companies
 * Cria nova empresa
 */
crmRoutes.post('/companies', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<NewCrmCompany>();

  if (!body.user_id || !body.name) {
    return c.json({ error: 'user_id and name are required' }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newCompany: NewCrmCompany = {
    id,
    user_id: body.user_id,
    name: body.name,
    cnpj: body.cnpj || null,
    industry: body.industry || null,
    segment: body.segment || null,
    size: body.size || null,
    website: body.website || null,
    address: body.address || null,
    city: body.city || null,
    state: body.state || null,
    phone: body.phone || null,
    email: body.email || null,
    linkedin: body.linkedin || null,
    instagram: body.instagram || null,
    facebook: body.facebook || null,
    notes: body.notes || null,
    created_at: now,
    updated_at: now,
  };

  const result = await db.insert(crmCompanies).values(newCompany).returning();

  console.log(`✅ [D1] CRM Company created: ${id}`);
  return c.json({ data: result[0], success: true }, 201);
});

/**
 * PATCH /crm/companies/:id
 * Atualiza empresa
 */
crmRoutes.patch('/companies/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const body = await c.req.json();

  const { id: _, user_id: __, created_at: ___, ...updates } = body;

  const result = await db
    .update(crmCompanies)
    .set({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .where(eq(crmCompanies.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Company not found' }, 404);
  }

  console.log(`✅ [D1] CRM Company updated: ${id}`);
  return c.json({ data: result[0], success: true });
});

/**
 * DELETE /crm/companies/:id
 * Remove empresa
 */
crmRoutes.delete('/companies/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const result = await db
    .delete(crmCompanies)
    .where(eq(crmCompanies.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Company not found' }, 404);
  }

  console.log(`✅ [D1] CRM Company deleted: ${id}`);
  return c.json({ success: true });
});

/**
 * GET /crm/companies/count/user/:userId
 * Conta empresas do usuário
 */
crmRoutes.get('/companies/count/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');

  const companies = await db.query.crmCompanies.findMany({
    where: eq(crmCompanies.user_id, userId),
    columns: { id: true },
  });

  return c.json({ data: { count: companies.length } });
});

// =============================================================================
// CONTACTS
// =============================================================================

/**
 * GET /crm/contacts/user/:userId
 * Lista todos os contatos de um usuário
 */
crmRoutes.get('/contacts/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');
  const search = c.req.query('search');
  const companyId = c.req.query('company_id');

  let whereConditions = [eq(crmContacts.user_id, userId)];

  if (companyId) {
    whereConditions.push(eq(crmContacts.company_id, companyId));
  }

  const contacts = await db.query.crmContacts.findMany({
    where: and(...whereConditions),
    orderBy: desc(crmContacts.created_at),
  });

  // Filter by search if provided (name or email)
  let filteredContacts = contacts;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredContacts = contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        (c.email && c.email.toLowerCase().includes(searchLower))
    );
  }

  // Fetch company data for each contact
  const contactsWithCompany = await Promise.all(
    filteredContacts.map(async (contact) => {
      if (contact.company_id) {
        const company = await db.query.crmCompanies.findFirst({
          where: eq(crmCompanies.id, contact.company_id),
          columns: { id: true, name: true, industry: true },
        });
        return { ...contact, company };
      }
      return { ...contact, company: null };
    })
  );

  return c.json({ data: contactsWithCompany });
});

/**
 * GET /crm/contacts/:id
 * Busca contato por ID
 */
crmRoutes.get('/contacts/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const contact = await db.query.crmContacts.findFirst({
    where: eq(crmContacts.id, id),
  });

  if (!contact) {
    return c.json({ error: 'Contact not found' }, 404);
  }

  // Fetch company data
  let company = null;
  if (contact.company_id) {
    company = await db.query.crmCompanies.findFirst({
      where: eq(crmCompanies.id, contact.company_id),
      columns: { id: true, name: true, industry: true, size: true, website: true },
    });
  }

  return c.json({ data: { ...contact, company } });
});

/**
 * POST /crm/contacts
 * Cria novo contato
 */
crmRoutes.post('/contacts', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<NewCrmContact & { tags?: string[] }>();

  if (!body.user_id || !body.name) {
    return c.json({ error: 'user_id and name are required' }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newContact: NewCrmContact = {
    id,
    user_id: body.user_id,
    company_id: body.company_id || null,
    name: body.name,
    email: body.email || null,
    phone: body.phone || null,
    mobile: body.mobile || null,
    position: body.position || null,
    role: body.role || null,
    tags: body.tags ? JSON.stringify(body.tags) : null,
    notes: body.notes || null,
    source: body.source || null,
    lead_source: body.lead_source || null,
    birth_date: body.birth_date || null,
    address: body.address || null,
    linkedin: body.linkedin || null,
    instagram: body.instagram || null,
    created_at: now,
    updated_at: now,
  };

  const result = await db.insert(crmContacts).values(newContact).returning();

  // Fetch company if exists
  let company = null;
  if (result[0].company_id) {
    company = await db.query.crmCompanies.findFirst({
      where: eq(crmCompanies.id, result[0].company_id),
      columns: { id: true, name: true, industry: true },
    });
  }

  console.log(`✅ [D1] CRM Contact created: ${id}`);
  return c.json({ data: { ...result[0], company }, success: true }, 201);
});

/**
 * PATCH /crm/contacts/:id
 * Atualiza contato
 */
crmRoutes.patch('/contacts/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const body = await c.req.json();

  const { id: _, user_id: __, created_at: ___, tags, ...updates } = body;

  const updateData: Record<string, unknown> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  if (tags !== undefined) {
    updateData.tags = Array.isArray(tags) ? JSON.stringify(tags) : tags;
  }

  const result = await db
    .update(crmContacts)
    .set(updateData)
    .where(eq(crmContacts.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Contact not found' }, 404);
  }

  // Fetch company if exists
  let company = null;
  if (result[0].company_id) {
    company = await db.query.crmCompanies.findFirst({
      where: eq(crmCompanies.id, result[0].company_id),
      columns: { id: true, name: true, industry: true },
    });
  }

  console.log(`✅ [D1] CRM Contact updated: ${id}`);
  return c.json({ data: { ...result[0], company }, success: true });
});

/**
 * DELETE /crm/contacts/:id
 * Remove contato
 */
crmRoutes.delete('/contacts/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const result = await db
    .delete(crmContacts)
    .where(eq(crmContacts.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Contact not found' }, 404);
  }

  console.log(`✅ [D1] CRM Contact deleted: ${id}`);
  return c.json({ success: true });
});

/**
 * GET /crm/contacts/company/:companyId
 * Busca contatos por empresa
 */
crmRoutes.get('/contacts/company/:companyId', async (c) => {
  const db = c.get('db');
  const companyId = c.req.param('companyId');

  const contacts = await db.query.crmContacts.findMany({
    where: eq(crmContacts.company_id, companyId),
    orderBy: asc(crmContacts.name),
  });

  return c.json({ data: contacts });
});

/**
 * GET /crm/contacts/count/user/:userId
 * Conta contatos do usuário
 */
crmRoutes.get('/contacts/count/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');

  const contacts = await db.query.crmContacts.findMany({
    where: eq(crmContacts.user_id, userId),
    columns: { id: true },
  });

  return c.json({ data: { count: contacts.length } });
});

/**
 * GET /crm/contacts/recent/user/:userId
 * Contatos recentes do usuário
 */
crmRoutes.get('/contacts/recent/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');
  const limit = parseInt(c.req.query('limit') || '5');

  const contacts = await db.query.crmContacts.findMany({
    where: eq(crmContacts.user_id, userId),
    orderBy: desc(crmContacts.created_at),
    limit,
  });

  // Fetch company data for each contact
  const contactsWithCompany = await Promise.all(
    contacts.map(async (contact) => {
      if (contact.company_id) {
        const company = await db.query.crmCompanies.findFirst({
          where: eq(crmCompanies.id, contact.company_id),
          columns: { id: true, name: true },
        });
        return { ...contact, company };
      }
      return { ...contact, company: null };
    })
  );

  return c.json({ data: contactsWithCompany });
});

// =============================================================================
// DEALS
// =============================================================================

/**
 * GET /crm/deals/user/:userId
 * Lista todos os deals de um usuário
 */
crmRoutes.get('/deals/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');
  const stage = c.req.query('stage');
  const contactId = c.req.query('contact_id');
  const companyId = c.req.query('company_id');

  let whereConditions = [eq(crmDeals.user_id, userId)];

  if (stage) {
    whereConditions.push(eq(crmDeals.stage, stage));
  }
  if (contactId) {
    whereConditions.push(eq(crmDeals.contact_id, contactId));
  }
  if (companyId) {
    whereConditions.push(eq(crmDeals.company_id, companyId));
  }

  const deals = await db.query.crmDeals.findMany({
    where: and(...whereConditions),
    orderBy: desc(crmDeals.created_at),
  });

  // Fetch related data for each deal
  const dealsWithRelations = await Promise.all(
    deals.map(async (deal) => {
      let contact = null;
      let company = null;

      if (deal.contact_id) {
        contact = await db.query.crmContacts.findFirst({
          where: eq(crmContacts.id, deal.contact_id),
          columns: { id: true, name: true, email: true, phone: true },
        });
      }
      if (deal.company_id) {
        company = await db.query.crmCompanies.findFirst({
          where: eq(crmCompanies.id, deal.company_id),
          columns: { id: true, name: true },
        });
      }

      return { ...deal, contact, company };
    })
  );

  return c.json({ data: dealsWithRelations });
});

/**
 * GET /crm/deals/:id
 * Busca deal por ID
 */
crmRoutes.get('/deals/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const deal = await db.query.crmDeals.findFirst({
    where: eq(crmDeals.id, id),
  });

  if (!deal) {
    return c.json({ error: 'Deal not found' }, 404);
  }

  // Fetch related data
  let contact = null;
  let company = null;

  if (deal.contact_id) {
    contact = await db.query.crmContacts.findFirst({
      where: eq(crmContacts.id, deal.contact_id),
      columns: { id: true, name: true, email: true, phone: true, mobile: true, position: true },
    });
  }
  if (deal.company_id) {
    company = await db.query.crmCompanies.findFirst({
      where: eq(crmCompanies.id, deal.company_id),
      columns: { id: true, name: true, industry: true, website: true },
    });
  }

  return c.json({ data: { ...deal, contact, company } });
});

/**
 * POST /crm/deals
 * Cria novo deal
 */
crmRoutes.post('/deals', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<NewCrmDeal>();

  if (!body.user_id || !body.title) {
    return c.json({ error: 'user_id and title are required' }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newDeal: NewCrmDeal = {
    id,
    user_id: body.user_id,
    contact_id: body.contact_id || null,
    company_id: body.company_id || null,
    title: body.title,
    value: body.value || 0,
    stage: body.stage || 'lead',
    probability: body.probability || 0,
    expected_close_date: body.expected_close_date || null,
    actual_close_date: body.actual_close_date || null,
    lost_reason: body.lost_reason || null,
    source: body.source || null,
    notes: body.notes || null,
    products: body.products || null,
    created_at: now,
    updated_at: now,
  };

  const result = await db.insert(crmDeals).values(newDeal).returning();

  // Fetch related data
  let contact = null;
  let company = null;

  if (result[0].contact_id) {
    contact = await db.query.crmContacts.findFirst({
      where: eq(crmContacts.id, result[0].contact_id),
      columns: { id: true, name: true, email: true },
    });
  }
  if (result[0].company_id) {
    company = await db.query.crmCompanies.findFirst({
      where: eq(crmCompanies.id, result[0].company_id),
      columns: { id: true, name: true },
    });
  }

  console.log(`✅ [D1] CRM Deal created: ${id}`);
  return c.json({ data: { ...result[0], contact, company }, success: true }, 201);
});

/**
 * PATCH /crm/deals/:id
 * Atualiza deal
 */
crmRoutes.patch('/deals/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const body = await c.req.json();

  const { id: _, user_id: __, created_at: ___, ...updates } = body;

  const updateData: Record<string, unknown> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // Se mudou para fechado, registra a data
  if (updates.stage === 'closed_won' || updates.stage === 'closed_lost') {
    updateData.actual_close_date = new Date().toISOString().split('T')[0];
  }

  const result = await db
    .update(crmDeals)
    .set(updateData)
    .where(eq(crmDeals.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Deal not found' }, 404);
  }

  // Fetch related data
  let contact = null;
  let company = null;

  if (result[0].contact_id) {
    contact = await db.query.crmContacts.findFirst({
      where: eq(crmContacts.id, result[0].contact_id),
      columns: { id: true, name: true, email: true },
    });
  }
  if (result[0].company_id) {
    company = await db.query.crmCompanies.findFirst({
      where: eq(crmCompanies.id, result[0].company_id),
      columns: { id: true, name: true },
    });
  }

  console.log(`✅ [D1] CRM Deal updated: ${id}`);
  return c.json({ data: { ...result[0], contact, company }, success: true });
});

/**
 * DELETE /crm/deals/:id
 * Remove deal
 */
crmRoutes.delete('/deals/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const result = await db
    .delete(crmDeals)
    .where(eq(crmDeals.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Deal not found' }, 404);
  }

  console.log(`✅ [D1] CRM Deal deleted: ${id}`);
  return c.json({ success: true });
});

/**
 * GET /crm/deals/pipeline/user/:userId
 * Busca deals para o Pipeline (Kanban)
 */
crmRoutes.get('/deals/pipeline/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');

  const openStages = ['lead', 'qualified', 'proposal', 'negotiation'];

  const deals = await db.query.crmDeals.findMany({
    where: and(
      eq(crmDeals.user_id, userId),
      inArray(crmDeals.stage, openStages)
    ),
    orderBy: asc(crmDeals.created_at),
  });

  // Fetch related data for each deal
  const dealsWithRelations = await Promise.all(
    deals.map(async (deal) => {
      let contact = null;
      let company = null;

      if (deal.contact_id) {
        contact = await db.query.crmContacts.findFirst({
          where: eq(crmContacts.id, deal.contact_id),
          columns: { id: true, name: true, email: true },
        });
      }
      if (deal.company_id) {
        company = await db.query.crmCompanies.findFirst({
          where: eq(crmCompanies.id, deal.company_id),
          columns: { id: true, name: true },
        });
      }

      return { ...deal, contact, company };
    })
  );

  // Organize by stage
  const columns = openStages.map((stage) => {
    const stageDeals = dealsWithRelations.filter((d) => d.stage === stage);
    const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

    return {
      id: stage,
      deals: stageDeals,
      total_value: totalValue,
      count: stageDeals.length,
    };
  });

  const totalValue = columns.reduce((sum, col) => sum + col.total_value, 0);
  const totalDeals = columns.reduce((sum, col) => sum + col.count, 0);

  return c.json({
    data: {
      columns,
      total_value: totalValue,
      total_deals: totalDeals,
    },
  });
});

/**
 * GET /crm/deals/metrics/user/:userId
 * Métricas do pipeline
 */
crmRoutes.get('/deals/metrics/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

  const openStages = ['lead', 'qualified', 'proposal', 'negotiation'];

  // Open deals
  const openDeals = await db.query.crmDeals.findMany({
    where: and(
      eq(crmDeals.user_id, userId),
      inArray(crmDeals.stage, openStages)
    ),
    columns: { value: true, probability: true },
  });

  // Closed deals this month
  const closedDeals = await db.query.crmDeals.findMany({
    where: and(
      eq(crmDeals.user_id, userId),
      inArray(crmDeals.stage, ['closed_won', 'closed_lost']),
      gte(crmDeals.updated_at, startOfMonthStr)
    ),
    columns: { value: true, stage: true },
  });

  const totalValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const weightedValue = openDeals.reduce(
    (sum, d) => sum + ((d.value || 0) * (d.probability || 0)) / 100,
    0
  );

  const wonThisMonth = closedDeals.filter((d) => d.stage === 'closed_won').length;
  const lostThisMonth = closedDeals.filter((d) => d.stage === 'closed_lost').length;
  const revenueThisMonth = closedDeals
    .filter((d) => d.stage === 'closed_won')
    .reduce((sum, d) => sum + (d.value || 0), 0);

  return c.json({
    data: {
      total_value: totalValue,
      weighted_value: weightedValue,
      open_deals: openDeals.length,
      won_this_month: wonThisMonth,
      lost_this_month: lostThisMonth,
      revenue_this_month: revenueThisMonth,
    },
  });
});

/**
 * GET /crm/deals/count/user/:userId
 * Conta deals do usuário
 */
crmRoutes.get('/deals/count/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');

  const deals = await db.query.crmDeals.findMany({
    where: eq(crmDeals.user_id, userId),
    columns: { id: true },
  });

  return c.json({ data: { count: deals.length } });
});

// =============================================================================
// TASKS
// =============================================================================

/**
 * GET /crm/tasks/user/:userId
 * Lista todas as tarefas de um usuário
 */
crmRoutes.get('/tasks/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');
  const completed = c.req.query('completed');
  const type = c.req.query('type');
  const priority = c.req.query('priority');
  const contactId = c.req.query('contact_id');
  const dealId = c.req.query('deal_id');

  let whereConditions = [eq(crmTasks.user_id, userId)];

  if (completed !== undefined) {
    whereConditions.push(eq(crmTasks.completed, completed === 'true'));
  }
  if (type) {
    whereConditions.push(eq(crmTasks.type, type));
  }
  if (priority) {
    whereConditions.push(eq(crmTasks.priority, priority));
  }
  if (contactId) {
    whereConditions.push(eq(crmTasks.contact_id, contactId));
  }
  if (dealId) {
    whereConditions.push(eq(crmTasks.deal_id, dealId));
  }

  const tasks = await db.query.crmTasks.findMany({
    where: and(...whereConditions),
    orderBy: asc(crmTasks.due_date),
  });

  // Fetch related data for each task
  const tasksWithRelations = await Promise.all(
    tasks.map(async (task) => {
      let contact = null;
      let deal = null;

      if (task.contact_id) {
        contact = await db.query.crmContacts.findFirst({
          where: eq(crmContacts.id, task.contact_id),
          columns: { id: true, name: true, email: true },
        });
      }
      if (task.deal_id) {
        deal = await db.query.crmDeals.findFirst({
          where: eq(crmDeals.id, task.deal_id),
          columns: { id: true, title: true, value: true, stage: true },
        });
      }

      return { ...task, contact, deal };
    })
  );

  return c.json({ data: tasksWithRelations });
});

/**
 * GET /crm/tasks/:id
 * Busca tarefa por ID
 */
crmRoutes.get('/tasks/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const task = await db.query.crmTasks.findFirst({
    where: eq(crmTasks.id, id),
  });

  if (!task) {
    return c.json({ error: 'Task not found' }, 404);
  }

  // Fetch related data
  let contact = null;
  let deal = null;

  if (task.contact_id) {
    contact = await db.query.crmContacts.findFirst({
      where: eq(crmContacts.id, task.contact_id),
      columns: { id: true, name: true, email: true, phone: true },
    });
  }
  if (task.deal_id) {
    deal = await db.query.crmDeals.findFirst({
      where: eq(crmDeals.id, task.deal_id),
      columns: { id: true, title: true, value: true, stage: true },
    });
  }

  return c.json({ data: { ...task, contact, deal } });
});

/**
 * POST /crm/tasks
 * Cria nova tarefa
 */
crmRoutes.post('/tasks', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<NewCrmTask>();

  if (!body.user_id || !body.title || !body.due_date) {
    return c.json({ error: 'user_id, title, and due_date are required' }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newTask: NewCrmTask = {
    id,
    user_id: body.user_id,
    contact_id: body.contact_id || null,
    deal_id: body.deal_id || null,
    title: body.title,
    description: body.description || null,
    due_date: body.due_date,
    type: body.type || 'other',
    priority: body.priority || 'medium',
    completed: false,
    completed_at: null,
    created_at: now,
  };

  const result = await db.insert(crmTasks).values(newTask).returning();

  // Fetch related data
  let contact = null;
  let deal = null;

  if (result[0].contact_id) {
    contact = await db.query.crmContacts.findFirst({
      where: eq(crmContacts.id, result[0].contact_id),
      columns: { id: true, name: true, email: true },
    });
  }
  if (result[0].deal_id) {
    deal = await db.query.crmDeals.findFirst({
      where: eq(crmDeals.id, result[0].deal_id),
      columns: { id: true, title: true, value: true, stage: true },
    });
  }

  console.log(`✅ [D1] CRM Task created: ${id}`);
  return c.json({ data: { ...result[0], contact, deal }, success: true }, 201);
});

/**
 * PATCH /crm/tasks/:id
 * Atualiza tarefa
 */
crmRoutes.patch('/tasks/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const body = await c.req.json();

  const { id: _, user_id: __, created_at: ___, ...updates } = body;

  const result = await db
    .update(crmTasks)
    .set(updates)
    .where(eq(crmTasks.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Task not found' }, 404);
  }

  // Fetch related data
  let contact = null;
  let deal = null;

  if (result[0].contact_id) {
    contact = await db.query.crmContacts.findFirst({
      where: eq(crmContacts.id, result[0].contact_id),
      columns: { id: true, name: true, email: true },
    });
  }
  if (result[0].deal_id) {
    deal = await db.query.crmDeals.findFirst({
      where: eq(crmDeals.id, result[0].deal_id),
      columns: { id: true, title: true, value: true, stage: true },
    });
  }

  console.log(`✅ [D1] CRM Task updated: ${id}`);
  return c.json({ data: { ...result[0], contact, deal }, success: true });
});

/**
 * PATCH /crm/tasks/:id/complete
 * Marca tarefa como concluída
 */
crmRoutes.patch('/tasks/:id/complete', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const result = await db
    .update(crmTasks)
    .set({
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .where(eq(crmTasks.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Task not found' }, 404);
  }

  console.log(`✅ [D1] CRM Task completed: ${id}`);
  return c.json({ data: result[0], success: true });
});

/**
 * PATCH /crm/tasks/:id/uncomplete
 * Marca tarefa como não concluída
 */
crmRoutes.patch('/tasks/:id/uncomplete', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const result = await db
    .update(crmTasks)
    .set({
      completed: false,
      completed_at: null,
    })
    .where(eq(crmTasks.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Task not found' }, 404);
  }

  console.log(`✅ [D1] CRM Task uncompleted: ${id}`);
  return c.json({ data: result[0], success: true });
});

/**
 * DELETE /crm/tasks/:id
 * Remove tarefa
 */
crmRoutes.delete('/tasks/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const result = await db
    .delete(crmTasks)
    .where(eq(crmTasks.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Task not found' }, 404);
  }

  console.log(`✅ [D1] CRM Task deleted: ${id}`);
  return c.json({ success: true });
});

/**
 * GET /crm/tasks/overdue/user/:userId
 * Tarefas atrasadas
 */
crmRoutes.get('/tasks/overdue/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');
  const now = new Date().toISOString();

  const tasks = await db.query.crmTasks.findMany({
    where: and(
      eq(crmTasks.user_id, userId),
      eq(crmTasks.completed, false),
      lte(crmTasks.due_date, now)
    ),
    orderBy: asc(crmTasks.due_date),
  });

  // Fetch related data
  const tasksWithRelations = await Promise.all(
    tasks.map(async (task) => {
      let contact = null;
      let deal = null;

      if (task.contact_id) {
        contact = await db.query.crmContacts.findFirst({
          where: eq(crmContacts.id, task.contact_id),
          columns: { id: true, name: true, email: true },
        });
      }
      if (task.deal_id) {
        deal = await db.query.crmDeals.findFirst({
          where: eq(crmDeals.id, task.deal_id),
          columns: { id: true, title: true, value: true, stage: true },
        });
      }

      return { ...task, contact, deal };
    })
  );

  return c.json({ data: tasksWithRelations });
});

/**
 * GET /crm/tasks/today/user/:userId
 * Tarefas de hoje
 */
crmRoutes.get('/tasks/today/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString();

  const tasks = await db.query.crmTasks.findMany({
    where: and(
      eq(crmTasks.user_id, userId),
      eq(crmTasks.completed, false),
      gte(crmTasks.due_date, todayStr),
      lte(crmTasks.due_date, tomorrowStr)
    ),
    orderBy: asc(crmTasks.due_date),
  });

  // Fetch related data
  const tasksWithRelations = await Promise.all(
    tasks.map(async (task) => {
      let contact = null;
      let deal = null;

      if (task.contact_id) {
        contact = await db.query.crmContacts.findFirst({
          where: eq(crmContacts.id, task.contact_id),
          columns: { id: true, name: true, email: true },
        });
      }
      if (task.deal_id) {
        deal = await db.query.crmDeals.findFirst({
          where: eq(crmDeals.id, task.deal_id),
          columns: { id: true, title: true, value: true, stage: true },
        });
      }

      return { ...task, contact, deal };
    })
  );

  return c.json({ data: tasksWithRelations });
});

/**
 * GET /crm/tasks/count/pending/user/:userId
 * Conta tarefas pendentes
 */
crmRoutes.get('/tasks/count/pending/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');

  const tasks = await db.query.crmTasks.findMany({
    where: and(
      eq(crmTasks.user_id, userId),
      eq(crmTasks.completed, false)
    ),
    columns: { id: true },
  });

  return c.json({ data: { count: tasks.length } });
});

/**
 * GET /crm/tasks/count/overdue/user/:userId
 * Conta tarefas atrasadas
 */
crmRoutes.get('/tasks/count/overdue/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');
  const now = new Date().toISOString();

  const tasks = await db.query.crmTasks.findMany({
    where: and(
      eq(crmTasks.user_id, userId),
      eq(crmTasks.completed, false),
      lte(crmTasks.due_date, now)
    ),
    columns: { id: true },
  });

  return c.json({ data: { count: tasks.length } });
});

// =============================================================================
// ACTIVITIES
// =============================================================================

/**
 * GET /crm/activities/user/:userId
 * Lista todas as atividades de um usuário
 */
crmRoutes.get('/activities/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');
  const limit = parseInt(c.req.query('limit') || '50');
  const type = c.req.query('type');
  const contactId = c.req.query('contact_id');
  const dealId = c.req.query('deal_id');

  let whereConditions = [eq(crmActivities.user_id, userId)];

  if (type) {
    whereConditions.push(eq(crmActivities.type, type));
  }
  if (contactId) {
    whereConditions.push(eq(crmActivities.contact_id, contactId));
  }
  if (dealId) {
    whereConditions.push(eq(crmActivities.deal_id, dealId));
  }

  const activities = await db.query.crmActivities.findMany({
    where: and(...whereConditions),
    orderBy: desc(crmActivities.created_at),
    limit,
  });

  // Fetch related data for each activity
  const activitiesWithRelations = await Promise.all(
    activities.map(async (activity) => {
      let contact = null;
      let deal = null;

      if (activity.contact_id) {
        contact = await db.query.crmContacts.findFirst({
          where: eq(crmContacts.id, activity.contact_id),
          columns: { id: true, name: true, email: true },
        });
      }
      if (activity.deal_id) {
        deal = await db.query.crmDeals.findFirst({
          where: eq(crmDeals.id, activity.deal_id),
          columns: { id: true, title: true, value: true, stage: true },
        });
      }

      return { ...activity, contact, deal };
    })
  );

  return c.json({ data: activitiesWithRelations });
});

/**
 * GET /crm/activities/:id
 * Busca atividade por ID
 */
crmRoutes.get('/activities/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const activity = await db.query.crmActivities.findFirst({
    where: eq(crmActivities.id, id),
  });

  if (!activity) {
    return c.json({ error: 'Activity not found' }, 404);
  }

  // Fetch related data
  let contact = null;
  let deal = null;

  if (activity.contact_id) {
    contact = await db.query.crmContacts.findFirst({
      where: eq(crmContacts.id, activity.contact_id),
      columns: { id: true, name: true, email: true },
    });
  }
  if (activity.deal_id) {
    deal = await db.query.crmDeals.findFirst({
      where: eq(crmDeals.id, activity.deal_id),
      columns: { id: true, title: true, value: true, stage: true },
    });
  }

  return c.json({ data: { ...activity, contact, deal } });
});

/**
 * POST /crm/activities
 * Cria nova atividade
 */
crmRoutes.post('/activities', async (c) => {
  const db = c.get('db');
  const body = await c.req.json<NewCrmActivity>();

  if (!body.user_id || !body.type || !body.description) {
    return c.json({ error: 'user_id, type, and description are required' }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const newActivity: NewCrmActivity = {
    id,
    user_id: body.user_id,
    contact_id: body.contact_id || null,
    deal_id: body.deal_id || null,
    type: body.type,
    description: body.description,
    metadata: body.metadata || null,
    created_at: now,
  };

  const result = await db.insert(crmActivities).values(newActivity).returning();

  // Fetch related data
  let contact = null;
  let deal = null;

  if (result[0].contact_id) {
    contact = await db.query.crmContacts.findFirst({
      where: eq(crmContacts.id, result[0].contact_id),
      columns: { id: true, name: true, email: true },
    });
  }
  if (result[0].deal_id) {
    deal = await db.query.crmDeals.findFirst({
      where: eq(crmDeals.id, result[0].deal_id),
      columns: { id: true, title: true, value: true, stage: true },
    });
  }

  console.log(`✅ [D1] CRM Activity created: ${id}`);
  return c.json({ data: { ...result[0], contact, deal }, success: true }, 201);
});

/**
 * DELETE /crm/activities/:id
 * Remove atividade
 */
crmRoutes.delete('/activities/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  const result = await db
    .delete(crmActivities)
    .where(eq(crmActivities.id, id))
    .returning();

  if (result.length === 0) {
    return c.json({ error: 'Activity not found' }, 404);
  }

  console.log(`✅ [D1] CRM Activity deleted: ${id}`);
  return c.json({ success: true });
});

/**
 * GET /crm/activities/contact/:contactId
 * Atividades por contato
 */
crmRoutes.get('/activities/contact/:contactId', async (c) => {
  const db = c.get('db');
  const contactId = c.req.param('contactId');
  const limit = parseInt(c.req.query('limit') || '20');

  const activities = await db.query.crmActivities.findMany({
    where: eq(crmActivities.contact_id, contactId),
    orderBy: desc(crmActivities.created_at),
    limit,
  });

  // Fetch deal data
  const activitiesWithDeal = await Promise.all(
    activities.map(async (activity) => {
      let deal = null;
      if (activity.deal_id) {
        deal = await db.query.crmDeals.findFirst({
          where: eq(crmDeals.id, activity.deal_id),
          columns: { id: true, title: true, value: true, stage: true },
        });
      }
      return { ...activity, deal };
    })
  );

  return c.json({ data: activitiesWithDeal });
});

/**
 * GET /crm/activities/deal/:dealId
 * Atividades por deal
 */
crmRoutes.get('/activities/deal/:dealId', async (c) => {
  const db = c.get('db');
  const dealId = c.req.param('dealId');
  const limit = parseInt(c.req.query('limit') || '20');

  const activities = await db.query.crmActivities.findMany({
    where: eq(crmActivities.deal_id, dealId),
    orderBy: desc(crmActivities.created_at),
    limit,
  });

  // Fetch contact data
  const activitiesWithContact = await Promise.all(
    activities.map(async (activity) => {
      let contact = null;
      if (activity.contact_id) {
        contact = await db.query.crmContacts.findFirst({
          where: eq(crmContacts.id, activity.contact_id),
          columns: { id: true, name: true, email: true },
        });
      }
      return { ...activity, contact };
    })
  );

  return c.json({ data: activitiesWithContact });
});

/**
 * GET /crm/activities/stats/user/:userId
 * Estatísticas de atividades por tipo
 */
crmRoutes.get('/activities/stats/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');

  const activities = await db.query.crmActivities.findMany({
    where: eq(crmActivities.user_id, userId),
    columns: { type: true },
  });

  const stats: Record<string, number> = {};
  activities.forEach((activity) => {
    stats[activity.type] = (stats[activity.type] || 0) + 1;
  });

  return c.json({ data: stats });
});

/**
 * GET /crm/activities/count/user/:userId
 * Conta atividades por período
 */
crmRoutes.get('/activities/count/user/:userId', async (c) => {
  const db = c.get('db');
  const userId = c.req.param('userId');
  const startDate = c.req.query('start_date');
  const endDate = c.req.query('end_date');

  let whereConditions = [eq(crmActivities.user_id, userId)];

  if (startDate) {
    whereConditions.push(gte(crmActivities.created_at, startDate));
  }
  if (endDate) {
    whereConditions.push(lte(crmActivities.created_at, endDate));
  }

  const activities = await db.query.crmActivities.findMany({
    where: and(...whereConditions),
    columns: { id: true },
  });

  return c.json({ data: { count: activities.length } });
});
