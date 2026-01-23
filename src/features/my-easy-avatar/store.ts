import PocketBase from 'pocketbase';
import { MeshStandardMaterial } from 'three';
import { randInt } from 'three/src/math/MathUtils.js';
import { create } from 'zustand';
import { DEMO_CATEGORIES, getDemoAssets, getDemoCustomization } from './demoData';
import { avatarService } from './services/avatarService';

const pocketBaseUrl = import.meta.env.VITE_POCKETBASE_URL || '';
const isPocketBaseConfigured = Boolean(pocketBaseUrl);

if (!isPocketBaseConfigured) {
  console.log('[MyEasyAvatar] Running in demo mode with local assets.');
}

export const PHOTO_POSES = {
  Idle: 'Idle',
  Chill: 'Chill',
  Cool: 'Cool',
  Punch: 'Punch',
  Ninja: 'Ninja',
  King: 'King',
  Busy: 'Busy',
} as const;

export type PhotoPose = (typeof PHOTO_POSES)[keyof typeof PHOTO_POSES];

export const UI_MODES = {
  PHOTO: 'photo',
  CUSTOMIZE: 'customize',
} as const;

export type UIMode = (typeof UI_MODES)[keyof typeof UI_MODES];

export const pb = new PocketBase(pocketBaseUrl);

// Types
export type ColorPalette = {
  id: string;
  colors: string[];
};

export type CameraPlacement = {
  id: string;
  position: [number, number, number];
  target: [number, number, number];
};

export type Asset = {
  id: string;
  name: string;
  file: string;
  thumbnail?: string;
  group: string;
  lockedGroups?: string[];
};

export type Category = {
  id: string;
  name: string;
  position: number;
  removable: boolean;
  startingAsset?: string;
  assets: Asset[];
  expand?: {
    colorPalette?: ColorPalette;
    cameraPlacement?: CameraPlacement;
  };
};

export type Customization = {
  [categoryName: string]: {
    asset?: Asset | null;
    color?: string;
  };
};

export type LockedGroups = {
  [categoryName: string]: Array<{
    name: string;
    categoryName: string;
  }>;
};

type ConfiguratorState = {
  loading: boolean;
  saving: boolean;
  mode: UIMode;
  setMode: (mode: UIMode) => void;
  pose: PhotoPose;
  setPose: (pose: PhotoPose) => void;
  categories: Category[];
  currentCategory: Category | null;
  assets: Asset[];
  lockedGroups: LockedGroups;
  skin: MeshStandardMaterial;
  customization: Customization;
  avatarName: string;
  setAvatarName: (name: string) => void;
  avatarSelfie: string | null;
  setAvatarSelfie: (selfie: string | null) => void;
  download: () => void;
  setDownload: (download: () => void) => void;
  screenshot: () => void;
  setScreenshot: (screenshot: () => void) => void;
  takeSelfie: () => void;
  setTakeSelfie: (takeSelfie: () => void) => void;
  updateColor: (color: string) => void;
  updateSkin: (color: string) => void;
  fetchCategories: () => Promise<void>;
  setCurrentCategory: (category: Category) => void;
  changeAsset: (category: string, asset: Asset | null) => void;
  randomize: () => void;
  applyLockedAssets: () => void;
  saveAvatar: () => Promise<{ success: boolean; error?: string }>;
  loadSavedAvatar: () => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: () => boolean;
};

/**
 * Get URL for asset file - works in both demo mode and with PocketBase
 */
export function getAssetFileURL(asset: Asset): string {
  if (!isPocketBaseConfigured) {
    return `/avatar/models/${asset.file}`;
  }
  return pb.files.getUrl(asset, asset.file);
}

/**
 * Get URL for asset thumbnail - works in both demo mode and with PocketBase
 */
