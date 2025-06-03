// src/services/connectService.ts
import axios from 'axios';
import { Customer } from '../types';

class ConnectService {
  private ccpUrl: string;
  private initialized = false;

  constructor() {
    const ccpUrl = import.meta.env.VITE_CONNECT_INSTANCE_URL;
    if (!ccpUrl) {
      throw new Error('❌ VITE_CONNECT_INSTANCE_URL is not defined in environment variables.');
    }
    this.ccpUrl = ccpUrl;
  }

  /**
   * Initializes the Amazon Connect CCP and wires up contact event listeners.
   *
   * @param container  - The DOM element where CCP will be embedded.
   * @param onContactConnected - Callback that receives the caller’s phone number.
   */
  initCCP(container: HTMLElement, onContactConnected: (phone: string) => void): void {
    if (this.initialized) {
      console.warn('⚠️ CCP is already initialized. Skipping.');
      return;
    }

    if (!window.connect?.core) {
      console.error('❌ Amazon Connect Streams API is not loaded (window.connect.core missing).');
      return;
    }

    try {
      window.connect.core.initCCP(container, {
        ccpUrl: this.ccpUrl,
        loginPopup: true,
        loginPopupAutoClose: true,
        region: import.meta.env.VITE_CONNECT_REGION || 'us-east-1',
        softphone: {
          allowFramedSoftphone: true,
          disableRingtone: false,
        },
      });

      // Listen for any new contact (inbound or outbound)
      window.connect.contact((contact: any) => {
        // onConnected fires when the agent accepts the call
        contact.onConnected(() => {
          try {
            const connection = contact.getInitialConnection();
            const endpoint = connection?.getEndpoint();
            const phone: string | null = endpoint?.phoneNumber ?? null;

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
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      throw new Error('❌ VITE_API_URL is not defined in environment variables.');
    }

    try {
      const response = await axios.post(`${apiUrl}/customer-lookup-public`, { phoneNumber });
      // Cast response.data to 'any' so TS knows its shape:
      const data: any = response.data;

      const foundFlag = String(data?.CustomerFound ?? '').toLowerCase() === 'true';
      if (foundFlag) {
        const customer: Customer = {
          id: String(data.CustomerId),
          name: String(data.CustomerName),
          email: String(data.CustomerEmail),
          company: String(data.CustomerCompany),
          status: (data.CustomerStatus as 'Active' | 'Inactive') || 'Inactive',
          priority: (data.Priority as 'High' | 'Normal' | 'Low') || 'Normal',
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
}

export default new ConnectService();