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
  };
  contact(handler: (contact: any) => void): void;
}

declare global {
  interface Window {
    connect?: Connect;
  }
}

export {};