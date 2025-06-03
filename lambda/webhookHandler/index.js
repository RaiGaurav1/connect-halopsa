const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const { HALO_CACHE_TABLE_NAME, WEBHOOK_API_KEY } = process.env;

exports.handler = async (event) => {
  // Validate webhook API key
  const apiKey = event.headers?.['x-api-key'] || event.headers?.['X-Api-Key'];
  if (!apiKey || apiKey !== WEBHOOK_API_KEY) {
    console.warn('Unauthorized webhook attempt');
    return { 
      statusCode: 401, 
      body: JSON.stringify({ error: 'Unauthorized' }) 
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    console.error('Invalid JSON payload', err);
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { event_type, customer_id } = body;
  if (!event_type || !customer_id) {
    return { 
      statusCode: 400, 
      body: JSON.stringify({ error: 'Missing required fields' }) 
    };
  }

  console.log('Webhook received:', event_type, 'for', customer_id);

  try {
    switch (event_type) {
      case 'customer.updated':
        await invalidateCustomerCache(customer_id);
        break;
      case 'ticket.created':
        // Optionally notify via SNS or send to frontend (not covered here)
        break;
      default:
        console.log('Unhandled webhook event:', event_type);
    }
    return { statusCode: 200, body: JSON.stringify({ received: true, event_type }) };
  } catch (err) {
    console.error('Error handling webhook:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) };
  }
};

async function invalidateCustomerCache(customerId) {
  // If you store the mapping { customerId → phoneNumber } in a separate table or in the cache item, query it
  const scanParams = {
    TableName: HALO_CACHE_TABLE_NAME,
    FilterExpression: 'customerId = :cid',
    ExpressionAttributeValues: { ':cid': customerId }
  };

  try {
    const scanResult = await ddb.scan(scanParams).promise();
    if (scanResult.Items && scanResult.Items.length) {
      for (const item of scanResult.Items) {
        const deleteParams = {
          TableName: HALO_CACHE_TABLE_NAME,
          Key: { phoneNumber: item.phoneNumber }
        };
        await ddb.delete(deleteParams).promise();
        console.log(`Invalidated cache for phoneNumber=${item.phoneNumber}`);
      }
      return { success: true, invalidated: scanResult.Items.length };
    } else {
      console.log(`No cache entry found for customerId=${customerId}`);
      return { success: true, invalidated: 0 };
    }
  } catch (err) {
    console.error('Error invalidating cache:', err);
    throw err;
  }
}
