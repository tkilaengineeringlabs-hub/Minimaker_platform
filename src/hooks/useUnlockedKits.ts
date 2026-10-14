import { useEffect, useMemo, useState } from "react";
import { useBoundStore } from "~/hooks/useBoundStore";
import { isSupabaseConfigured } from "~/lib/supabase";
import { readUnlockedKitIds, type KitId } from "~/utils/kits";

type UseUnlockedKitsResult = {
  unlockedKitIds: ReadonlySet<KitId>;
  unlockedKitIdsLoaded: boolean;
  refreshLocalKits: () => void;
};

export const useUnlockedKits = (): UseUnlockedKitsResult => {
  const kitIds = useBoundStore((state) => state.unlockedKitIds);
  const authReady = useBoundStore((state) => state.authReady);
  const [localKitIds, setLocalKitIds] = useState<Set<KitId>>(() =>
    readUnlockedKitIds(),
  );
  const [localReady, setLocalReady] = useState<boolean>(false);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    setLocalKitIds(readUnlockedKitIds());
    setLocalReady(true);
  }, []);

  const unlockedKitIds = useMemo<ReadonlySet<KitId>>(
    () => (isSupabaseConfigured ? new Set<KitId>(kitIds) : localKitIds),
    [kitIds, localKitIds],
  );

  return {
    unlockedKitIds,
    unlockedKitIdsLoaded: isSupabaseConfigured ? authReady : localReady,
    refreshLocalKits: () => setLocalKitIds(readUnlockedKitIds()),
  };
};
