import { supabase } from "~/lib/supabase";
import type { KitId } from "~/utils/kits";

export const getMyUnlockedKitIds = async (): Promise<KitId[]> => {
  if (supabase === null) return [];

  const { data, error } = await supabase.from("user_kits").select("kit_id");

  if (error !== null) {
    console.error("Error loading user kits", error.message);
    return [];
  }

  return data.map((row) => row.kit_id);
};

export const saveUnlockedKit = async ({
  userId,
  kitId,
}: {
  userId: string;
  kitId: KitId;
}): Promise<void> => {
  if (supabase === null) return;

  const { error } = await supabase.from("user_kits").upsert(
    {
      user_id: userId,
      kit_id: kitId,
      unlocked_at: new Date().toISOString(),
    },
    { onConflict: "user_id,kit_id" },
  );

  if (error !== null) {
    console.error("Error saving unlocked kit", error.message);
  }
};
