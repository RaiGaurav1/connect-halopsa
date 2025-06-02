const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const mockCustomers = {
  "+61123456789": {
    name: "John Doe",
    email: "john.doe@example.com",
    company: "Bendigo Telco",
    phone: "+61123456789",
    tickets: [
      { id: 1, title: "Password reset", status: "Closed" },
      { id: 2, title: "VoIP not working", status: "Open" }
    ]
  },
  "+61098765432": {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    company: "Bendigo Telco",
    phone: "+61098765432",
    tickets: [
      { id: 3, title: "Slow internet", status: "In Progress" }
    ]
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Customer lookup
app.get('/api/customer', (req, res) => {
  const phone = req.query.phone;
  console.log(`🔍 Looking up customer with phone: ${phone}`);

  const customer = mockCustomers[phone];
  if (customer) {
    console.log(`✅ Found customer: ${customer.name}`);
    res.json(customer);
  } else {
    console.log(`❌ No customer found for: ${phone}`);
    res.status(404).json({ error: 'Customer not found' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Mock HaloPSA API running at http://localhost:${PORT}`);
  console.log(`📞 Available phone numbers:`, Object.keys(mockCustomers));
});
