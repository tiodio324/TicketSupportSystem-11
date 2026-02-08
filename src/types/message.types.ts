// Message Types

export type MessageSender = 'customer' | 'agent';

export interface Message {
  id: string;
  ticketId: string;
  content: string;
  senderType: MessageSender;
  senderName: string;
  senderId: string;
  isInternal: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface MessageFormData {
  ticketId: string;
  content: string;
  isInternal: boolean;
}
