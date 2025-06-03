// Using ES modules (Node.js 20)
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';
import https from 'https';

// Initialize AWS SDK v3 clients
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const secretsClient = new SecretsManagerClient({});
const cloudwatchClient = new CloudWatchClient({});

// Environment variables
const {
  CACHE_TABLE_NAME,
  CACHE_TTL = '3600',
  MAX_RETRIES = '3',
  TIMEOUT_MS = '5000',
  HALO_SECRET_NAME
} = process.env;

const HTTPS_AGENT = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
  keepAliveMsecs: 30000,
});

// Global cache for secrets to avoid repeated calls
let _secretsCache = null;
let _secretsCacheExpiry = 0;

// Handler
export const handler = async (event, context) => {
  const startTime = Date.now();
  const metrics = { cacheHit: false, apiCall: false, success: false };

  try {
    const phoneNumber = extractPhoneNumber(event);
    if (!phoneNumber) {
      return createResponse(400, false, 'No phone number provided');
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    console.log('Looking up:', normalizedPhone);

    // 1. Check cache
    const cached = await getCachedCustomer(normalizedPhone);
    if (cached) {
      metrics.cacheHit = true;
      metrics.success = true;
      await publishMetrics(metrics, Date.now() - startTime);
      return createResponse(200, true, null, cached);
    }

    // 2. Fetch secrets & initialize HaloPSA client
    const secrets = await getSecrets();
    
    // 3. Lookup via HaloPSA API
    metrics.apiCall = true;
    const customer = await lookupCustomer(normalizedPhone, secrets);

    if (customer) {
      await putCache(normalizedPhone, customer);
      metrics.success = true;
      await publishMetrics(metrics, Date.now() - startTime);
      return createResponse(200, true, null, customer);
    } else {
      // Cache negative result for a short time (300s) to avoid hammering haloPSA
      await putNegativeCache(normalizedPhone);
      await publishMetrics(metrics, Date.now() - startTime);
      return createResponse(404, false, 'Customer not found');
    }
  } catch (err) {
    console.error('Error in CustomerLookup:', err);
    await publishMetrics(metrics, Date.now() - startTime);
    return createErrorResponse(err);
  }
};

function extractPhoneNumber(event) {
  // Amazon Connect format
  if (event.Details?.ContactData?.CustomerEndpoint?.Address) {
    return event.Details.ContactData.CustomerEndpoint.Address;
  }
  
  if (event.phoneNumber) {
    return event.phoneNumber;
  }
  
  if (event.Details?.Parameters?.PhoneNumber) {
    return event.Details.Parameters.PhoneNumber;
  }
  
  return null;
}

function normalizePhoneNumber(phone) {
  if (!phone) return null;
  let n = phone.toString().replace(/[^\d+]/g, '');
  if (n.startsWith('+')) return n;
  if (n.length === 10) return `+1${n}`;
  if (n.startsWith('1') && n.length === 11) return `+${n}`;
  if (n.startsWith('00')) return `+${n.substring(2)}`;
  return `+${n}`;
}

async function getCachedCustomer(phone) {
  try {
    const cmd = new GetCommand({
      TableName: CACHE_TABLE_NAME,
      Key: { phoneNumber: phone }
    });
    
    const resp = await docClient.send(cmd);
    if (resp.Item && resp.Item.ttl > Math.floor(Date.now() / 1000)) {
      console.log('Cache hit:', phone);
      return resp.Item.customerData;
    }
  } catch (err) {
    console.warn('Cache lookup failed:', err);
  }
  
  return null;
}

async function putCache(phone, customerData) {
  try {
    const cmd = new PutCommand({
      TableName: CACHE_TABLE_NAME,
      Item: {
        phoneNumber: phone,
        customerData,
        ttl: Math.floor(Date.now() / 1000) + parseInt(CACHE_TTL),
        lastUpdated: new Date().toISOString()
      }
    });
    
    await docClient.send(cmd);
    console.log('Cached customer:', phone);
  } catch (err) {
    console.warn('Failed to put cache:', err);
  }
}

async function putNegativeCache(phone) {
  try {
    const cmd = new PutCommand({
      TableName: CACHE_TABLE_NAME,
      Item: {
        phoneNumber: phone,
        customerData: null,
        ttl: Math.floor(Date.now() / 1000) + 300,
        lastUpdated: new Date().toISOString()
      }
    });
    
    await docClient.send(cmd);
    console.log('Cached negative result for:', phone);
  } catch (err) {
    console.warn('Failed to put negative cache:', err);
  }
}

async function getSecrets() {
  const now = Date.now();
  if (_secretsCache && now < _secretsCacheExpiry) {
    return _secretsCache;
  }
  
  try {
    const cmd = new GetSecretValueCommand({ SecretId: HALO_SECRET_NAME });
    const resp = await secretsClient.send(cmd);
    _secretsCache = JSON.parse(resp.SecretString);
    _secretsCacheExpiry = now + (5 * 60 * 1000); // 5 minutes
    return _secretsCache;
  } catch (err) {
    err.name = 'SecretsManagerError';
    throw err;
  }
}

async function lookupCustomer(phoneNumber, secrets) {
  // Implement actual API call to HaloPSA
  // This is a simplified example
  try {
    const response = await fetch(`${secrets.apiBaseUrl}/customers?search=${phoneNumber}&searchtype=phone&count=1`, {
      headers: {
        'Authorization': `Bearer ${secrets.token}`,
        'Content-Type': 'application/json',
        'X-Tenant': secrets.tenantId
      }
    });
    
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    const customers = data.customers || [];
    return customers.length ? customers[0] : null;
  } catch (err) {
    console.error('HaloPSA API error:', err);
    throw err;
  }
}

async function publishMetrics(metrics, duration) {
  try {
    const cmd = new PutMetricDataCommand({
      Namespace: 'ConnectHaloPSA',
      MetricData: [
        { MetricName: 'LookupDuration', Value: duration, Unit: 'Milliseconds', Timestamp: new Date() },
        { MetricName: 'LookupCacheHit', Value: metrics.cacheHit ? 1 : 0, Unit: 'Count', Timestamp: new Date() },
        { MetricName: 'LookupSuccess', Value: metrics.success ? 1 : 0, Unit: 'Count', Timestamp: new Date() },
        { MetricName: 'LookupAPICall', Value: metrics.apiCall ? 1 : 0, Unit: 'Count', Timestamp: new Date() }
      ]
    });
    
    await cloudwatchClient.send(cmd);
  } catch (err) {
    console.warn('Failed to publish metrics:', err);
  }
}

function createResponse(statusCode, found, errorMsg, customerData = {}) {
  const resp = { statusCode, CustomerFound: found ? 'true' : 'false' };
  
  if (errorMsg) resp.ErrorMessage = errorMsg;
  
  if (found && customerData) {
    Object.entries(customerData).forEach(([k,v]) => {
      if (v !== null && v !== undefined) {
        resp[k.charAt(0).toUpperCase() + k.slice(1)] = String(v);
      }
    });
  }
  
  return resp;
}

function createErrorResponse(err) {
  switch (err.name) {
    case 'SecretsManagerError':
      return createResponse(500, false, 'Configuration error');
    case 'AuthenticationError':
      return createResponse(401, false, 'Authentication failed');
    case 'TimeoutError':
      return createResponse(504, false, 'Request timed out');
    default:
      return createResponse(500, false, 'Internal server error');
  }
}
