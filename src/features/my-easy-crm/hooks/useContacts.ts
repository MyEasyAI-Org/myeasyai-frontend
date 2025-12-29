// =============================================
// MyEasyCRM - useContacts Hook
// =============================================

import { useState, useCallback, useEffect } from 'react';
import { ContactService } from '../services';
import type { Contact, ContactFormData, ContactFilters } from '../types';

interface UseContactsReturn {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  refresh: () => Promise<void>;
  createContact: (data: ContactFormData) => Promise<Contact>;
  updateContact: (id: string, data: Partial<ContactFormData>) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  setFilters: (filters: ContactFilters) => void;
  filters: ContactFilters;
}

export function useContacts(initialFilters?: ContactFilters): UseContactsReturn {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<ContactFilters>(initialFilters || {});

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await ContactService.getAll(filters);
      setContacts(data);
      setTotalCount(data.length);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load contacts';
      setError(message);
      console.error('Error fetching contacts:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const createContact = useCallback(async (data: ContactFormData): Promise<Contact> => {
    const contact = await ContactService.create(data);
    setContacts((prev) => [contact, ...prev]);
    setTotalCount((prev) => prev + 1);
    return contact;
  }, []);

  const updateContact = useCallback(async (id: string, data: Partial<ContactFormData>): Promise<Contact> => {
    const updated = await ContactService.update(id, data);
    setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const deleteContact = useCallback(async (id: string): Promise<void> => {
    await ContactService.delete(id);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setTotalCount((prev) => prev - 1);
  }, []);

  return {
    contacts,
    isLoading,
    error,
    totalCount,
    refresh: fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    setFilters,
    filters,
  };
}

// Hook para um único contato
interface UseContactReturn {
  contact: Contact | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateContact: (data: Partial<ContactFormData>) => Promise<Contact>;
}

export function useContact(id: string | null): UseContactReturn {
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContact = useCallback(async () => {
    if (!id) {
      setContact(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await ContactService.getById(id);
      setContact(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load contact';
      setError(message);
      console.error('Error fetching contact:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  const updateContact = useCallback(async (data: Partial<ContactFormData>): Promise<Contact> => {
    if (!id) throw new Error('Contact ID not provided');
    const updated = await ContactService.update(id, data);
    setContact(updated);
    return updated;
  }, [id]);

  return {
    contact,
    isLoading,
    error,
    refresh: fetchContact,
    updateContact,
  };
}
