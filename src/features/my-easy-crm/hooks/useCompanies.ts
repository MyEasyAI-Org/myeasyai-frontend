// =============================================
// MyEasyCRM - useCompanies Hook
// =============================================

import { useState, useCallback, useEffect } from 'react';
import { CompanyService } from '../services';
import type { Company, CompanyFormData } from '../types';

interface UseCompaniesReturn {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  refresh: () => Promise<void>;
  createCompany: (data: CompanyFormData) => Promise<Company>;
  updateCompany: (id: string, data: Partial<CompanyFormData>) => Promise<Company>;
  deleteCompany: (id: string) => Promise<void>;
  searchCompanies: (search: string) => Promise<void>;
}

export function useCompanies(): UseCompaniesReturn {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState<string | undefined>();

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await CompanyService.getAll(search);
      setCompanies(data);
      setTotalCount(data.length);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load companies';
      setError(message);
      console.error('Error fetching companies:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const searchCompanies = useCallback(async (searchTerm: string) => {
    setSearch(searchTerm || undefined);
  }, []);

  const createCompany = useCallback(async (data: CompanyFormData): Promise<Company> => {
    const company = await CompanyService.create(data);
    setCompanies((prev) => [company, ...prev]);
    setTotalCount((prev) => prev + 1);
    return company;
  }, []);

  const updateCompany = useCallback(async (id: string, data: Partial<CompanyFormData>): Promise<Company> => {
    const updated = await CompanyService.update(id, data);
    setCompanies((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const deleteCompany = useCallback(async (id: string): Promise<void> => {
    await CompanyService.delete(id);
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    setTotalCount((prev) => prev - 1);
  }, []);

  return {
    companies,
    isLoading,
    error,
    totalCount,
    refresh: fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    searchCompanies,
  };
}

// Hook para uma única empresa
interface UseCompanyReturn {
  company: (Company & { contacts_count: number; deals_count: number }) | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateCompany: (data: Partial<CompanyFormData>) => Promise<Company>;
}

export function useCompany(id: string | null): UseCompanyReturn {
  const [company, setCompany] = useState<(Company & { contacts_count: number; deals_count: number }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = useCallback(async () => {
    if (!id) {
      setCompany(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await CompanyService.getByIdWithStats(id);
      setCompany(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load company';
      setError(message);
      console.error('Error fetching company:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const updateCompany = useCallback(async (data: Partial<CompanyFormData>): Promise<Company> => {
    if (!id) throw new Error('Company ID not provided');
    const updated = await CompanyService.update(id, data);
    setCompany((prev) => prev ? { ...prev, ...updated } : null);
    return updated;
  }, [id]);

  return {
    company,
    isLoading,
    error,
    refresh: fetchCompany,
    updateCompany,
  };
}

// Hook para select de empresas
export function useCompaniesSelect(): {
  options: { id: string; name: string }[];
  isLoading: boolean;
  error: string | null;
} {
  const [options, setOptions] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchOptions = async () => {
      try {
        const data = await CompanyService.getForSelect();
        if (isMounted) {
          setOptions(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to load companies';
          setError(message);
          console.error('Error fetching companies for select:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  return { options, isLoading, error };
}
