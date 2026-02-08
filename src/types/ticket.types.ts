// Ticket Types

export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  categoryId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  assignedAgentId?: string;
  messagesCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface TicketFormData {
  subject: string;
  description: string;
  priority: TicketPriority;
  categoryId: string;
  customerName: string;
  customerEmail: string;
}
