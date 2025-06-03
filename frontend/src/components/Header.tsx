import React from 'react';
import {
  AppBar, Toolbar, Typography, Box,
  IconButton, Avatar, Chip, Menu, MenuItem,
  Badge, Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
  PhoneEnabled as PhoneEnabledIcon
} from '@mui/icons-material';

interface HeaderProps {
  agentStatus: string;
  onAgentStatusChange: (status: string) => void;
}

const Header: React.FC<HeaderProps> = ({ agentStatus, onAgentStatusChange }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [statusAnchorEl, setStatusAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleStatusMenu = (event: React.MouseEvent<HTMLElement>) => {
    setStatusAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleStatusClose = (status?: string) => {
    if (status) onAgentStatusChange(status);
    setStatusAnchorEl(null);
  };
  
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <PhoneEnabledIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AWS Connect + HaloPSA Integration
        </Typography>
        
        <Chip
          label={agentStatus}
          color={
            agentStatus === 'Available' ? 'success' :
            agentStatus === 'Busy' ? 'error' :
            agentStatus === 'After Call Work' ? 'warning' : 'default'
          }
          onClick={handleStatusMenu}
          sx={{ mr: 2 }}
        />
        
        <Menu
          anchorEl={statusAnchorEl}
          open={Boolean(statusAnchorEl)}
          onClose={() => handleStatusClose()}
        >
          <MenuItem onClick={() => handleStatusClose('Available')}>Available</MenuItem>
          <MenuItem onClick={() => handleStatusClose('Busy')}>Busy</MenuItem>
          <MenuItem onClick={() => handleStatusClose('After Call Work')}>After Call Work</MenuItem>
          <MenuItem onClick={() => handleStatusClose('Offline')}>Offline</MenuItem>
        </Menu>
        
        <IconButton color="inherit" sx={{ mr: 1 }}>
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        
        <IconButton color="inherit" sx={{ mr: 1 }}>
          <HelpIcon />
        </IconButton>
        
        <IconButton color="inherit" sx={{ mr: 2 }}>
          <SettingsIcon />
        </IconButton>
        
        <Avatar 
          onClick={handleMenu}
          sx={{ cursor: 'pointer', bgcolor: 'secondary.main' }}
        >
          AS
        </Avatar>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>My Account</MenuItem>
          <Divider />
          <MenuItem onClick={handleClose}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
