import React from 'react';
import { Paper, Typography, Box, Chip, CircularProgress, Alert } from '@mui/material';
import { Customer } from '../types';

interface CustomerDetailsProps {
  customer: Customer | null;
  loading: boolean;
  error: string | null;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer, loading, error }) => (
  <Paper elevation={3} sx={{ p: 3, minHeight: '400px' }}>
    <Typography variant="h6" gutterBottom>
      Customer Information
    </Typography>
    
    {loading && (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    )}
    
    {error && (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    )}
    
    {!loading && !error && !customer && (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        No active call. Customer information will appear when a call connects.
      </Typography>
    )}
    
    {customer && (
      <Box sx={{ mt: 2 }}>
        <Detail label="Customer ID" value={customer.id} />
        <Detail label="Name" value={customer.name} variant="h5" />
        <Detail label="Email" value={customer.email} />
        <Detail label="Company" value={customer.company} />
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Status</Typography>
          <Chip label={customer.status} color={customer.status === 'Active' ? 'success' : 'default'} size="small" />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
          <Chip 
            label={customer.priority}
            color={customer.priority === 'High' ? 'error' : 'primary'}
            variant="outlined"
            size="small"
          />
        </Box>
      </Box>
    )}
  </Paper>
);

interface DetailProps {
  label: string;
  value: string;
  variant?: 'body1' | 'h5';
}

const Detail: React.FC<DetailProps> = ({ label, value, variant = 'body1' }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
    <Typography variant={variant}>{value}</Typography>
  </Box>
);

export default CustomerDetails;
