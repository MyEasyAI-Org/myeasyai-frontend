import type { User } from '@supabase/supabase-js';
import * as flags from 'country-flag-icons/react/3x2';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { COUNTRIES, getCountryConfig } from '../constants/countries';
import { BRAZILIAN_STATES } from '../constants/brazilianStates';
import { getCitiesByState } from '../constants/brazilianCities';
import { userManagementServiceV2 } from '../services/UserManagementServiceV2';
import { Modal } from './Modal';
import { TermsModal } from './TermsModal';
import { PlanSelectionStep } from './onboarding/PlanSelectionStep';

type OnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  user: User;
  disableClose?: boolean;
  initialStep?: number; // Start on a specific step (0-3), used for payment-only flow
};

type FormData = {
  name?: string;
  preferred_name?: string;
  mobile_phone?: string;
  country_code?: string;
  state?: string;
  city?: string;
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
    description: 'Vamos comecar com suas informacoes basicas',
  },
  {
    id: 'contact',
    title: 'Contato',
    description: 'Como podemos entrar em contato com voce?',
  },
  {
    id: 'preferences',
    title: 'Preferencias',
    description: 'Personalize sua experiencia',
  },
  {
    id: 'plan',
    title: 'Plano',
    description: 'Escolha o plano ideal para voce',
  },
];

