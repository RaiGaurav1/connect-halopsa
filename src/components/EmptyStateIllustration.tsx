import React from 'react';
import { Box, Typography } from '@mui/material';

const EmptyStateIllustration: React.FC = () => (
  <Box sx={{ textAlign: 'center', py: 4 }}>
    <Typography variant="h6" color="text.secondary">
      No Data Available
    </Typography>
  </Box>
);

export default EmptyStateIllustration;
