import { useState, useEffect } from 'react';
import CCPContainer from './components/CCPContainer';
import CustomerDetails from './components/CustomerDetails';
import { listenForIncomingCalls } from './services/connectService';

function App() {
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    listenForIncomingCalls(setCustomer);
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Connect + HaloPSA Integration</h1>
      <CCPContainer />
      <CustomerDetails customer={customer} />
    </div>
  );
}

export default App;
