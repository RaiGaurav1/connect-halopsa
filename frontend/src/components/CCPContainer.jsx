import { useEffect, useRef } from 'react';

const CCPContainer = () => {
  const ccpRef = useRef();

  useEffect(() => {
    const container = ccpRef.current;
    if (!container) return;

    window.connect.core.initCCP(container, {
      ccpUrl: 'https://btsandbox.awsapps.com/connect/ccp-v2/',  // ✅ LIVE CCP URL
      loginPopup: true,
      region: 'ap-southeast-2',
      softphone: { allowFramedSoftphone: true }
    });
  }, []);

  return (
    <div>
      <h2>Amazon Connect CCP</h2>
      <div ref={ccpRef} style={{ height: '500px' }} />
    </div>
  );
};

export default CCPContainer;