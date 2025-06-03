import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

interface CustomerInfoProps {
  customer: null | {
    id: string;
    name: string;
    email: string;
    company: string;
    status: "Active" | "Inactive";
    priority: "High" | "Normal" | "Low";
  };
  loading: boolean;
  error: string | null;
  onManualLookup: (phone: string) => void;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({
  customer,
  loading,
  error,
  onManualLookup,
}) => {
  const [phoneInput, setPhoneInput] = useState("");

  const handleLookupClick = () => {
    onManualLookup(phoneInput.trim());
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      {/* Header: “Customer Information” */}
      <Box
        sx={{
          backgroundColor: "primary.main",
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="subtitle1" sx={{ color: "common.white", fontWeight: 500 }}>
          Customer Information
        </Typography>
        <Box>
          <IconButton size="small" sx={{ color: "common.white" }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: "common.white" }}>
            <ClearIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Content area */}
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "common.white",
          borderTop: "1px solid #e0e0e0",
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Search bar */}
        <Box sx={{ width: "100%", mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by phone number"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <Button
                  variant="contained"
                  size="small"
                  sx={{ ml: 1, textTransform: "none" }}
                  onClick={handleLookupClick}
                  disabled={loading || phoneInput.trim() === ""}
                >
                  LOOKUP
                </Button>
              ),
            }}
          />
        </Box>

        <Divider sx={{ width: "100%", mb: 2 }} />

        {/* Loading / Error messages */}
        {loading && (
          <Typography variant="body2" color="text.secondary">
            Loading customer…
          </Typography>
        )}
        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}

        {/* If we have a `customer` object, show it (placeholder) */}
        {customer && !loading && !error && (
          <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle2" gutterBottom>
              {customer.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {customer.company} • {customer.email}
            </Typography>
          </Box>
        )}

        {/* Otherwise, show “No active call” illustration */}
        {!customer && !loading && !error && (
          <Box
            sx={{
              mt: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Simple gray rectangle as placeholder illustration */}
            <Box
              component="img"
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='120' fill='%23ccc'%3E%3Crect width='150' height='120' rx='8' ry='8'/%3E%3C/svg%3E"
              alt="Empty State"
              sx={{ mb: 2 }}
            />

            <Typography variant="h6" color="text.secondary" gutterBottom>
              No active call
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Customer information will appear here when a call connects or when you
              manually search by phone
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CustomerInfo;
