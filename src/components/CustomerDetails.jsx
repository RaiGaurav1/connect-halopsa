const CustomerDetails = ({ customer }) => {
  if (!customer) return <p>No customer info yet.</p>;

  return (
    <div>
      <h2>Customer Details</h2>
      <ul>
        <li><strong>Name:</strong> {customer.name}</li>
        <li><strong>Email:</strong> {customer.email}</li>
        <li><strong>Phone:</strong> {customer.phone}</li>
        <li><strong>Account ID:</strong> {customer.id}</li>
      </ul>
    </div>
  );
};

export default CustomerDetails;
