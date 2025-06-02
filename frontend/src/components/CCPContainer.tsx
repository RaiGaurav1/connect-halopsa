// src/components/CCPContainer.tsx
import React, { useRef, useEffect } from 'react';
import connectService from '../services/connectService';

interface CCPContainerProps {
  onContactConnected: (phoneNumber: string) => void;
}

/**
 * This component renders a <div> for the Amazon Connect CCP,
 * then calls connectService.initCCP(...) once on mount.
 */
const CCPContainer: React.FC<CCPContainerProps> = ({ onContactConnected }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize CCP exactly once
    connectService.initCCP(containerRef.current, onContactConnected);

    // No cleanup needed here (Amazon Connect Streams API does not expose an unmount callback).
  }, [onContactConnected]);

  // You can adjust height/width as needed. 600px tall is just an example.
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '600px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    />
  );
};

export default CCPContainer;