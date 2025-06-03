// src/types/index.ts

// Customer interface from HaloPSA
export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'Active' | 'Inactive';
  priority: 'High' | 'Normal' | 'Low';
  // Additional fields you might want to include:
  phone?: string;
  lastContact?: string;
  accountManager?: string;
}

// Amazon Connect contact
export interface Contact {
  contactId: string;
  phoneNumber: string;
  state: 'INCOMING' | 'CONNECTING' | 'CONNECTED' | 'ENDED' | string;
  attributes?: Record<string, string>;
  queue?: string;
  duration?: number;
  agentId?: string;
  initiationTimestamp?: string;
  disconnectTimestamp?: string;
}

// Amazon Connect streams API types
export interface Connection {
  getEndpoint(): Endpoint | null;
  getType(): string;
  getState(): ConnectionState;
}

export interface Endpoint {
  phoneNumber: string | null;
  type: 'TELEPHONE' | 'AGENT' | string;
}

export type ConnectionState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';

export interface ConnectContact {
  getContactId(): string;
  getInitialConnection(): Connection | null;
  getQueue(): string | null;
  getState(): ContactState;
  onConnected(callback: () => void): void;
  onEnded(callback: () => void): void;
  getAttributes(): Record<string, { name: string; value: string }> | null;
}

export type ContactState = 'INCOMING' | 'CONNECTING' | 'CONNECTED' | 'ENDED';

// Agent interfaces
export interface AgentState {
  name: string;
  startTimestamp: Date;
  type: string;
}

export interface AgentConfiguration {
  name: string;
  username: string;
  userId: string;
  extension: string;
}

export interface Agent {
  getState(): AgentState;
  getConfiguration(): AgentConfiguration;
  onStateChange(callback: (state: AgentState) => void): void;
}

export interface Connect {
  core: {
    initCCP(container: HTMLElement, config: {
      ccpUrl: string;
      loginPopup?: boolean;
      loginPopupAutoClose?: boolean;
      region: string;
      softphone?: {
        allowFramedSoftphone: boolean;
        disableRingtone?: boolean;
      };
    }): void;
    onInitialized(callback: () => void): void;
  };
  contact(handler: (contact: ConnectContact) => void): void;
  agent(handler: (agent: Agent) => void): void;
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

// Global window declaration with proper Connect typing
declare global {
  interface Window { 
    connect?: Connect;
  }
}