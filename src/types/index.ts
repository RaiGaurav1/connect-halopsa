export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'Active' | 'Inactive';
  priority: 'High' | 'Normal' | 'Low';
}

export interface Contact {
  contactId: string;
  phoneNumber: string;
  state: string;
  attributes?: Record<string, any>;
}

declare global {
  interface Window { connect: any; }
}
