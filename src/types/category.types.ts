// Category Types

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
  color: string;
}
