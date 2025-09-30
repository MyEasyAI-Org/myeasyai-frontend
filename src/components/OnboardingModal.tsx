import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

type OnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  user: User;
};

type FormData = {
  name?: string;
  mobile_phone?: string;
  country_code?: string;
  country?: string;
  postal_code?: string;
  address?: string;
  preferred_language?: string;
};

// Lista de países com códigos e bandeiras
const countryCodes = [
  { code: 'BR', dial: '+55', flag: '🇧🇷', name: 'Brasil', phoneFormat: '(##) #####-####', phoneLength: 11 },
  { code: 'US', dial: '+1', flag: '🇺🇸', name: 'Estados Unidos', phoneFormat: '(###) ###-####', phoneLength: 10 },
  { code: 'PT', dial: '+351', flag: '🇵🇹', name: 'Portugal', phoneFormat: '### ### ###', phoneLength: 9 },
  { code: 'ES', dial: '+34', flag: '🇪🇸', name: 'Espanha', phoneFormat: '### ## ## ##', phoneLength: 9 },
  { code: 'AR', dial: '+54', flag: '🇦🇷', name: 'Argentina', phoneFormat: '## ####-####', phoneLength: 10 },
  { code: 'MX', dial: '+52', flag: '🇲🇽', name: 'México', phoneFormat: '## #### ####', phoneLength: 10 },
  { code: 'CO', dial: '+57', flag: '🇨🇴', name: 'Colômbia', phoneFormat: '### ### ####', phoneLength: 10 },
  { code: 'FR', dial: '+33', flag: '🇫🇷', name: 'França', phoneFormat: '# ## ## ## ##', phoneLength: 9 },
  { code: 'DE', dial: '+49', flag: '🇩🇪', name: 'Alemanha', phoneFormat: '### ########', phoneLength: 11 },
  { code: 'IT', dial: '+39', flag: '🇮🇹', name: 'Itália', phoneFormat: '### ### ####', phoneLength: 10 },
];

const steps = [
  {
    id: 'personal',
    title: 'Dados Pessoais',
    description: 'Vamos começar com suas informações básicas'
  },
  {
    id: 'contact',
    title: 'Contato',
    description: 'Como podemos entrar em contato com você?'
  },
  {
    id: 'location',
    title: 'Localização',
    description: 'Onde você está localizado?'
  },
  {
    id: 'preferences',
    title: 'Preferências',
    description: 'Personalize sua experiência'
  }
];

