// =============================================
// MyEasyCRM - Company Service
// =============================================

import { supabase } from '../../../lib/api-clients/supabase-client';
import type { Company, CompanyFormData } from '../types';

const TABLE_NAME = 'crm_companies';

export const CompanyService = {
  /**
   * Busca todas as empresas do usuário
   */
  async getAll(search?: string): Promise<Company[]> {
    let query = supabase
      .from(TABLE_NAME)
      .select('*')
      .order('name');

    if (search) {
      query = query.or(`name.ilike.%${search}%,cnpj.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching companies:', error);
      throw new Error('Erro ao buscar empresas');
    }

    return data || [];
  },

  /**
   * Busca uma empresa por ID
   */
  async getById(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching company:', error);
      throw new Error('Erro ao buscar empresa');
    }

    return data;
  },

  /**
   * Busca uma empresa com estatísticas (contatos e deals)
   */
  async getByIdWithStats(id: string): Promise<Company & { contacts_count: number; deals_count: number } | null> {
    const { data: company, error: companyError } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (companyError) {
      if (companyError.code === 'PGRST116') {
        return null;
      }
      throw new Error('Erro ao buscar empresa');
    }

    // Contar contatos
    const { count: contactsCount } = await supabase
      .from('crm_contacts')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', id);

    // Contar deals
    const { count: dealsCount } = await supabase
      .from('crm_deals')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', id);

    return {
      ...company,
      contacts_count: contactsCount || 0,
      deals_count: dealsCount || 0,
    };
  },

  /**
   * Cria uma nova empresa
   */
  async create(data: CompanyFormData): Promise<Company> {
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
      throw new Error('Usuário não autenticado');
    }

    const { data: company, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        ...data,
        user_id: user.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      throw new Error('Erro ao criar empresa');
    }

    return company;
  },

  /**
   * Atualiza uma empresa existente
   */
  async update(id: string, data: Partial<CompanyFormData>): Promise<Company> {
    const { data: company, error } = await supabase
      .from(TABLE_NAME)
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating company:', error);
      throw new Error('Erro ao atualizar empresa');
    }

    return company;
  },

  /**
   * Deleta uma empresa
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting company:', error);
      throw new Error('Erro ao deletar empresa');
    }
  },

  /**
   * Conta total de empresas
   */
  async count(): Promise<number> {
    const { count, error } = await supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error counting companies:', error);
      throw new Error('Erro ao contar empresas');
    }

    return count || 0;
  },

  /**
   * Busca empresas para select/dropdown
   */
  async getForSelect(): Promise<{ id: string; name: string }[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching companies for select:', error);
      throw new Error('Erro ao buscar empresas');
    }

    return data || [];
  },

  /**
   * Busca empresas por indústria
   */
  async getByIndustry(industry: string): Promise<Company[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('industry', industry)
      .order('name');

    if (error) {
      console.error('Error fetching companies by industry:', error);
      throw new Error('Erro ao buscar empresas por indústria');
    }

    return data || [];
  },
};
