/**
 * Ticket Service
 * Manages support tickets - creates, lists, and retrieves ticket data
 */

export type TicketCategory =
  | 'login_issues'
  | 'payment_billing'
  | 'bug_report'
  | 'feature_request'
  | 'myeasywebsite'
  | 'myeasycrm'
  | 'myeasycontent'
  | 'myeasyavatar'
  | 'myeasycode'
  | 'myeasyresume'
  | 'myeasylearning'
  | 'account_settings'
  | 'other';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high';

export interface Ticket {
  id: string;
  category: TicketCategory;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  userEmail: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  responses?: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  message: string;
  isStaff: boolean;
  authorName: string;
  createdAt: string;
}

export interface CreateTicketData {
  category: TicketCategory;
  subject: string;
  description: string;
  userEmail: string;
  userName: string;
}

// Local storage key for tickets (temporary solution until D1 is set up)
const TICKETS_STORAGE_KEY = 'myeasyai_support_tickets';

class TicketService {
  /**
   * Create a new support ticket
   */
  async createTicket(data: CreateTicketData): Promise<Ticket> {
    const ticket: Ticket = {
      id: this.generateTicketId(),
      category: data.category,
      subject: data.subject,
      description: data.description,
      status: 'open',
      priority: this.determinePriority(data.category),
      userEmail: data.userEmail,
      userName: data.userName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
    };

    // Save to local storage (temporary)
    const tickets = this.getTicketsFromStorage();
    tickets.unshift(ticket);
    this.saveTicketsToStorage(tickets);

    // Send email notification (in the future, this would call a Cloudflare Worker)
    await this.sendEmailNotification(ticket);

    console.log('[TicketService] Ticket created:', ticket.id);
    return ticket;
  }

  /**
   * Get all tickets for a user
   */
  async getUserTickets(userEmail: string): Promise<Ticket[]> {
    const tickets = this.getTicketsFromStorage();
    return tickets.filter(t => t.userEmail === userEmail);
  }

  /**
   * Get a specific ticket by ID
   */
  async getTicketById(ticketId: string, userEmail: string): Promise<Ticket | null> {
    const tickets = this.getTicketsFromStorage();
    return tickets.find(t => t.id === ticketId && t.userEmail === userEmail) || null;
  }

  /**
   * Add a response to a ticket (user reply)
   */
  async addResponse(ticketId: string, message: string, userEmail: string, userName: string): Promise<TicketResponse> {
    const tickets = this.getTicketsFromStorage();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId && t.userEmail === userEmail);

    if (ticketIndex === -1) {
      throw new Error('Ticket not found');
    }

    const response: TicketResponse = {
      id: `resp-${Date.now()}`,
      ticketId,
      message,
      isStaff: false,
      authorName: userName,
      createdAt: new Date().toISOString(),
    };

    if (!tickets[ticketIndex].responses) {
      tickets[ticketIndex].responses = [];
    }
    tickets[ticketIndex].responses!.push(response);
    tickets[ticketIndex].updatedAt = new Date().toISOString();

    this.saveTicketsToStorage(tickets);

    return response;
  }

  /**
   * Generate a unique ticket ID
   */
  private generateTicketId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TKT-${timestamp}-${random}`;
  }

  /**
   * Determine ticket priority based on category
   */
  private determinePriority(category: TicketCategory): TicketPriority {
    const highPriority: TicketCategory[] = ['login_issues', 'payment_billing', 'bug_report'];
    const mediumPriority: TicketCategory[] = ['account_settings', 'feature_request'];

    if (highPriority.includes(category)) return 'high';
    if (mediumPriority.includes(category)) return 'medium';
    return 'low';
  }

  /**
   * Send email notification for new ticket
   * This is a placeholder - will be replaced with Cloudflare Worker call
   */
  private async sendEmailNotification(ticket: Ticket): Promise<void> {
    // For now, we'll use mailto link approach or log to console
    // In production, this would call a Cloudflare Worker with email API
    console.log('[TicketService] Email notification would be sent to: gabrielfavera07@gmail.com');
    console.log('[TicketService] Ticket details:', {
      id: ticket.id,
      category: ticket.category,
      subject: ticket.subject,
      description: ticket.description,
      userEmail: ticket.userEmail,
      userName: ticket.userName,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
    });

    // Try to call email worker if available
    try {
      const emailWorkerUrl = import.meta.env.VITE_CLOUDFLARE_EMAIL_WORKER;
      if (emailWorkerUrl) {
        await fetch(emailWorkerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'gabrielfavera07@gmail.com',
            subject: `[Ticket ${ticket.id}] ${ticket.subject}`,
            html: this.formatEmailHtml(ticket),
          }),
        });
      }
    } catch (error) {
      console.warn('[TicketService] Could not send email notification:', error);
      // Don't throw - ticket was still created successfully
    }
  }

  /**
   * Format ticket as HTML email
   */
  private formatEmailHtml(ticket: Ticket): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #3b82f6); padding: 20px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Novo Ticket de Suporte</h1>
        </div>
        <div style="background: #1e293b; padding: 24px; border-radius: 0 0 12px 12px; color: #e2e8f0;">
          <p style="margin: 0 0 16px;"><strong style="color: #a78bfa;">ID:</strong> ${ticket.id}</p>
          <p style="margin: 0 0 16px;"><strong style="color: #a78bfa;">Categoria:</strong> ${ticket.category}</p>
          <p style="margin: 0 0 16px;"><strong style="color: #a78bfa;">Assunto:</strong> ${ticket.subject}</p>
          <p style="margin: 0 0 16px;"><strong style="color: #a78bfa;">Prioridade:</strong> ${ticket.priority}</p>
          <p style="margin: 0 0 16px;"><strong style="color: #a78bfa;">Usuario:</strong> ${ticket.userName} (${ticket.userEmail})</p>
          <hr style="border: none; border-top: 1px solid #475569; margin: 20px 0;">
          <p style="margin: 0 0 8px;"><strong style="color: #a78bfa;">Descricao:</strong></p>
          <div style="background: #0f172a; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${ticket.description}</div>
        </div>
      </div>
    `;
  }

  /**
   * Get tickets from local storage
   */
  private getTicketsFromStorage(): Ticket[] {
    try {
      const data = localStorage.getItem(TICKETS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save tickets to local storage
   */
  private saveTicketsToStorage(tickets: Ticket[]): void {
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  }

  /**
   * Get status display text in Portuguese
   */
  getStatusText(status: TicketStatus): string {
    const statusMap: Record<TicketStatus, string> = {
      open: 'Aberto',
      in_progress: 'Em andamento',
      resolved: 'Resolvido',
      closed: 'Fechado',
    };
    return statusMap[status];
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: TicketStatus): string {
    const colorMap: Record<TicketStatus, string> = {
      open: 'bg-blue-500/20 text-blue-400',
      in_progress: 'bg-yellow-500/20 text-yellow-400',
      resolved: 'bg-green-500/20 text-green-400',
      closed: 'bg-slate-500/20 text-slate-400',
    };
    return colorMap[status];
  }

  /**
   * Get priority color for UI
   */
  getPriorityColor(priority: TicketPriority): string {
    const colorMap: Record<TicketPriority, string> = {
      low: 'bg-slate-500/20 text-slate-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      high: 'bg-red-500/20 text-red-400',
    };
    return colorMap[priority];
  }
}

export const ticketService = new TicketService();
