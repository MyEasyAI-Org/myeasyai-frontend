// Hook React para inicializar sincronização Realtime
// Ativa o DatabaseSyncService quando o app está montado

import { useEffect, useRef } from 'react';
import { databaseSyncService } from '../services/DatabaseSyncService';

/**
 * Hook que inicializa a sincronização bidirecional de banco de dados
 *
 * Uso:
 * ```tsx
 * function App() {
 *   useRealtimeSync();
 *   return <div>...</div>;
 * }
 * ```
 */
export function useRealtimeSync(): void {
  const isInitialized = useRef(false);

  useEffect(() => {
    // Evita inicialização dupla em StrictMode
    if (isInitialized.current) {
      return;
    }

    // Inicializa o serviço de sincronização
    databaseSyncService.initialize();
    isInitialized.current = true;

    // Cleanup quando o componente desmonta
    return () => {
      databaseSyncService.destroy();
      isInitialized.current = false;
    };
  }, []);
}

/**
 * Hook para controlar o estado da sincronização
 * Permite habilitar/desabilitar sync em runtime
 */
export function useSyncControl() {
  const enable = () => databaseSyncService.setEnabled(true);
  const disable = () => databaseSyncService.setEnabled(false);
  const isReady = () => databaseSyncService.isReady();

  return {
    enable,
    disable,
    isReady,
  };
}

/**
 * Hook para marcar registros como sincronizados
 * Usado pelos services para evitar loops de sync
 */
export function useSyncMarker() {
  const markAsSynced = (table: 'users' | 'sites' | 'user_products', recordId: string) => {
    databaseSyncService.markAsSynced(table, recordId);
  };

  return { markAsSynced };
}
