exports.handler = async (event) => {
  console.log('Received webhook event:', JSON.stringify(event));
  
  try {
    // Basic webhook processing logic
    let body = event.body;
    
    // If the body is a string (and possibly base64 encoded)
    if (typeof event.body === 'string') {
      // Check if it's base64 encoded
      if (event.isBase64Encoded) {
        body = JSON.parse(Buffer.from(event.body, 'base64').toString());
      } else {
        body = JSON.parse(event.body);
      }
    }
    
    // Process the webhook payload
    console.log('Webhook payload:', JSON.stringify(body));
    
    // Return success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Webhook received successfully'
      })
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Error processing webhook',
        error: error.message
      })
    };
  }
};
