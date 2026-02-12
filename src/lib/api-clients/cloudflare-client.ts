// HTTP client for Cloudflare R2 API integration
// This file contains ONLY HTTP wrappers, no business logic

const CLOUDFLARE_UPLOAD_WORKER = import.meta.env.VITE_CLOUDFLARE_UPLOAD_WORKER;

export interface R2Object {
  key: string;
  size: number;
  uploaded: string;
  etag: string;
}

export interface R2ListResponse {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
}

/**
 * HTTP client for Cloudflare R2 API
 * Uses a Worker proxy to handle CORS and authentication
 */
export class CloudflareClient {
  private readonly uploadWorkerUrl: string;

  constructor() {
    this.uploadWorkerUrl = CLOUDFLARE_UPLOAD_WORKER;

    if (!this.uploadWorkerUrl) {
      console.warn('⚠️ [CLOUDFLARE CLIENT] Missing VITE_CLOUDFLARE_UPLOAD_WORKER');
    }
  }

  /**
   * Upload a file to R2 bucket via Worker proxy
   */
  async uploadFile(key: string, content: string | Blob, contentType: string): Promise<void> {
    if (!this.uploadWorkerUrl) {
      throw new Error('Upload Worker URL not configured');
    }

    console.log('📤 [CLOUDFLARE CLIENT] Uploading via proxy:', key);

    const response = await fetch(this.uploadWorkerUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'X-File-Path': key,
      },
      body: content,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [CLOUDFLARE CLIENT] Upload error:', response.status, errorText);
      throw new Error(`R2 upload failed: ${response.status} - ${errorText}`);
    }

    // Try to parse JSON response, but don't fail if it's not JSON
    try {
      const result = await response.json();
      console.log('✅ [CLOUDFLARE CLIENT] Upload complete:', result);
    } catch {
      console.log('✅ [CLOUDFLARE CLIENT] Upload complete (no JSON response)');
    }
  }

  /**
   * Download/Get a file from R2 bucket via Worker proxy
   * Returns the file as ArrayBuffer for binary files
   */
  async getFile(key: string): Promise<ArrayBuffer> {
    if (!this.uploadWorkerUrl) {
      throw new Error('Upload Worker URL not configured');
    }

    console.log('📥 [CLOUDFLARE CLIENT] Downloading via proxy:', key);

    const response = await fetch(this.uploadWorkerUrl, {
      method: 'GET',
      headers: {
        'X-File-Path': key,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [CLOUDFLARE CLIENT] Download error:', response.status, errorText);
      throw new Error(`R2 download failed: ${response.status} - ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log('✅ [CLOUDFLARE CLIENT] Download complete:', key, `(${arrayBuffer.byteLength} bytes)`);
    return arrayBuffer;
  }

  /**
   * Delete a file from R2 bucket via Worker proxy
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.uploadWorkerUrl) {
      throw new Error('Upload Worker URL not configured');
    }

    console.log('🗑️ [CLOUDFLARE CLIENT] Deleting via proxy:', key);

    const response = await fetch(this.uploadWorkerUrl, {
      method: 'DELETE',
      headers: {
        'X-File-Path': key,
      },
    });

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text();
      throw new Error(`R2 delete failed: ${response.status} - ${errorText}`);
    }

    console.log('✅ [CLOUDFLARE CLIENT] Delete complete:', key);
  }

  /**
   * Check if a file exists in R2 bucket
   * Note: This makes a request to the site URL to check
   */
  async fileExists(key: string): Promise<boolean> {
    const domain = import.meta.env.VITE_SITE_DOMAIN || 'myeasyai.com';
    const slug = key.split('/')[0];
    const url = `https://${slug}.${domain}/`;

    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * List objects in R2 bucket with optional prefix
   * Note: This functionality requires additional Worker endpoint
   */
  async listObjects(_prefix?: string): Promise<R2Object[]> {
    // Not implemented via proxy - would require additional Worker endpoint
    console.warn('⚠️ [CLOUDFLARE CLIENT] listObjects not available via proxy');
    return [];
  }

  /**
   * Get the public URL for a site
   */
  getSiteUrl(slug: string): string {
    const domain = import.meta.env.VITE_SITE_DOMAIN || 'myeasyai.com';
    return `https://${slug}.${domain}`;
  }
}

// Export singleton instance
export const cloudflareClient = new CloudflareClient();
