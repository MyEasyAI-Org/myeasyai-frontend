import type { User } from '@supabase/supabase-js';
import * as flags from 'country-flag-icons/react/3x2';
import { useEffect, useRef, useState } from 'react';
import { COUNTRIES, getCountryConfig } from '../constants/countries';
import { supabase } from '../lib/supabase';
import { Modal } from './Modal';

type OnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  user: User;
};

type FormData = {
  name?: string;
  preferred_name?: string;
  mobile_phone?: string;
  country_code?: string;
  country?: string;
  postal_code?: string;
  address?: string;
  neighborhood?: string;
  street?: string;
  number?: string;
  complement?: string;
  city?: string;
  state?: string;
  preferred_language?: string;
};

// Helper to render SVG flags
const FlagIcon = ({
  countryCode,
  className = 'w-6 h-4',
}: {
  countryCode: string;
  className?: string;
}) => {
  const Flag = flags[countryCode as keyof typeof flags];
  if (!Flag) return null;
  return <Flag className={className} />;
};

const steps = [
  {
    id: 'personal',
    title: 'Dados Pessoais',
    description: 'Vamos começar com suas informações básicas',
  },
  {
    id: 'contact',
    title: 'Contato',
    description: 'Como podemos entrar em contato com você?',
  },
  {
    id: 'location',
    title: 'Localização',
    description: 'Onde você está localizado?',
  },
  {
    id: 'preferences',
    title: 'Preferências',
    description: 'Personalize sua experiência',
  },
];

