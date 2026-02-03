// =============================================
// MyEasyDocs - useDocsSearch Hook
// Search documents by name and content
// =============================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { DocsSearchService, type SearchResult } from '../services/DocsSearchService';
import type { DocsDocument } from '../types';

interface UseDocsSearchOptions {
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Minimum query length to trigger search */
  minQueryLength?: number;
  /** All documents to filter by name */
  documents: DocsDocument[];
  /** Whether to search in content chunks */
  searchInContent?: boolean;
}

interface UseDocsSearchReturn {
  /** Current search query */
  query: string;
  /** Set search query */
  setQuery: (query: string) => void;
  /** Documents matching by name */
  matchedDocumentsByName: DocsDocument[];
  /** Documents matching by content (from chunks) */
  matchedDocumentsByContent: SearchResult[];
  /** Combined unique document IDs that match */
  matchedDocumentIds: Set<string>;
  /** Whether search is active (query is not empty) */
  isSearchActive: boolean;
  /** Loading state for content search */
  isSearching: boolean;
  /** Error message if any */
  error: string | null;
  /** Clear search */
  clearSearch: () => void;
}

export function useDocsSearch(options: UseDocsSearchOptions): UseDocsSearchReturn {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    documents,
    searchInContent = true,
  } = options;

  const [query, setQueryState] = useState('');
  const [matchedDocumentsByContent, setMatchedDocumentsByContent] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Filter documents by name (local search)
  const matchedDocumentsByName = query.length >= minQueryLength
    ? documents.filter((doc) => {
        const queryLower = query.toLowerCase();
        return (
          doc.name.toLowerCase().includes(queryLower) ||
          doc.original_name.toLowerCase().includes(queryLower)
        );
      })
    : [];

  // Combine unique document IDs
  const matchedDocumentIds = new Set<string>([
    ...matchedDocumentsByName.map((d) => d.id),
    ...matchedDocumentsByContent.map((r) => r.documentId),
  ]);

  const isSearchActive = query.length >= minQueryLength;

  // Search in content with debounce
  const searchInContentChunks = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minQueryLength) {
      setMatchedDocumentsByContent([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsSearching(true);
    setError(null);

    try {
      const results = await DocsSearchService.searchChunks(searchQuery, 20);

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setMatchedDocumentsByContent(results);
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      console.error('[useDocsSearch] Error searching content:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setMatchedDocumentsByContent([]);
    } finally {
      setIsSearching(false);
    }
  }, [minQueryLength]);

  // Set query with debounced content search
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (newQuery.length < minQueryLength) {
      setMatchedDocumentsByContent([]);
      return;
    }

    // Debounce content search
    if (searchInContent) {
      debounceTimerRef.current = setTimeout(() => {
        searchInContentChunks(newQuery);
      }, debounceMs);
    }
  }, [debounceMs, minQueryLength, searchInContent, searchInContentChunks]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQueryState('');
    setMatchedDocumentsByContent([]);
    setError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    matchedDocumentsByName,
    matchedDocumentsByContent,
    matchedDocumentIds,
    isSearchActive,
    isSearching,
    error,
    clearSearch,
  };
}

export default useDocsSearch;
