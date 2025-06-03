// src/types/index.ts

// Customer interface from HaloPSA
export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'Active' | 'Inactive';
  priority: 'High' | 'Normal' | 'Low';
}

// API response interface
export interface CustomerLookupResponse {
  statusCode?: number;
  CustomerFound: string | boolean;
  CustomerId?: string;
  CustomerName?: string;
  CustomerEmail?: string;
  CustomerCompany?: string;
  CustomerStatus?: string;
  Priority?: string;
  ErrorMessage?: string;
}

// Declare global window with connect property
declare global {
  interface Window {
    connect?: {
      core: {
        initCCP: (container: HTMLElement, config: any) => void;
      };
      contact: (handler: (contact: any) => void) => void;
    };
  }
}
