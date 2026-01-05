// =============================================
// MyEasyCRM - Company Service
// Using Cloudflare D1 via d1Client
// =============================================

import { d1Client, type D1CrmCompany } from '../../../lib/api-clients/d1-client';
import { authService } from '../../../services/AuthServiceV2';
import type { Company, CompanyFormData } from '../types';

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

  throw new Error('[CompanyService] User not authenticated');
}

/** Helper to convert null to undefined */
function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

/**
 * Converts D1 company to frontend Company type
 */
function mapD1ToCompany(d1Company: D1CrmCompany): Company {
  return {
    id: d1Company.id,
    user_id: d1Company.user_id,
    name: d1Company.name,
    cnpj: nullToUndefined(d1Company.cnpj),
    industry: nullToUndefined(d1Company.industry) as Company['industry'],
    segment: nullToUndefined(d1Company.segment) as Company['segment'],
    size: nullToUndefined(d1Company.size) as Company['size'],
    website: nullToUndefined(d1Company.website),
    address: nullToUndefined(d1Company.address),
    city: nullToUndefined(d1Company.city),
    state: nullToUndefined(d1Company.state),
    phone: nullToUndefined(d1Company.phone),
    email: nullToUndefined(d1Company.email),
    linkedin: nullToUndefined(d1Company.linkedin),
    instagram: nullToUndefined(d1Company.instagram),
    facebook: nullToUndefined(d1Company.facebook),
    notes: nullToUndefined(d1Company.notes),
    created_at: d1Company.created_at ?? new Date().toISOString(),
    updated_at: d1Company.updated_at ?? new Date().toISOString(),
  };
}

export const CompanyService = {
  /**
   * Busca todas as empresas do usuário
   */
  async getAll(search?: string): Promise<Company[]> {
    const userId = await getCurrentUserId();
    const result = await d1Client.getCrmCompanies(userId);

    if (result.error) {
      console.error('Error fetching companies:', result.error);
      throw new Error('Failed to fetch companies');
    }

    let companies = (result.data || []).map(mapD1ToCompany);

    // Filter by search if provided
    if (search) {
      const searchLower = search.toLowerCase();
      companies = companies.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.cnpj?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by name
    companies.sort((a, b) => a.name.localeCompare(b.name));

    return companies;
  },

  /**
   * Busca uma empresa por ID
   */
  async getById(id: string): Promise<Company | null> {
    const result = await d1Client.getCrmCompanyById(id);

    if (result.error) {
      if (result.error.includes('not found')) {
        return null;
      }
      console.error('Error fetching company:', result.error);
      throw new Error('Failed to fetch company');
    }

    return result.data ? mapD1ToCompany(result.data) : null;
  },

  /**
   * Busca uma empresa com estatísticas (contatos e deals)
   */
  async getByIdWithStats(id: string): Promise<Company & { contacts_count: number; deals_count: number } | null> {
    const company = await this.getById(id);

    if (!company) {
      return null;
    }

    // Get contacts count
    const contactsResult = await d1Client.getCrmContactsByCompany(id);
    const contactsCount = contactsResult.data?.length || 0;

    // Get deals count (we need userId for this)
    const userId = await getCurrentUserId();
    const dealsResult = await d1Client.getCrmDeals(userId, { company_id: id });
    const dealsCount = dealsResult.data?.length || 0;

    return {
      ...company,
      contacts_count: contactsCount,
      deals_count: dealsCount,
    };
  },

  /**
   * Cria uma nova empresa
   */
  async create(data: CompanyFormData): Promise<Company> {
    const userId = await getCurrentUserId();

    const result = await d1Client.createCrmCompany({
      user_id: userId,
      name: data.name,
      cnpj: data.cnpj,
      industry: data.industry,
      segment: data.segment,
      size: data.size,
      website: data.website,
      address: data.address,
      city: data.city,
      state: data.state,
      phone: data.phone,
      email: data.email,
      linkedin: data.linkedin,
      instagram: data.instagram,
      facebook: data.facebook,
      notes: data.notes,
    });

    if (result.error || !result.data) {
      console.error('Error creating company:', result.error);
      throw new Error('Failed to create company');
    }

    return mapD1ToCompany(result.data);
  },

  /**
   * Atualiza uma empresa existente
   */
  async update(id: string, data: Partial<CompanyFormData>): Promise<Company> {
    const result = await d1Client.updateCrmCompany(id, data);

    if (result.error || !result.data) {
      console.error('Error updating company:', result.error);
      throw new Error('Failed to update company');
    }

    return mapD1ToCompany(result.data);
  },

  /**
   * Deleta uma empresa
   */
  async delete(id: string): Promise<void> {
    const result = await d1Client.deleteCrmCompany(id);

    if (result.error) {
      console.error('Error deleting company:', result.error);
      throw new Error('Failed to delete company');
    }
  },

  /**
   * Conta total de empresas
   */
  async count(): Promise<number> {
    const userId = await getCurrentUserId();
    const result = await d1Client.countCrmCompanies(userId);

    if (result.error) {
      console.error('Error counting companies:', result.error);
      throw new Error('Failed to count companies');
    }

    return result.data?.count || 0;
  },

  /**
   * Busca empresas para select/dropdown
   */
  async getForSelect(): Promise<{ id: string; name: string }[]> {
    const companies = await this.getAll();
    return companies.map((c) => ({ id: c.id, name: c.name }));
  },

  /**
   * Busca empresas por indústria
   */
  async getByIndustry(industry: string): Promise<Company[]> {
    const companies = await this.getAll();
    return companies.filter((c) => c.industry === industry);
  },
};
