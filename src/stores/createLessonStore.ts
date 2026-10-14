import type { BoundStateCreator } from "~/hooks/useBoundStore";
import {
  defaultLearningPathId,
  learningPaths,
  type LearningPathId,
} from "~/utils/learningPaths";

const learningProgressStorageKey = "mini-maker-learning-progress";
type ProgressByPath = Record<LearningPathId, number>;

const createEmptyProgressByPath = (): ProgressByPath => ({
  fundamentos: 0,
  rover: 0,
  sensor: 0,
  smart: 0,
});

const normalizeProgressByPath = (
  storedProgress?: Partial<Record<LearningPathId, number>>,
): ProgressByPath => {
  const progressByPath = createEmptyProgressByPath();

  learningPaths.forEach((learningPath) => {
    const progress = storedProgress?.[learningPath.id];
    if (typeof progress === "number" && Number.isFinite(progress)) {
      progressByPath[learningPath.id] = progress;
    }
  });

  return progressByPath;
};

const readProgressByPath = (): ProgressByPath => {
  if (typeof window === "undefined") {
    return createEmptyProgressByPath();
  }

  const storedProgress = localStorage.getItem(learningProgressStorageKey);
  if (storedProgress === null) {
    return createEmptyProgressByPath();
  }

  try {
    return normalizeProgressByPath(
      JSON.parse(storedProgress) as Partial<Record<LearningPathId, number>>,
    );
  } catch {
    return createEmptyProgressByPath();
  }
};

const writeProgressByPath = (progressByPath: ProgressByPath) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    learningProgressStorageKey,
    JSON.stringify(progressByPath),
  );
};

export type LessonSlice = {
  lessonsCompleted: number;
  progressByPath: ProgressByPath;
  setProgressByPath: (
    progressByPath: Partial<Record<LearningPathId, number>>,
  ) => void;
  lessonsCompletedForPath: (pathId: LearningPathId) => number;
  increaseLessonsCompleted: (by?: number, pathId?: LearningPathId) => void;
  jumpToUnit: (unitNumber: number, pathId?: LearningPathId) => void;
};

const initialProgressByPath = readProgressByPath();

export const createLessonSlice: BoundStateCreator<LessonSlice> = (
  set,
  get,
) => ({
  lessonsCompleted: initialProgressByPath[defaultLearningPathId],
  progressByPath: initialProgressByPath,
  setProgressByPath: (progressByPath) =>
    set(() => {
      const nextProgressByPath = normalizeProgressByPath(progressByPath);
      writeProgressByPath(nextProgressByPath);

      return {
        lessonsCompleted: nextProgressByPath[defaultLearningPathId],
        progressByPath: nextProgressByPath,
      };
    }),
  lessonsCompletedForPath: (pathId) => get().progressByPath[pathId] ?? 0,
  increaseLessonsCompleted: (by = 1, pathId = defaultLearningPathId) =>
    set(({ progressByPath }) => {
      const nextProgressByPath = {
        ...progressByPath,
        [pathId]: (progressByPath[pathId] ?? 0) + by,
      };
      writeProgressByPath(nextProgressByPath);

      return {
        lessonsCompleted: nextProgressByPath[defaultLearningPathId],
        progressByPath: nextProgressByPath,
      };
    }),
  jumpToUnit: (unitNumber: number, pathId = defaultLearningPathId) =>
    set(({ progressByPath }) => {
      const lessonsPerTile = 4;
      const learningPath =
        learningPaths.find((learningPath) => learningPath.id === pathId) ??
        learningPaths[0];
      const totalLessonsToJumpToUnit = (learningPath?.units ?? [])
        .filter((unit) => unit.unitNumber < unitNumber)
        .map((unit) => unit.tiles.length * lessonsPerTile)
        .reduce((a, b) => a + b, 0);
      const nextProgressByPath = {
        ...progressByPath,
        [pathId]: Math.max(
          progressByPath[pathId] ?? 0,
          totalLessonsToJumpToUnit,
        ),
      };
      writeProgressByPath(nextProgressByPath);

      return {
        lessonsCompleted: nextProgressByPath[defaultLearningPathId],
        progressByPath: nextProgressByPath,
      };
    }),
});
