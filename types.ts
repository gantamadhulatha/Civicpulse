
export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Address {
  city: string;
  state: string;
  district: string;
  pinCode: string;
}

export interface CivicIssue {
  id: string;
  description: string;
  image?: string;
  priority: Priority;
  aiSummary: string;
  aiReason: string;
  priorityScore: number;
  location: Location;
  address: Address;
  timestamp: number;
  status: 'Pending' | 'In Progress' | 'Resolved';
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AIAnalysis {
  priority: Priority;
  summary: string;
  reason: string;
  score: number;
}
