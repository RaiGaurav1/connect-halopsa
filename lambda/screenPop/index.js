// ✅ ConnectScreenPop Lambda
exports.handler = async (event) => {
  const phone = event.Details?.ContactData?.CustomerEndpoint?.Address || "UNKNOWN";
  const screenPopURL = `https://bendigotelco.holapsa.com/customer-lookup?phone=${encodeURIComponent(phone)}`;

  console.log("📟 Screen Pop Triggered:");
  console.log("Phone:", phone);
  console.log("URL:", screenPopURL);

  return {
    statusCode: 200,
    body: JSON.stringify({ screenPopURL }),
  };
};
