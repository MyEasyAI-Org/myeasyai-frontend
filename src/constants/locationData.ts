// Arquivo unificado para dados de localizacao (estados, regioes, cidades)
// Exporta funcoes helper para obter dados baseado no pais selecionado

import { BRAZILIAN_STATES } from './brazilianStates';
import { BRAZILIAN_CITIES, getCitiesByState as getBrazilianCities } from './brazilianCities';
import { PORTUGAL_DISTRICTS, PORTUGAL_CITIES, getCitiesByDistrict } from './portugalCities';
import { USA_STATES, USA_CITIES, getCitiesByState as getUSACities } from './usaCities';
import {
  EUROPE_COUNTRIES,
  SPAIN_REGIONS,
  SPAIN_CITIES,
  FRANCE_REGIONS,
  FRANCE_CITIES,
  GERMANY_STATES,
  GERMANY_CITIES,
  ITALY_REGIONS,
  ITALY_CITIES,
  UK_REGIONS,
  UK_CITIES,
  NETHERLANDS_CITIES,
  BELGIUM_CITIES,
  SWITZERLAND_CITIES,
  AUSTRIA_CITIES,
  IRELAND_CITIES,
  getEuropeCities,
  getEuropeRegions,
} from './europeCities';
import {
  SOUTH_AMERICA_COUNTRIES,
  ARGENTINA_PROVINCES,
  ARGENTINA_CITIES,
  CHILE_REGIONS,
  CHILE_CITIES,
  COLOMBIA_DEPARTMENTS,
  COLOMBIA_CITIES,
  PERU_DEPARTMENTS,
  PERU_CITIES,
  VENEZUELA_STATES,
  VENEZUELA_CITIES,
  ECUADOR_PROVINCES,
  ECUADOR_CITIES,
  BOLIVIA_DEPARTMENTS,
  BOLIVIA_CITIES,
  PARAGUAY_CITIES,
  URUGUAY_CITIES,
  getSouthAmericaCities,
  getSouthAmericaRegions,
} from './southAmericaCities';

// Re-export tudo
export {
  // Brasil
  BRAZILIAN_STATES,
  BRAZILIAN_CITIES,
  getBrazilianCities,
  // Portugal
  PORTUGAL_DISTRICTS,
  PORTUGAL_CITIES,
  getCitiesByDistrict,
  // EUA
  USA_STATES,
  USA_CITIES,
  getUSACities,
  // Europa
  EUROPE_COUNTRIES,
  SPAIN_REGIONS,
  SPAIN_CITIES,
  FRANCE_REGIONS,
  FRANCE_CITIES,
  GERMANY_STATES,
  GERMANY_CITIES,
  ITALY_REGIONS,
  ITALY_CITIES,
  UK_REGIONS,
  UK_CITIES,
  NETHERLANDS_CITIES,
  BELGIUM_CITIES,
  SWITZERLAND_CITIES,
  AUSTRIA_CITIES,
  IRELAND_CITIES,
  getEuropeCities,
  getEuropeRegions,
  // America do Sul
  SOUTH_AMERICA_COUNTRIES,
  ARGENTINA_PROVINCES,
  ARGENTINA_CITIES,
  CHILE_REGIONS,
  CHILE_CITIES,
  COLOMBIA_DEPARTMENTS,
  COLOMBIA_CITIES,
  PERU_DEPARTMENTS,
  PERU_CITIES,
  VENEZUELA_STATES,
  VENEZUELA_CITIES,
  ECUADOR_PROVINCES,
  ECUADOR_CITIES,
  BOLIVIA_DEPARTMENTS,
  BOLIVIA_CITIES,
  PARAGUAY_CITIES,
  URUGUAY_CITIES,
  getSouthAmericaCities,
  getSouthAmericaRegions,
};

// Tipo para regiao/estado
export type RegionOption = {
  code: string;
  name: string;
};

/**
 * Retorna as regioes/estados para um pais especifico
 * @param countryCode Codigo do pais (BR, PT, US, ES, FR, DE, IT, GB, AR, CL, CO, PE, etc.)
 */
export function getRegionsByCountry(countryCode: string): readonly RegionOption[] {
  switch (countryCode) {
    // Americas
    case 'BR':
      return BRAZILIAN_STATES;
    case 'US':
      return USA_STATES;
    case 'AR':
      return ARGENTINA_PROVINCES;
    case 'CL':
      return CHILE_REGIONS;
    case 'CO':
      return COLOMBIA_DEPARTMENTS;
    case 'PE':
      return PERU_DEPARTMENTS;
    case 'VE':
      return VENEZUELA_STATES;
    case 'EC':
      return ECUADOR_PROVINCES;
    case 'BO':
      return BOLIVIA_DEPARTMENTS;
    // Europa
    case 'PT':
      return PORTUGAL_DISTRICTS;
    case 'ES':
      return SPAIN_REGIONS;
    case 'FR':
      return FRANCE_REGIONS;
    case 'DE':
      return GERMANY_STATES;
    case 'IT':
      return ITALY_REGIONS;
    case 'GB':
      return UK_REGIONS;
    default:
      return [];
  }
}

