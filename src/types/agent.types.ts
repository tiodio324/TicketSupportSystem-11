// Agent Types

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  isOnline: boolean;
  assignedTicketsCount: number;
  resolvedTicketsCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentFormData {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
}
