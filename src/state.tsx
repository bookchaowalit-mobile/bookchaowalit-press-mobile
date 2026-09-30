import React, {createContext, useContext, useMemo, useState} from 'react';
import {EMPTY_RELEASE, type Release} from './lib/pressRelease';

type ReleaseState = {
  release: Release;
  update: (patch: Partial<Release>) => void;
  reset: () => void;
};

const ReleaseContext = createContext<ReleaseState | null>(null);

export function ReleaseProvider({
  children,
  initial = EMPTY_RELEASE,
}: {
  children: React.ReactNode;
  initial?: Release;
}) {
  const [release, setRelease] = useState<Release>(initial);
  const value = useMemo(
    () => ({
      release,
      update: (patch: Partial<Release>) =>
        setRelease(current => ({...current, ...patch})),
      reset: () => setRelease(EMPTY_RELEASE),
    }),
    [release],
  );
  return (
    <ReleaseContext.Provider value={value}>{children}</ReleaseContext.Provider>
  );
}

export function useRelease(): ReleaseState {
  const ctx = useContext(ReleaseContext);
  if (!ctx) {
    throw new Error('useRelease must be used inside <ReleaseProvider>');
  }
  return ctx;
}
