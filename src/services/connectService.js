export function listenForIncomingCalls(onCustomerFound) {
  window.connect.contact(contact => {
    contact.onConnected(async () => {
      const attributes = contact.getAttributes();
      const phoneAttr = attributes?.CustomerPhone?.value;

      if (phoneAttr) {
        const res = await fetch(`/api/customer?phone=${encodeURIComponent(phoneAttr)}`);
        const customer = await res.json();
        onCustomerFound(customer);
      }
    });
  });
}
