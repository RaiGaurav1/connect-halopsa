import React from "react";
import { Box, Typography } from "@mui/material";

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 1,
        px: 3,
        backgroundColor: "background.paper",
        textAlign: "center",
        mt: "auto",
        borderTop: "1px solid #e0e0e0",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        v4.0.0 • © {new Date().getFullYear()} AWS Connect + HaloPSA Integration
      </Typography>
    </Box>
  );
};

export default Footer;
