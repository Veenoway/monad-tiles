"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface MiniAppContext {
  user?: {
    username: string;
    fid: number;
    displayName: string;
    pfpUrl: string;
  };
  client?: {
    name: string;
    safeAreaInsets: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  actions?: {
    addFrame: () => Promise<void>;
    composeCast: (text: string, media?: string[]) => Promise<void>;
    viewProfile: (fid: number) => Promise<void>;
  };
}

const MiniAppContext = createContext<{
  context: MiniAppContext | null;
  setContext: (context: MiniAppContext) => void;
}>({
  context: null,
  setContext: () => {},
});

export function MiniAppProvider({ children }: { children: React.ReactNode }) {
  const [context, setContext] = useState<MiniAppContext | null>(null);

  useEffect(() => {
    // Initialiser le contexte avec les valeurs par défaut
    setContext({
      client: {
        name: "browser",
        safeAreaInsets: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
    });
  }, []);

  return (
    <MiniAppContext.Provider value={{ context, setContext }}>
      {children}
    </MiniAppContext.Provider>
  );
}

export function useMiniAppContext() {
  const context = useContext(MiniAppContext);
  if (!context) {
    throw new Error("useMiniAppContext must be used within a MiniAppProvider");
  }
  return context;
}
