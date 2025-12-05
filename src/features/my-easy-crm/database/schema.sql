-- =============================================
-- MyEasyCRM - Supabase Database Schema
-- =============================================
-- Execute este script no SQL Editor do Supabase
-- para criar todas as tabelas necessárias para o CRM
-- =============================================

-- =============================================
-- 1. TABELA: crm_companies (Empresas)
-- =============================================
CREATE TABLE IF NOT EXISTS crm_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20),
  website VARCHAR(500),
  industry VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_crm_companies_user_id ON crm_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_companies_name ON crm_companies(name);

-- RLS (Row Level Security)
ALTER TABLE crm_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own companies"
  ON crm_companies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own companies"
  ON crm_companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own companies"
  ON crm_companies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own companies"
  ON crm_companies FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 2. TABELA: crm_contacts (Contatos)
-- =============================================
CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(100),
  source VARCHAR(50) DEFAULT 'other',
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_crm_contacts_user_id ON crm_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_company_id ON crm_contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_name ON crm_contacts(name);

-- RLS
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contacts"
  ON crm_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts"
  ON crm_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON crm_contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON crm_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 3. TABELA: crm_deals (Negociações/Deals)
-- =============================================
CREATE TABLE IF NOT EXISTS crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES crm_companies(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  stage VARCHAR(50) NOT NULL DEFAULT 'lead',
  probability INTEGER DEFAULT 10,
  expected_close_date DATE,
  closed_at TIMESTAMPTZ,
  lost_reason TEXT,
  source VARCHAR(50) DEFAULT 'other',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_crm_deals_user_id ON crm_deals(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_contact_id ON crm_deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_company_id ON crm_deals(company_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON crm_deals(stage);
CREATE INDEX IF NOT EXISTS idx_crm_deals_expected_close ON crm_deals(expected_close_date);

-- RLS
ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deals"
  ON crm_deals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deals"
  ON crm_deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals"
  ON crm_deals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deals"
  ON crm_deals FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 4. TABELA: crm_tasks (Tarefas)
-- =============================================
CREATE TABLE IF NOT EXISTS crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'other',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_crm_tasks_user_id ON crm_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_contact_id ON crm_tasks(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_deal_id ON crm_tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_due_date ON crm_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_completed ON crm_tasks(completed);

-- RLS
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks"
  ON crm_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON crm_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON crm_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON crm_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 5. TABELA: crm_activities (Atividades)
-- =============================================
CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES crm_deals(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_crm_activities_user_id ON crm_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_contact_id ON crm_activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_deal_id ON crm_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_type ON crm_activities(type);
CREATE INDEX IF NOT EXISTS idx_crm_activities_created_at ON crm_activities(created_at DESC);

-- RLS
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities"
  ON crm_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities"
  ON crm_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
  ON crm_activities FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 6. TRIGGERS: Auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crm_companies_updated_at
  BEFORE UPDATE ON crm_companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_contacts_updated_at
  BEFORE UPDATE ON crm_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_deals_updated_at
  BEFORE UPDATE ON crm_deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_tasks_updated_at
  BEFORE UPDATE ON crm_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7. VIEWS: Estatísticas e Métricas
-- =============================================

-- View para métricas do pipeline
CREATE OR REPLACE VIEW crm_deal_metrics AS
SELECT
  user_id,
  SUM(CASE WHEN stage NOT IN ('closed_won', 'closed_lost') THEN value ELSE 0 END) as total_value,
  SUM(CASE WHEN stage NOT IN ('closed_won', 'closed_lost') THEN value * probability / 100 ELSE 0 END) as weighted_value,
  COUNT(CASE WHEN stage NOT IN ('closed_won', 'closed_lost') THEN 1 END) as open_deals,
  COUNT(CASE WHEN stage = 'closed_won' AND closed_at >= date_trunc('month', NOW()) THEN 1 END) as won_this_month,
  COUNT(CASE WHEN stage = 'closed_lost' AND closed_at >= date_trunc('month', NOW()) THEN 1 END) as lost_this_month,
  COALESCE(SUM(CASE WHEN stage = 'closed_won' AND closed_at >= date_trunc('month', NOW()) THEN value ELSE 0 END), 0) as revenue_this_month
FROM crm_deals
GROUP BY user_id;

-- =============================================
-- 8. FUNÇÕES: Utilidades
-- =============================================

-- Função para obter contagem de contatos por empresa
CREATE OR REPLACE FUNCTION get_company_contacts_count(company_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM crm_contacts WHERE company_id = company_uuid);
END;
$$ LANGUAGE plpgsql;

-- Função para obter contagem de deals por empresa
CREATE OR REPLACE FUNCTION get_company_deals_count(company_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM crm_deals WHERE company_id = company_uuid);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- NOTAS DE INSTALAÇÃO
-- =============================================
--
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Verifique se todas as tabelas foram criadas corretamente
-- 3. Teste as políticas RLS criando e consultando dados
-- 4. As foreign keys garantem integridade referencial
-- 5. Os índices otimizam as consultas mais comuns
--
-- VALORES DOS ENUMS (definidos na aplicação):
--
-- stage (deals): lead, qualification, proposal, negotiation, closed_won, closed_lost
-- type (tasks): call, email, meeting, follow_up, deadline, other
-- priority (tasks): low, medium, high, urgent
-- type (activities): call, email, meeting, note
-- source: website, referral, social_media, cold_call, event, partner, other
--
-- =============================================
