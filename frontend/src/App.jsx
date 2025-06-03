import { useEffect, useState } from 'react';
import CCPContainer from './components/CCPContainer';
import CustomerDetails from './components/CustomerDetails';

function ErrorFallback({ error }) {
  return (
    <div style={{ color: 'red' }}>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
    </div>
  );
}

function App() {
  const [customer, setCustomer] = useState(null);
  const [sdkLoaded, setSdkLoaded] = useState(true);

  useEffect(() => {
    let retries = 0;
    const interval = setInterval(() => {
      if (window.connect) {
        console.log('Amazon Connect SDK detected.');
        setSdkLoaded(true);
        clearInterval(interval);
      } else {
        retries++;
        console.warn('Waiting for Amazon Connect SDK...');
        if (retries >= 10) {
          console.error('Amazon Connect SDK failed to load.');
          setSdkLoaded(false);
          clearInterval(interval);
        }
      }
    }, 500);
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Connect + HaloPSA Integration</h1>
      {!sdkLoaded ? (
        <p style={{ color: 'red' }}>Amazon Connect SDK not loaded. Please check if the script is included in index.html.</p>
      ) : (
        <>
          {console.log('Rendering CCPContainer')}
          <CCPContainer />
          {console.log('Rendering CustomerDetails with:', customer)}
          <CustomerDetails customer={customer} />
        </>
      )}
    </div>
  );
}

export default App;