import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ShortlistContextProps {
  shortlist: Set<number>;
  toggle: (id: number) => void;
}

const ShortlistContext = createContext<ShortlistContextProps | undefined>(undefined);

export const ShortlistProvider = ({ children }: { children: ReactNode }) => {
  const [shortlist, setShortlist] = useState<Set<number>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('shortlist');
    if (stored) {
      try {
        const ids: number[] = JSON.parse(stored);
        setShortlist(new Set(ids));
      } catch {}
    }
  }, []);

  // Persist on change
  useEffect(() => {
    const ids = Array.from(shortlist);
    localStorage.setItem('shortlist', JSON.stringify(ids));
  }, [shortlist]);

  const toggle = (id: number) => {
    setShortlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <ShortlistContext.Provider value={{ shortlist, toggle }}>
      {children}
    </ShortlistContext.Provider>
  );
};

export const useShortlist = () => {
  const ctx = useContext(ShortlistContext);
  if (!ctx) {
    throw new Error('useShortlist must be used within ShortlistProvider');
  }
  return ctx;
};
