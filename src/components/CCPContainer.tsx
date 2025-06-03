import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import connectService from '../services/connectService';

interface CCPContainerProps {
  onContactConnected: (phone: string) => void;
}

const CCPContainer: React.FC<CCPContainerProps> = ({ onContactConnected }) => {
  const ccpRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ccpRef.current) {
      connectService.initCCP(ccpRef.current, onContactConnected);
    }
  }, [onContactConnected]);

  return (
    <Paper elevation={3} sx={{ p: 2, height: '600px' }}>
      <Typography variant="h6" gutterBottom>
        Amazon Connect Contact Control Panel
      </Typography>
      <Box ref={ccpRef} sx={{ width: '100%', height: '540px' }} />
    </Paper>
  );
};

export default CCPContainer;
