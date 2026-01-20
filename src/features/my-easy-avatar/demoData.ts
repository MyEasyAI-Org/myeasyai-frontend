/**
 * Demo data for MyEasyAvatar when PocketBase is not configured
 * This provides all the categories and assets needed for the avatar configurator
 * Complete list based on all available GLB models in public/avatar/models/
 */

import type { Asset, Category, ColorPalette, CameraPlacement } from './store';

// Extended color palettes with more options
const SKIN_COLORS: ColorPalette = {
  id: 'skin-palette',
  colors: [
    '#ffdbac', '#f5c6a5', '#e8b094', '#d4956d', '#c68642', '#8d5524', '#6b3e26', '#3c241a',
    '#ffe0bd', '#ffd1aa', '#eac086', '#d4a574', '#b8860b', '#a0522d', '#8b4513', '#5d3a1a',
  ],
};

const HAIR_COLORS: ColorPalette = {
  id: 'hair-palette',
  colors: [
    // Natural colors
    '#000000', '#1c1c1c', '#2c1810', '#4a3728', '#6b4423', '#8b4513', '#a0522d', '#cd853f',
    '#daa520', '#f4a460', '#d2b48c', '#ffdab9', '#ffffff', '#c0c0c0', '#808080',
    // Fashion colors
    '#ff0000', '#ff4500', '#ff6b6b', '#ff69b4', '#ff1493', '#c71585', '#9b59b6', '#8b008b',
    '#4b0082', '#0000ff', '#3498db', '#00ced1', '#00ff00', '#32cd32', '#006400',
  ],
};

const OUTFIT_COLORS: ColorPalette = {
  id: 'outfit-palette',
  colors: [
    // Basics
    '#000000', '#1a1a2e', '#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#bdc3c7', '#ecf0f1', '#ffffff',
    // Blues
    '#0f3460', '#16213e', '#1a237e', '#283593', '#3498db', '#2196f3', '#03a9f4', '#00bcd4',
    // Purples
    '#4a148c', '#6a1b9a', '#7b1fa2', '#8e24aa', '#9b59b6', '#ab47bc', '#ba68c8', '#ce93d8',
    // Reds/Pinks
    '#b71c1c', '#c62828', '#e74c3c', '#f44336', '#e91e63', '#f06292', '#f8bbd9',
    // Greens
    '#1b5e20', '#2e7d32', '#27ae60', '#4caf50', '#66bb6a', '#81c784', '#a5d6a7',
    // Yellows/Oranges
    '#ff6f00', '#ff8f00', '#f39c12', '#ffc107', '#ffeb3b', '#fff176',
  ],
};

const EYE_COLORS: ColorPalette = {
  id: 'eye-palette',
  colors: [
    '#2c1810', '#4a3728', '#6b4423', '#8b4513',
    '#000080', '#0000cd', '#1e90ff', '#4169e1', '#6495ed', '#87ceeb',
    '#006400', '#228b22', '#32cd32', '#90ee90',
    '#4b0082', '#8b008b', '#9932cc', '#ba55d3',
    '#808080', '#a9a9a9', '#c0c0c0',
    '#ff0000', '#dc143c',
  ],
};

const ACCESSORY_COLORS: ColorPalette = {
  id: 'accessory-palette',
  colors: [
    // Metals
    '#ffd700', '#daa520', '#b8860b', '#c0c0c0', '#a9a9a9', '#cd7f32', '#b87333',
    // Colors
    '#000000', '#1a1a2e', '#ffffff', '#e74c3c', '#3498db', '#27ae60', '#9b59b6', '#f39c12',
    '#2c3e50', '#8e44ad', '#16a085', '#d35400', '#c0392b', '#2980b9',
  ],
};