/**
 * Retorna as cidades para um pais e regiao especificos
 * @param countryCode Codigo do pais
 * @param regionCode Codigo da regiao/estado (opcional)
 */
export function getCitiesByCountryAndRegion(countryCode: string, regionCode?: string): string[] {
  switch (countryCode) {
    // Americas
    case 'BR':
      return regionCode ? getBrazilianCities(regionCode) : Object.values(BRAZILIAN_CITIES).flat();
    case 'US':
      return regionCode ? getUSACities(regionCode) : Object.values(USA_CITIES).flat();
    case 'AR':
      return regionCode ? ARGENTINA_CITIES[regionCode] || [] : Object.values(ARGENTINA_CITIES).flat();
    case 'CL':
      return regionCode ? CHILE_CITIES[regionCode] || [] : Object.values(CHILE_CITIES).flat();
    case 'CO':
      return regionCode ? COLOMBIA_CITIES[regionCode] || [] : Object.values(COLOMBIA_CITIES).flat();
    case 'PE':
      return regionCode ? PERU_CITIES[regionCode] || [] : Object.values(PERU_CITIES).flat();
    case 'VE':
      return regionCode ? VENEZUELA_CITIES[regionCode] || [] : Object.values(VENEZUELA_CITIES).flat();
    case 'EC':
      return regionCode ? ECUADOR_CITIES[regionCode] || [] : Object.values(ECUADOR_CITIES).flat();
    case 'BO':
      return regionCode ? BOLIVIA_CITIES[regionCode] || [] : Object.values(BOLIVIA_CITIES).flat();
    case 'PY':
      return PARAGUAY_CITIES;
    case 'UY':
      return URUGUAY_CITIES;
    // Europa
    case 'PT':
      return regionCode ? getCitiesByDistrict(regionCode) : Object.values(PORTUGAL_CITIES).flat();
    case 'ES':
      return regionCode ? SPAIN_CITIES[regionCode] || [] : Object.values(SPAIN_CITIES).flat();
    case 'FR':
      return regionCode ? FRANCE_CITIES[regionCode] || [] : Object.values(FRANCE_CITIES).flat();
    case 'DE':
      return regionCode ? GERMANY_CITIES[regionCode] || [] : Object.values(GERMANY_CITIES).flat();
    case 'IT':
      return regionCode ? ITALY_CITIES[regionCode] || [] : Object.values(ITALY_CITIES).flat();
    case 'GB':
      return regionCode ? UK_CITIES[regionCode] || [] : Object.values(UK_CITIES).flat();
    case 'NL':
      return NETHERLANDS_CITIES;
    case 'BE':
      return BELGIUM_CITIES;
    case 'CH':
      return SWITZERLAND_CITIES;
    case 'AT':
      return AUSTRIA_CITIES;
    case 'IE':
      return IRELAND_CITIES;
    default:
      return [];
  }
}

/**
 * Verifica se um pais tem regioes/estados para selecionar
 */
export function countryHasRegions(countryCode: string): boolean {
  return getRegionsByCountry(countryCode).length > 0;
}

/**
 * Lista de todos os paises suportados
 */
export const SUPPORTED_COUNTRIES = [
  // Americas
  { code: 'BR', name: 'Brasil', dialCode: '+55' },
  { code: 'US', name: 'Estados Unidos', dialCode: '+1' },
  { code: 'AR', name: 'Argentina', dialCode: '+54' },
  { code: 'CL', name: 'Chile', dialCode: '+56' },
  { code: 'CO', name: 'Colombia', dialCode: '+57' },
  { code: 'PE', name: 'Peru', dialCode: '+51' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58' },
  { code: 'EC', name: 'Equador', dialCode: '+593' },
  { code: 'BO', name: 'Bolivia', dialCode: '+591' },
  { code: 'PY', name: 'Paraguai', dialCode: '+595' },
  { code: 'UY', name: 'Uruguai', dialCode: '+598' },
  // Europa
  { code: 'PT', name: 'Portugal', dialCode: '+351' },
  { code: 'ES', name: 'Espanha', dialCode: '+34' },
  { code: 'FR', name: 'Franca', dialCode: '+33' },
  { code: 'DE', name: 'Alemanha', dialCode: '+49' },
  { code: 'IT', name: 'Italia', dialCode: '+39' },
  { code: 'GB', name: 'Reino Unido', dialCode: '+44' },
  { code: 'NL', name: 'Holanda', dialCode: '+31' },
  { code: 'BE', name: 'Belgica', dialCode: '+32' },
  { code: 'CH', name: 'Suica', dialCode: '+41' },
  { code: 'AT', name: 'Austria', dialCode: '+43' },
  { code: 'IE', name: 'Irlanda', dialCode: '+353' },
] as const;

export type SupportedCountryCode = (typeof SUPPORTED_COUNTRIES)[number]['code'];
