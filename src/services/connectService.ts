// src/services/connectService.ts
import axios from 'axios';
import { Customer, CustomerLookupResponse } from '../types';

class ConnectService {
  private ccpUrl: string;
  private initialized = false;

  constructor() {
    const ccpUrl = import.meta.env.VITE_CONNECT_INSTANCE_URL;
    if (!ccpUrl) {
      console.error('❌ VITE_CONNECT_INSTANCE_URL is not defined in environment variables.');
      // Use default URL for development, will be overridden in production
      this.ccpUrl = "https://your-instance.my.connect.aws/connect/ccp-v2/";
    } else {
      this.ccpUrl = ccpUrl as string;
    }
  }

  /**
   * Loads the Amazon Connect Streams API if not already loaded
   */
  private loadConnectAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      // If already loaded, resolve immediately
      if (window.connect?.core) {
        resolve();
        return;
      }

      // If script tag doesn't exist, create it
      if (!document.querySelector('script[src*="connect/ccp"]')) {
        const script = document.createElement('script');
        script.src = this.ccpUrl.replace('ccp-v2/', 'ccp-v2.js');
        script.async = true;
        
        script.onload = () => {
          console.log('✅ Amazon Connect Streams API loaded');
          // Wait a bit for the script to initialize
          setTimeout(() => {
            if (window.connect?.core) {
              resolve();
            } else {
              reject(new Error('Connect API loaded but connect.core not available'));
            }
          }, 500);
        };
        
        script.onerror = () => {
          reject(new Error('Failed to load Amazon Connect Streams API'));
        };
        
        document.head.appendChild(script);
      } else {
        // Script exists but API not loaded, wait for it
        let retries = 0;
        const maxRetries = 20;
        const interval = setInterval(() => {
          if (window.connect?.core) {
            clearInterval(interval);
            resolve();
            return;
          }
          
          retries++;
          if (retries >= maxRetries) {
            clearInterval(interval);
            reject(new Error('Timeout waiting for Amazon Connect Streams API to initialize'));
          }
        }, 250);
      }
    });
  }

  /**
   * Initializes the Amazon Connect CCP and wires up contact event listeners.
   *
   * @param container  - The DOM element where CCP will be embedded.
   * @param onContactConnected - Callback that receives the caller's phone number.
   */
  async initCCP(container: HTMLElement, onContactConnected: (phone: string) => void): Promise<void> {
    if (this.initialized) {
      console.warn('⚠️ CCP is already initialized. Skipping.');
      return;
    }

    try {
      await this.loadConnectAPI();

      // Initialize the CCP iframe
      if (window.connect?.core) {
        window.connect.core.initCCP(container, {
          ccpUrl: this.ccpUrl,
          loginPopup: true,
          loginPopupAutoClose: true,
          region: import.meta.env.VITE_CONNECT_REGION || 'ap-southeast-2',
          softphone: {
            allowFramedSoftphone: true,
            disableRingtone: false,
          },
        });

        // Listen for any new contact (inbound or outbound)
        if (window.connect) {
          window.connect.contact((contact: any) => {
            // onConnected fires when the agent accepts the call
            contact.onConnected(() => {
              try {
                const connection = contact.getInitialConnection();
                const endpoint = connection?.getEndpoint();
                const phone: string | null = endpoint?.phoneNumber ?? null;

                console.log('📞 Contact connected, phone:', phone);
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
              console.log('📴 Contact ended.');
            });
          });
        }

        this.initialized = true;
        console.log('✅ CCP initialized successfully.');
      } else {
        throw new Error('Connect API not available');
      }
    } catch (error) {
      console.error('❌ Failed to initialize CCP:', error);
      throw error; // Re-throw to allow UI to handle failure
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
      const response = await axios.post<CustomerLookupResponse>(`${apiUrl}/customer-lookup-public`, { phoneNumber });
      const data = response.data;

      // Some backends return booleans as strings—normalize by string comparison.
      const foundFlag = String(data?.CustomerFound ?? '').toLowerCase() === 'true';
      if (foundFlag) {
        const customer: Customer = {
          id: String(data.CustomerId || ''),
          name: String(data.CustomerName || ''),
          email: String(data.CustomerEmail || ''),
          company: String(data.CustomerCompany || ''),
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
      throw error;
    }
  }
}

export default new ConnectService();
