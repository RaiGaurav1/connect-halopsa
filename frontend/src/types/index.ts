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

// Minimal type definitions for the Connect Streams API
export interface ConnectCore {
  initCCP: (
    container: HTMLElement,
    config: {
      ccpUrl: string;
      loginPopup: boolean;
      loginPopupAutoClose: boolean;
      region: string;
      softphone: {
        allowFramedSoftphone: boolean;
        disableRingtone: boolean;
      };
    }
  ) => void;
}

export interface Connect {
  core: ConnectCore;
  contact: (callback: (contact: any) => void) => void;
}

declare global {
  interface Window {
    connect?: Connect;
  }
}

export {};