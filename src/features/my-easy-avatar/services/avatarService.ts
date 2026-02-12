/**
 * Avatar Service - Handles saving and loading avatar customizations from the database
 */

import { d1Client } from '../../../lib/api-clients/d1-client';
import { authService } from '../../../services/AuthServiceV2';
import type { Customization, Asset, PhotoPose } from '../store';

/**
 * Serializable format for storing customization in database
 * We store only the essential data (asset IDs and colors) to keep it lightweight
 */
export type SerializedCustomization = {
  [categoryName: string]: {
    assetId?: string | null;
    color?: string;
  };
};

/**
 * Convert full Customization to serializable format
 */
export function serializeCustomization(customization: Customization): SerializedCustomization {
  const serialized: SerializedCustomization = {};

  for (const [categoryName, config] of Object.entries(customization)) {
    serialized[categoryName] = {
      assetId: config.asset?.id || null,
      color: config.color,
    };
  }

  return serialized;
}

/**
 * Convert serialized format back to full Customization
 * Requires the assets array to reconstruct Asset objects from IDs
 */
export function deserializeCustomization(
  serialized: SerializedCustomization,
  assets: Asset[]
): Customization {
  const customization: Customization = {};

  for (const [categoryName, config] of Object.entries(serialized)) {
    customization[categoryName] = {
      color: config.color,
    };

    if (config.assetId) {
      const asset = assets.find((a) => a.id === config.assetId);
      if (asset) {
        customization[categoryName].asset = asset;
      }
    }
  }

  return customization;
}

/**
 * Avatar Service for persisting customizations
 */
export const avatarService = {
  /**
   * Save avatar customization to database
   * Uses the user's bio field to store the serialized customization as JSON
   */
  async saveCustomization(
    customization: Customization,
    avatarName?: string,
    avatarSelfie?: string | null,
    pose?: PhotoPose
  ): Promise<{ success: boolean; error?: string }> {
    const user = authService.getUser();

    if (!user?.uuid) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const serialized = serializeCustomization(customization);
      const jsonString = JSON.stringify({
        type: 'avatar_customization',
        version: 1,
        data: serialized,
        updatedAt: new Date().toISOString(),
      });

      // First get the current user to preserve existing bio if it's not avatar data
      const currentUser = await d1Client.getUserByUuid(user.uuid);
      let bioData: any = {};

      if (currentUser.data?.bio) {
        try {
          const existingBio = JSON.parse(currentUser.data.bio);
          // If bio contains non-avatar data, preserve it
          if (existingBio.type !== 'avatar_customization') {
            bioData = { originalBio: currentUser.data.bio };
          }
        } catch {
          // Bio is plain text, preserve it
          bioData = { originalBio: currentUser.data.bio };
        }
      }

      // Merge avatar data with preserved bio
      const finalBio = JSON.stringify({
        ...bioData,
        avatar: {
          type: 'avatar_customization',
          version: 1,
          data: serialized,
          name: avatarName || '',
          selfie: avatarSelfie || null,
          pose: pose || 'Idle',
          updatedAt: new Date().toISOString(),
        },
      });

      const result = await d1Client.updateUserByUuid(user.uuid, {
        bio: finalBio,
      });

      if (result.error) {
        console.error('[AvatarService] Failed to save customization:', result.error);
        return { success: false, error: result.error };
      }

      console.log('[AvatarService] Customization saved successfully');
      return { success: true };
    } catch (error: any) {
      console.error('[AvatarService] Error saving customization:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Load avatar customization from database
   */
  async loadCustomization(assets: Asset[]): Promise<{
    success: boolean;
    customization?: Customization;
    avatarName?: string;
    avatarSelfie?: string | null;
    pose?: PhotoPose;
    error?: string;
  }> {
    const user = authService.getUser();

    if (!user?.uuid) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const result = await d1Client.getUserByUuid(user.uuid);

      if (result.error) {
        console.error('[AvatarService] Failed to load user:', result.error);
        return { success: false, error: result.error };
      }

      if (!result.data?.bio) {
        console.log('[AvatarService] No saved customization found');
        return { success: true }; // No customization saved yet
      }

      try {
        const bioData = JSON.parse(result.data.bio);

        // Check for avatar data in the bio
        let avatarData = null;

        if (bioData.avatar?.type === 'avatar_customization') {
          avatarData = bioData.avatar;
        } else if (bioData.type === 'avatar_customization') {
          // Legacy format
          avatarData = bioData;
        }

        if (!avatarData) {
          console.log('[AvatarService] No avatar customization in bio');
          return { success: true };
        }

        const customization = deserializeCustomization(avatarData.data, assets);
        console.log('[AvatarService] Customization loaded successfully');
        return {
          success: true,
          customization,
          avatarName: avatarData.name || '',
          avatarSelfie: avatarData.selfie || null,
          pose: avatarData.pose || 'Idle',
        };
      } catch (parseError) {
        // Bio is not JSON, no avatar data
        console.log('[AvatarService] Bio is not JSON, no avatar data');
        return { success: true };
      }
    } catch (error: any) {
      console.error('[AvatarService] Error loading customization:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if user has a saved avatar
   */
  async hasSavedAvatar(): Promise<boolean> {
    const user = authService.getUser();

    if (!user?.uuid) {
      return false;
    }

    try {
      const result = await d1Client.getUserByUuid(user.uuid);

      if (!result.data?.bio) {
        return false;
      }

      const bioData = JSON.parse(result.data.bio);
      return !!(bioData.avatar?.type === 'avatar_customization' || bioData.type === 'avatar_customization');
    } catch {
      return false;
    }
  },

  /**
   * Get only avatar name and selfie (for use in other modules like MyEasyDocs)
   */
  async getAvatarBasicInfo(retries = 2): Promise<{
    name: string | null;
    selfie: string | null;
  }> {
    const user = authService.getUser();

    if (!user?.uuid) {
      console.log('[AvatarService] No user authenticated, cannot load avatar info');
      return { name: null, selfie: null };
    }

    try {
      const result = await d1Client.getUserByUuid(user.uuid);

      if (result.error) {
        console.error('[AvatarService] Error fetching user data:', result.error);

        // Retry on error
        if (retries > 0) {
          console.log(`[AvatarService] Retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
          return this.getAvatarBasicInfo(retries - 1);
        }

        return { name: null, selfie: null };
      }

      if (!result.data?.bio) {
        console.log('[AvatarService] No bio data found for user');
        return { name: null, selfie: null };
      }

      const bioData = JSON.parse(result.data.bio);
      const avatarData = bioData.avatar || bioData;

      if (avatarData.type !== 'avatar_customization') {
        console.log('[AvatarService] Bio does not contain avatar customization');
        return { name: null, selfie: null };
      }

      console.log('[AvatarService] Avatar info loaded successfully:', {
        name: avatarData.name,
        hasSelfie: !!avatarData.selfie,
      });

      return {
        name: avatarData.name || null,
        selfie: avatarData.selfie || null,
      };
    } catch (error) {
      console.error('[AvatarService] Exception loading avatar info:', error);

      // Retry on exception
      if (retries > 0) {
        console.log(`[AvatarService] Retrying after exception... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return this.getAvatarBasicInfo(retries - 1);
      }

      return { name: null, selfie: null };
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!authService.getUser()?.uuid;
  },

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    return authService.getUser()?.uuid || null;
  },
};
