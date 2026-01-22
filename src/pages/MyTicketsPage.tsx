import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Inbox,
  MessageSquare,
  Plus,
  RefreshCw,
  Ticket,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../router';
import { authService } from '../services/AuthServiceV2';
import { ticketService, type Ticket as TicketType } from '../services/TicketService';

export function MyTicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  const user = authService.getCurrentUser();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const userTickets = await ticketService.getUserTickets(user?.email || '');
      setTickets(userTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'all') return true;
    if (filter === 'open') return ticket.status === 'open' || ticket.status === 'in_progress';
    if (filter === 'resolved') return ticket.status === 'resolved' || ticket.status === 'closed';
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-main to-blue-main">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-black-main/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
              <span className="font-semibold text-white">Meus Tickets</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Meus Tickets</h1>
            <p className="text-slate-400">Acompanhe suas solicitacoes de suporte</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadTickets}
              className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={() => navigate(ROUTES.SUPPORT_TICKET)}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/25"
            >
              <Plus className="h-4 w-4" />
              Novo Ticket
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'open', label: 'Abertos' },
            { value: 'resolved', label: 'Resolvidos' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as 'all' | 'open' | 'resolved')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter === tab.value
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.value === 'all' && ` (${tickets.length})`}
              {tab.value === 'open' && ` (${tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length})`}
              {tab.value === 'resolved' && ` (${tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length})`}
            </button>
          ))}
        </div>

        {/* Tickets List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <Inbox className="mx-auto mb-4 h-16 w-16 text-slate-600" />
            <h3 className="mb-2 text-lg font-semibold text-white">
              {filter === 'all'
                ? 'Nenhum ticket ainda'
                : filter === 'open'
                  ? 'Nenhum ticket aberto'
                  : 'Nenhum ticket resolvido'}
            </h3>
            <p className="mb-6 text-slate-400">
              {filter === 'all'
                ? 'Quando voce abrir um ticket de suporte, ele aparecera aqui.'
                : 'Nenhum ticket encontrado com este filtro.'}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => navigate(ROUTES.SUPPORT_TICKET)}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/25"
              >
                <Plus className="h-4 w-4" />
                Abrir Primeiro Ticket
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => {
                  // TODO: Navigate to ticket detail page
                  console.log('View ticket:', ticket.id);
                }}
                className="group w-full rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left transition-all hover:border-purple-500/50 hover:bg-slate-800/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-700 px-2 py-0.5 text-xs font-mono text-slate-300">
                        {ticket.id}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ticketService.getStatusColor(ticket.status)}`}>
                        {ticketService.getStatusText(ticket.status)}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ticketService.getPriorityColor(ticket.priority)}`}>
                        {ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Media' : 'Baixa'}
                      </span>
                    </div>
                    <h3 className="mb-1 font-semibold text-white group-hover:text-purple-300">
                      {ticket.subject}
                    </h3>
                    <p className="line-clamp-2 text-sm text-slate-400">
                      {ticket.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-purple-400" />
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(ticket.createdAt)}
                  </span>
                  {ticket.responses && ticket.responses.length > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {ticket.responses.length} {ticket.responses.length === 1 ? 'resposta' : 'respostas'}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
