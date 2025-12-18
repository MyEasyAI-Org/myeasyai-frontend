/**
 * Template Styles - Estilos CSS específicos para cada template
 *
 * Baseado nos 11 templates HTML do projeto MyEasyWebsite
 */

export interface TemplateStyle {
  id: number;
  name: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    dark: string;
    light: string;
  };
  fonts: {
    heading: string;
    body: string;
    googleFontsUrl: string;
  };
  cssVariables: string;
  customStyles: string;
}

/**
 * Estilos de todos os 11 templates
 */
export const TEMPLATE_STYLES: TemplateStyle[] = [
  // Template 1 - Original (Playfair + Poppins)
  {
    id: 1,
    name: 'Original',
    colors: {
      primary: '#ea580c',
      primaryLight: '#fb923c',
      primaryDark: '#c2410c',
      secondary: '#1a1a1a',
      accent: '#fb923c',
      dark: '#1a1a1a',
      light: '#f5f5f5',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Poppins',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Poppins:wght@300;400;500;600;700&display=swap',
    },
    cssVariables: `
      --color-primary: #ea580c;
      --color-primary-light: #fb923c;
      --color-secondary: #1a1a1a;
      --color-accent: #fb923c;
      --font-heading: 'Playfair Display', serif;
      --font-body: 'Poppins', sans-serif;
    `,
    customStyles: '',
  },

  // Template 2 - Minimalista (Space Grotesk + Inter)
  {
    id: 2,
    name: 'Minimalista',
    colors: {
      primary: '#111827',
      primaryLight: '#374151',
      primaryDark: '#030712',
      secondary: '#f9fafb',
      accent: '#6b7280',
      dark: '#111827',
      light: '#ffffff',
    },
    fonts: {
      heading: 'Space Grotesk',
      body: 'Inter',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap',
    },
    cssVariables: `
      --color-primary: #111827;
      --color-primary-light: #374151;
      --color-secondary: #f9fafb;
      --color-accent: #6b7280;
      --font-heading: 'Space Grotesk', sans-serif;
      --font-body: 'Inter', sans-serif;
    `,
    customStyles: `
      .hero { background: linear-gradient(135deg, #111827 0%, #1f2937 100%); }
      .section-badge { background: #f3f4f6; color: #111827; border: 1px solid #e5e7eb; }
      .feature-card { border: 1px solid #e5e7eb; }
      .feature-card:hover { border-color: #111827; }
    `,
  },

  // Template 3 - Natureza (Cormorant Garamond + Nunito)
  {
    id: 3,
    name: 'Natureza',
    colors: {
      primary: '#166534',
      primaryLight: '#22c55e',
      primaryDark: '#14532d',
      secondary: '#f0fdf4',
      accent: '#84cc16',
      dark: '#14532d',
      light: '#f0fdf4',
    },
    fonts: {
      heading: 'Cormorant Garamond',
      body: 'Nunito',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&display=swap',
    },
    cssVariables: `
      --color-primary: #166534;
      --color-primary-light: #22c55e;
      --color-secondary: #f0fdf4;
      --color-accent: #84cc16;
      --font-heading: 'Cormorant Garamond', serif;
      --font-body: 'Nunito', sans-serif;
    `,
    customStyles: `
      .hero { background: linear-gradient(135deg, #166534 0%, #14532d 50%, #052e16 100%); }
      body::before {
        content: ''; position: fixed; inset: 0;
        background: radial-gradient(circle at 80% 20%, rgba(132, 204, 22, 0.05) 0%, transparent 50%);
        pointer-events: none; z-index: -1;
      }
    `,
  },

  // Template 4 - Tech Moderno (JetBrains Mono + Inter)
  {
    id: 4,
    name: 'Tech',
    colors: {
      primary: '#6366f1',
      primaryLight: '#818cf8',
      primaryDark: '#4f46e5',
      secondary: '#0f172a',
      accent: '#22d3ee',
      dark: '#020617',
      light: '#f8fafc',
    },
    fonts: {
      heading: 'JetBrains Mono',
      body: 'Inter',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap',
    },
    cssVariables: `
      --color-primary: #6366f1;
      --color-primary-light: #818cf8;
      --color-secondary: #0f172a;
      --color-accent: #22d3ee;
      --font-heading: 'JetBrains Mono', monospace;
      --font-body: 'Inter', sans-serif;
    `,
    customStyles: `
      .hero { background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #22d3ee 100%); }
      body::before {
        content: ''; position: fixed; inset: 0;
        background-image: linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
        background-size: 60px 60px;
        pointer-events: none; z-index: -1;
      }
      .feature-icon { background: linear-gradient(135deg, #6366f1, #a855f7, #22d3ee); }
    `,
  },

  // Template 5 - Luxo Gold (Cinzel + Montserrat)
  {
    id: 5,
    name: 'Luxo',
    colors: {
      primary: '#d4af37',
      primaryLight: '#e5c76b',
      primaryDark: '#b8941f',
      secondary: '#0d0d0d',
      accent: '#f5d742',
      dark: '#0d0d0d',
      light: '#fefefe',
    },
    fonts: {
      heading: 'Cinzel',
      body: 'Montserrat',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap',
    },
    cssVariables: `
      --color-primary: #d4af37;
      --color-primary-light: #e5c76b;
      --color-secondary: #0d0d0d;
      --color-accent: #f5d742;
      --font-heading: 'Cinzel', serif;
      --font-body: 'Montserrat', sans-serif;
    `,
    customStyles: `
      .hero { background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #d4af37 200%); }
      h1, h2, h3, h4 { text-transform: uppercase; letter-spacing: 0.05em; }
      .hero-badge { border: 2px solid #d4af37; background: rgba(212, 175, 55, 0.15); }
      .section-badge { border: 1px solid #d4af37; background: rgba(212, 175, 55, 0.1); }
    `,
  },

  // Template 6 - Kids Colorido (Fredoka One + Nunito)
  {
    id: 6,
    name: 'Kids',
    colors: {
      primary: '#ff6b6b',
      primaryLight: '#ff8787',
      primaryDark: '#ee5a5a',
      secondary: '#4ecdc4',
      accent: '#ffe66d',
      dark: '#2d3748',
      light: '#fefefe',
    },
    fonts: {
      heading: 'Fredoka One',
      body: 'Nunito',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;500;600;700&display=swap',
    },
    cssVariables: `
      --color-primary: #ff6b6b;
      --color-primary-light: #ff8787;
      --color-secondary: #4ecdc4;
      --color-accent: #ffe66d;
      --font-heading: 'Fredoka One', cursive;
      --font-body: 'Nunito', sans-serif;
    `,
    customStyles: `
      .hero { background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #ffe66d 100%); }
      body::before {
        content: ''; position: fixed; inset: 0;
        background-image: radial-gradient(circle at 20% 80%, rgba(255, 107, 107, 0.05) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(78, 205, 196, 0.05) 0%, transparent 50%),
                          radial-gradient(circle at 40% 40%, rgba(255, 230, 109, 0.05) 0%, transparent 50%);
        pointer-events: none; z-index: -1;
      }
      .feature-card { border-radius: 30px; }
      .hero-cta-primary { border-radius: 30px; }
    `,
  },

  // Template 7 - Industrial (Bebas Neue + Roboto)
  {
    id: 7,
    name: 'Industrial',
    colors: {
      primary: '#f59e0b',
      primaryLight: '#fbbf24',
      primaryDark: '#d97706',
      secondary: '#1f2937',
      accent: '#fbbf24',
      dark: '#111827',
      light: '#f9fafb',
    },
    fonts: {
      heading: 'Bebas Neue',
      body: 'Roboto',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:wght@400;500;700&display=swap',
    },
    cssVariables: `
      --color-primary: #f59e0b;
      --color-primary-light: #fbbf24;
      --color-secondary: #1f2937;
      --color-accent: #fbbf24;
      --font-heading: 'Bebas Neue', sans-serif;
      --font-body: 'Roboto', sans-serif;
    `,
    customStyles: `
      .hero { background: linear-gradient(135deg, #1f2937 0%, #111827 50%, #f59e0b 200%); }
      h1, h2, h3, h4 { text-transform: uppercase; letter-spacing: 0.1em; }
      .feature-card { border-radius: 8px; }
      .hero-cta-primary { border-radius: 4px; text-transform: uppercase; letter-spacing: 0.15em; }
      body::before {
        content: ''; position: fixed; inset: 0;
        background: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 2px,
          rgba(245, 158, 11, 0.02) 2px,
          rgba(245, 158, 11, 0.02) 4px
        );
        pointer-events: none; z-index: -1;
      }
    `,
  },

  // Template 8 - Vintage (Playfair Display + Lora)
  {
    id: 8,
    name: 'Vintage',
    colors: {
      primary: '#92400e',
      primaryLight: '#b45309',
      primaryDark: '#78350f',
      secondary: '#fef3c7',
      accent: '#d97706',
      dark: '#451a03',
      light: '#fffbeb',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Lora',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;900&family=Lora:wght@400;500;600;700&display=swap',
    },
    cssVariables: `
      --color-primary: #92400e;
      --color-primary-light: #b45309;
      --color-secondary: #fef3c7;
      --color-accent: #d97706;
      --font-heading: 'Playfair Display', serif;
      --font-body: 'Lora', serif;
    `,
    customStyles: `
      .hero { background: linear-gradient(135deg, #92400e 0%, #78350f 50%, #451a03 100%); }
      body { background: #fffbeb; }
      .feature-card { background: #fef3c7; border: 2px solid #f59e0b; }
      .section-badge { background: #fef3c7; color: #92400e; border: 2px solid #92400e; }
      h1, h2 { font-style: italic; }
    `,
  },

  // Template 9 - Fitness Energia (Anton + Barlow)
  {
    id: 9,
    name: 'Fitness',
    colors: {
      primary: '#dc2626',
      primaryLight: '#ef4444',
      primaryDark: '#b91c1c',
      secondary: '#0a0a0a',
      accent: '#fbbf24',
      dark: '#000000',
      light: '#f5f5f5',
    },
    fonts: {
      heading: 'Anton',
      body: 'Barlow',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Anton&family=Barlow:wght@400;500;600;700&display=swap',
    },
    cssVariables: `
      --color-primary: #dc2626;
      --color-primary-light: #ef4444;
      --color-secondary: #0a0a0a;
      --color-accent: #fbbf24;
      --font-heading: 'Anton', sans-serif;
      --font-body: 'Barlow', sans-serif;
    `,
    customStyles: `
      .hero { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #7f1d1d 100%); }
      h1, h2, h3, h4 { text-transform: uppercase; letter-spacing: 0.03em; }
      body::before {
        content: ''; position: fixed; inset: 0;
        background: radial-gradient(ellipse at 20% 0%, rgba(220, 38, 38, 0.1) 0%, transparent 50%);
        pointer-events: none; z-index: -1;
      }
      .feature-card { border-radius: 8px; }
      .hero-cta-primary { border-radius: 4px; text-transform: uppercase; font-weight: 700; }
    `,
  },

  // Template 10 - Zen (Cormorant Garamond + Quicksand)
  {
    id: 10,
    name: 'Zen',
    colors: {
      primary: '#0d9488',
      primaryLight: '#14b8a6',
      primaryDark: '#0f766e',
      secondary: '#f0fdfa',
      accent: '#5eead4',
      dark: '#134e4a',
      light: '#f0fdfa',
    },
    fonts: {
      heading: 'Cormorant Garamond',
      body: 'Quicksand',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap',
    },
    cssVariables: `
      --color-primary: #0d9488;
      --color-primary-light: #14b8a6;
      --color-secondary: #f0fdfa;
      --color-accent: #5eead4;
      --font-heading: 'Cormorant Garamond', serif;
      --font-body: 'Quicksand', sans-serif;
    `,
    customStyles: `
      .hero { background: linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #134e4a 100%); }
      body { background: #f0fdfa; }
      body::before {
        content: ''; position: fixed; inset: 0;
        background: radial-gradient(circle at 50% 50%, rgba(13, 148, 136, 0.03) 0%, transparent 70%);
        pointer-events: none; z-index: -1;
      }
      .feature-card { border-radius: 24px; background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); }
      .section-badge { background: rgba(13, 148, 136, 0.1); border: none; }
    `,
  },

  // Template 11 - Criativo Artístico (Space Grotesk + DM Sans)
  {
    id: 11,
    name: 'Criativo',
    colors: {
      primary: '#ec4899',
      primaryLight: '#f472b6',
      primaryDark: '#db2777',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      dark: '#0f0f0f',
      light: '#fefefe',
    },
    fonts: {
      heading: 'Space Grotesk',
      body: 'DM Sans',
      googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap',
    },
    cssVariables: `
      --color-primary: #ec4899;
      --color-primary-light: #f472b6;
      --color-secondary: #8b5cf6;
      --color-accent: #06b6d4;
      --font-heading: 'Space Grotesk', sans-serif;
      --font-body: 'DM Sans', sans-serif;
    `,
    customStyles: `
      .hero { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%); }
      body::before {
        content: ''; position: fixed; inset: 0;
        background: radial-gradient(ellipse at 20% 20%, rgba(236, 72, 153, 0.08) 0%, transparent 50%),
                    radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
                    radial-gradient(ellipse at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 60%);
        pointer-events: none; z-index: -1; animation: bgPulse 10s ease-in-out infinite;
      }
      @keyframes bgPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
      .feature-icon { background: linear-gradient(135deg, #ec4899, #8b5cf6, #06b6d4); }
    `,
  },
];

