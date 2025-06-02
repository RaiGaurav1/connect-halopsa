// lambda/layer/nodejs/halopsa-client.js

const axios = require('axios');
const axiosRetry = require('axios-retry');

class HaloPSAClient {
  /**
   * config: { baseURL, clientId, clientSecret, tenantId }
   */
  constructor(config) {
    this.baseURL      = config.baseURL.replace(/\/+$/, ''); // trim trailing slash
    this.clientId     = config.clientId;
    this.clientSecret = config.clientSecret;
    this.tenantId     = config.tenantId;

    this.token        = null;
    this.tokenExpiry  = 0; // epoch ms

    // Create Axios instance with default headers
    this.client = axios.create({
      baseURL: `${this.baseURL}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant': this.tenantId
      }
    });

    // Retry logic: retry network errors & 429s up to 3 times
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
               (error.response && error.response.status === 429);
      }
    });

    this._setupInterceptors();
  }

  _setupInterceptors() {
    // Attach Authorization header if token valid
    this.client.interceptors.request.use(async (cfg) => {
      if (!this.token || Date.now() >= this.tokenExpiry) {
        await this._authenticate();
      }
      cfg.headers.Authorization = `Bearer ${this.token}`;
      return cfg;
    }, (error) => Promise.reject(error));

    // Refresh token on 401
    this.client.interceptors.response.use(
      (resp) => resp,
      async (error) => {
        if (error.response?.status === 401) {
          await this._authenticate();
          error.config.headers.Authorization = `Bearer ${this.token}`;
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  async _authenticate() {
    const payload = new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     this.clientId,
      client_secret: this.clientSecret,
      scope:         'all'
    }).toString();

    const resp = await axios.post(
      `${this.baseURL}/auth/token`,
      payload,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    this.token = resp.data.access_token;
    // expires_in is in seconds
    this.tokenExpiry = Date.now() + (resp.data.expires_in * 1000) - (60 * 1000);
    return this.token;
  }

  /**
   * Search for a customer by phone number.
   * Returns customer object or null.
   */
  async searchCustomerByPhone(phoneNumber) {
    const resp = await this.client.get('/Customers', {
      params: {
        search:     phoneNumber,
        searchtype: 'phone',
        count:      1
      }
    });
    const customers = resp.data.customers || [];
    return customers.length ? customers[0] : null;
  }

  /**
   * Create a call log (ticket) in HaloPSA.
   * callData: { phoneNumber, transcript, customerId, agentId, startTime, endTime }
   */
  async createCallLog(callData) {
    const body = {
      summary:      `Call from ${callData.phoneNumber}`,
      details:      callData.transcript || 'No transcript available',
      customer_id:  callData.customerId,
      category_id:  callData.categoryId || 1,    // default category
      type_id:      callData.typeId     || 26,   // call type
      agent_id:     callData.agentId,
      status_id:    callData.statusId   || 29,   // closed
      dateoccurred: callData.startTime,
      dateclosed:   callData.endTime
    };
    const resp = await this.client.post('/Tickets', body);
    return resp.data;
  }

  /**
   * Invalidate cache for a given customer in DynamoDB.
   * (To be invoked via webhook when customer.updated event is received).
   */
  async invalidateCustomerCache(customerId) {
    // This method will be implemented in the webhook handler
    // e.g., fetch phoneNumber by customerId, then delete item from CustomerCacheTable
    throw new Error('Not implemented');
  }
}

module.exports = HaloPSAClient;