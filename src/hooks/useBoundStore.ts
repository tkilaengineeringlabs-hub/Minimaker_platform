import type { StateCreator } from "zustand";
import { create } from "zustand";
import type { GoalXpSlice } from "~/stores/createGoalXpStore";
import { createGoalXpSlice } from "~/stores/createGoalXpStore";
import type { LessonSlice } from "~/stores/createLessonStore";
import { createLessonSlice } from "~/stores/createLessonStore";
import type { SoundSettingsSlice } from "~/stores/createSoundSettingsStore";
import { createSoundSettingsSlice } from "~/stores/createSoundSettingsStore";
import type { StreakSlice } from "~/stores/createStreakStore";
import { createStreakSlice } from "~/stores/createStreakStore";
import type { TeslaSlice } from "~/stores/createTeslaStore";
import { createTeslaSlice } from "~/stores/createTeslaStore";
import type { UserSlice } from "~/stores/createUserStore";
import { createUserSlice } from "~/stores/createUserStore";
import type { XpSlice } from "~/stores/createXpStore";
import { createXpSlice } from "~/stores/createXpStore";

export type BoundState = GoalXpSlice &
  LessonSlice &
  SoundSettingsSlice &
  StreakSlice &
  TeslaSlice &
  UserSlice &
  XpSlice;

export type BoundStateCreator<SliceState> = StateCreator<
  BoundState,
  [],
  [],
  SliceState
>;

export const useBoundStore = create<BoundState>((...args) => ({
  ...createGoalXpSlice(...args),
  ...createLessonSlice(...args),
  ...createSoundSettingsSlice(...args),
  ...createStreakSlice(...args),
  ...createTeslaSlice(...args),
  ...createUserSlice(...args),
  ...createXpSlice(...args),
}));
