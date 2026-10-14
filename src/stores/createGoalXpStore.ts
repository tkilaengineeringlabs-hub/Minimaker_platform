import type { BoundStateCreator } from "~/hooks/useBoundStore";

export type GoalXp = 10 | 20 | 30 | 50;
const goalXpStorageKey = "mini-maker-goal-xp";

const readGoalXp = (): GoalXp => {
  if (typeof window === "undefined") return 10;

  const storedGoal = Number(localStorage.getItem(goalXpStorageKey));
  return storedGoal === 20 || storedGoal === 30 || storedGoal === 50
    ? storedGoal
    : 10;
};

export type GoalXpSlice = {
  goalXp: GoalXp;
  setGoalXp: (newGoalXp: GoalXp) => void;
};

export const createGoalXpSlice: BoundStateCreator<GoalXpSlice> = (set) => ({
  goalXp: readGoalXp(),
  setGoalXp: (newGoalXp: GoalXp) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(goalXpStorageKey, String(newGoalXp));
    }
    set({ goalXp: newGoalXp });
  },
});
