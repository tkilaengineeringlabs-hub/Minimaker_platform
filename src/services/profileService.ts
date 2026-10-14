import { supabase } from "~/lib/supabase";
import type { Profile } from "~/types/supabase";

export const getProfile = async (userId: string): Promise<Profile | null> => {
  if (supabase === null) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error !== null) {
    console.error("Error loading profile", error.message);
    return null;
  }

  return data;
};
