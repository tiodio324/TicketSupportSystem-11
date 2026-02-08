// User & Authentication Types

export type UserRole = 'customer' | 'agent' | 'admin';

export interface User {
  id?: string;
  role: UserRole;
  name?: string;
  email?: string;
}

export interface AuthCredentials {
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User;
  loginModalOpen: boolean;
}

export const ROLE_PERMISSIONS = {
  customer: {
    canViewTickets: true,
    canCreateTickets: true,
    canViewOwnTickets: true,
    canRespondToTickets: true,
    canManageTickets: false,
    canManageAgents: false,
    canManageCategories: false,
    canAccessAdmin: false,
  },
  agent: {
    canViewTickets: true,
    canCreateTickets: true,
    canViewOwnTickets: true,
    canRespondToTickets: true,
    canManageTickets: true,
    canManageAgents: false,
    canManageCategories: false,
    canAccessAdmin: false,
  },
  admin: {
    canViewTickets: true,
    canCreateTickets: true,
    canViewOwnTickets: true,
    canRespondToTickets: true,
    canManageTickets: true,
    canManageAgents: true,
    canManageCategories: true,
    canAccessAdmin: true,
  },
} as const;

export type RolePermissions = typeof ROLE_PERMISSIONS[UserRole];