export function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
  user,
  disableClose = false,
  initialStep = 0,
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Update currentStep when initialStep changes (e.g., when re-opening for payment)
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialStep);
    }
  }, [initialStep, isOpen]);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    preferred_name: '',
    country_code: 'BR',
    state: '',
    city: '',
    preferred_language: 'pt',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [isClosingCountryDropdown, setIsClosingCountryDropdown] =
    useState(false);
  const [isClosingStateDropdown, setIsClosingStateDropdown] = useState(false);
  const [isClosingCityDropdown, setIsClosingCityDropdown] = useState(false);
  const [isClosingLanguageDropdown, setIsClosingLanguageDropdown] =
    useState(false);

  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
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

  // Handler for state change
  const handleStateChange = (stateCode: string) => {
    setFormData((prev) => ({ ...prev, state: stateCode, city: '' })); // Limpar cidade ao mudar estado
    setIsClosingStateDropdown(true);
    setTimeout(() => {
      setShowStateDropdown(false);
      setIsClosingStateDropdown(false);
    }, 700);
    setStateSearch('');
    setCitySearch('');
  };

  // Handler for city change
  const handleCityChange = (city: string) => {
    setFormData((prev) => ({ ...prev, city }));
    setIsClosingCityDropdown(true);
    setTimeout(() => {
      setShowCityDropdown(false);
      setIsClosingCityDropdown(false);
    }, 700);
    setCitySearch('');
  };

  // Filter countries for phone dropdown
  const filteredPhoneCountries = COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      country.dial.includes(countrySearch),
  );

  // Filter states for dropdown
  const filteredStates = BRAZILIAN_STATES.filter(
    (state) =>
      state.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
      state.code.toLowerCase().includes(stateSearch.toLowerCase()),
  );

  // Get cities for selected state
  const availableCities = formData.state ? getCitiesByState(formData.state) : [];

  // Filter cities for dropdown
  const filteredCities = availableCities.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase()),
  );

  // Available languages
  const languages = [
    { code: 'pt', name: 'Portugues', countryFlag: 'BR' },
    { code: 'en', name: 'English', countryFlag: 'US' },
    { code: 'es', name: 'Espanol', countryFlag: 'ES' },
    { code: 'fr', name: 'Francais', countryFlag: 'FR' },
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
      case 0: // Personal Data + Terms
        return !!(
          formData.name &&
          formData.name.trim().split(' ').length >= 2 &&
          !errors.name &&
          acceptedTerms
        );
      case 1: {
        // Contact + Location
        const country = getCountryConfig(formData.country_code || 'BR');
        const numbers = (formData.mobile_phone || '').replace(/\D/g, '');
        return !!(
          country &&
          numbers.length === country.phoneLength &&
          !errors.mobile_phone &&
          formData.state &&
          formData.city
        );
      }
      case 2: // Preferences
        return !!formData.preferred_language;
      case 3: // Plan Selection - always valid, handled by PlanSelectionStep
        return true;
      default:
        return true;
    }
  };

  const nextStep = async () => {
    if (!canProceed()) return;

    // Save user data after preferences step (step 2) before going to plan selection
    if (currentStep === 2) {
      setLoading(true);
      try {
        const country = getCountryConfig(formData.country_code || 'BR');
        const fullPhoneNumber = country
          ? `${country.dial} ${formData.mobile_phone}`
          : formData.mobile_phone;

        // Use UserManagementServiceV2 (D1 Primary + Supabase Fallback)
        const result = await userManagementServiceV2.updateUserProfile(user.email!, {
          name: formData.name || 'Usuario',
          preferred_name: formData.preferred_name || undefined,
          mobile_phone: fullPhoneNumber
            ? String(parseInt(fullPhoneNumber.replace(/\D/g, '')))
            : undefined,
          country: formData.country_code || 'BR',
          state: formData.state || undefined,
          city: formData.city || undefined,
          preferred_language: formData.preferred_language || 'pt',
        });

        if (!result.success) {
          console.error('Erro ao salvar dados:', result.error);
          toast.error('Erro ao salvar informacoes', {
            description: 'Tente novamente.',
          });
          setLoading(false);
          return;
        }

        console.log('✅ [ONBOARDING] Perfil atualizado via UserManagementServiceV2');
      } catch (error) {
        console.error('Erro inesperado:', error);
        toast.error('Erro inesperado', {
          description: 'Tente novamente.',
        });
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Note: handleSubmit is no longer used since data is saved in step 2
  // and step 3 (plan selection) redirects to Stripe
  const handleSubmit = async () => {
    // This is now a no-op since the flow goes to Stripe Checkout
    // The onComplete callback will be called after successful payment
    // via the CheckoutSuccessPage
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Personal Data + Terms
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
                placeholder="Ex: Joao Silva Santos"
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
                placeholder="Ex: Joao, Joaozinho, JJ..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
              <span className="text-xs text-slate-500 mt-1">
                Escreva um nome amigavel para usarmos com voce
              </span>
            </label>

            {/* Terms Checkbox */}
            <div className="pt-4 border-t border-slate-700">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-5 w-5 rounded border-2 border-slate-600 bg-slate-800 peer-checked:border-purple-500 peer-checked:bg-purple-500 transition-colors">
                    {acceptedTerms && (
                      <svg
                        className="h-full w-full text-white p-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-slate-300">
                  Li e aceito os{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowTermsModal(true);
                    }}
                    className="text-purple-400 hover:text-purple-300 underline font-medium transition-colors"
                  >
                    Termos de Uso
                  </button>
                </span>
              </label>
            </div>
          </div>
        );

      case 1: {
        // Contact + Location
        const selectedCountry =
          getCountryConfig(formData.country_code || 'BR') || COUNTRIES[0];
        const selectedState = BRAZILIAN_STATES.find(
          (s) => s.code === formData.state,
        );

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
                          placeholder="Buscar pais..."
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

            {/* State Dropdown */}
            <label className="block text-left">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                Estado *
              </span>
              <div className="relative" ref={stateDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowStateDropdown(!showStateDropdown)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 transition-colors text-left"
                >
                  <span className="text-slate-100 flex-1">
                    {selectedState
                      ? `${selectedState.name} (${selectedState.code})`
                      : 'Selecione seu estado'}
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

                {showStateDropdown && (
                  <div
                    className={`absolute z-10 mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 shadow-xl transition-opacity duration-700 ${isClosingStateDropdown ? 'opacity-0' : 'opacity-100'}`}
                  >
                    <div className="p-2 border-b border-slate-700">
                      <input
                        type="text"
                        value={stateSearch}
                        onChange={(e) => setStateSearch(e.target.value)}
                        placeholder="Buscar estado..."
                        className="w-full px-3 py-2 rounded-md bg-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredStates.map((state) => (
                        <button
                          key={state.code}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleStateChange(state.code);
                          }}
                          className="flex items-center gap-3 w-full px-4 py-2 hover:bg-slate-700 transition-colors text-left"
                        >
                          <span className="text-slate-100 flex-1">
                            {state.name}
                          </span>
                          <span className="text-slate-400">{state.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </label>

            {/* City Dropdown */}
            <label className="block text-left">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                Cidade *
              </span>
              <div className="relative" ref={cityDropdownRef}>
                <button
                  type="button"
                  onClick={() => formData.state && setShowCityDropdown(!showCityDropdown)}
                  disabled={!formData.state}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-700 bg-slate-800/60 transition-colors text-left ${
                    formData.state
                      ? 'hover:bg-slate-700/60 cursor-pointer'
                      : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <span className="text-slate-100 flex-1">
                    {formData.city || (formData.state ? 'Selecione sua cidade' : 'Selecione o estado primeiro')}
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

                {showCityDropdown && formData.state && (
                  <div
                    className={`absolute z-10 mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 shadow-xl transition-opacity duration-700 ${isClosingCityDropdown ? 'opacity-0' : 'opacity-100'}`}
                  >
                    <div className="p-2 border-b border-slate-700">
                      <input
                        type="text"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        placeholder="Buscar cidade..."
                        className="w-full px-3 py-2 rounded-md bg-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCities.length > 0 ? (
                        filteredCities.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleCityChange(city);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 hover:bg-slate-700 transition-colors text-left"
                          >
                            <span className="text-slate-100 flex-1">
                              {city}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-slate-400 text-sm">
                          Nenhuma cidade encontrada
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        );
      }

      case 2: {
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

      case 3: // Plan Selection
        return (
          <PlanSelectionStep
            userEmail={user.email || ''}
            userId={user.id}
            countryCode={formData.country_code || 'BR'}
            onSuccess={onComplete}
          />
        );

      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  // Load user data when opening modal
  useEffect(() => {
    const loadUserData = async () => {
      if (!isOpen || !user.email) return;

      // Primeiro, preencher com dados do user_metadata (disponível imediatamente após signup)
      const metadataName = user.user_metadata?.full_name || user.user_metadata?.name || '';
      const metadataPreferredName = user.user_metadata?.preferred_name || '';

      try {
        // Use UserManagementServiceV2 (D1 Primary + Supabase Fallback)
        const result = await userManagementServiceV2.getUserProfile(user.email);

        if (!result.success || !result.data) {
          console.error('Erro ao carregar dados do usuario:', result.error);
          // Use user_metadata data as fallback
          setFormData((prev) => ({
            ...prev,
            name: metadataName,
            preferred_name: metadataPreferredName,
          }));
        } else {
          const data = result.data;
          // Fill form with database data, but prefer user_metadata for preferred_name
          // (pois o banco pode não ter sido atualizado ainda após signup)
          setFormData((prev) => ({
            ...prev,
            name: metadataName || data.name || '',
            preferred_name: metadataPreferredName || data.preferred_name || '',
            mobile_phone: data.mobile_phone ? String(data.mobile_phone) : '',
            country_code: data.country_code || 'BR',
            state: data.state || '',
            city: data.city || '',
            preferred_language: data.preferred_language || 'pt',
          }));
          console.log('✅ [ONBOARDING] Dados carregados via UserManagementServiceV2');
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Em caso de erro, usar dados do user_metadata
        setFormData((prev) => ({
          ...prev,
          name: metadataName,
          preferred_name: metadataPreferredName,
        }));
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
        stateDropdownRef.current &&
        !stateDropdownRef.current.contains(event.target as Node)
      ) {
        setShowStateDropdown(false);
      }
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCityDropdown(false);
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
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        disableClose={disableClose}
        title="Complete seu perfil"
        description="Para uma experiencia personalizada, precisamos de algumas informacoes."
        contentClassName="space-y-6"
      >
        {/* Progress Timeline */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">
              Etapa {currentStep + 1} de {steps.length}
            </span>
            <span className="text-sm text-slate-400">
              {Math.round(progressPercentage)}% concluido
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

        {/* Navigation - Hide on step 3 (plan selection) since it has its own button */}
        {currentStep !== 3 && (
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

            <button
              onClick={nextStep}
              disabled={!canProceed() || loading}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                !canProceed() || loading
                  ? 'bg-purple-400 text-white cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
              }`}
            >
              {loading ? 'Salvando...' : 'Proximo'}
            </button>
          </div>
        )}
      </Modal>

      {/* Terms Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </>
  );
}