// Camera placements for different categories
const CAMERA_PLACEMENTS: Record<string, CameraPlacement> = {
  head: {
    id: 'head-camera',
    position: [0, 0.5, 2.5],
    target: [0, 0.5, 0],
  },
  body: {
    id: 'body-camera',
    position: [-1.5, 0, 4],
    target: [0, 0.3, 0],
  },
  feet: {
    id: 'feet-camera',
    position: [0, -0.5, 3],
    target: [0, -0.5, 0],
  },
};

// Helper function to create asset from filename
function createAsset(filename: string, group: string, lockedGroups?: string[], hasThumbnail = true): Asset {
  const name = filename.replace('.glb', '').replace(/\./g, ' ');
  // Generate thumbnail name: Head.001.glb -> Head_001.png
  const baseName = filename.replace('.glb', '').replace(/\./g, '_');
  return {
    id: `${group}-${filename}`,
    name,
    file: filename,
    thumbnail: hasThumbnail ? `${baseName}.png` : undefined,
    group,
    lockedGroups,
  };
}

// Demo categories with ALL available assets from public/avatar/models/
export const DEMO_CATEGORIES: Category[] = [
  {
    id: 'head',
    name: 'Head',
    position: 0,
    removable: false,
    startingAsset: 'head-Head.001.glb',
    expand: {
      colorPalette: SKIN_COLORS,
      cameraPlacement: CAMERA_PLACEMENTS.head,
    },
    assets: [
      createAsset('Head.001.glb', 'head'),
      createAsset('Head.002.glb', 'head'),
      createAsset('Head.003.glb', 'head'),
      createAsset('Head.004.glb', 'head'),
      createAsset('PumpkinHead.glb', 'head'),
    ],
  },
  {
    id: 'hair',
    name: 'Hair',
    position: 1,
    removable: true,
    startingAsset: 'hair-Hair.001.glb',
    expand: {
      colorPalette: HAIR_COLORS,
      cameraPlacement: CAMERA_PLACEMENTS.head,
    },
    assets: [
      createAsset('Hair.001.glb', 'hair'),
      createAsset('Hair.002.glb', 'hair'),
      createAsset('Hair.003.glb', 'hair'),
      createAsset('Hair.004.glb', 'hair'),
      createAsset('Hair.005.glb', 'hair'),
      createAsset('Hair.006.glb', 'hair'),
      createAsset('Hair.007.glb', 'hair'),
      createAsset('Hair.008.glb', 'hair'),
      createAsset('Hair.009.glb', 'hair'),
      createAsset('Hair.010.glb', 'hair'),
      createAsset('Hair.011.glb', 'hair'),
    ],
  },
  {
    id: 'eyebrow',
    name: 'EyeBrow',
    position: 2,
    removable: false,
    startingAsset: 'eyebrow-EyeBrow.001.glb',
    expand: {
      colorPalette: HAIR_COLORS,
      cameraPlacement: CAMERA_PLACEMENTS.head,
    },
    assets: [
      createAsset('EyeBrow.001.glb', 'eyebrow'),
      createAsset('EyeBrow.002.glb', 'eyebrow'),
      createAsset('EyeBrow.003.glb', 'eyebrow'),
      createAsset('EyeBrow.004.glb', 'eyebrow'),
      createAsset('EyeBrow.005.glb', 'eyebrow'),
      createAsset('EyeBrow.006.glb', 'eyebrow'),
      createAsset('EyeBrow.007.glb', 'eyebrow'),
      createAsset('EyeBrow.008.glb', 'eyebrow'),
      createAsset('EyeBrow.009.glb', 'eyebrow'),
      createAsset('EyeBrow.010.glb', 'eyebrow'),
    ],
  },
  {
    id: 'eyes',
    name: 'Eyes',
    position: 3,
    removable: false,
    startingAsset: 'eyes-Eyes.001.glb',
    expand: {
      colorPalette: EYE_COLORS,
      cameraPlacement: CAMERA_PLACEMENTS.head,
    },
    assets: [
      createAsset('Eyes.001.glb', 'eyes'),
      createAsset('Eyes.002.glb', 'eyes'),
      createAsset('Eyes.003.glb', 'eyes'),
      createAsset('Eyes.004.glb', 'eyes'),
      createAsset('Eyes.005.glb', 'eyes'),
      createAsset('Eyes.006.glb', 'eyes'),
      createAsset('Eyes.007.glb', 'eyes'),
      createAsset('Eyes.008.glb', 'eyes'),
      createAsset('Eyes.009.glb', 'eyes'),
      createAsset('Eyes.010.glb', 'eyes'),
      createAsset('Eyes.011.glb', 'eyes'),
      createAsset('Eyes.012.glb', 'eyes'),
    ],
  },
  {
    id: 'nose',
    name: 'Nose',
    position: 4,
    removable: false,
    startingAsset: 'nose-Nose.001.glb',
    expand: {
      colorPalette: SKIN_COLORS,
      cameraPlacement: CAMERA_PLACEMENTS.head,
    },
    assets: [
      createAsset('Nose.001.glb', 'nose'),
      createAsset('Nose.002.glb', 'nose'),
      createAsset('Nose.003.glb', 'nose'),
      createAsset('Nose.004.glb', 'nose'),
    ],
  },
  {
    id: 'face',
    name: 'Face',
    position: 5,
    removable: true,
    expand: {
      colorPalette: SKIN_COLORS,
      cameraPlacement: CAMERA_PLACEMENTS.head,
    },
    assets: [
      createAsset('Face.001.glb', 'face'),
      createAsset('Face.002.glb', 'face'),
      createAsset('Face.003.glb', 'face'),
      createAsset('Face.004.glb', 'face'),
      createAsset('Face.005.glb', 'face'),
      createAsset('Face.006.glb', 'face'),
      createAsset('Face.007.glb', 'face'),
    ],
  },
  {
    id: 'facialhair',
    name: 'FacialHair',
    position: 6,
    removable: true,
    expand: {
      colorPalette: HAIR_COLORS,
      cameraPlacement: CAMERA_PLACEMENTS.head,
    },
    assets: [
      createAsset('FacialHair.001.glb', 'facialhair'),
      createAsset('FacialHair.002.glb', 'facialhair'),
      createAsset('FacialHair.003.glb', 'facialhair'),
      createAsset('FacialHair.004.glb', 'facialhair'),
      createAsset('FacialHair.005.glb', 'facialhair'),
      createAsset('FacialHair.006.glb', 'facialhair'),
      createAsset('FacialHair.007.glb', 'facialhair'),
    ],
  },
  {
    id: 'glasses',
    name: 'Glasses',
    position: 7,
    removable: true,
    expand: {
      colorPalette: ACCESSORY_COLORS,
      cameraPlacement: CAMERA_PLACEMENTS.head,
    },
    assets: [
      createAsset('Glasses.001.glb', 'glasses'),
      createAsset('Glasses.002.glb', 'glasses'),
      createAsset('Glasses.003.glb', 'glasses'),
      createAsset('Glasses.004.glb', 'glasses'),
    ],
  },
  {
    id: 'facemask',
    name: 'FaceMask',
    position: 8,
    removable: true,
    expand: {
      colorPalette: ACCESSORY_COLORS,
      cameraPlacement: CAMERA_PLACEMENTS.head,
    },
    assets: [
      createAsset('FaceMask.glb', 'facemask'),
    ],
  },
  {
    id: 'hat',
    name: 'Hat',
    position: 9,
    removable: true,
    expand: {
      colorPalette: ACCESSORY_COLORS,
      cameraPlacement: CAMERA_PLACEMENTS.head,
    },
    assets: [
      createAsset('Hat.001.glb', 'hat'),
      createAsset('Hat.002.glb', 'hat'),
      createAsset('Hat.003.glb', 'hat'),
      createAsset('Hat.004.glb', 'hat'),
      createAsset('Hat.005.glb', 'hat'),
      createAsset('Hat.006.glb', 'hat'),
      createAsset('Hat.007.glb', 'hat'),
    ],
  },
  {
    id: 'earring',
    name: 'Earring',
    position: 10,
    removable: true,
    expand: {
      colorPalette: ACCESSORY_COLORS,
      cameraPlacement: CAMERA_PLACEMENTS.head,
    },
    assets: [
      createAsset('Earring.001.glb', 'earring'),
      createAsset('Earring.002.glb', 'earring'),
      createAsset('Earring.003.glb', 'earring'),
      createAsset('Earring.004.glb', 'earring'),
      createAsset('Earring.005.glb', 'earring'),
      createAsset('Earring.006.glb', 'earring'),
    ],
  },
  {
    id: 'bow',
    name: 'Bow',
    position: 11,
    removable: true,
    expand: {
      colorPalette: ACCESSORY_COLORS,
      cameraPlacement: CAMERA_PLACEMENTS.head,
    },
    assets: [
      createAsset('Bow.001.glb', 'bow'),
      createAsset('Bow.002.glb', 'bow'),
    ],
  },
  {
    id: 'top',
    name: 'Top',
    position: 12,
    removable: false,
    startingAsset: 'top-Top.001.glb',
    expand: {
      colorPalette: OUTFIT_COLORS,
      cameraPlacement: CAMERA_PLACEMENTS.body,
    },
    assets: [
      createAsset('Top.001.glb', 'top'),
      createAsset('Top.002.glb', 'top'),
      createAsset('Top.003.glb', 'top'),
    ],
  },
  {
    id: 'bottom',
    name: 'Bottom',
    position: 13,
    removable: false,
    startingAsset: 'bottom-Bottom.001.glb',
    expand: {
      colorPalette: OUTFIT_COLORS,
      cameraPlacement: CAMERA_PLACEMENTS.body,
    },
    assets: [
      createAsset('Bottom.001.glb', 'bottom'),
      createAsset('Bottom.002.glb', 'bottom'),
      createAsset('Bottom.003.glb', 'bottom'),
    ],
  },
  {
    id: 'outfit',
    name: 'Outfit',
    position: 14,
    removable: true,
    expand: {
      colorPalette: OUTFIT_COLORS,
      cameraPlacement: CAMERA_PLACEMENTS.body,
    },
    assets: [
      createAsset('Outfit.001.glb', 'outfit'),
      createAsset('Outfit.002.glb', 'outfit'),
      createAsset('Outfit.003.glb', 'outfit'),
      createAsset('Outfit.004.glb', 'outfit'),
      createAsset('WawaDress.glb', 'outfit', ['top', 'bottom']),
    ],
  },
  {
    id: 'shoes',
    name: 'Shoes',
    position: 15,
    removable: false,
    startingAsset: 'shoes-Shoes.001.glb',
    expand: {
      colorPalette: OUTFIT_COLORS,
      cameraPlacement: CAMERA_PLACEMENTS.feet,
    },
    assets: [
      createAsset('Shoes.001.glb', 'shoes'),
      createAsset('Shoes.002.glb', 'shoes'),
      createAsset('Shoes.003.glb', 'shoes'),
    ],
  },
];

// Helper to get all assets from categories
export function getDemoAssets(): Asset[] {
  return DEMO_CATEGORIES.flatMap((cat) => cat.assets);
}

// Helper to get initial customization
export function getDemoCustomization(): Record<string, { asset?: Asset | null; color?: string }> {
  const customization: Record<string, { asset?: Asset | null; color?: string }> = {};

  for (const category of DEMO_CATEGORIES) {
    customization[category.name] = {
      color: category.expand?.colorPalette?.colors?.[0] || '',
    };

    if (category.startingAsset) {
      const startingAsset = category.assets.find((asset) => asset.id === category.startingAsset);
      if (startingAsset) {
        customization[category.name].asset = startingAsset;
      }
    }
  }

  return customization;
}
