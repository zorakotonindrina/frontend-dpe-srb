'use client';

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';

interface FetchProgressContextType {
  isFetching: boolean;
}

const FetchProgressContext = createContext<FetchProgressContextType>({ isFetching: false });

export function useFetchProgress() {
  return useContext(FetchProgressContext);
}

export function FetchProgressProvider({ children }: { children: ReactNode }) {
  const [count, setCount]           = useState(0);
  const originalFetch               = useRef<typeof fetch | null>(null);

  useEffect(() => {
    originalFetch.current = window.fetch.bind(window);

    window.fetch = async (...args: Parameters<typeof fetch>) => {
      setCount(c => c + 1);
      try {
        return await originalFetch.current!(...args);
      } finally {
        setCount(c => c - 1);
      }
    };

    return () => {
      if (originalFetch.current) window.fetch = originalFetch.current;
    };
  }, []);

  return (
    <FetchProgressContext.Provider value={{ isFetching: count > 0 }}>
      {children}
    </FetchProgressContext.Provider>
  );
}
