// Navigation Types

export type PageId = 'home' | 'tickets' | 'agents' | 'customers' | 'admin' | 'admin-tickets' | 'admin-agents';

export interface PageConfig {
  id: PageId;
  title: string;
  icon: string;
  requiresAuth: boolean;
  requiredRole?: 'agent' | 'admin';
  showInNav: boolean;
  parentId?: PageId;
}

export const PAGES_CONFIG: Record<PageId, PageConfig> = {
  home: { id: 'home', title: 'Главная', icon: 'home', requiresAuth: false, showInNav: true },
  tickets: { id: 'tickets', title: 'Тикеты', icon: 'ticket', requiresAuth: false, showInNav: true },
  agents: { id: 'agents', title: 'Агенты', icon: 'headphones', requiresAuth: true, requiredRole: 'agent', showInNav: true },
  customers: { id: 'customers', title: 'Клиенты', icon: 'users', requiresAuth: true, requiredRole: 'agent', showInNav: true },
  admin: { id: 'admin', title: 'Управление', icon: 'settings', requiresAuth: true, requiredRole: 'admin', showInNav: true },
  'admin-tickets': { id: 'admin-tickets', title: 'Тикеты', icon: 'ticket', requiresAuth: true, requiredRole: 'admin', showInNav: false, parentId: 'admin' },
  'admin-agents': { id: 'admin-agents', title: 'Агенты', icon: 'headphones', requiresAuth: true, requiredRole: 'admin', showInNav: false, parentId: 'admin' },
};
