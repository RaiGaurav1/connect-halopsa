// src/components/CustomerDetails.tsx
import React from 'react';
import { Box, Card, CardContent, CircularProgress, Typography, Alert } from '@mui/material';
import { Customer } from '../types';

interface CustomerDetailsProps {
  customer: Customer | null;
  loading: boolean;
  error: string | null;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer, loading, error }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ width: '100%' }}>
        {error}
      </Alert>
    );
  }

  if (!customer) {
    return (
      <Typography variant="body1" color="textSecondary">
        No customer data to display.
      </Typography>
    );
  }

  // If we have a customer, show their details in a Card
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Customer Information
        </Typography>

        <Typography>
          <strong>ID:</strong> {customer.id}
        </Typography>
        <Typography>
          <strong>Name:</strong> {customer.name}
        </Typography>
        <Typography>
          <strong>Email:</strong> {customer.email}
        </Typography>
        <Typography>
          <strong>Company:</strong> {customer.company}
        </Typography>
        <Typography>
          <strong>Status:</strong> {customer.status}
        </Typography>
        <Typography>
          <strong>Priority:</strong> {customer.priority}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CustomerDetails;