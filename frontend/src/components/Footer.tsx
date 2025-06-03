import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

interface FooterProps {
  connected: boolean;
  version: string;
}

const Footer: React.FC<FooterProps> = ({ connected, version }) => {
  return (
    <Box sx={{ 
      p: 1, 
      borderTop: 1, 
      borderColor: 'divider',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      bgcolor: 'background.paper'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          Connection:
        </Typography>
        <Chip 
          label={connected ? "Connected" : "Disconnected"} 
          color={connected ? "success" : "error"}
          size="small"
        />
      </Box>
      
      <Typography variant="body2" color="text.secondary">
        {version} • © 2025 AWS Connect + HaloPSA Integration
      </Typography>
    </Box>
  );
};

export default Footer;
