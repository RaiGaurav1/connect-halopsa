// amazon-connect-streams.d.ts

interface Contact {
  onConnected(callback: () => void): void;
  onEnded(callback: () => void): void;
  getInitialConnection(): Connection;
  // Add other contact methods as needed
}

interface Connection {
  getEndpoint(): Endpoint | null;
  // Add other connection methods as needed
}

interface Endpoint {
  phoneNumber: string | null;
  // Add other endpoint properties as needed
}

interface Connect {
  core: {
    initCCP(container: HTMLElement, config: {
      ccpUrl: string;
      loginPopup: boolean;
      loginPopupAutoClose: boolean;
      region: string;
      softphone: {
        allowFramedSoftphone: boolean;
        disableRingtone: boolean;
      }
    }): void;
    onInitialized(callback: () => void): void;
  };
  contact(handler: (contact: Contact) => void): void;
}

declare global {
  interface Window {
    connect?: Connect;
  }
}

export {};