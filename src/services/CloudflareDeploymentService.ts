// Cloudflare R2 deployment service
// Contains business logic for site deployment orchestration

import { cloudflareClient } from '../lib/api-clients/cloudflare-client';

export interface CloudflareDeployResult {
  success: boolean;
  url: string;
  slug: string;
  filesUploaded: number;
  error?: string;
}

export interface DeployProgress {
  progress: number;
  message: string;
}

/**
 * Service responsible for deploying websites to Cloudflare R2
 * Manages the complete lifecycle: validation, upload, and URL generation
 */
export class CloudflareDeploymentService {
  /**
   * Validates if a slug is valid for use as subdomain
   * Only allows lowercase letters, numbers, and hyphens
   */
  validateSlug(slug: string): { valid: boolean; error?: string } {
    if (!slug || slug.trim() === '') {
      return { valid: false, error: 'Slug is required' };
    }

    const cleanSlug = slug.toLowerCase().trim();

    // Check length
    if (cleanSlug.length < 3) {
      return { valid: false, error: 'Slug must be at least 3 characters' };
    }

    if (cleanSlug.length > 63) {
      return { valid: false, error: 'Slug must be at most 63 characters' };
    }

    // Check format (only lowercase letters, numbers, hyphens)
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(cleanSlug) && cleanSlug.length > 1) {
      return {
        valid: false,
        error: 'Slug must start and end with a letter or number, and contain only letters, numbers, and hyphens'
      };
    }

    // Check for reserved subdomains
    const RESERVED = ['www', 'app', 'api', 'admin', 'dashboard', 'mail', 'smtp', 'ftp', 'test', 'teste'];
    if (RESERVED.includes(cleanSlug)) {
      return { valid: false, error: 'This subdomain is reserved' };
    }

    return { valid: true };
  }

  /**
   * Normalizes a slug to be URL-safe
   */
  normalizeSlug(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphen
      .replace(/-+/g, '-') // Remove consecutive hyphens
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Checks if a slug is already in use
   */
  async isSlugAvailable(slug: string): Promise<boolean> {
    try {
      const exists = await cloudflareClient.fileExists(`${slug}/index.html`);
      return !exists;
    } catch (error) {
      console.error('❌ [CLOUDFLARE DEPLOY] Error checking slug:', error);
      // If we can't check, assume it's available
      return true;
    }
  }

  /**
   * Gets the content type for a file based on extension
   */
  private getContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const types: Record<string, string> = {
      'html': 'text/html; charset=utf-8',
      'css': 'text/css; charset=utf-8',
      'js': 'application/javascript; charset=utf-8',
      'json': 'application/json; charset=utf-8',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon',
      'webp': 'image/webp',
      'woff': 'font/woff',
      'woff2': 'font/woff2',
      'ttf': 'font/ttf',
    };
    return types[ext] || 'application/octet-stream';
  }

  /**
   * Deploys a website with multiple files to Cloudflare R2
   */
  async deployWebsite(
    slug: string,
    files: Record<string, string>,
    onProgress?: (progress: DeployProgress) => void
  ): Promise<CloudflareDeployResult> {
    try {
      // Step 1: Validate slug
      onProgress?.({ progress: 5, message: 'Validating site name...' });

      const validation = this.validateSlug(slug);
      if (!validation.valid) {
        return {
          success: false,
          url: '',
          slug,
          filesUploaded: 0,
          error: validation.error,
        };
      }

      const normalizedSlug = this.normalizeSlug(slug);
      console.log('🚀 [CLOUDFLARE DEPLOY] Starting deploy for:', normalizedSlug);

      onProgress?.({ progress: 10, message: 'Checking availability...' });

      // Step 2: Check if slug is available (optional - we allow updates)
      const isAvailable = await this.isSlugAvailable(normalizedSlug);
      if (!isAvailable) {
        console.log('🔄 [CLOUDFLARE DEPLOY] Site exists, will update:', normalizedSlug);
        onProgress?.({ progress: 15, message: 'Site exists, updating...' });
      }

      // Step 3: Upload files
      const fileEntries = Object.entries(files);
      const totalFiles = fileEntries.length;
      let uploadedCount = 0;

      onProgress?.({ progress: 20, message: `Uploading ${totalFiles} files...` });

      for (const [filename, content] of fileEntries) {
        const key = `${normalizedSlug}/${filename}`;
        const contentType = this.getContentType(filename);

        console.log(`📤 [CLOUDFLARE DEPLOY] Uploading: ${key}`);

        await cloudflareClient.uploadFile(key, content, contentType);
        uploadedCount++;

        const uploadProgress = 20 + (uploadedCount / totalFiles) * 70;
        onProgress?.({
          progress: uploadProgress,
          message: `Uploaded ${uploadedCount}/${totalFiles} files...`
        });
      }

      // Step 4: Generate URL
      onProgress?.({ progress: 95, message: 'Finishing...' });

      const siteUrl = cloudflareClient.getSiteUrl(normalizedSlug);

      console.log('🎉 [CLOUDFLARE DEPLOY] Deploy complete!');
      console.log('🌐 [CLOUDFLARE DEPLOY] URL:', siteUrl);

      onProgress?.({ progress: 100, message: 'Site published!' });

      return {
        success: true,
        url: siteUrl,
        slug: normalizedSlug,
        filesUploaded: uploadedCount,
      };
    } catch (error) {
      console.error('❌ [CLOUDFLARE DEPLOY] Deploy error:', error);
      return {
        success: false,
        url: '',
        slug,
        filesUploaded: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Deploys a single HTML file (simplified API for basic sites)
   */
  async deploySinglePage(
    slug: string,
    htmlContent: string,
    onProgress?: (progress: DeployProgress) => void
  ): Promise<CloudflareDeployResult> {
    return this.deployWebsite(slug, { 'index.html': htmlContent }, onProgress);
  }

  /**
   * Deletes a site from R2
   */
  async deleteSite(slug: string): Promise<boolean> {
    try {
      const normalizedSlug = this.normalizeSlug(slug);
      console.log('🗑️ [CLOUDFLARE DEPLOY] Deleting site:', normalizedSlug);

      // List all files for this site
      const objects = await cloudflareClient.listObjects(`${normalizedSlug}/`);

      // Delete each file
      for (const obj of objects) {
        await cloudflareClient.deleteFile(obj.key);
      }

      // Also try to delete common files directly
      const commonFiles = ['index.html', 'css/style.css', 'js/main.js'];
      for (const file of commonFiles) {
        try {
          await cloudflareClient.deleteFile(`${normalizedSlug}/${file}`);
        } catch {
          // Ignore errors for files that don't exist
        }
      }

      console.log('✅ [CLOUDFLARE DEPLOY] Site deleted:', normalizedSlug);
      return true;
    } catch (error) {
      console.error('❌ [CLOUDFLARE DEPLOY] Delete error:', error);
      return false;
    }
  }

  /**
   * Gets the public URL for a site
   */
  getSiteUrl(slug: string): string {
    return cloudflareClient.getSiteUrl(this.normalizeSlug(slug));
  }
}

// Export singleton instance
export const cloudflareDeploymentService = new CloudflareDeploymentService();