export function OnboardingModal({ isOpen, onClose, onComplete, user }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: user.user_metadata?.full_name || user.user_metadata?.name || '',
    country_code: 'BR',
    country: 'BR',
    preferred_language: 'pt'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Função para capitalizar nomes
  const capitalizeName = (name: string): string => {
    // Lista de preposições que devem ficar em minúsculo (exceto se for a primeira palavra)
    const lowercaseWords = ['de', 'da', 'do', 'dos', 'das', 'e'];
    
    return name
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        // Se for a primeira palavra ou não estiver na lista de palavras em minúsculo
        if (index === 0 || !lowercaseWords.includes(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  };

  // Função para formatar telefone baseado no país
  const formatPhone = (phone: string, countryCode: string): string => {
    const country = countryCodes.find(c => c.code === countryCode);
    if (!country) return phone;

    // Remove todos os caracteres não numéricos
    const numbers = phone.replace(/\D/g, '');
    
    // Limita ao tamanho máximo do país
    const limitedNumbers = numbers.slice(0, country.phoneLength);
    
    // Aplica a formatação do país
    let formatted = '';
    let numberIndex = 0;
    
    for (let i = 0; i < country.phoneFormat.length && numberIndex < limitedNumbers.length; i++) {
      if (country.phoneFormat[i] === '#') {
        formatted += limitedNumbers[numberIndex];
        numberIndex++;
      } else {
        formatted += country.phoneFormat[i];
      }
    }
    
    return formatted;
  };

  // Handler para mudança de nome com capitalização automática
  const handleNameChange = (value: string) => {
    const capitalizedName = capitalizeName(value);
    setFormData(prev => ({ ...prev, name: capitalizedName }));
    if (value.trim().split(' ').length < 2) {
      setErrors(prev => ({ ...prev, name: 'Digite nome e sobrenome' }));
    } else {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  // Handler para mudança de telefone com formatação automática
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value, formData.country_code || 'BR');
    setFormData(prev => ({ ...prev, mobile_phone: formatted }));
    
    const country = countryCodes.find(c => c.code === formData.country_code);
    const numbers = value.replace(/\D/g, '');
    if (country && numbers.length < country.phoneLength) {
      setErrors(prev => ({ ...prev, mobile_phone: 'Telefone incompleto' }));
    } else {
      setErrors(prev => ({ ...prev, mobile_phone: undefined }));
    }
  };

  // Handler para mudança de país (código de telefone)
  const handleCountryCodeChange = (countryCode: string) => {
    setFormData(prev => ({ 
      ...prev, 
      country_code: countryCode,
      mobile_phone: '' // Limpa o telefone ao mudar de país
    }));
    setShowCountryDropdown(false);
  };

  // Validar se pode avançar para próximo passo
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: // Dados Pessoais
        return !!(formData.name && formData.name.trim().split(' ').length >= 2 && !errors.name);
      case 1: // Contato
        const country = countryCodes.find(c => c.code === formData.country_code);
        const numbers = (formData.mobile_phone || '').replace(/\D/g, '');
        return !!(country && numbers.length === country.phoneLength && !errors.mobile_phone);
      case 2: // Localização
        return !!(formData.country && formData.postal_code && formData.address);
      case 3: // Preferências
        return !!(formData.preferred_language);
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
    
    setLoading(true);
    try {
      const country = countryCodes.find(c => c.code === formData.country_code);
      const fullPhoneNumber = country ? `${country.dial} ${formData.mobile_phone}` : formData.mobile_phone;
      
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name || 'Usuário',
          mobile_phone: fullPhoneNumber ? parseInt(fullPhoneNumber.replace(/\D/g, '')) : null,
          country: formData.country,
          postal_code: formData.postal_code ? parseInt(formData.postal_code) : null,
          address: formData.address,
          preferred_language: formData.preferred_language || 'pt',
          last_online: new Date().toISOString()
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
      case 0: // Dados Pessoais
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
          </div>
        );

      case 1: // Contato
        const selectedCountry = countryCodes.find(c => c.code === formData.country_code) || countryCodes[0];
        return (
          <div className="space-y-4">
            <label className="block text-left">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                Telefone / WhatsApp *
              </span>
              <div className="flex gap-2">
                {/* Country Code Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center gap-2 px-3 py-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
                  >
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <span className="text-slate-100">{selectedCountry.dial}</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showCountryDropdown && (
                    <div className="absolute z-10 mt-1 w-64 rounded-lg border border-slate-700 bg-slate-800 shadow-xl max-h-60 overflow-y-auto">
                      {countryCodes.map(country => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleCountryCodeChange(country.code)}
                          className="flex items-center gap-3 w-full px-4 py-2 hover:bg-slate-700 transition-colors text-left"
                        >
                          <span className="text-xl">{country.flag}</span>
                          <span className="text-slate-100">{country.name}</span>
                          <span className="text-slate-400 ml-auto">{country.dial}</span>
                        </button>
                      ))}
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
                <span className="text-xs text-red-400 mt-1">{errors.mobile_phone}</span>
              )}
              
            </label>
          </div>
        );

      case 2: // Localização
        return (
          <div className="space-y-4">
            <label className="block text-left">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                País *
              </span>
              <select
                value={formData.country || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                <option value="">Selecione seu país</option>
                {countryCodes.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-left">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                CEP *
              </span>
              <input
                type="text"
                value={formData.postal_code || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setFormData(prev => ({ ...prev, postal_code: value }));
                }}
                placeholder="00000000"
                maxLength={8}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </label>

            <label className="block text-left">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                Endereço completo *
              </span>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Rua, número, bairro, cidade"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </label>
          </div>
        );

      case 3: // Preferências
        return (
          <div className="space-y-4">
            <label className="block text-left">
              <span className="mb-1 block text-sm font-medium text-slate-300">
                Idioma preferido *
              </span>
              <select
                value={formData.preferred_language || 'pt'}
                onChange={(e) => setFormData(prev => ({ ...prev, preferred_language: e.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              >
                <option value="pt">🇧🇷 Português</option>
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
                <option value="fr">🇫🇷 Français</option>
              </select>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showCountryDropdown) {
        setShowCountryDropdown(false);
      }
    };
    
    if (showCountryDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showCountryDropdown]);

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
