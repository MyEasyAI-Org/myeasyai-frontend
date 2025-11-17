import { useState } from 'react';
import type { CountryAddressConfig } from '../../../constants/countries';
import { addressService } from '../../../services/AddressService';

/**
 * Address confirmation result from geocoding
 */
export type AddressConfirmation = {
  original: string;
  formatted: string;
  lat: string;
  lon: string;
};

/**
 * Hook for managing address-related state and logic in MyEasyWebsite
 * Handles country selection, address validation, and geocoding
 */
export function useAddressManagement() {
  const [selectedCountry, setSelectedCountry] = useState<CountryAddressConfig>(
    addressService.getDefaultCountry()
  );
  const [addressConfirmation, setAddressConfirmation] = useState<AddressConfirmation | null>(null);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);

  /**
   * Get all available countries
   */
  const getAllCountries = () => {
    return addressService.getCountries();
  };

  /**
   * Get countries grouped by region
   */
  const getCountriesByRegion = () => {
    return addressService.getCountriesByRegion();
  };

  /**
   * Select a country
   */
  const selectCountry = (country: CountryAddressConfig) => {
    setSelectedCountry(country);
  };

  /**
   * Select country by code
   */
  const selectCountryByCode = (code: string) => {
    const country = addressService.getCountryByCode(code);
    if (country) {
      setSelectedCountry(country);
    }
  };

  /**
   * Search countries by name or code
   */
  const searchCountries = (query: string) => {
    return addressService.searchCountries(query);
  };

  /**
   * Validate and geocode an address
   */
  const validateAddress = async (address: string): Promise<boolean> => {
    setIsValidatingAddress(true);

    try {
      const result = await addressService.geocodeAddress(address);

      if (result) {
        setAddressConfirmation({
          original: address,
          formatted: result.displayName,
          lat: result.lat,
          lon: result.lon,
        });
        return true;
      }

      setAddressConfirmation(null);
      return false;
    } catch (error) {
      console.error('Error validating address:', error);
      setAddressConfirmation(null);
      return false;
    } finally {
      setIsValidatingAddress(false);
    }
  };

  /**
   * Clear address confirmation
   */
  const clearAddressConfirmation = () => {
    setAddressConfirmation(null);
  };

  /**
   * Format phone number according to selected country
   */
  const formatPhoneNumber = (phone: string): string => {
    return addressService.formatPhoneNumber(phone, selectedCountry);
  };

  /**
   * Validate phone number length
   */
  const isValidPhoneLength = (phone: string): boolean => {
    return addressService.isValidPhoneLength(phone, selectedCountry);
  };

  /**
   * Format postal code according to selected country
   */
  const formatPostalCode = (postalCode: string): string => {
    return addressService.formatPostalCode(postalCode, selectedCountry);
  };

  /**
   * Validate postal code
   */
  const isValidPostalCode = (postalCode: string): boolean => {
    return addressService.isValidPostalCode(postalCode, selectedCountry);
  };

  /**
   * Get address fields configuration for selected country
   */
  const getAddressFields = () => {
    return addressService.getAddressFields(selectedCountry);
  };

  /**
   * Build full address string from components
   */
  const buildAddressString = (components: {
    line1?: string;
    line2?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  }): string => {
    return addressService.buildAddressString({
      ...components,
      country: selectedCountry,
    });
  };

  return {
    // State
    selectedCountry,
    addressConfirmation,
    isValidatingAddress,

    // Actions
    selectCountry,
    selectCountryByCode,
    validateAddress,
    clearAddressConfirmation,

    // Getters
    getAllCountries,
    getCountriesByRegion,
    searchCountries,
    getAddressFields,

    // Formatters/Validators
    formatPhoneNumber,
    isValidPhoneLength,
    formatPostalCode,
    isValidPostalCode,
    buildAddressString,
  };
}