/**
 * Obtém os estilos de um template pelo ID
 */
export function getTemplateStyleById(id: number): TemplateStyle | undefined {
  return TEMPLATE_STYLES.find(t => t.id === id);
}

/**
 * Gera o CSS completo para um template
 */
export function generateTemplateCSS(templateId: number, customColors?: {
  primary?: string;
  secondary?: string;
  accent?: string;
}): string {
  const style = getTemplateStyleById(templateId);
  if (!style) return '';

  const colors = {
    ...style.colors,
    ...customColors,
  };

  return `
    /* Template ${style.id} - ${style.name} */
    :root {
      --color-primary: ${colors.primary};
      --color-primary-light: ${colors.primaryLight};
      --color-secondary: ${colors.secondary};
      --color-accent: ${colors.accent};
    }
    ${style.customStyles}
  `;
}

/**
 * Retorna a URL do Google Fonts para um template
 */
export function getTemplateFontsUrl(templateId: number): string {
  const style = getTemplateStyleById(templateId);
  return style?.fonts.googleFontsUrl || TEMPLATE_STYLES[0].fonts.googleFontsUrl;
}

/**
 * Retorna os nomes das fontes para uso no CSS
 */
export function getTemplateFonts(templateId: number): { heading: string; body: string } {
  const style = getTemplateStyleById(templateId);
  return style?.fonts || TEMPLATE_STYLES[0].fonts;
}
