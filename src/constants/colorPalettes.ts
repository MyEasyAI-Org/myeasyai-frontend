// 60 Paletas de Cores Profissionais
export interface ColorPalette {
  id: string;
  name: string;
  category: 'blue' | 'green' | 'purple' | 'pink' | 'red' | 'orange' | 'yellow' | 'neutral';
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  light: string;
}

export const colorPalettes: ColorPalette[] = [
  // AZUIS (10 paletas)
  { id: 'azure-sky', name: 'Azure Sky', category: 'blue', primary: '#0EA5E9', secondary: '#38BDF8', accent: '#7DD3FC', dark: '#0C4A6E', light: '#E0F2FE' },
  { id: 'ocean-blue', name: 'Ocean Blue', category: 'blue', primary: '#1E40AF', secondary: '#3B82F6', accent: '#60A5FA', dark: '#1E3A8A', light: '#DBEAFE' },
  { id: 'royal-blue', name: 'Royal Blue', category: 'blue', primary: '#1D4ED8', secondary: '#2563EB', accent: '#3B82F6', dark: '#1E3A8A', light: '#DBEAFE' },
  { id: 'navy-blue', name: 'Navy Blue', category: 'blue', primary: '#1E3A8A', secondary: '#1E40AF', accent: '#3B82F6', dark: '#172554', light: '#EFF6FF' },
  { id: 'sky-fresh', name: 'Sky Fresh', category: 'blue', primary: '#0284C7', secondary: '#0EA5E9', accent: '#38BDF8', dark: '#075985', light: '#F0F9FF' },
  { id: 'electric-blue', name: 'Electric Blue', category: 'blue', primary: '#2563EB', secondary: '#3B82F6', accent: '#60A5FA', dark: '#1E40AF', light: '#EFF6FF' },
  { id: 'deep-ocean', name: 'Deep Ocean', category: 'blue', primary: '#075985', secondary: '#0369A1', accent: '#0EA5E9', dark: '#0C4A6E', light: '#F0F9FF' },
  { id: 'sapphire', name: 'Sapphire', category: 'blue', primary: '#1E40AF', secondary: '#2563EB', accent: '#60A5FA', dark: '#1E3A8A', light: '#EFF6FF' },
  { id: 'cyan-wave', name: 'Cyan Wave', category: 'blue', primary: '#0891B2', secondary: '#06B6D4', accent: '#22D3EE', dark: '#164E63', light: '#ECFEFF' },
  { id: 'arctic-blue', name: 'Arctic Blue', category: 'blue', primary: '#0369A1', secondary: '#0284C7', accent: '#38BDF8', dark: '#0C4A6E', light: '#F0F9FF' },
  
  // VERDES (10 paletas)
  { id: 'emerald-forest', name: 'Emerald Forest', category: 'green', primary: '#059669', secondary: '#10B981', accent: '#34D399', dark: '#065F46', light: '#D1FAE5' },
  { id: 'mint-fresh', name: 'Mint Fresh', category: 'green', primary: '#10B981', secondary: '#34D399', accent: '#6EE7B7', dark: '#047857', light: '#ECFDF5' },
  { id: 'tropical-green', name: 'Tropical Green', category: 'green', primary: '#14B8A6', secondary: '#2DD4BF', accent: '#5EEAD4', dark: '#115E59', light: '#F0FDFA' },
  { id: 'forest-deep', name: 'Forest Deep', category: 'green', primary: '#047857', secondary: '#059669', accent: '#10B981', dark: '#064E3B', light: '#D1FAE5' },
  { id: 'lime-energy', name: 'Lime Energy', category: 'green', primary: '#65A30D', secondary: '#84CC16', accent: '#A3E635', dark: '#3F6212', light: '#F7FEE7' },
  { id: 'jade-imperial', name: 'Jade Imperial', category: 'green', primary: '#0D9488', secondary: '#14B8A6', accent: '#2DD4BF', dark: '#134E4A', light: '#CCFBF1' },
  { id: 'sage-calm', name: 'Sage Calm', category: 'green', primary: '#16A34A', secondary: '#22C55E', accent: '#4ADE80', dark: '#15803D', light: '#DCFCE7' },
  { id: 'aqua-teal', name: 'Aqua Teal', category: 'green', primary: '#0F766E', secondary: '#14B8A6', accent: '#5EEAD4', dark: '#134E4A', light: '#F0FDFA' },
  { id: 'green-meadow', name: 'Green Meadow', category: 'green', primary: '#15803D', secondary: '#16A34A', accent: '#22C55E', dark: '#14532D', light: '#F0FDF4' },
  { id: 'sea-green', name: 'Sea Green', category: 'green', primary: '#0D9488', secondary: '#14B8A6', accent: '#2DD4BF', dark: '#115E59', light: '#CCFBF1' },
  
  // ROXOS/VIOLETAS (8 paletas)
  { id: 'purple-magic', name: 'Purple Magic', category: 'purple', primary: '#7C3AED', secondary: '#8B5CF6', accent: '#A78BFA', dark: '#5B21B6', light: '#F5F3FF' },
  { id: 'lavender-dream', name: 'Lavender Dream', category: 'purple', primary: '#8B5CF6', secondary: '#A78BFA', accent: '#C4B5FD', dark: '#6B21A8', light: '#FAF5FF' },
  { id: 'violet-royal', name: 'Violet Royal', category: 'purple', primary: '#6B21A8', secondary: '#7C3AED', accent: '#8B5CF6', dark: '#581C87', light: '#F3E8FF' },
  { id: 'indigo-night', name: 'Indigo Night', category: 'purple', primary: '#4F46E5', secondary: '#6366F1', accent: '#818CF8', dark: '#3730A3', light: '#EEF2FF' },
  { id: 'plum-rich', name: 'Plum Rich', category: 'purple', primary: '#9333EA', secondary: '#A855F7', accent: '#C084FC', dark: '#7E22CE', light: '#FAE8FF' },
  { id: 'amethyst', name: 'Amethyst', category: 'purple', primary: '#7E22CE', secondary: '#9333EA', accent: '#A855F7', dark: '#6B21A8', light: '#F3E8FF' },
  { id: 'purple-haze', name: 'Purple Haze', category: 'purple', primary: '#6D28D9', secondary: '#7C3AED', accent: '#8B5CF6', dark: '#5B21B6', light: '#EDE9FE' },
  { id: 'violet-storm', name: 'Violet Storm', category: 'purple', primary: '#5B21B6', secondary: '#6D28D9', accent: '#7C3AED', dark: '#4C1D95', light: '#EDE9FE' },
  
  // ROSAS (10 paletas)
  { id: 'rose-passion', name: 'Rose Passion', category: 'pink', primary: '#E11D48', secondary: '#F43F5E', accent: '#FB7185', dark: '#9F1239', light: '#FFE4E6' },
  { id: 'cherry-blossom', name: 'Cherry Blossom', category: 'pink', primary: '#DB2777', secondary: '#EC4899', accent: '#F472B6', dark: '#9D174D', light: '#FCE7F3' },
  { id: 'hot-pink', name: 'Hot Pink', category: 'pink', primary: '#BE185D', secondary: '#DB2777', accent: '#EC4899', dark: '#9F1239', light: '#FDF2F8' },
  { id: 'fuchsia-vibrant', name: 'Fuchsia Vibrant', category: 'pink', primary: '#A21CAF', secondary: '#C026D3', accent: '#D946EF', dark: '#86198F', light: '#FAE8FF' },
  { id: 'cotton-candy', name: 'Cotton Candy', category: 'pink', primary: '#F472B6', secondary: '#F9A8D4', accent: '#FBCFE8', dark: '#DB2777', light: '#FDF2F8' },
  { id: 'bubblegum', name: 'Bubblegum', category: 'pink', primary: '#EC4899', secondary: '#F472B6', accent: '#F9A8D4', dark: '#BE185D', light: '#FCE7F3' },
  { id: 'magenta-power', name: 'Magenta Power', category: 'pink', primary: '#C026D3', secondary: '#D946EF', accent: '#E879F9', dark: '#A21CAF', light: '#FAE8FF' },
  { id: 'pink-sunrise', name: 'Pink Sunrise', category: 'pink', primary: '#F43F5E', secondary: '#FB7185', accent: '#FDA4AF', dark: '#E11D48', light: '#FFF1F2' },
  { id: 'rose-gold', name: 'Rose Gold', category: 'pink', primary: '#BE7C4D', secondary: '#D4A574', accent: '#E8C5A0', dark: '#8B4513', light: '#FFF8F0' },
  { id: 'dusty-rose', name: 'Dusty Rose', category: 'pink', primary: '#C2717A', secondary: '#D89CA6', accent: '#E8BCC8', dark: '#8B4A52', light: '#FAF0F1' },
  
  // VERMELHOS (10 paletas)
  { id: 'ruby-red', name: 'Ruby Red', category: 'red', primary: '#DC2626', secondary: '#EF4444', accent: '#F87171', dark: '#991B1B', light: '#FEE2E2' },
  { id: 'crimson-power', name: 'Crimson Power', category: 'red', primary: '#B91C1C', secondary: '#DC2626', accent: '#EF4444', dark: '#7F1D1D', light: '#FEF2F2' },
  { id: 'wine-burgundy', name: 'Wine Burgundy', category: 'red', primary: '#991B1B', secondary: '#B91C1C', accent: '#DC2626', dark: '#7F1D1D', light: '#FEF2F2' },
  { id: 'scarlet-flame', name: 'Scarlet Flame', category: 'red', primary: '#EF4444', secondary: '#F87171', accent: '#FCA5A5', dark: '#DC2626', light: '#FEE2E2' },
  { id: 'cherry-red', name: 'Cherry Red', category: 'red', primary: '#DC143C', secondary: '#E53E3E', accent: '#FC8181', dark: '#9B1C1C', light: '#FED7D7' },
  { id: 'blood-orange', name: 'Blood Orange', category: 'red', primary: '#CD5C5C', secondary: '#E53E3E', accent: '#F56565', dark: '#822727', light: '#FED7D7' },
  { id: 'fire-engine', name: 'Fire Engine', category: 'red', primary: '#FF0000', secondary: '#FF4500', accent: '#FF6347', dark: '#8B0000', light: '#FFE4E1' },
  { id: 'brick-red', name: 'Brick Red', category: 'red', primary: '#B22222', secondary: '#CD5C5C', accent: '#F08080', dark: '#800000', light: '#FFE4E1' },
  { id: 'cardinal-red', name: 'Cardinal Red', category: 'red', primary: '#C41E3A', secondary: '#DC143C', accent: '#F08080', dark: '#8B0000', light: '#FFE4E1' },
  { id: 'strawberry', name: 'Strawberry', category: 'red', primary: '#FF1493', secondary: '#FF69B4', accent: '#FFB6C1', dark: '#C71585', light: '#FFE4E6' },
  
  // LARANJAS (10 paletas)
  { id: 'sunset-orange', name: 'Sunset Orange', category: 'orange', primary: '#EA580C', secondary: '#F97316', accent: '#FB923C', dark: '#C2410C', light: '#FFEDD5' },
  { id: 'tangerine', name: 'Tangerine', category: 'orange', primary: '#F97316', secondary: '#FB923C', accent: '#FDBA74', dark: '#EA580C', light: '#FFF7ED' },
  { id: 'peach-soft', name: 'Peach Soft', category: 'orange', primary: '#FB923C', secondary: '#FDBA74', accent: '#FED7AA', dark: '#F97316', light: '#FFF7ED' },
  { id: 'amber-warm', name: 'Amber Warm', category: 'orange', primary: '#D97706', secondary: '#F59E0B', accent: '#FBBF24', dark: '#B45309', light: '#FEF3C7' },
  { id: 'coral-reef', name: 'Coral Reef', category: 'orange', primary: '#FF6347', secondary: '#FF7F50', accent: '#FFA07A', dark: '#CD5C5C', light: '#FFE4E1' },
  { id: 'pumpkin-spice', name: 'Pumpkin Spice', category: 'orange', primary: '#FF8C00', secondary: '#FFA500', accent: '#FFD700', dark: '#B8860B', light: '#FFF8DC' },
  { id: 'burnt-orange', name: 'Burnt Orange', category: 'orange', primary: '#CC5500', secondary: '#FF6600', accent: '#FF8C00', dark: '#8B4513', light: '#FFEEE6' },
  { id: 'apricot-dream', name: 'Apricot Dream', category: 'orange', primary: '#FFAB91', secondary: '#FFCC80', accent: '#FFE0B2', dark: '#E65100', light: '#FFF3E0' },
  { id: 'copper-glow', name: 'Copper Glow', category: 'orange', primary: '#B87333', secondary: '#CD853F', accent: '#DEB887', dark: '#8B4513', light: '#FDF5E6' },
  { id: 'mango-tango', name: 'Mango Tango', category: 'orange', primary: '#FF8243', secondary: '#FFA366', accent: '#FFC489', dark: '#E65100', light: '#FFF3E0' },
  
  // AMARELOS (10 paletas)
  { id: 'sunshine-yellow', name: 'Sunshine Yellow', category: 'yellow', primary: '#EAB308', secondary: '#FACC15', accent: '#FDE047', dark: '#A16207', light: '#FEF9C3' },
  { id: 'honey-warm', name: 'Honey Warm', category: 'yellow', primary: '#CA8A04', secondary: '#EAB308', accent: '#FACC15', dark: '#A16207', light: '#FEF3C7' },
  { id: 'golden-hour', name: 'Golden Hour', category: 'yellow', primary: '#F59E0B', secondary: '#FBBF24', accent: '#FCD34D', dark: '#D97706', light: '#FEF3C7' },
  { id: 'lemon-fresh', name: 'Lemon Fresh', category: 'yellow', primary: '#FACC15', secondary: '#FDE047', accent: '#FEF08A', dark: '#EAB308', light: '#FEFCE8' },
  { id: 'canary-bright', name: 'Canary Bright', category: 'yellow', primary: '#FFFF00', secondary: '#FFFF33', accent: '#FFFF66', dark: '#CCCC00', light: '#FFFFCC' },
  { id: 'banana-cream', name: 'Banana Cream', category: 'yellow', primary: '#FFE135', secondary: '#FFED4A', accent: '#FFF59D', dark: '#B8860B', light: '#FFFBEB' },
  { id: 'mustard-gold', name: 'Mustard Gold', category: 'yellow', primary: '#DAA520', secondary: '#FFD700', accent: '#FFED4A', dark: '#B8860B', light: '#FFF8DC' },
  { id: 'butter-soft', name: 'Butter Soft', category: 'yellow', primary: '#FFF8DC', secondary: '#FFFACD', accent: '#FFFFE0', dark: '#F0E68C', light: '#FFFFF0' },
  { id: 'marigold', name: 'Marigold', category: 'yellow', primary: '#FFB300', secondary: '#FFCC33', accent: '#FFD966', dark: '#E65100', light: '#FFF8E1' },
  { id: 'electric-yellow', name: 'Electric Yellow', category: 'yellow', primary: '#CCFF00', secondary: '#DDFF33', accent: '#EEFF66', dark: '#99CC00', light: '#F7FFE0' },
  
  // NEUTROS/CINZAS (6 paletas)
  { id: 'slate-modern', name: 'Slate Modern', category: 'neutral', primary: '#475569', secondary: '#64748B', accent: '#94A3B8', dark: '#1E293B', light: '#F1F5F9' },
  { id: 'graphite-pro', name: 'Graphite Pro', category: 'neutral', primary: '#374151', secondary: '#4B5563', accent: '#6B7280', dark: '#111827', light: '#F3F4F6' },
  { id: 'silver-elite', name: 'Silver Elite', category: 'neutral', primary: '#52525B', secondary: '#71717A', accent: '#A1A1AA', dark: '#27272A', light: '#FAFAFA' },
  { id: 'charcoal-deep', name: 'Charcoal Deep', category: 'neutral', primary: '#27272A', secondary: '#3F3F46', accent: '#52525B', dark: '#18181B', light: '#F4F4F5' },
  { id: 'smoke-gray', name: 'Smoke Gray', category: 'neutral', primary: '#6B7280', secondary: '#9CA3AF', accent: '#D1D5DB', dark: '#374151', light: '#F9FAFB' },
  { id: 'stone-elegant', name: 'Stone Elegant', category: 'neutral', primary: '#57534E', secondary: '#78716C', accent: '#A8A29E', dark: '#292524', light: '#FAFAF9' }
];

export const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    blue: '#3B82F6',
    green: '#10B981',
    purple: '#8B5CF6',
    pink: '#EC4899',
    red: '#EF4444',
    orange: '#F97316',
    yellow: '#FACC15',
    neutral: '#6B7280'
  };
  return colors[category] || '#6B7280';
};

export const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    blue: '💙',
    green: '💚',
    purple: '💜',
    pink: '💗',
    red: '❤️',
    orange: '🧡',
    yellow: '💛',
    neutral: '🤍'
  };
  return icons[category] || '🎨';
};
