import React, { useState } from "react";
import { Box, Grid, Paper } from "@mui/material";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CCPPlaceholder from "./components/CCPPlaceholder";
import CustomerInfo from "./components/CustomerInfo";

const App: React.FC = () => {
  // Placeholder state—no real data yet
  const [customer, setCustomer] = useState<null | any>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Placeholder: called when CCP “connects” later
  const handleContactConnected = (contact: any) => {
    console.log("Contact connected:", contact);
    setConnected(true);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* 1. AppBar */}
      <Header />

      {/* 2. Main content: two cards side by side */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Grid container spacing={3}>
          {/* LEFT CARD */}
          <Grid item xs={12} md={7} lg={8}>
            <Paper
              elevation={3}
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <CCPPlaceholder onContactConnected={handleContactConnected} />
            </Paper>
          </Grid>

          {/* RIGHT CARD */}
          <Grid item xs={12} md={5} lg={4}>
            <Paper
              elevation={3}
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <CustomerInfo
                customer={customer}
                loading={loading}
                error={error}
                onManualLookup={(phone: string) => {
                  console.log("Manual lookup for:", phone);
                }}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 3. Footer */}
      <Footer />
    </Box>
  );
};

export default App;
