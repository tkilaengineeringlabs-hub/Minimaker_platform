import { supabase } from "~/lib/supabase";
import type { KitId } from "~/utils/kits";

export const getMyUnlockedKitIds = async (userId: string): Promise<KitId[]> => {
  if (supabase === null) return [];

  const { data, error } = await supabase
    .from("user_kits")
    .select("kit_id")
    .eq("user_id", userId);

  if (error !== null) {
    throw error;
  }

  return data.map((row) => row.kit_id);
};

export const saveUnlockedKit = async ({
  userId,
  kitId,
}: {
  userId: string;
  kitId: KitId;
}): Promise<boolean> => {
  if (supabase === null) return false;

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
    return false;
  }
  return true;
};
