import { supabase } from "~/lib/supabase";
import type { LearningProgress } from "~/types/supabase";
import type { LearningPathId } from "~/utils/learningPaths";

export const getMyLearningProgress = async (): Promise<LearningProgress[]> => {
  if (supabase === null) return [];

  const { data, error } = await supabase
    .from("learning_progress")
    .select("*")
    .order("path_id");

  if (error !== null) {
    console.error("Error loading learning progress", error.message);
    return [];
  }

  return data;
};

export const saveLearningProgress = async ({
  userId,
  pathId,
  completedLessons,
  xp,
}: {
  userId: string;
  pathId: LearningPathId;
  completedLessons: number;
  xp: number;
}): Promise<void> => {
  if (supabase === null) return;

  const { error } = await supabase.from("learning_progress").upsert(
    {
      user_id: userId,
      path_id: pathId,
      completed_lessons: completedLessons,
      xp,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,path_id" },
  );

  if (error !== null) {
    console.error("Error saving learning progress", error.message);
  }
};