export function getAssetThumbnailURL(asset: Asset): string {
  if (!asset.thumbnail) {
    return '';
  }

  if (!isPocketBaseConfigured) {
    return `/avatar/thumbnails/${asset.thumbnail}`;
  }
  return pb.files.getUrl(asset, asset.thumbnail);
}

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  loading: true,
  saving: false,
  mode: UI_MODES.CUSTOMIZE,
  setMode: (mode) => {
    set({ mode });
    if (mode === UI_MODES.CUSTOMIZE) {
      set({ pose: PHOTO_POSES.Idle });
    }
  },
  pose: PHOTO_POSES.Idle,
  setPose: (pose) => set({ pose }),
  categories: [],
  currentCategory: null,
  assets: [],
  lockedGroups: {},
  skin: new MeshStandardMaterial({ color: 0xf5c6a5, roughness: 1 }),
  customization: {},
  avatarName: '',
  setAvatarName: (name) => set({ avatarName: name }),
  avatarSelfie: null,
  setAvatarSelfie: (selfie) => set({ avatarSelfie: selfie }),
  download: () => {},
  setDownload: (download) => set({ download }),
  screenshot: () => {},
  setScreenshot: (screenshot) => set({ screenshot }),
  takeSelfie: () => {},
  setTakeSelfie: (takeSelfie) => set({ takeSelfie }),
  updateColor: (color) => {
    set((state) => ({
      customization: {
        ...state.customization,
        [state.currentCategory?.name || '']: {
          ...state.customization[state.currentCategory?.name || ''],
          color,
        },
      },
    }));
    if (get().currentCategory?.name === 'Head') {
      get().updateSkin(color);
    }
  },
  updateSkin: (color) => {
    get().skin.color.set(color);
  },
  fetchCategories: async () => {
    // Demo mode when PocketBase is not configured - use local assets
    if (!isPocketBaseConfigured) {
      const customization = getDemoCustomization();
      set({
        categories: DEMO_CATEGORIES,
        currentCategory: DEMO_CATEGORIES[0],
        assets: getDemoAssets(),
        customization,
        loading: false,
      });
      get().applyLockedAssets();
      return;
    }

    try {
      const categories = await pb.collection('CustomizationGroups').getFullList({
        sort: '+position',
        expand: 'colorPalette,cameraPlacement',
      });
      const assets = await pb.collection('CustomizationAssets').getFullList({
        sort: 'name',
      });
      const customization: Customization = {};
      categories.forEach((category) => {
        const categoryWithAssets = category as unknown as Category;
        categoryWithAssets.assets = assets.filter((asset) => asset.group === category.id) as unknown as Asset[];
        customization[category.name] = {
          color: (category.expand as Category['expand'])?.colorPalette?.colors?.[0] || '',
        };
        if (category.startingAsset) {
          customization[category.name].asset = categoryWithAssets.assets.find(
            (asset) => asset.id === category.startingAsset
          );
        }
      });

      set({
        categories: categories as unknown as Category[],
        currentCategory: categories[0] as unknown as Category,
        assets: assets as unknown as Asset[],
        customization,
        loading: false,
      });
      get().applyLockedAssets();
    } catch (error) {
      console.error('[MyEasyAvatar] Error fetching categories:', error);
      set({ loading: false });
    }
  },
  setCurrentCategory: (category) => set({ currentCategory: category }),
  changeAsset: (category, asset) => {
    set((state) => ({
      customization: {
        ...state.customization,
        [category]: {
          ...state.customization[category],
          asset,
        },
      },
    }));
    get().applyLockedAssets();
  },
  randomize: () => {
    const customization: Customization = {};
    get().categories.forEach((category) => {
      let randomAsset: Asset | null = category.assets[randInt(0, category.assets.length - 1)];
      if (category.removable) {
        if (randInt(0, category.assets.length - 1) === 0) {
          randomAsset = null;
        }
      }
      const randomColor =
        category.expand?.colorPalette?.colors?.[
          randInt(0, (category.expand.colorPalette?.colors?.length || 1) - 1)
        ];
      customization[category.name] = {
        asset: randomAsset,
        color: randomColor,
      };
      if (category.name === 'Head') {
        get().updateSkin(randomColor || '');
      }
    });
    set({ customization });
    get().applyLockedAssets();
  },

  applyLockedAssets: () => {
    const customization = get().customization;
    const categories = get().categories;
    const lockedGroups: LockedGroups = {};

    Object.values(customization).forEach((category) => {
      if (category.asset?.lockedGroups) {
        category.asset.lockedGroups.forEach((group) => {
          const foundCategory = categories.find((cat) => cat.id === group);
          if (!foundCategory) return;
          const categoryName = foundCategory.name;
          if (!lockedGroups[categoryName]) {
            lockedGroups[categoryName] = [];
          }
          const lockingAssetCategory = categories.find((cat) => cat.id === category.asset?.group);
          if (!lockingAssetCategory) return;
          lockedGroups[categoryName].push({
            name: category.asset?.name || '',
            categoryName: lockingAssetCategory.name,
          });
        });
      }
    });

    set({ lockedGroups });
  },

  saveAvatar: async () => {
    if (!avatarService.isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }

    set({ saving: true });
    const customization = get().customization;
    const avatarName = get().avatarName;
    const avatarSelfie = get().avatarSelfie;
    const pose = get().pose;
    const result = await avatarService.saveCustomization(customization, avatarName, avatarSelfie, pose);
    set({ saving: false });

    return result;
  },

  loadSavedAvatar: async () => {
    if (!avatarService.isAuthenticated()) {
      return { success: false, error: 'User not authenticated' };
    }

    const assets = get().assets;
    if (assets.length === 0) {
      return { success: false, error: 'Assets not loaded yet' };
    }

    const result = await avatarService.loadCustomization(assets);

    if (result.success && result.customization) {
      // Apply the loaded customization
      set({ customization: result.customization });

      // Apply avatar name and selfie if available
      if (result.avatarName !== undefined) {
        set({ avatarName: result.avatarName });
      }
      if (result.avatarSelfie !== undefined) {
        set({ avatarSelfie: result.avatarSelfie });
      }

      // Apply saved pose if available
      if (result.pose) {
        set({ pose: result.pose });
      }

      // Apply skin color if Head category has a color
      const headColor = result.customization.Head?.color;
      if (headColor) {
        get().updateSkin(headColor);
      }

      // Apply locked assets
      get().applyLockedAssets();
    }

    return { success: result.success, error: result.error };
  },

  isAuthenticated: () => {
    return avatarService.isAuthenticated();
  },
}));

// Auto-fetch categories on import
useConfiguratorStore.getState().fetchCategories();
