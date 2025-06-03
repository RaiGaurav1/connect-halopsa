import React, { useState, useCallback } from 'react';
import {
  Container, Grid, Box, CssBaseline, ThemeProvider, createTheme
} from '@mui/material';
import CCPContainer from './components/CCPContainer';
import CustomerDetails from './components/CustomerDetails';
import Header from './components/Header';
import Footer from './components/Footer';
import connectService from './services/connectService';
import { Customer } from './types';

const theme = createTheme({
  palette: {
    primary: { main: '#232F3E' },
    secondary: { main: '#FF9900' },
    background: {
      default: '#f5f5f7',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h6: {
      fontWeight: 600,
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          borderRadius: 8
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
        }
      }
    }
  }
});

const App: React.FC = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState('Available');
  const [connected, setConnected] = useState(false);
  
  const handleContactConnected = useCallback(async (phoneNumber: string) => {
    console.log('📞 Handling call for phone:', phoneNumber);
    setLoading(true);
    setError(null);

    try {
      const customerData = await connectService.fetchCustomer(phoneNumber);
      if (customerData) {
        setCustomer(customerData);
        setConnected(true);
        console.log('✅ Customer found:', customerData);
      } else {
        setError('Customer not found');
        setCustomer(null);
      }
    } catch (err) {
      console.error('❌ Error fetching customer:', err);
      setError('Failed to fetch customer info');
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleManualLookup = useCallback(async (phoneNumber: string) => {
    if (!phoneNumber) return;
    
    handleContactConnected(phoneNumber);
  }, [handleContactConnected]);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
        <Header 
          agentStatus={agentStatus} 
          onAgentStatusChange={setAgentStatus} 
        />
        
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7} lg={8}>
              <CCPContainer 
                onContactConnected={handleContactConnected} 
              />
            </Grid>
            <Grid item xs={12} md={5} lg={4}>
              <CustomerDetails
                customer={customer}
                loading={loading}
                error={error}
                onManualLookup={handleManualLookup}
              />
            </Grid>
          </Grid>
        </Box>
        
        <Footer 
          connected={connected} 
          version="v4.0.0" 
        />
      </Box>
    </ThemeProvider>
  );
};

export default App;
