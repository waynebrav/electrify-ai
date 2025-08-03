import React, { useEffect } from 'react';
import { getCSPHeader } from '@/utils/security';

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  useEffect(() => {
    // Add CSP header via meta tag (fallback for client-side)
    const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!existingMeta) {
      const metaCSP = document.createElement('meta');
      metaCSP.setAttribute('http-equiv', 'Content-Security-Policy');
      metaCSP.setAttribute('content', getCSPHeader());
      document.head.appendChild(metaCSP);
    }

    // Clear any leftover insecure session data on app start
    const cleanupInsecureData = () => {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        // Clean up any potential legacy insecure admin sessions
        if (key.includes('admin') && key !== 'adminSession') {
          sessionStorage.removeItem(key);
        }
      });
    };

    cleanupInsecureData();

    // Add security event listeners
    const handleBeforeUnload = () => {
      // Optionally clear sensitive data on page unload
      // This is aggressive but increases security
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return <>{children}</>;
};