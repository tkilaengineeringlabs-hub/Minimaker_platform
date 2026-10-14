import { useEffect, useMemo, useState } from "react";
import { useBoundStore } from "~/hooks/useBoundStore";
import { isSupabaseConfigured } from "~/lib/supabase";
import { readUnlockedKitIds } from "~/utils/kits";

export const useUnlockedKits = () => {
  const kitIds = useBoundStore((state) => state.unlockedKitIds);
  const authReady = useBoundStore((state) => state.authReady);
  const [localKitIds, setLocalKitIds] = useState(readUnlockedKitIds);
  const [localReady, setLocalReady] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    setLocalKitIds(readUnlockedKitIds());
    setLocalReady(true);
  }, []);

  const unlockedKitIds = useMemo(
    () => (isSupabaseConfigured ? new Set(kitIds) : localKitIds),
    [kitIds, localKitIds],
  );

  return {
    unlockedKitIds,
    unlockedKitIdsLoaded: isSupabaseConfigured ? authReady : localReady,
    refreshLocalKits: () => setLocalKitIds(readUnlockedKitIds()),
  };
};
