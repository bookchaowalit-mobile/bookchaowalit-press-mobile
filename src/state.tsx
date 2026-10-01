import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DRAFT_STORAGE_KEY,
  EMPTY_RELEASE,
  parseDraft,
  serializeDraft,
  type Release,
} from './lib/pressRelease';

type ReleaseState = {
  release: Release;
  update: (patch: Partial<Release>) => void;
  reset: () => void;
};

const ReleaseContext = createContext<ReleaseState | null>(null);

/**
 * Holds the draft release and persists it with AsyncStorage. The stored draft
 * is loaded once on mount; edits made before it loads win. Nothing is written
 * until a read has succeeded, so a storage error cannot wipe a saved draft.
 */
export function ReleaseProvider({
  children,
  initial = EMPTY_RELEASE,
}: {
  children: React.ReactNode;
  initial?: Release;
}) {
  const [release, setRelease] = useState<Release>(initial);
  const [hydrated, setHydrated] = useState(false);
  const touched = useRef(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(DRAFT_STORAGE_KEY)
      .then(raw => {
        if (cancelled) {
          return;
        }
        const stored = parseDraft(raw);
        if (stored && !touched.current) {
          setRelease(stored);
        }
        setHydrated(true);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(DRAFT_STORAGE_KEY, serializeDraft(release)).catch(
        () => undefined,
      );
    }
  }, [hydrated, release]);

  const value = useMemo(
    () => ({
      release,
      update: (patch: Partial<Release>) => {
        touched.current = true;
        setRelease(current => ({...current, ...patch}));
      },
      reset: () => {
        touched.current = true;
        setRelease(EMPTY_RELEASE);
      },
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
