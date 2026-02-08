import { makeAutoObservable, runInAction } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { 
  Ticket, TicketFormData, TicketStatus,
  Message, MessageFormData,
  Agent, AgentFormData,
  Category, CategoryFormData,
  FilterParams 
} from '@/types';
import FirebaseService from '@/firebase';
import { authStore } from './AuthStore';

export class DataStore {
  tickets: Ticket[] = [];
  messages: Message[] = [];
  agents: Agent[] = [];
  categories: Category[] = [];

  ticketsLoading = false;
  messagesLoading = false;
  agentsLoading = false;
  categoriesLoading = false;

  error: string | null = null;
  filters: FilterParams = {};

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // === COMPUTED PROPERTIES ===

  get activeTickets(): Ticket[] {
    return this.tickets.filter(t => t.isActive).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  get openTickets(): Ticket[] {
    return this.activeTickets.filter(t => t.status === 'open' || t.status === 'in_progress' || t.status === 'pending');
  }

  get resolvedTickets(): Ticket[] {
    return this.activeTickets.filter(t => t.status === 'resolved' || t.status === 'closed');
  }

  get activeAgents(): Agent[] {
    return this.agents.filter(a => a.isActive).sort((a, b) => a.lastName.localeCompare(b.lastName, 'ru'));
  }

  get onlineAgents(): Agent[] {
    return this.activeAgents.filter(a => a.isOnline);
  }

  get activeCategories(): Category[] {
    return this.categories.filter(c => c.isActive).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }

  get filteredTickets(): Ticket[] {
    let result = this.activeTickets;
    
    if (this.filters.categoryId) result = result.filter(t => t.categoryId === this.filters.categoryId);
    if (this.filters.status) result = result.filter(t => t.status === this.filters.status);
    if (this.filters.priority) result = result.filter(t => t.priority === this.filters.priority);
    if (this.filters.agentId) result = result.filter(t => t.assignedAgentId === this.filters.agentId);
    if (this.filters.search) {
      const search = this.filters.search.toLowerCase();
      result = result.filter(t => t.subject.toLowerCase().includes(search) || t.description.toLowerCase().includes(search) || t.customerName.toLowerCase().includes(search));
    }
    
    return result;
  }

  get ticketsByStatus(): Record<TicketStatus, number> {
    return {
      open: this.activeTickets.filter(t => t.status === 'open').length,
      in_progress: this.activeTickets.filter(t => t.status === 'in_progress').length,
      pending: this.activeTickets.filter(t => t.status === 'pending').length,
      resolved: this.activeTickets.filter(t => t.status === 'resolved').length,
      closed: this.activeTickets.filter(t => t.status === 'closed').length,
    };
  }

  // === GET BY ID ===

  getTicketById = (id: string): Ticket | undefined => this.tickets.find(t => t.id === id);
  getAgentById = (id: string): Agent | undefined => this.agents.find(a => a.id === id);
  getCategoryById = (id: string): Category | undefined => this.categories.find(c => c.id === id);
  getMessagesForTicket = (ticketId: string): Message[] => this.messages.filter(m => m.ticketId === ticketId && m.isActive).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // === LOAD DATA ===

  loadAllData = async (): Promise<void> => {
    await Promise.all([this.loadTickets(), this.loadMessages(), this.loadAgents(), this.loadCategories()]);
  };

  loadTickets = async (): Promise<void> => {
    this.ticketsLoading = true;
    try {
      const data = await FirebaseService.getData<Record<string, Ticket>>('tickets');
      runInAction(() => { this.tickets = data ? Object.values(data) : []; this.ticketsLoading = false; });
    } catch { runInAction(() => { this.error = 'Ошибка загрузки тикетов'; this.ticketsLoading = false; }); }
  };

  loadMessages = async (): Promise<void> => {
    this.messagesLoading = true;
    try {
      const data = await FirebaseService.getData<Record<string, Message>>('messages');
      runInAction(() => { this.messages = data ? Object.values(data) : []; this.messagesLoading = false; });
    } catch { runInAction(() => { this.error = 'Ошибка загрузки сообщений'; this.messagesLoading = false; }); }
  };

  loadAgents = async (): Promise<void> => {
    this.agentsLoading = true;
    try {
      const data = await FirebaseService.getData<Record<string, Agent>>('agents');
      runInAction(() => { this.agents = data ? Object.values(data) : []; this.agentsLoading = false; });
    } catch { runInAction(() => { this.error = 'Ошибка загрузки агентов'; this.agentsLoading = false; }); }
  };

  loadCategories = async (): Promise<void> => {
    this.categoriesLoading = true;
    try {
      const data = await FirebaseService.getData<Record<string, Category>>('categories');
      runInAction(() => { this.categories = data ? Object.values(data) : []; this.categoriesLoading = false; });
    } catch { runInAction(() => { this.error = 'Ошибка загрузки категорий'; this.categoriesLoading = false; }); }
  };

  // === CRUD TICKETS ===

  createTicket = async (data: TicketFormData): Promise<Ticket | null> => {
    const now = new Date().toISOString();
    const ticket: Ticket = {
      id: uuidv4(),
      ...data,
      status: 'open',
      customerId: authStore.user.id || `customer_${Date.now()}`,
      messagesCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await FirebaseService.setData(`tickets/${ticket.id}`, ticket);
      runInAction(() => { this.tickets.push(ticket); });
      return ticket;
    } catch { return null; }
  };

  updateTicket = async (id: string, data: Partial<Ticket>): Promise<boolean> => {
    if (!authStore.canManageTickets()) return false;
    const index = this.tickets.findIndex(t => t.id === id);
    if (index === -1) return false;
    const updated: Ticket = { ...this.tickets[index], ...data, updatedAt: new Date().toISOString() };
    if (data.status === 'resolved' && !updated.resolvedAt) updated.resolvedAt = new Date().toISOString();
    try {
      await FirebaseService.setData(`tickets/${id}`, updated);
      runInAction(() => { this.tickets[index] = updated; });
      return true;
    } catch { return false; }
  };

  assignTicket = async (ticketId: string, agentId: string): Promise<boolean> => {
    return this.updateTicket(ticketId, { assignedAgentId: agentId, status: 'in_progress' });
  };

  closeTicket = async (id: string): Promise<boolean> => {
    return this.updateTicket(id, { status: 'closed' });
  };

  // === CRUD MESSAGES ===

  createMessage = async (data: MessageFormData, senderName: string): Promise<Message | null> => {
    const message: Message = {
      id: uuidv4(),
      ...data,
      senderType: authStore.isAgent ? 'agent' : 'customer',
      senderName,
      senderId: authStore.user.id || '',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    try {
      await FirebaseService.setData(`messages/${message.id}`, message);
      const ticketIndex = this.tickets.findIndex(t => t.id === data.ticketId);
      if (ticketIndex !== -1) {
        const newCount = this.tickets[ticketIndex].messagesCount + 1;
        await FirebaseService.updateData(`tickets/${data.ticketId}`, { messagesCount: newCount, updatedAt: new Date().toISOString() });
        runInAction(() => { this.tickets[ticketIndex].messagesCount = newCount; });
      }
      runInAction(() => { this.messages.push(message); });
      return message;
    } catch { return null; }
  };

  // === CRUD AGENTS ===

  createAgent = async (data: AgentFormData): Promise<Agent | null> => {
    if (!authStore.canManageAgents()) return null;
    const now = new Date().toISOString();
    const agent: Agent = { id: uuidv4(), ...data, isOnline: false, assignedTicketsCount: 0, resolvedTicketsCount: 0, isActive: true, createdAt: now, updatedAt: now };
    try {
      await FirebaseService.setData(`agents/${agent.id}`, agent);
      runInAction(() => { this.agents.push(agent); });
      return agent;
    } catch { return null; }
  };

  deleteAgent = async (id: string): Promise<boolean> => {
    if (!authStore.canManageAgents()) return false;
    const index = this.agents.findIndex(a => a.id === id);
    if (index === -1) return false;
    try {
      await FirebaseService.updateData(`agents/${id}`, { isActive: false });
      runInAction(() => { this.agents[index].isActive = false; });
      return true;
    } catch { return false; }
  };

  // === CRUD CATEGORIES ===

  createCategory = async (data: CategoryFormData): Promise<Category | null> => {
    if (!authStore.canManageCategories()) return null;
    const category: Category = { id: uuidv4(), ...data, isActive: true, createdAt: new Date().toISOString() };
    try {
      await FirebaseService.setData(`categories/${category.id}`, category);
      runInAction(() => { this.categories.push(category); });
      return category;
    } catch { return null; }
  };

  deleteCategory = async (id: string): Promise<boolean> => {
    if (!authStore.canManageCategories()) return false;
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return false;
    try {
      await FirebaseService.updateData(`categories/${id}`, { isActive: false });
      runInAction(() => { this.categories[index].isActive = false; });
      return true;
    } catch { return false; }
  };

  // === FILTERS ===

  setFilter = (key: keyof FilterParams, value: string | undefined): void => {
    this.filters = { ...this.filters, [key]: value };
  };

  clearFilters = (): void => { this.filters = {}; };
  clearError = (): void => { this.error = null; };
}

export const dataStore = new DataStore();
