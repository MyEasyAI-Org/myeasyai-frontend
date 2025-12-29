// =============================================
// MyEasyCRM - Contact Service
// =============================================

import { supabase } from '../../../lib/api-clients/supabase-client';
import type { Contact, ContactFormData, ContactFilters } from '../types';

const TABLE_NAME = 'crm_contacts';

export const ContactService = {
  /**
   * Busca todos os contatos do usuário
   */
  async getAll(filters?: ContactFilters): Promise<Contact[]> {
    let query = supabase
      .from(TABLE_NAME)
      .select(`
        *,
        company:crm_companies(id, name, industry)
      `)
      .order('created_at', { ascending: false });

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    if (filters?.company_id) {
      query = query.eq('company_id', filters.company_id);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    if (filters?.lead_source) {
      query = query.eq('lead_source', filters.lead_source);
    }

    if (filters?.created_after) {
      query = query.gte('created_at', filters.created_after);
    }

    if (filters?.created_before) {
      query = query.lte('created_at', filters.created_before);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contacts:', error);
      throw new Error('Failed to fetch contacts');
    }

    return data || [];
  },

  /**
   * Busca um contato por ID
   */
  async getById(id: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        company:crm_companies(id, name, industry, size, website)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching contact:', error);
      throw new Error('Failed to fetch contact');
    }

    return data;
  },

  /**
   * Cria um novo contato
   */
  async create(data: ContactFormData): Promise<Contact> {
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
      throw new Error('[ContactService] User not authenticated');
    }

    const { data: contact, error } = await supabase
      .from(TABLE_NAME)
      .insert({
        ...data,
        user_id: user.user.id,
        tags: data.tags || [],
      })
      .select(`
        *,
        company:crm_companies(id, name, industry)
      `)
      .single();

    if (error) {
      console.error('Error creating contact:', error);
      throw new Error('Failed to create contact');
    }

    return contact;
  },

  /**
   * Atualiza um contato existente
   */
  async update(id: string, data: Partial<ContactFormData>): Promise<Contact> {
    const { data: contact, error } = await supabase
      .from(TABLE_NAME)
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        company:crm_companies(id, name, industry)
      `)
      .single();

    if (error) {
      console.error('Error updating contact:', error);
      throw new Error('Failed to update contact');
    }

    return contact;
  },

  /**
   * Deleta um contato
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting contact:', error);
      throw new Error('Failed to delete contact');
    }
  },

  /**
   * Conta total de contatos
   */
  async count(): Promise<number> {
    const { count, error } = await supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error counting contacts:', error);
      throw new Error('Failed to count contacts');
    }

    return count || 0;
  },

  /**
   * Busca contatos por empresa
   */
  async getByCompany(companyId: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('company_id', companyId)
      .order('name');

    if (error) {
      console.error('Error fetching contacts by company:', error);
      throw new Error('Failed to fetch contacts by company');
    }

    return data || [];
  },

  /**
   * Busca contatos criados recentemente
   */
  async getRecent(limit = 5): Promise<Contact[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        company:crm_companies(id, name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent contacts:', error);
      throw new Error('Failed to fetch recent contacts');
    }

    return data || [];
  },

  /**
   * Adiciona tags a um contato
   */
  async addTags(id: string, tags: string[]): Promise<Contact> {
    const contact = await this.getById(id);
    if (!contact) {
      throw new Error('Contact not found');
    }

    const uniqueTags = [...new Set([...contact.tags, ...tags])];
    return this.update(id, { tags: uniqueTags });
  },

  /**
   * Remove tags de um contato
   */
  async removeTags(id: string, tagsToRemove: string[]): Promise<Contact> {
    const contact = await this.getById(id);
    if (!contact) {
      throw new Error('Contact not found');
    }

    const filteredTags = contact.tags.filter(tag => !tagsToRemove.includes(tag));
    return this.update(id, { tags: filteredTags });
  },
};
