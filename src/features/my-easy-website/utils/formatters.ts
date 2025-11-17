import type { CountryAddressConfig } from '../../../constants/countries';

/**
 * Formata número de telefone baseado no formato do país
 */
export function formatPhoneNumber(
  phone: string,
  country: CountryAddressConfig
): string {
  const cleaned = phone.replace(/\D/g, '');
  let formatted = '';
  let phoneIndex = 0;

  for (
    let i = 0;
    i < country.phoneFormat.length && phoneIndex < cleaned.length;
    i++
  ) {
    if (country.phoneFormat[i] === '#') {
      formatted += cleaned[phoneIndex];
      phoneIndex++;
    } else {
      formatted += country.phoneFormat[i];
    }
  }

  return formatted || cleaned;
}

/**
 * Processa descrição de cores para criar paleta customizada
 */
export function processColors(description: string): {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  light: string;
} {
  const colorMap: Record<string, string> = {
    azul: '#3b82f6',
    vermelho: '#ef4444',
    verde: '#10b981',
    amarelo: '#f59e0b',
    roxo: '#8b5cf6',
    rosa: '#ec4899',
    laranja: '#f97316',
    preto: '#1f2937',
    branco: '#f3f4f6',
    cinza: '#6b7280',
  };

  const words = description.toLowerCase().split(/\s+/);
  const foundColors: string[] = [];

  words.forEach((word) => {
    if (colorMap[word]) {
      foundColors.push(colorMap[word]);
    }
  });

  // Se não encontrou cores, usar paleta padrão
  if (foundColors.length === 0) {
    return {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      dark: '#1f2937',
      light: '#f3f4f6',
    };
  }

  return {
    primary: foundColors[0] || '#3b82f6',
    secondary: foundColors[1] || '#8b5cf6',
    accent: foundColors[2] || '#f59e0b',
    dark: '#1f2937',
    light: '#f3f4f6',
  };
}
