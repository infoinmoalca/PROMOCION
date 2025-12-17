
export enum ProjectStatus {
  PLANNING = 'En Planificación',
  ACTIVE = 'En Construcción',
  SALES = 'Comercialización',
  COMPLETED = 'Entregado'
}

export interface User {
  email: string;
  name: string;
  role: 'admin' | 'user';
  lastLogin: string;
}

export interface ProjectAction {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'Milestone' | 'Payment' | 'Construction' | 'Legal';
  amount?: number;
}

export interface Alert {
  id: string;
  title: string;
  date: string;
  type: 'License' | 'Meeting' | 'Deadline' | 'Other';
  isCompleted: boolean;
}

export interface Budget {
  id: string;
  concept: string;
  amount: number; // Estimated/Quoted amount
  actualAmount?: number; // Actual/Executed amount
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  providerId?: string; // Optional link to a specific provider
  documentId?: string; // Optional link to an uploaded quote/document
}

export interface Project {
  id: string;
  name: string;
  location: string;
  budget: number;
  actualCost: number;
  progress: number;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  stakeholderIds?: string[]; // IDs of providers/clients linked to this project
  actions?: ProjectAction[]; // History of events
  budgets?: Budget[]; // List of budgets/quotes
  alerts?: Alert[]; // List of reminders/alerts
}

export interface CashFlowItem {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface Stakeholder {
  id: string;
  name: string;
  type: 'Client' | 'Provider';
  activity?: string; // New field for business activity (e.g. Plumbing, Architecture)
  email: string;
  phone: string;
  address: string;
  taxId: string; // NIF/CIF
  notes?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'Invoice' | 'Blueprint' | 'Contract' | 'Other' | 'Budget';
  date: string;
  amount?: number;
  status: 'Processed' | 'Pending';
  url?: string; // For preview
  linkedEntityId?: string; // ID of project or stakeholder
  linkedEntityType?: 'Project' | 'Stakeholder' | 'None';
}

export interface FeasibilityParams {
  landCost: number;
  constructionCost: number;
  saleableArea: number;
  estimatedPricePerSqm: number;
  softCostsPercent: number; // Licenses, marketing, etc.
  durationMonths: number;
  financingRate: number;
}

export type ViewState = 'dashboard' | 'projects' | 'feasibility' | 'documents' | 'stakeholders' | 'settings';
