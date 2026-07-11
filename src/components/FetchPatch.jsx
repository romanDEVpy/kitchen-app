"use client";

import { useEffect } from 'react';

if (typeof window !== 'undefined' && !window.__fetchPatched) {
  window.__fetchPatched = true;
  const originalFetch = window.fetch;
  window.fetch = function (uri, options) {
    if (typeof uri === 'string' && uri.startsWith('/api/')) {
      uri = '/kitchen-app' + uri;
    }
    return originalFetch.call(this, uri, options);
  };
}

export default function FetchPatch() {
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.__fetchPatched) {
      window.__fetchPatched = true;
      const originalFetch = window.fetch;
      window.fetch = function (uri, options) {
        if (typeof uri === 'string' && uri.startsWith('/api/')) {
          uri = '/kitchen-app' + uri;
        }
        return originalFetch.call(this, uri, options);
      };
    }
  }, []);

  return null;
}
