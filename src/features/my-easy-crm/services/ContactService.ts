// =============================================
// MyEasyCRM - Contact Service
// Using Cloudflare D1 via d1Client
// =============================================

import { d1Client, type D1CrmContact } from '../../../lib/api-clients/d1-client';
import { authService } from '../../../services/AuthServiceV2';
import type { Contact, ContactFormData, ContactFilters } from '../types';

/**
 * Gets the current authenticated user ID.
 * Works with both Cloudflare and Supabase auth sources.
 */
async function getCurrentUserId(): Promise<string> {
  await authService.waitForInit();
  const authUser = authService.getUser();

  if (authUser?.uuid) {
    return authUser.uuid;
  }

  throw new Error('[ContactService] User not authenticated');
}

/**
 * Converts D1 contact to frontend Contact type
 */
function mapD1ToContact(d1Contact: D1CrmContact): Contact {
  return {
    id: d1Contact.id,
    user_id: d1Contact.user_id,
    company_id: d1Contact.company_id,
    name: d1Contact.name,
    email: d1Contact.email,
    phone: d1Contact.phone,
    mobile: d1Contact.mobile,
    position: d1Contact.position,
    role: d1Contact.role,
    tags: d1Contact.tags ? JSON.parse(d1Contact.tags) : [],
    notes: d1Contact.notes,
    source: d1Contact.source,
    lead_source: d1Contact.lead_source,
    birth_date: d1Contact.birth_date,
    address: d1Contact.address,
    linkedin: d1Contact.linkedin,
    instagram: d1Contact.instagram,
    created_at: d1Contact.created_at,
    updated_at: d1Contact.updated_at,
    company: d1Contact.company || undefined,
  };
}

export const ContactService = {
  /**
   * Busca todos os contatos do usuário
   */
  async getAll(filters?: ContactFilters): Promise<Contact[]> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getCrmContacts(userId, {
      search: filters?.search,
      company_id: filters?.company_id,
    });

    if (result.error) {
      console.error('Error fetching contacts:', result.error);
      throw new Error('Failed to fetch contacts');
    }

    let contacts = (result.data || []).map(mapD1ToContact);

    // Apply additional filters client-side
    if (filters?.tags && filters.tags.length > 0) {
      const filterTags = filters.tags;
      contacts = contacts.filter((c) =>
        filterTags.some((tag) => c.tags.includes(tag))
      );
    }

    if (filters?.lead_source) {
      contacts = contacts.filter((c) => c.lead_source === filters.lead_source);
    }

    if (filters?.created_after) {
      const createdAfter = filters.created_after;
      contacts = contacts.filter((c) => c.created_at >= createdAfter);
    }

    if (filters?.created_before) {
      const createdBefore = filters.created_before;
      contacts = contacts.filter((c) => c.created_at <= createdBefore);
    }

    return contacts;
  },

  /**
   * Busca um contato por ID
   */
  async getById(id: string): Promise<Contact | null> {
    const result = await d1Client.getCrmContactById(id);

    if (result.error) {
      if (result.error.includes('not found')) {
        return null;
      }
      console.error('Error fetching contact:', result.error);
      throw new Error('Failed to fetch contact');
    }

    return result.data ? mapD1ToContact(result.data) : null;
  },

  /**
   * Cria um novo contato
   */
  async create(data: ContactFormData): Promise<Contact> {
    const userId = await getCurrentUserId();

    const result = await d1Client.createCrmContact({
      user_id: userId,
      name: data.name,
      company_id: data.company_id,
      email: data.email,
      phone: data.phone,
      mobile: data.mobile,
      position: data.position,
      role: data.role,
      tags: data.tags,
      notes: data.notes,
      source: data.source,
      lead_source: data.lead_source,
      birth_date: data.birth_date,
      address: data.address,
      linkedin: data.linkedin,
      instagram: data.instagram,
    });

    if (result.error || !result.data) {
      console.error('Error creating contact:', result.error);
      throw new Error('Failed to create contact');
    }

    return mapD1ToContact(result.data);
  },

  /**
   * Atualiza um contato existente
   */
  async update(id: string, data: Partial<ContactFormData>): Promise<Contact> {
    const result = await d1Client.updateCrmContact(id, {
      ...data,
      tags: data.tags,
    });

    if (result.error || !result.data) {
      console.error('Error updating contact:', result.error);
      throw new Error('Failed to update contact');
    }

    return mapD1ToContact(result.data);
  },

  /**
   * Deleta um contato
   */
  async delete(id: string): Promise<void> {
    const result = await d1Client.deleteCrmContact(id);

    if (result.error) {
      console.error('Error deleting contact:', result.error);
      throw new Error('Failed to delete contact');
    }
  },

  /**
   * Conta total de contatos
   */
  async count(): Promise<number> {
    const userId = await getCurrentUserId();
    const result = await d1Client.countCrmContacts(userId);

    if (result.error) {
      console.error('Error counting contacts:', result.error);
      throw new Error('Failed to count contacts');
    }

    return result.data?.count || 0;
  },

  /**
   * Busca contatos por empresa
   */
  async getByCompany(companyId: string): Promise<Contact[]> {
    const result = await d1Client.getCrmContactsByCompany(companyId);

    if (result.error) {
      console.error('Error fetching contacts by company:', result.error);
      throw new Error('Failed to fetch contacts by company');
    }

    return (result.data || []).map(mapD1ToContact);
  },

  /**
   * Busca contatos criados recentemente
   */
  async getRecent(limit = 5): Promise<Contact[]> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getRecentCrmContacts(userId, limit);

    if (result.error) {
      console.error('Error fetching recent contacts:', result.error);
      throw new Error('Failed to fetch recent contacts');
    }

    return (result.data || []).map(mapD1ToContact);
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

    const filteredTags = contact.tags.filter((tag) => !tagsToRemove.includes(tag));
    return this.update(id, { tags: filteredTags });
  },
};
