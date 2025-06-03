import React from "react";
import { Box, Typography } from "@mui/material";

interface CCPPlaceholderProps {
  onContactConnected: (contact: any) => void;
}

const CCPPlaceholder: React.FC<CCPPlaceholderProps> = ({ onContactConnected }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      {/* Dark blue header */}
      <Box
        sx={{
          backgroundColor: "primary.main",
          px: 2,
          py: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ color: "common.white", fontWeight: 500 }}
        >
          Amazon Connect Contact Control Panel
        </Typography>
      </Box>

      {/* White content area */}
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "common.white",
          borderTop: "1px solid #e0e0e0",
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Loading Contact Control Panel…
        </Typography>
      </Box>
    </Box>
  );
};

export default CCPPlaceholder;
