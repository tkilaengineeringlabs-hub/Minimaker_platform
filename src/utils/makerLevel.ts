export type MakerLevel = {
  name: string;
  levelNumber: number;
  currentLevelXp: number;
  nextLevelXp: number | null;
  xpForNextLevel: number;
  progressPercent: number;
};

const makerLevelThresholds = [
  { name: "Maker Novato", minXp: 0 },
  { name: "Constructor", minXp: 100 },
  { name: "Inventor", minXp: 250 },
  { name: "Ingeniero", minXp: 500 },
  { name: "Master Maker", minXp: 1000 },
] as const;

export const getMakerLevel = (xp: number): MakerLevel => {
  const safeXp = Math.max(0, Math.floor(xp));
  const currentLevelIndex = makerLevelThresholds.findLastIndex(
    (level) => safeXp >= level.minXp,
  );
  const levelIndex = currentLevelIndex >= 0 ? currentLevelIndex : 0;
  const currentLevel = makerLevelThresholds[levelIndex];
  const nextLevel = makerLevelThresholds[levelIndex + 1];
  const currentLevelXp = currentLevel?.minXp ?? 0;

  if (nextLevel === undefined) {
    return {
      name: currentLevel?.name ?? makerLevelThresholds[0].name,
      levelNumber: levelIndex + 1,
      currentLevelXp,
      nextLevelXp: null,
      xpForNextLevel: 0,
      progressPercent: 100,
    };
  }

  const xpRange = nextLevel.minXp - currentLevelXp;
  const xpEarnedInLevel = safeXp - currentLevelXp;

  return {
    name: currentLevel?.name ?? makerLevelThresholds[0].name,
    levelNumber: levelIndex + 1,
    currentLevelXp,
    nextLevelXp: nextLevel.minXp,
    xpForNextLevel: Math.max(0, nextLevel.minXp - safeXp),
    progressPercent: Math.min(
      100,
      Math.max(0, Math.round((xpEarnedInLevel / xpRange) * 100)),
    ),
  };
};
