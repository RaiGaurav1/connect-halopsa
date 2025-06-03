// src/services/connectService.ts
import axios, { AxiosResponse, AxiosError } from 'axios';
import { Customer, Connect, ConnectContact } from '../types';

// Define API response type for better type safety
interface CustomerLookupResponse {
  CustomerFound?: string | boolean;
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
      throw new Error('❌ VITE_CONNECT_INSTANCE_URL is not defined in environment variables.');
    }
    this.ccpUrl = ccpUrl;
  }

  /**
   * Initializes the Amazon Connect CCP and wires up contact event listeners.
   *
   * @param container  - The DOM element where CCP will be embedded.
   * @param onContactConnected - Callback that receives the caller's phone number.
   */
  initCCP(container: HTMLElement, onContactConnected: (phone: string) => void): void {
    if (this.initialized) {
      console.warn('⚠️ CCP is already initialized. Skipping.');
      return;
    }

    const connectObj = window.connect;
    if (!connectObj?.core) {
      console.error('❌ Amazon Connect Streams API is not loaded (window.connect.core missing).');
      return;
    }

    try {
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

      // Listen for any new contact (inbound or outbound)
      connectObj.contact((contact: ConnectContact) => {
        // onConnected fires when the agent accepts the call
        contact.onConnected(() => {
          try {
            const connection = contact.getInitialConnection();
            const endpoint = connection?.getEndpoint();
            const phone = endpoint?.phoneNumber || null;

            console.log('📞 Connect CCP: Contact connected, phone=', phone);
            if (phone) {
              onContactConnected(phone);
            } else {
              console.warn('⚠️ Contact connected but no phone number found.');
            }
          } catch (err) {
            console.error('❌ Error extracting phone from connected contact:', err);
          }
        });

        // Optionally handle call end
        contact.onEnded(() => {
          console.log('📴 Connect CCP: Contact ended');
        });
      });

      this.initialized = true;
      console.log('✅ CCP initialized');
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
      throw new Error('❌ VITE_API_URL is not defined in environment variables.');
    }

    try {
      const response: AxiosResponse<CustomerLookupResponse> = await axios.post(
        `${apiUrl}/customer-lookup-public`, 
        { phoneNumber }
      );
      
      const data = response.data;

      // Handle different formats of CustomerFound (boolean or string)
      const foundFlag = typeof data.CustomerFound === 'string' 
        ? data.CustomerFound.toLowerCase() === 'true'
        : Boolean(data.CustomerFound);
      
      if (foundFlag) {
        const customer: Customer = {
          id: String(data.CustomerId || ''),
          name: String(data.CustomerName || ''),
          email: String(data.CustomerEmail || ''),
          company: String(data.CustomerCompany || ''),
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
      const axiosError = error as AxiosError;
      console.error('❌ Error fetching customer:', axiosError.message || error);
      return null;
    }
  }

  /**
   * Validates status value and provides a default if invalid
   */
  private validateStatus(status?: string): 'Active' | 'Inactive' {
    return status === 'Active' ? 'Active' : 'Inactive';
  }

  /**
   * Validates priority value and provides a default if invalid
   */
  private validatePriority(priority?: string): 'High' | 'Normal' | 'Low' {
    if (priority === 'High') return 'High';
    if (priority === 'Low') return 'Low';
    return 'Normal';
  }
}

export default new ConnectService();