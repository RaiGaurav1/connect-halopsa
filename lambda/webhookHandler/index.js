const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();
const { HALO_CACHE_TABLE_NAME } = process.env;

// Expected event body: { event_type: 'customer.updated', customer_id: '12345', ... }

exports.handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    console.error('Invalid JSON payload', err);
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { event_type, customer_id } = body;
  console.log('Webhook received:', event_type, 'for', customer_id);

  try {
    switch (event_type) {
      case 'customer.updated':
        await invalidateCustomerCache(body.customer_id);
        break;
      case 'ticket.created':
        // Optionally notify via SNS or send to frontend (not covered here)
        break;
      default:
        console.log('Unhandled webhook event:', event_type);
    }
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('Error handling webhook:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};

async function invalidateCustomerCache(customerId) {
  // If you store the mapping { customerId → phoneNumber } in a separate table or in the cache item, query it
  // For simplicity, assume CustomerCacheTable uses phoneNumber as key, so we need to find that entry
  // Option 1: scan entire table for matching customerId (inefficient)
  // Option 2: store an inverted index table (customerId → phoneNumber) in Lambda/CACHE

  // Here’s a simple scan (only safe if cache is small):
  const scanParams = {
    TableName: HALO_CACHE_TABLE_NAME,
    FilterExpression: 'customerId = :cid',
    ExpressionAttributeValues: { ':cid': customerId }
  };

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
  } else {
    console.log(`No cache entry found for customerId=${customerId}`);
  }
}