export function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
  user,
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    preferred_name: '',
    country_code: 'BR',
    country: 'BR',
    preferred_language: 'pt',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isClosingCountryDropdown, setIsClosingCountryDropdown] =
    useState(false);
  const [isClosingLocationDropdown, setIsClosingLocationDropdown] =
    useState(false);
  const [isClosingLanguageDropdown, setIsClosingLanguageDropdown] =
    useState(false);

  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // Function to capitalize names
  const capitalizeName = (name: string): string => {
    const lowercaseWords = ['de', 'da', 'do', 'dos', 'das', 'e'];

    return name
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (index === 0 || !lowercaseWords.includes(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  };

  // Function to format phone based on country
  const formatPhone = (phone: string, countryCode: string): string => {
    const country = getCountryConfig(countryCode);
    if (!country) return phone;

    const numbers = phone.replace(/\D/g, '');
    const limitedNumbers = numbers.slice(0, country.phoneLength);

    let formatted = '';
    let numberIndex = 0;

    for (
      let i = 0;
      i < country.phoneFormat.length && numberIndex < limitedNumbers.length;
      i++
    ) {
      if (country.phoneFormat[i] === '#') {
        formatted += limitedNumbers[numberIndex];
        numberIndex++;
      } else {
        formatted += country.phoneFormat[i];
      }
    }

    return formatted;
  };

  // Function to fetch postal code (ViaCEP - Brazil)
  const fetchBrazilianAddress = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );
      const data = await response.json();

      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Handler for postal code change
  const handlePostalCodeChange = async (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, postal_code: cleanValue }));

    // If Brazil and has 8 digits, fetch address
    if (formData.country === 'BR' && cleanValue.length === 8) {
      await fetchBrazilianAddress(cleanValue);
    }
  };

  // Handler for name change with automatic capitalization
  const handleNameChange = (value: string) => {
    const capitalizedName = capitalizeName(value);
    setFormData((prev) => ({ ...prev, name: capitalizedName }));
    if (value.trim().split(' ').length < 2) {
      setErrors((prev) => ({ ...prev, name: 'Digite nome e sobrenome' }));
    } else {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  // Handler for phone change with automatic formatting
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value, formData.country_code || 'BR');
    setFormData((prev) => ({ ...prev, mobile_phone: formatted }));

    const country = getCountryConfig(formData.country_code || 'BR');
    const numbers = value.replace(/\D/g, '');
    if (country && numbers.length < country.phoneLength) {
      setErrors((prev) => ({ ...prev, mobile_phone: 'Telefone incompleto' }));
    } else {
      setErrors((prev) => ({ ...prev, mobile_phone: undefined }));
    }
  };

  // Handler for country change (phone code)
  const handleCountryCodeChange = (countryCode: string) => {
    setFormData((prev) => ({
      ...prev,
      country_code: countryCode,
      mobile_phone: '',
    }));
    setIsClosingCountryDropdown(true);
    setTimeout(() => {
      setShowCountryDropdown(false);
      setIsClosingCountryDropdown(false);
    }, 700);
    setCountrySearch('');
  };

  // Handler for country change (location)
  const handleLocationCountryChange = (countryCode: string) => {
    setFormData((prev) => ({
      ...prev,
      country: countryCode,
      postal_code: '',
      street: '',
      neighborhood: '',
      city: '',
      state: '',
      complement: '',
    }));
    setIsClosingLocationDropdown(true);
    setTimeout(() => {
      setShowLocationDropdown(false);
      setIsClosingLocationDropdown(false);
    }, 700);
    setLocationSearch('');
  };

  // Filter countries for phone dropdown
  const filteredPhoneCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      country.dial.includes(countrySearch),
  );

  // Filter countries for location dropdown
  const filteredLocationCountries = COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(locationSearch.toLowerCase()),
  );

  // Available languages
  const languages = [
    { code: 'pt', name: 'Português', countryFlag: 'BR' },
    { code: 'en', name: 'English', countryFlag: 'US' },
    { code: 'es', name: 'Español', countryFlag: 'ES' },
    { code: 'fr', name: 'Français', countryFlag: 'FR' },
  ];

  // Filter languages
  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(languageSearch.toLowerCase()),
  );

  // Handler for language change
  const handleLanguageChange = (languageCode: string) => {
    setFormData((prev) => ({ ...prev, preferred_language: languageCode }));
    setIsClosingLanguageDropdown(true);
    setTimeout(() => {
      setShowLanguageDropdown(false);
      setIsClosingLanguageDropdown(false);
    }, 700);
    setLanguageSearch('');
  };

  // Validate if can proceed to next step
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: // Personal Data
        return !!(
          formData.name &&
          formData.name.trim().split(' ').length >= 2 &&
          !errors.name
        );
      case 1: {
        // Contact
        const country = getCountryConfig(formData.country_code || 'BR');
        const numbers = (formData.mobile_phone || '').replace(/\D/g, '');
        return !!(
          country &&
          numbers.length === country.phoneLength &&
          !errors.mobile_phone
        );
      }
      case 2: {
        // Location
        const locationCountry = getCountryConfig(formData.country || 'BR');
        if (!locationCountry) return false;

        // Validate required fields based on country
        const hasPostalCode = !!formData.postal_code;
        const hasStreet = !!formData.street;
        const hasNumber = !!formData.number;
        const hasCity = !!formData.city;
        const hasNeighborhood = locationCountry.addressFields.neighborhoodLabel
          ? !!formData.neighborhood
          : true;
        const hasState = locationCountry.addressFields.stateLabel
          ? !!formData.state
          : true;

        return (
          hasPostalCode &&
          hasStreet &&
          hasNumber &&
          hasCity &&
          hasNeighborhood &&
          hasState
        );
      }
      case 3: // Preferences
        return !!formData.preferred_language;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    // Build full address by concatenating fields
    const fullAddress = [
      formData.street,
      formData.number,
      formData.complement,
      formData.neighborhood,
      formData.city,
      formData.state,
    ]
      .filter(Boolean)
      .join(', ');

    setLoading(true);
    try {
      const country = getCountryConfig(formData.country_code || 'BR');
      const fullPhoneNumber = country
        ? `${country.dial} ${formData.mobile_phone}`
        : formData.mobile_phone;

      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name || 'Usuário',
          preferred_name: formData.preferred_name || null,
          mobile_phone: fullPhoneNumber
            ? parseInt(fullPhoneNumber.replace(/\D/g, ''))
            : null,
          country: formData.country,
          postal_code: formData.postal_code
            ? parseInt(formData.postal_code)
            : null,
          address: fullAddress,
          preferred_language: formData.preferred_language || 'pt',
          last_online: new Date().toISOString(),
        })
        .eq('email', user.email);

      if (error) {
        console.error('Erro ao salvar dados:', error);
        alert('Erro ao salvar informações. Tente novamente.');
        return;
      }

      onComplete();
    } catch (error) {
      console.error('Erro inesperado:', error);
      alert('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Data
        return (
          <div className="space-y-4">
            <label className="block text-left">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                Seu nome completo *
              </span>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: João Silva Santos"
                className={`w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-slate-700'} bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
              />
              {errors.name && (
                <span className="text-xs text-red-400 mt-1">{errors.name}</span>
              )}
            </label>

            <label className="block text-left">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                Como quer ser chamado?
              </span>
              <input
                type="text"
                value={formData.preferred_name || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    preferred_name: e.target.value,
                  }))
                }
                placeholder="Ex: João, Joãozinho, JJ..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
              <span className="text-xs text-slate-500 mt-1">
                Escreva um nome amigável para usarmos com você 😊
              </span>
            </label>
          </div>
        );

      case 1: {
        // Contact
        const selectedCountry =
          getCountryConfig(formData.country_code || 'BR') || COUNTRIES[0];
        return (
          <div className="space-y-4">
            <label className="block text-left">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                Telefone / WhatsApp *
              </span>
              <div className="flex gap-2">
                {/* Country Code Selector */}
                <div className="relative" ref={countryDropdownRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCountryDropdown(!showCountryDropdown);
                    }}
                    className="flex items-center gap-2 px-3 py-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
                  >
                    <FlagIcon
                      countryCode={selectedCountry.code}
                      className="w-6 h-4"
                    />
                    <span className="text-slate-100">
                      {selectedCountry.dial}
                    </span>
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showCountryDropdown && (
                    <div
                      className={`absolute z-10 mt-1 w-80 rounded-lg border border-slate-700 bg-slate-800 shadow-xl transition-opacity duration-700 ${isClosingCountryDropdown ? 'opacity-0' : 'opacity-100'}`}
                    >
                      <div className="p-2 border-b border-slate-700">
                        <input
                          type="text"
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Buscar país..."
                          className="w-full px-3 py-2 rounded-md bg-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredPhoneCountries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleCountryCodeChange(country.code);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 hover:bg-slate-700 transition-colors text-left"
                          >
                            <FlagIcon
                              countryCode={country.code}
                              className="w-6 h-4 flex-shrink-0"
                            />
                            <span className="text-slate-100 flex-1 truncate">
                              {country.name}
                            </span>
                            <span className="text-slate-400">
                              {country.dial}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Phone Input */}
                <input
                  type="tel"
                  value={formData.mobile_phone || ''}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder={selectedCountry.phoneFormat.replace(/#/g, '0')}
                  className={`flex-1 rounded-lg border ${errors.mobile_phone ? 'border-red-500' : 'border-slate-700'} bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40`}
                />
              </div>
              {errors.mobile_phone && (
                <span className="text-xs text-red-400 mt-1">
                  {errors.mobile_phone}
                </span>
              )}
            </label>
          </div>
        );
      }

      case 2: {
        // Location
        const locationCountry =
          getCountryConfig(formData.country || 'BR') || COUNTRIES[0];
        return (
          <div className="space-y-4">
            <label className="block text-left">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                País *
              </span>
              <div className="relative" ref={locationDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 transition-colors text-left"
                >
                  <FlagIcon
                    countryCode={locationCountry.code}
                    className="w-6 h-4"
                  />
                  <span className="text-slate-100 flex-1">
                    {locationCountry.name}
                  </span>
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showLocationDropdown && (
                  <div
                    className={`absolute z-10 mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 shadow-xl transition-opacity duration-700 ${isClosingLocationDropdown ? 'opacity-0' : 'opacity-100'}`}
                  >
                    <div className="p-2 border-b border-slate-700">
                      <input
                        type="text"
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        placeholder="Buscar país..."
                        className="w-full px-3 py-2 rounded-md bg-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredLocationCountries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleLocationCountryChange(country.code);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2 hover:bg-slate-700 transition-colors text-left"
                        >
                          <FlagIcon
                            countryCode={country.code}
                            className="w-6 h-4 flex-shrink-0"
                          />
                          <span className="text-slate-100 truncate">
                            {country.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </label>

            <label className="block text-left">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                {locationCountry.postalCodeLabel} *{' '}
                {isLoadingAddress && '(Buscando...)'}
              </span>
              <input
                type="text"
                value={formData.postal_code || ''}
                onChange={(e) => handlePostalCodeChange(e.target.value)}
                placeholder={locationCountry.postalCodePlaceholder}
                maxLength={locationCountry.postalCodeMaxLength}
                disabled={isLoadingAddress}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 disabled:opacity-50"
              />
              {locationCountry.hasAutoComplete && (
                <span className="text-xs text-slate-500 mt-1">
                  ✨ Preenchimento automático disponível
                </span>
              )}
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block text-left">
                <span className="mb-1 block text-sm font-medium text-slate-300">
                  {locationCountry.addressFields.line1Label} *
                </span>
                <input
                  type="text"
                  value={formData.street || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, street: e.target.value }))
                  }
                  placeholder={`Ex: ${locationCountry.addressFields.line1Label}`}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </label>

              <label className="block text-left">
                <span className="mb-1 block text-sm font-medium text-slate-300">
                  {locationCountry.addressFields.line2Label || 'Número'} *
                </span>
                <input
                  type="text"
                  value={formData.number || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, number: e.target.value }))
                  }
                  placeholder="123"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </label>
            </div>

            <label className="block text-left">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                Complemento
              </span>
              <input
                type="text"
                value={formData.complement || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    complement: e.target.value,
                  }))
                }
                placeholder="Ex.: Bloco 2 / Apartamento 602"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </label>

            {locationCountry.addressFields.neighborhoodLabel && (
              <label className="block text-left">
                <span className="mb-1 block text-sm font-medium text-slate-300">
                  {locationCountry.addressFields.neighborhoodLabel} *
                </span>
                <input
                  type="text"
                  value={formData.neighborhood || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      neighborhood: e.target.value,
                    }))
                  }
                  placeholder={`Ex: ${locationCountry.addressFields.neighborhoodLabel}`}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </label>
            )}

            <div className="grid grid-cols-2 gap-4">
              <label className="block text-left">
                <span className="mb-1 block text-sm font-medium text-slate-300">
                  {locationCountry.addressFields.cityLabel} *
                </span>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder={`Ex: ${locationCountry.addressFields.cityLabel}`}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </label>

              {locationCountry.addressFields.stateLabel && (
                <label className="block text-left">
                  <span className="mb-1 block text-sm font-medium text-slate-300">
                    {locationCountry.addressFields.stateLabel} *
                  </span>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => {
                      const maxLength =
                        locationCountry.addressFields.stateMaxLength;
                      let value = e.target.value;
                      if (maxLength) {
                        value = value
                          .toUpperCase()
                          .replace(/[^A-Z]/g, '')
                          .slice(0, maxLength);
                      }
                      setFormData((prev) => ({ ...prev, state: value }));
                    }}
                    placeholder={
                      locationCountry.addressFields.statePlaceholder || 'Estado'
                    }
                    maxLength={locationCountry.addressFields.stateMaxLength}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                </label>
              )}
            </div>
          </div>
        );
      }

      case 3: {
        // Preferences
        const selectedLanguage =
          languages.find((lang) => lang.code === formData.preferred_language) ||
          languages[0];
        return (
          <div className="space-y-4">
            <label className="block text-left">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                Idioma preferido *
              </span>
              <div className="relative" ref={languageDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 transition-colors text-left"
                >
                  <FlagIcon
                    countryCode={selectedLanguage.countryFlag}
                    className="w-6 h-4"
                  />
                  <span className="text-slate-100 flex-1">
                    {selectedLanguage.name}
                  </span>
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showLanguageDropdown && (
                  <div
                    className={`absolute z-10 mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 shadow-xl transition-opacity duration-700 ${isClosingLanguageDropdown ? 'opacity-0' : 'opacity-100'}`}
                  >
                    <div className="p-2 border-b border-slate-700">
                      <input
                        type="text"
                        value={languageSearch}
                        onChange={(e) => setLanguageSearch(e.target.value)}
                        placeholder="Buscar idioma..."
                        className="w-full px-3 py-2 rounded-md bg-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredLanguages.map((language) => (
                        <button
                          key={language.code}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleLanguageChange(language.code);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2 hover:bg-slate-700 transition-colors text-left"
                        >
                          <FlagIcon
                            countryCode={language.countryFlag}
                            className="w-6 h-4 flex-shrink-0"
                          />
                          <span className="text-slate-100 truncate">
                            {language.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  // Load user data when opening modal
  useEffect(() => {
    const loadUserData = async () => {
      if (!isOpen || !user.email) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select(
            'name, preferred_name, mobile_phone, country, postal_code, address, street, number, complement, neighborhood, city, state, preferred_language, country_code',
          )
          .eq('email', user.email)
          .single();

        if (error) {
          console.error('Erro ao carregar dados do usuário:', error);
          // Use user_metadata data as fallback
          setFormData((prev) => ({
            ...prev,
            name:
              user.user_metadata?.full_name || user.user_metadata?.name || '',
            preferred_name: user.user_metadata?.preferred_name || '',
          }));
        } else if (data) {
          // Fill form with database data
          setFormData((prev) => ({
            ...prev,
            name:
              data.name ||
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              '',
            preferred_name:
              data.preferred_name || user.user_metadata?.preferred_name || '',
            mobile_phone: data.mobile_phone ? String(data.mobile_phone) : '',
            country_code: data.country_code || 'BR',
            country: data.country || 'BR',
            postal_code: data.postal_code ? String(data.postal_code) : '',
            street: data.street || '',
            number: data.number || '',
            complement: data.complement || '',
            neighborhood: data.neighborhood || '',
            city: data.city || '',
            state: data.state || '',
            preferred_language: data.preferred_language || 'pt',
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadUserData();
  }, [isOpen, user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete seu perfil"
      description="Para uma experiência personalizada, precisamos de algumas informações."
      contentClassName="space-y-6"
    >
      {/* Progress Timeline */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">
            Etapa {currentStep + 1} de {steps.length}
          </span>
          <span className="text-sm text-slate-400">
            {Math.round(progressPercentage)}% concluído
          </span>
        </div>

        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                index <= currentStep ? 'text-purple-400' : 'text-slate-500'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  index < currentStep
                    ? 'bg-purple-500 text-white'
                    : index === currentStep
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-700 text-slate-400'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              <span className="text-xs mt-1 text-center max-w-16">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[200px]">
        <h3 className="text-lg font-semibold text-slate-200 mb-2">
          {steps[currentStep].title}
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          {steps[currentStep].description}
        </p>

        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            currentStep === 0
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-slate-600 text-slate-200 hover:bg-slate-500'
          }`}
        >
          Anterior
        </button>

        {currentStep === steps.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={loading || !canProceed()}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              loading || !canProceed()
                ? 'bg-purple-400 text-white cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
            }`}
          >
            {loading ? 'Salvando...' : 'Finalizar'}
          </button>
        ) : (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              !canProceed()
                ? 'bg-purple-400 text-white cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
            }`}
          >
            Próximo
          </button>
        )}
      </div>
    </Modal>
  );
}
