import { WebContainer } from '@webcontainer/api';
import { WORK_DIR_NAME } from '../../utils/constants';

interface WebContainerContext {
  loaded: boolean;
  error: Error | null;
}

export const webcontainerContext: WebContainerContext = {
  loaded: false,
  error: null,
};

let webcontainerInstance: WebContainer | null = null;
let webcontainerPromise: Promise<WebContainer> | null = null;
let bootAttempted = false;
let bootFailureCount = 0;
const MAX_BOOT_RETRIES = 3;

/**
 * Check if the environment supports WebContainer
 */
export function checkWebContainerSupport(): { supported: boolean; reason?: string } {
  // Check for cross-origin isolation
  if (typeof crossOriginIsolated !== 'undefined' && !crossOriginIsolated) {
    return {
      supported: false,
      reason: 'Cross-origin isolation não está habilitado. Os headers COOP/COEP são necessários.',
    };
  }

  // Check for SharedArrayBuffer support
  if (typeof SharedArrayBuffer === 'undefined') {
    return {
      supported: false,
      reason: 'SharedArrayBuffer não está disponível neste navegador.',
    };
  }

  return { supported: true };
}

export async function getWebContainer(): Promise<WebContainer> {
  // Return existing instance if available
  if (webcontainerInstance) {
    console.log('[WebContainer] Returning existing instance');
    return webcontainerInstance;
  }

  // Return existing promise if boot is in progress
  if (webcontainerPromise) {
    console.log('[WebContainer] Returning existing boot promise');
    return webcontainerPromise;
  }

  // If boot was already attempted and failed, check if we can retry
  if (bootAttempted && webcontainerContext.error) {
    if (bootFailureCount >= MAX_BOOT_RETRIES) {
      console.log('[WebContainer] Max retries reached, throwing cached error');
      throw webcontainerContext.error;
    }
    console.log(`[WebContainer] Boot previously failed, retrying (attempt ${bootFailureCount + 1}/${MAX_BOOT_RETRIES})`);
    // Reset for retry
    bootAttempted = false;
    webcontainerContext.error = null;
  }

  // Check environment support before attempting boot
  const support = checkWebContainerSupport();
  if (!support.supported) {
    const error = new Error(support.reason);
    webcontainerContext.error = error;
    bootAttempted = true;
    throw error;
  }

  console.log('[WebContainer] Starting boot process...');
  console.log('[WebContainer] crossOriginIsolated:', typeof crossOriginIsolated !== 'undefined' ? crossOriginIsolated : 'undefined');
  console.log('[WebContainer] SharedArrayBuffer available:', typeof SharedArrayBuffer !== 'undefined');
  bootAttempted = true;

  // Small delay to ensure environment is ready
  await new Promise(resolve => setTimeout(resolve, 100));

  webcontainerPromise = WebContainer.boot({
    coep: 'credentialless',
    workdirName: WORK_DIR_NAME,
    forwardPreviewErrors: true,
  }).then((wc: WebContainer) => {
    console.log('[WebContainer] Boot successful');
    webcontainerInstance = wc;
    webcontainerContext.loaded = true;
    webcontainerContext.error = null;

    // Listen for server-ready events
    wc.on('server-ready', (port: number, url: string) => {
      console.log(`[WebContainer] Server ready on port ${port}: ${url}`);
    });

    // Listen for errors
    wc.on('error', (error: { message: string }) => {
      console.error('[WebContainer] Runtime error:', error.message);
    });

    return wc;
  }).catch((error: Error) => {
    console.error('[WebContainer] Boot failed:', error);
    bootFailureCount++;
    webcontainerContext.error = error;
    webcontainerContext.loaded = false;
    webcontainerPromise = null; // Reset promise so retry is possible
    throw error;
  });

  return webcontainerPromise;
}

export function isWebContainerLoaded(): boolean {
  return webcontainerContext.loaded;
}

/**
 * Reset WebContainer state to allow fresh boot attempt
 */
export function resetWebContainer(): void {
  console.log('[WebContainer] Resetting state for fresh boot');
  webcontainerInstance = null;
  webcontainerPromise = null;
  bootAttempted = false;
  bootFailureCount = 0;
  webcontainerContext.loaded = false;
  webcontainerContext.error = null;
}
