import {
  ArrowLeft,
  Check,
  MessageSquare,
  Palette,
  Send,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import type React from 'react';
import { FlagIcon } from './shared/FlagIcon';
import type { SectionKey, BusinessArea } from '../hooks/useSiteData';

type ChatPanelProps = {
  // Hooks
  conversation: any;
  site: any;
  colorPalettes: any;
  addressManagement: any;

  // Estados UI
  inputMessage: string;
  setInputMessage: (value: string) => void;
  showCountryDropdown: boolean;
  setShowCountryDropdown: (value: boolean) => void;
  showSummary: boolean;
  summaryMessageIndex: number | null;
  uploadedImages: string[];
  setUploadedImages: React.Dispatch<React.SetStateAction<string[]>>;
  isGenerating: boolean;
  showEditModal: boolean;
  setShowEditModal: (value: boolean) => void;
  editingField: string | null;
  setEditingField: (value: string | null) => void;

  // Handlers
  handleAreaSelect: (area: BusinessArea) => void;
  handleVibeSelect: (vibe: string) => void;
  handleSendMessage: () => void;
  handleColorCategorySelect: (category: string) => void;
  handlePaletteSelect: (palette: any) => void;
  handleSectionSelect: (section: string) => void;
  handleConfirmSections: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCustomColors: (description: string) => void;
  confirmAddress: () => void;
  correctAddress: () => void;
  openInputModal: (config: any) => void;
  goBack: () => void;
  handleGenerateSite: () => void;
  askSectionQuestions: () => void;

  // Refs
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

export function ChatPanel({
  conversation,
  site,
  colorPalettes,
  addressManagement,
  inputMessage,
  setInputMessage,
  showCountryDropdown,
  setShowCountryDropdown,
  showSummary,
  summaryMessageIndex,
  uploadedImages,
  setUploadedImages,
  isGenerating,
  showEditModal,
  setShowEditModal,
  editingField,
  setEditingField,
  handleAreaSelect,
  handleVibeSelect,
  handleSendMessage,
  handleColorCategorySelect,
  handlePaletteSelect,
  handleSectionSelect,
  handleConfirmSections,
  handleImageUpload,
  handleCustomColors,
  confirmAddress,
  correctAddress,
  openInputModal,
  goBack,
  handleGenerateSite,
  askSectionQuestions,
  fileInputRef,
  messagesEndRef,
}: ChatPanelProps) {
  return (
    <div className="w-[30%] border-r border-slate-800 bg-slate-900/50 flex flex-col">
      {/* Chat Header */}
      <div className="border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">
            Assistente de Criação
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map((message: any, index: number) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
                  : 'bg-slate-800 text-slate-100 border border-slate-700'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-400">
                    AI Assistant
                  </span>
                </div>
              )}
              <p
                className="text-sm leading-relaxed"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {message.content}
              </p>

              {message.options && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {message.options.map((option: any, idx: number) => {
                    const Icon = option.icon;
                    const isSelected =
                      conversation.currentStep === 5 &&
                      site.siteData.sections.includes(
                        option.value as SectionKey,
                      );
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (conversation.currentStep === 0) {
                            handleAreaSelect(option.value as BusinessArea);
                          } else if (conversation.currentStep === 3.5) {
                            handleVibeSelect(option.value);
                          } else if (conversation.currentStep === 4) {
                            handleColorCategorySelect(option.value);
                          } else if (conversation.currentStep === 5) {
                            handleSectionSelect(option.value);
                          } else if (option.value === 'more') {
                            // Adicionar mais imagens
                            fileInputRef.current?.click();
                          } else if (option.value === 'continue') {
                            // Continuar para próxima pergunta
                            askSectionQuestions();
                          }
                        }}
                        className={`flex items-center space-x-2 rounded-lg border p-3 text-left transition-colors ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                            : 'border-slate-600 bg-slate-700 hover:border-purple-500 hover:bg-slate-600 text-slate-300'
                        }`}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span className="text-xs font-medium">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Color Palettes Grid */}
              {message.showColorPalettes && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                    {(colorPalettes.generatedPalettes.length > 0
                      ? colorPalettes.generatedPalettes
                      : colorPalettes.getFilteredPalettes()
                    ).map((palette: any) => (
                      <button
                        key={palette.id}
                        onClick={() => handlePaletteSelect(palette)}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all hover:scale-105 ${
                          site.siteData.selectedPaletteId === palette.id
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-slate-600 bg-slate-700 hover:border-purple-500'
                        }`}
                      >
                        <div className="flex gap-1">
                          <div
                            className="w-4 h-8 rounded"
                            style={{ backgroundColor: palette.primary }}
                          ></div>
                          <div
                            className="w-4 h-8 rounded"
                            style={{ backgroundColor: palette.secondary }}
                          ></div>
                          <div
                            className="w-4 h-8 rounded"
                            style={{ backgroundColor: palette.accent }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-slate-200">
                          {palette.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Color Button */}
                  {message.showCustomColorButton && (
                    <div className="border-t border-slate-700 pt-4">
                      <button
                        onClick={() => {
                          openInputModal({
                            title: '💡 Descreva suas cores favoritas',
                            placeholder:
                              'Ex: azul e amarelo, roxo com rosa, verde e laranja...',
                            defaultValue: '',
                            onConfirm: (description: string) => {
                              handleCustomColors(description);
                            },
                            multiline: false,
                          });
                        }}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 transition-colors group"
                      >
                        <Palette className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-semibold text-purple-300">
                          💡 Ou clique aqui e descreva suas cores em uma
                          frase
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {message.requiresImages && (
                <div className="mt-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 py-3 text-sm font-semibold text-white hover:from-purple-600 hover:to-blue-700 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Fazer Upload de Imagens</span>
                  </button>
                  {uploadedImages.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Upload ${idx + 1}`}
                            className="w-full h-16 object-cover rounded"
                          />
                          <button
                            onClick={() => {
                              setUploadedImages((prev) =>
                                prev.filter((_, i) => i !== idx),
                              );
                              site.removeGalleryImage(idx);
                            }}
                            className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {message.options && conversation.currentStep === 5 && (
                <button
                  onClick={handleConfirmSections}
                  className="mt-4 w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-600 py-2 text-sm font-semibold text-white hover:from-purple-600 hover:to-blue-700 transition-colors"
                  disabled={site.siteData.sections.length === 0}
                >
                  Continuar ({site.siteData.sections.length} seções)
                </button>
              )}

              {/* Confirmação de Endereço com Google Maps */}
              {addressManagement.addressConfirmation &&
                message.role === 'assistant' &&
                index === conversation.messages.length - 1 && (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-lg overflow-hidden border-2 border-purple-500/30">
                      <iframe
                        src={`https://maps.google.com/maps?q=${addressManagement.addressConfirmation.lat},${addressManagement.addressConfirmation.lon}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        className="w-full h-48"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        title="Endereço no mapa"
                      />
                    </div>
                    <p className="text-xs text-slate-300">
                      📍 {addressManagement.addressConfirmation.formatted}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={confirmAddress}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 py-2 text-sm font-semibold text-white hover:from-green-600 hover:to-emerald-700 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        Confirmar
                      </button>
                      <button
                        onClick={correctAddress}
                        className="flex-1 rounded-lg border border-red-500 bg-red-500/10 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Corrigir
                      </button>
                    </div>
                  </div>
                )}

              {/* Resumo das Informações para Confirmação */}
              {showSummary &&
                message.role === 'assistant' &&
                index === summaryMessageIndex && (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-lg border-2 border-purple-500/30 bg-slate-900/50 overflow-hidden">
                      {/* Header do Resumo */}
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3">
                        <h3 className="text-white font-bold text-center flex items-center justify-center gap-2">
                          <Check className="h-5 w-5" />
                          Resumo das Suas Informações
                        </h3>
                      </div>

                      {/* Corpo do Resumo */}
                      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                        {/* Nome da Empresa */}
                        <div className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                          <div className="flex-1">
                            <p className="text-xs text-slate-400 mb-1">
                              Nome da Empresa
                            </p>
                            <p className="text-sm font-semibold text-white">
                              {site.siteData.name}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              openInputModal({
                                title: 'Editar Nome da Empresa',
                                placeholder: 'Digite o novo nome',
                                defaultValue: site.siteData.name,
                                onConfirm: (newValue: string) => {
                                  site.updateName(newValue);
                                },
                              });
                            }}
                            className="ml-2 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                          >
                            Editar
                          </button>
                        </div>

                        {/* Slogan */}
                        <div className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                          <div className="flex-1">
                            <p className="text-xs text-slate-400 mb-1">Slogan</p>
                            <p className="text-sm font-semibold text-white">
                              {site.siteData.slogan}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              openInputModal({
                                title: 'Editar Slogan',
                                placeholder: 'Digite o novo slogan',
                                defaultValue: site.siteData.slogan,
                                onConfirm: (newValue: string) => {
                                  site.updateSlogan(newValue);
                                },
                              });
                            }}
                            className="ml-2 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                          >
                            Editar
                          </button>
                        </div>

                        {/* Descrição */}
                        <div className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                          <div className="flex-1">
                            <p className="text-xs text-slate-400 mb-1">
                              Descrição
                            </p>
                            <p className="text-sm text-white line-clamp-3">
                              {site.siteData.description}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              openInputModal({
                                title: 'Editar Descrição',
                                placeholder: 'Digite a nova descrição',
                                defaultValue: site.siteData.description,
                                onConfirm: (newValue: string) => {
                                  site.updateDescription(newValue);
                                },
                                multiline: true,
                              });
                            }}
                            className="ml-2 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                          >
                            Editar
                          </button>
                        </div>

                        {/* Cores */}
                        {site.siteData.colors && (
                          <div className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                            <div className="flex-1">
                              <p className="text-xs text-slate-400 mb-2">
                                Paleta de Cores
                              </p>
                              <div className="flex gap-2">
                                {(() => {
                                  const colors = JSON.parse(site.siteData.colors);
                                  return (
                                    <>
                                      <div className="flex flex-col items-center gap-1">
                                        <div
                                          className="w-10 h-10 rounded-lg border-2 border-white/20"
                                          style={{
                                            backgroundColor: colors.primary,
                                          }}
                                        ></div>
                                        <span className="text-xs text-slate-400">
                                          Principal
                                        </span>
                                      </div>
                                      <div className="flex flex-col items-center gap-1">
                                        <div
                                          className="w-10 h-10 rounded-lg border-2 border-white/20"
                                          style={{
                                            backgroundColor: colors.secondary,
                                          }}
                                        ></div>
                                        <span className="text-xs text-slate-400">
                                          Secundária
                                        </span>
                                      </div>
                                      <div className="flex flex-col items-center gap-1">
                                        <div
                                          className="w-10 h-10 rounded-lg border-2 border-white/20"
                                          style={{
                                            backgroundColor: colors.accent,
                                          }}
                                        ></div>
                                        <span className="text-xs text-slate-400">
                                          Destaque
                                        </span>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setShowEditModal(true);
                                setEditingField('colors');
                              }}
                              className="ml-2 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                            >
                              Editar
                            </button>
                          </div>
                        )}

                        {/* Seções */}
                        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-slate-400">
                              Seções do Site
                            </p>
                            <button
                              onClick={() => {
                                setEditingField('sections');
                                setShowEditModal(true);
                              }}
                              className="px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                            >
                              Editar
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {site.siteData.sections.map((section: string) => (
                              <span
                                key={section}
                                className="px-2 py-1 rounded bg-purple-600/20 text-purple-300 text-xs font-medium"
                              >
                                {section}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Serviços */}
                        {site.siteData.services.length > 0 && (
                          <div className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                            <div className="flex-1">
                              <p className="text-xs text-slate-400 mb-1">
                                Serviços
                              </p>
                              <p className="text-sm text-white">
                                {site.siteData.services.join(', ')}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                openInputModal({
                                  title: 'Editar Serviços',
                                  placeholder:
                                    'Digite os serviços separados por vírgula',
                                  defaultValue: site.siteData.services.join(', '),
                                  onConfirm: (newValue: string) => {
                                    const servicesList = newValue
                                      .split(',')
                                      .map((s) => s.trim())
                                      .filter((s) => s);
                                    site.setServices(servicesList);
                                  },
                                });
                              }}
                              className="ml-2 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                            >
                              Editar
                            </button>
                          </div>
                        )}

                        {/* Galeria */}
                        {site.siteData.gallery.length > 0 && (
                          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                            <p className="text-xs text-slate-400 mb-2">
                              Imagens da Galeria
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              {site.siteData.gallery.map((img: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`Galeria ${idx + 1}`}
                                  className="w-full h-16 object-cover rounded"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Contato */}
                        {site.siteData.sections.includes('contact') && (
                          <>
                            {site.siteData.address && (
                              <div className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                <div className="flex-1">
                                  <p className="text-xs text-slate-400 mb-1">
                                    📍 Endereço
                                  </p>
                                  <p className="text-sm text-white">
                                    {site.siteData.address}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    openInputModal({
                                      title: 'Editar Endereço',
                                      placeholder: 'Digite o novo endereço',
                                      defaultValue: site.siteData.address,
                                      onConfirm: (newValue: string) => {
                                        site.updateAddress(newValue);
                                      },
                                    });
                                  }}
                                  className="ml-2 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                                >
                                  Editar
                                </button>
                              </div>
                            )}

                            {site.siteData.phone && (
                              <div className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                <div className="flex-1">
                                  <p className="text-xs text-slate-400 mb-1">
                                    📞 Telefone
                                  </p>
                                  <p className="text-sm text-white">
                                    {site.siteData.phone}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    openInputModal({
                                      title: 'Editar Telefone',
                                      placeholder: 'Digite o novo telefone',
                                      defaultValue: site.siteData.phone,
                                      onConfirm: (newValue: string) => {
                                        site.updatePhone(newValue);
                                      },
                                    });
                                  }}
                                  className="ml-2 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                                >
                                  Editar
                                </button>
                              </div>
                            )}

                            {site.siteData.email && (
                              <div className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                <div className="flex-1">
                                  <p className="text-xs text-slate-400 mb-1">
                                    ✉️ E-mail
                                  </p>
                                  <p className="text-sm text-white">
                                    {site.siteData.email}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    openInputModal({
                                      title: 'Editar E-mail',
                                      placeholder: 'Digite o novo e-mail',
                                      defaultValue: site.siteData.email,
                                      onConfirm: (newValue: string) => {
                                        site.updateEmail(newValue);
                                      },
                                    });
                                  }}
                                  className="ml-2 px-3 py-1 rounded-lg bg-purple-600/20 border border-purple-500 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition-colors"
                                >
                                  Editar
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Footer do Resumo */}
                      <div className="border-t border-slate-700 p-4 bg-slate-800/30">
                        <p className="text-xs text-slate-400 text-center">
                          ✨ Revise suas informações e use os botões "Editar"
                          para fazer correções
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Botões de Ação - Acima do Input */}
      {(conversation.conversationHistory.length > 0 || showSummary) && (
        <div className="border-t border-slate-800 px-4 pt-3 pb-2 space-y-2">
          {conversation.conversationHistory.length > 0 && (
            <button
              onClick={goBack}
              className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-purple-500/30 bg-purple-500/10 px-4 py-3 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/50 transition-all group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:translate-x-[-4px] transition-transform" />
              <span className="text-sm font-semibold">
                Voltar à pergunta anterior
              </span>
            </button>
          )}

          {showSummary && (
            <button
              onClick={() => {
                // NÃO esconder o resumo, apenas gerar o site
                handleGenerateSite();
              }}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-white font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/50"
            >
              <Check className="h-5 w-5" />
              <span>Confirmar e Gerar Site</span>
            </button>
          )}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-800 p-4">
        {conversation.currentStep === 8 ? (
          // Input especial para telefone com dropdown de país
          <div className="space-y-2">
            <p className="text-xs text-slate-400 text-center">
              💡 Selecione o país e digite o telefone
            </p>
            <div className="flex space-x-2">
              {/* Dropdown de País */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCountryDropdown(!showCountryDropdown);
                  }}
                  className="flex items-center gap-2 px-3 py-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
                >
                  <FlagIcon
                    countryCode={addressManagement.selectedCountry.code}
                    className="w-6 h-4"
                  />
                  <span className="text-slate-100 text-sm font-semibold">
                    {addressManagement.selectedCountry.dial}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`}
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

                {/* Dropdown Menu */}
                {showCountryDropdown && (
                  <div className="absolute bottom-full left-0 mb-2 w-80 max-h-96 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50">
                    <div className="p-2 border-b border-slate-700 bg-slate-900">
                      <p className="text-xs font-semibold text-purple-300">
                        🌍 Selecione o país
                      </p>
                    </div>
                    <div className="p-2 space-y-1">
                      {addressManagement.getAllCountries().map((country: any) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            addressManagement.selectCountry(country);
                            setShowCountryDropdown(false);
                            setInputMessage('');
                          }}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all hover:bg-purple-500/20 ${
                            addressManagement.selectedCountry.code === country.code
                              ? 'bg-purple-500/30 border border-purple-500'
                              : 'hover:bg-slate-700'
                          }`}
                        >
                          <FlagIcon
                            countryCode={country.code}
                            className="w-6 h-4 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {country.name}
                            </p>
                            <p className="text-xs text-slate-400">{country.dial}</p>
                          </div>
                          {addressManagement.selectedCountry.code === country.code && (
                            <Check className="h-4 w-4 text-purple-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input de Telefone */}
              <input
                type="tel"
                value={inputMessage}
                onChange={(e) => {
                  const formatted = addressManagement.formatPhoneNumber(
                    e.target.value,
                  );
                  setInputMessage(formatted);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Ex: ${addressManagement.selectedCountry.phoneFormat.replace(/#/g, '9')}`}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isGenerating}
                className="rounded-lg bg-purple-600 p-2 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          // Input padrão para outros steps
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Digite sua mensagem..."
              disabled={
                conversation.currentStep === 0 ||
                conversation.currentStep === 3.5 ||
                conversation.currentStep === 5 ||
                isGenerating
              }
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={
                !inputMessage.trim() ||
                conversation.currentStep === 0 ||
                conversation.currentStep === 3.5 ||
                conversation.currentStep === 5 ||
                isGenerating
              }
              className="rounded-lg bg-purple-600 p-2 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
