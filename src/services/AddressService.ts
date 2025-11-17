import type { CountryAddressConfig } from '../constants/countries';
import { COUNTRIES, COUNTRIES_MAP, getCountryConfig } from '../constants/countries';
import { geocodingService } from './GeocodingService';

/**
 * Service responsible for managing address logic
 * Handles country selection, address validation, and geocoding
 */
export class AddressService {
  /**
   * Get all available countries
   */
  getCountries(): CountryAddressConfig[] {
    return COUNTRIES;
  }

  /**
   * Get country by code
   */
  getCountryByCode(code: string): CountryAddressConfig | undefined {
    return getCountryConfig(code);
  }

  /**
   * Get default country (first in list - Brazil)
   */
  getDefaultCountry(): CountryAddressConfig {
    return COUNTRIES[0];
  }

  /**
   * Search countries by name
   */
  searchCountries(query: string): CountryAddressConfig[] {
    const lowerQuery = query.toLowerCase();
    return COUNTRIES.filter(country =>
      country.name.toLowerCase().includes(lowerQuery) ||
      country.code.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Validate address using geocoding
   */
  async validateAddress(address: string): Promise<boolean> {
    return await geocodingService.validateAddress(address);
  }

  /**
   * Geocode address to coordinates
   */
  async geocodeAddress(address: string) {
    return await geocodingService.geocodeAddress(address);
  }

  /**
   * Format phone number according to country format
   */
  formatPhoneNumber(phone: string, country: CountryAddressConfig): string {
    // Remove all non-numeric characters
    const digits = phone.replace(/\D/g, '');

    // Apply format from country config
    let formatted = country.phoneFormat;
    let digitIndex = 0;

    for (let i = 0; i < formatted.length && digitIndex < digits.length; i++) {
      if (formatted[i] === '#') {
        formatted = formatted.substring(0, i) + digits[digitIndex] + formatted.substring(i + 1);
        digitIndex++;
      }
    }

    return formatted.replace(/#/g, '');
  }

  /**
   * Validate phone number length for country
   */
  isValidPhoneLength(phone: string, country: CountryAddressConfig): boolean {
    const digits = phone.replace(/\D/g, '');
    return digits.length === country.phoneLength;
  }

  /**
   * Format postal code according to country config
   */
  formatPostalCode(postalCode: string, country: CountryAddressConfig): string {
    if (!country.postalCodeMaxLength) {
      return postalCode;
    }

    return postalCode.substring(0, country.postalCodeMaxLength);
  }

  /**
   * Validate postal code format (if regex exists)
   */
  isValidPostalCode(postalCode: string, country: CountryAddressConfig): boolean {
    if (!country.postalCodeFormat) {
      // If no format specified, just check max length
      return country.postalCodeMaxLength
        ? postalCode.length <= country.postalCodeMaxLength
        : true;
    }

    return country.postalCodeFormat.test(postalCode);
  }

  /**
   * Get address field configuration for country
   */
  getAddressFields(country: CountryAddressConfig) {
    return country.addressFields;
  }

  /**
   * Build full address string from components
   */
  buildAddressString(components: {
    line1?: string;
    line2?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country: CountryAddressConfig;
  }): string {
    const parts: string[] = [];

    if (components.line1) parts.push(components.line1);
    if (components.line2) parts.push(components.line2);
    if (components.neighborhood) parts.push(components.neighborhood);
    if (components.city) parts.push(components.city);
    if (components.state) parts.push(components.state);
    if (components.postalCode) parts.push(components.postalCode);
    parts.push(components.country.name);

    return parts.join(', ');
  }

  /**
   * Get countries by region
   */
  getCountriesByRegion(): Record<string, CountryAddressConfig[]> {
    return {
      'América do Sul': COUNTRIES.slice(0, 10),
      'América do Norte': COUNTRIES.slice(10, 13),
      'América Central e Caribe': COUNTRIES.slice(13, 18),
      'Europa Ocidental': COUNTRIES.slice(18, 29),
      'Europa do Norte': COUNTRIES.slice(29, 34),
      'Europa do Leste': COUNTRIES.slice(34, 40),
      'Ásia': COUNTRIES.slice(40, 51),
      'Oceania': COUNTRIES.slice(51, 53),
      'África': COUNTRIES.slice(53, 58),
      'Oriente Médio': COUNTRIES.slice(58, 62),
    };
  }
}

// Singleton instance
export const addressService = new AddressService();
