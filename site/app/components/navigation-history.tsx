"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const PreviousPathContext = createContext<string | null>(null);

function sameOriginReferrerPath() {
  if (!document.referrer) return null;

  try {
    const referrer = new URL(document.referrer);
    return referrer.origin === window.location.origin ? referrer.pathname : null;
  } catch {
    return null;
  }
}

/** Tracks the previous App Router pathname without leaking it into public URLs. */
export function NavigationHistoryProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const currentPath = useRef<string | null>(null);
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  useEffect(() => {
    const previous = currentPath.current;

    if (previous && previous !== pathname) {
      setPreviousPath(previous);
    } else if (!previous) {
      setPreviousPath(sameOriginReferrerPath());
    }

    currentPath.current = pathname;
  }, [pathname]);

  return (
    <PreviousPathContext.Provider value={previousPath}>
      {children}
    </PreviousPathContext.Provider>
  );
}

export function usePreviousPath() {
  return useContext(PreviousPathContext);
}
