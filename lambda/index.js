exports.handler = async (event) => {
  const phone = event?.Details?.ContactData?.CustomerEndpoint?.Address || null;

  if (!phone) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Phone number not found in contact flow input.' }),
    };
  }

  // Simulated lookup
  const mockCustomers = {
    "+61123456789": { name: "John Smith", email: "john@example.com" },
    "+61098765432": { name: "Jane Doe", email: "jane@example.com" },
  };

  const customer = mockCustomers[phone];
  if (!customer) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Customer not found." }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      CustomerFound: "true",
      CustomerName: customer.name,
      CustomerEmail: customer.email,
    }),
  };
};