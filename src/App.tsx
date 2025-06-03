import React, { useState, useCallback } from 'react';
import {
  Container, Grid, Typography, Box, AppBar, Toolbar, CssBaseline
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PhoneIcon from '@mui/icons-material/Phone';
import CCPContainer from './components/CCPContainer';
import CustomerDetails from './components/CustomerDetails';
import connectService from './services/connectService';
import { Customer } from './types';

// Define theme outside the component to prevent recreation on each render
const theme = createTheme({
  palette: {
    primary: { main: '#232F3E' }, // AWS dark blue
    secondary: { main: '#FF9900' } // AWS orange
  }
});

const App: React.FC = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleContactConnected = useCallback(async (phoneNumber: string) => {
    console.log('📞 Handling call for phone:', phoneNumber);
    setLoading(true);
    setError(null);
    
    try {
      const data = await connectService.fetchCustomer(phoneNumber);
      
      if (data) {
        setCustomer(data);
        console.log('✅ Customer found:', data);
      } else {
        setError('Customer not found');
        setCustomer(null);
      }
    } catch (err: unknown) {
      // Handle error with proper type checking
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Failed to fetch customer info';
      console.error('❌ Error fetching customer:', err);
      setError(errorMessage);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed as we don't use any external values

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <PhoneIcon sx={{ mr: 2 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              AWS Connect + HaloPSA Integration
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <CCPContainer onContactConnected={handleContactConnected} />
            </Grid>
            <Grid item xs={12} md={8}>
              <CustomerDetails
                customer={customer}
                loading={loading}
                error={error}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;