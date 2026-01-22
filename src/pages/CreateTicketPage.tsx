import {
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  Loader2,
  MessageSquare,
  Send,
  Ticket,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../router';
import { authService } from '../services/AuthServiceV2';
import { ticketService, type TicketCategory } from '../services/TicketService';

const TICKET_CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: 'login_issues', label: 'Problemas para fazer login' },
  { value: 'payment_billing', label: 'Pagamento ou cobranca' },
  { value: 'bug_report', label: 'Reportar um bug/erro' },
  { value: 'feature_request', label: 'Sugestao de funcionalidade' },
  { value: 'myeasywebsite', label: 'Duvidas sobre MyEasyWebsite' },
  { value: 'myeasycrm', label: 'Duvidas sobre MyEasyCRM' },
  { value: 'myeasycontent', label: 'Duvidas sobre MyEasyContent' },
  { value: 'myeasyavatar', label: 'Duvidas sobre MyEasyAvatar' },
  { value: 'myeasycode', label: 'Duvidas sobre MyEasyCode' },
  { value: 'myeasyresume', label: 'Duvidas sobre MyEasyResume' },
  { value: 'myeasylearning', label: 'Duvidas sobre MyEasyLearning' },
  { value: 'account_settings', label: 'Configuracoes da conta' },
  { value: 'other', label: 'Outro assunto' },
];

export function CreateTicketPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<TicketCategory | ''>('');
  const [customSubject, setCustomSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const user = authService.getCurrentUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !description.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const subject = category === 'other'
        ? customSubject.trim() || 'Outro assunto'
        : TICKET_CATEGORIES.find(c => c.value === category)?.label || category;

      await ticketService.createTicket({
        category,
        subject,
        description: description.trim(),
        userEmail: user?.email || 'unknown',
        userName: user?.name || user?.email || 'Usuario',
      });

      setIsSuccess(true);
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Erro ao criar ticket. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = TICKET_CATEGORIES.find(c => c.value === category);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-black-main/80 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <button
                onClick={() => navigate(ROUTES.SUPPORT)}
                className="flex items-center space-x-2 rounded-lg bg-slate-800 px-4 py-2 text-white transition-colors hover:bg-slate-700"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Voltar ao Suporte</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 rounded-full bg-green-500/20 p-6">
              <CheckCircle className="h-16 w-16 text-green-400" />
            </div>
            <h1 className="mb-4 text-3xl font-bold text-white">
              Ticket Enviado com Sucesso!
            </h1>
            <p className="mb-8 max-w-md text-slate-400">
              Recebemos sua solicitacao e responderemos em breve por email.
              Voce tambem pode acompanhar o status do seu ticket na Central de Suporte.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate(ROUTES.SUPPORT)}
                className="rounded-lg bg-slate-800 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-700"
              >
                Voltar ao Suporte
              </button>
              <button
                onClick={() => navigate(ROUTES.SUPPORT_TICKETS)}
                className="rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/25"
              >
                Ver Meus Tickets
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-black-main/80 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={() => navigate(ROUTES.SUPPORT)}
              className="flex items-center space-x-2 rounded-lg bg-slate-800 px-4 py-2 text-white transition-colors hover:bg-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Voltar ao Suporte</span>
            </button>
            <div className="flex items-center space-x-3">
              <Ticket className="h-6 w-6 text-purple-400" />
              <span className="font-semibold text-white">Abrir Ticket</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">
            Como podemos ajudar?
          </h1>
          <p className="text-slate-400">
            Descreva seu problema ou duvida e nossa equipe respondera o mais rapido possivel.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info (Read Only) */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
              Enviando como
            </p>
            <p className="font-medium text-white">{user?.name || user?.email}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Qual e o assunto? *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex w-full items-center justify-between rounded-xl border bg-slate-800/50 px-4 py-3 text-left transition-all ${
                  isDropdownOpen ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-700'
                }`}
              >
                <span className={selectedCategory ? 'text-white' : 'text-slate-500'}>
                  {selectedCategory?.label || 'Selecione uma categoria'}
                </span>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 shadow-xl">
                  {TICKET_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        setCategory(cat.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-700 ${
                        category === cat.value ? 'bg-purple-500/20 text-purple-300' : 'text-slate-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom Subject (only for "other") */}
          {category === 'other' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Assunto personalizado
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Descreva brevemente o assunto"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-white">
              Descreva seu problema ou duvida *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Conte com detalhes o que esta acontecendo. Quanto mais informacoes, mais rapido podemos ajudar!"
              rows={6}
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <p className="mt-1 text-right text-xs text-slate-500">
              {description.length}/2000 caracteres
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!category || !description.trim() || isSubmitting}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 font-semibold transition-all ${
              !category || !description.trim() || isSubmitting
                ? 'cursor-not-allowed bg-slate-700 text-slate-500'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Enviar Ticket
              </>
            )}
          </button>

          <p className="text-center text-sm text-slate-500">
            Responderemos por email em ate 24 horas uteis.
          </p>
        </form>
      </main>
    </div>
  );
}
