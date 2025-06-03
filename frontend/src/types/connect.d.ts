// src/services/connectService.ts
import axios, { AxiosResponse } from 'axios';
import { Customer } from '../types';

// Better Amazon Connect types
interface Endpoint {
  phoneNumber?: string | null;
}

interface Connection {
  getEndpoint(): Endpoint | null;
}

interface ConnectContact {
  getInitialConnection(): Connection | null;
  onConnected(callback: () => void): void;
  onEnded(callback: () => void): void;
}

interface ConnectCore {
  initCCP(
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
  ): void;
}

interface Connect {
  core: ConnectCore;
  contact(handler: (contact: ConnectContact) => void): void;
}

// API response interface
interface CustomerLookupResponse {
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

class ConnectService {
  private ccpUrl: string;
  private initialized = false;

  constructor() {
    const ccpUrl = import.meta.env.VITE_CONNECT_INSTANCE_URL as string | undefined;
    if (!ccpUrl) {
      console.error('❌ VITE_CONNECT_INSTANCE_URL is not defined in environment variables.');
      this.ccpUrl = ''; // Default empty but initialized
    } else {
      this.ccpUrl = ccpUrl;
    }
  }

  /**
   * Initializes the Amazon Connect CCP and wires up contact event listeners.
   *
   * @param container - The DOM element where CCP will be embedded.
   * @param onContactConnected - Callback that receives the caller's phone number.
   */
  initCCP(container: HTMLElement, onContactConnected: (phone: string) => void): void {
    if (this.initialized) {
      console.warn('⚠️ CCP is already initialized. Skipping.');
      return;
    }

    if (!this.ccpUrl) {
      console.error('❌ CCP URL is not configured.');
      return;
    }

    // Check if Amazon Connect Streams API is loaded
    const connectObj = window.connect as Connect | undefined;
    if (!connectObj?.core) {
      console.error('❌ Amazon Connect Streams API is not loaded (window.connect.core missing).');
      return;
    }

    try {
      // Initialize the CCP iframe
      connectObj.core.initCCP(container, {
        ccpUrl: this.ccpUrl,
        loginPopup: true,
        loginPopupAutoClose: true,
        region: (import.meta.env.VITE_CONNECT_REGION as string) || 'ap-southeast-2',
        softphone: {
          allowFramedSoftphone: true,
          disableRingtone: false,
        },
      });

      // Set up contact handler
      connectObj.contact((contact: ConnectContact) => {
        // onConnected fires when the agent accepts the call
        contact.onConnected(() => {
          try {
            // Extract phone number from contact
            const connection = contact.getInitialConnection();
            const endpoint = connection?.getEndpoint();
            const phone = endpoint?.phoneNumber || null;

            if (phone) {
              console.log('📞 Contact connected, phone:', phone);
              onContactConnected(phone);
            } else {
              console.warn('⚠️ Contact connected but no phone number found.');
            }
          } catch (err) {
            console.error('❌ Error extracting phone from connected contact:', err);
          }
        });

        // Handle call end
        contact.onEnded(() => {
          console.log('📴 Contact ended.');
        });
      });

      this.initialized = true;
      console.log('✅ CCP initialized successfully.');
    } catch (error) {
      console.error('❌ Failed to initialize CCP:', error);
    }
  }

  /**
   * Fetches customer details from your backend by phone number.
   *
   * @param phoneNumber - E.164 phone number string
   * @returns Promise<Customer | null>
   */
  async fetchCustomer(phoneNumber: string): Promise<Customer | null> {
    const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
    if (!apiUrl) {
      console.error('❌ VITE_API_URL is not defined in environment variables.');
      return null;
    }

    try {
      const response: AxiosResponse<CustomerLookupResponse> = await axios.post(
        `${apiUrl}/customer-lookup-public`, 
        { phoneNumber }
      );
      
      const data = response.data;

      // Check if customer was found - handle different response formats
      const isFound = typeof data.CustomerFound === 'string' 
        ? data.CustomerFound.toLowerCase() === 'true'
        : !!data.CustomerFound;

      if (isFound && data.CustomerId) {
        // Create customer object with proper type safety
        const customer: Customer = {
          id: data.CustomerId || '',
          name: data.CustomerName || '',
          email: data.CustomerEmail || '',
          company: data.CustomerCompany || '',
          status: this.validateStatus(data.CustomerStatus),
          priority: this.validatePriority(data.Priority),
        };
        console.log('✅ Customer found:', customer);
        return customer;
      } else {
        console.log(`ℹ️ No customer found for phone: ${phoneNumber}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching customer:', error);
      return null;
    }
  }

  /**
   * Validates and normalizes the customer status
   */
  private validateStatus(status?: string): 'Active' | 'Inactive' {
    if (status === 'Active') return 'Active';
    return 'Inactive'; // Default
  }

  /**
   * Validates and normalizes the priority
   */
  private validatePriority(priority?: string): 'High' | 'Normal' | 'Low' {
    if (priority === 'High') return 'High';
    if (priority === 'Low') return 'Low';
    return 'Normal'; // Default
  }
}

export default new ConnectService();