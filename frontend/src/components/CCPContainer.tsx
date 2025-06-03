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
    <Paper elevation={0} sx={{ 
      p: 0, 
      height: '600px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        p: 2, 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8
      }}>
        <Typography variant="h6">Amazon Connect Contact Control Panel</Typography>
      </Box>
      
      <Box 
        ref={ccpRef} 
        sx={{ 
          width: '100%', 
          flexGrow: 1, 
          bgcolor: 'background.paper'
        }} 
      />
    </Paper>
  );
};

export default CCPContainer;
