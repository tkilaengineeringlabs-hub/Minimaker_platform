import type { KitId } from "~/utils/kits";
import { learningPaths, type LearningPathId } from "~/utils/learningPaths";

const lessonsPerTile = 4;

export type StudentProgress = Record<LearningPathId, number>;

export type Student = {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  unlockedKits: KitId[];
  progressByPath: StudentProgress;
  lessonsCompleted: number;
};

export type Classroom = {
  id: string;
  name: string;
  teacherName: string;
  students: Student[];
};

export type StudentStatus =
  | "COMPLETADO"
  | "EN PROGRESO"
  | "NECESITA AYUDA"
  | "SIN INICIAR";

const createProgress = (
  progress: Partial<StudentProgress>,
): StudentProgress => ({
  fundamentos: 0,
  rover: 0,
  sensor: 0,
  smart: 0,
  ...progress,
});

export const mockClassroom: Classroom = {
  id: "mini-makers-a",
  name: "Mini Makers A",
  teacherName: "Profesor Demo",
  students: [
    {
      id: "alex",
      name: "Alex",
      avatar: "A",
      xp: 320,
      streak: 4,
      unlockedKits: ["fundamentos-maker", "rover-bot"],
      progressByPath: createProgress({ fundamentos: 18, rover: 6 }),
      lessonsCompleted: 24,
    },
    {
      id: "sofia",
      name: "Sofía",
      avatar: "S",
      xp: 500,
      streak: 7,
      unlockedKits: ["fundamentos-maker", "rover-bot", "sensor-lab"],
      progressByPath: createProgress({ fundamentos: 76, rover: 12, sensor: 4 }),
      lessonsCompleted: 92,
    },
    {
      id: "mateo",
      name: "Mateo",
      avatar: "M",
      xp: 80,
      streak: 1,
      unlockedKits: ["fundamentos-maker"],
      progressByPath: createProgress({ fundamentos: 3 }),
      lessonsCompleted: 3,
    },
    {
      id: "valentina",
      name: "Valentina",
      avatar: "V",
      xp: 210,
      streak: 2,
      unlockedKits: ["fundamentos-maker", "rover-bot"],
      progressByPath: createProgress({ fundamentos: 14, rover: 2 }),
      lessonsCompleted: 16,
    },
    {
      id: "diego",
      name: "Diego",
      avatar: "D",
      xp: 40,
      streak: 0,
      unlockedKits: ["fundamentos-maker"],
      progressByPath: createProgress({ fundamentos: 0 }),
      lessonsCompleted: 0,
    },
    {
      id: "camila",
      name: "Camila",
      avatar: "C",
      xp: 360,
      streak: 3,
      unlockedKits: ["fundamentos-maker", "rover-bot"],
      progressByPath: createProgress({ fundamentos: 24, rover: 8 }),
      lessonsCompleted: 32,
    },
    {
      id: "leo",
      name: "Leo",
      avatar: "L",
      xp: 125,
      streak: 0,
      unlockedKits: ["fundamentos-maker", "rover-bot"],
      progressByPath: createProgress({ fundamentos: 9, rover: 0 }),
      lessonsCompleted: 9,
    },
    {
      id: "renata",
      name: "Renata",
      avatar: "R",
      xp: 275,
      streak: 5,
      unlockedKits: ["fundamentos-maker", "sensor-lab"],
      progressByPath: createProgress({ fundamentos: 20, sensor: 5 }),
      lessonsCompleted: 25,
    },
  ],
};

export const getPathTotalLessons = (pathId: LearningPathId): number => {
  const learningPath = learningPaths.find((path) => path.id === pathId);

  return (
    learningPath?.units.reduce(
      (total, unit) => total + unit.tiles.length * lessonsPerTile,
      0,
    ) ?? 1
  );
};

export const getStudentPathProgress = (
  student: Student,
  pathId: LearningPathId,
): number => {
  const completedLessons = student.progressByPath[pathId] ?? 0;

  return Math.min(
    100,
    Math.round((completedLessons / getPathTotalLessons(pathId)) * 100),
  );
};

export const getStudentProjectsCompleted = (
  student: Student,
  pathId?: LearningPathId,
): number => {
  const paths = pathId
    ? learningPaths.filter((path) => path.id === pathId)
    : learningPaths;

  return paths.reduce((total, path) => {
    const completedTiles = Math.floor(
      (student.progressByPath[path.id] ?? 0) / lessonsPerTile,
    );
    const completedTrophies = path.units
      .flatMap((unit) => unit.tiles)
      .filter((tile, index) => tile.type === "trophy" && index < completedTiles)
      .length;

    return total + completedTrophies;
  }, 0);
};

export const getAveragePathProgress = (
  students: Student[],
  pathId: LearningPathId,
): number => {
  if (students.length === 0) return 0;

  const progressTotal = students.reduce(
    (total, student) => total + getStudentPathProgress(student, pathId),
    0,
  );

  return Math.round(progressTotal / students.length);
};

export const getStudentStatus = ({
  student,
  pathId,
  averageProgress,
}: {
  student: Student;
  pathId: LearningPathId;
  averageProgress: number;
}): StudentStatus => {
  const progress = getStudentPathProgress(student, pathId);

  if (progress >= 100) return "COMPLETADO";
  if (progress === 0) return "SIN INICIAR";
  if (progress < averageProgress - 25) return "NECESITA AYUDA";
  return "EN PROGRESO";
};

export const getUnitProgress = (
  student: Student,
  pathId: LearningPathId,
): { unitNumber: number; description: string; progress: number }[] => {
  const learningPath = learningPaths.find((path) => path.id === pathId);
  let remainingLessons = student.progressByPath[pathId] ?? 0;

  return (learningPath?.units ?? []).map((unit) => {
    const unitLessons = unit.tiles.length * lessonsPerTile;
    const completedInUnit = Math.min(unitLessons, Math.max(0, remainingLessons));
    remainingLessons -= unitLessons;

    return {
      unitNumber: unit.unitNumber,
      description: unit.description,
      progress: Math.min(100, Math.round((completedInUnit / unitLessons) * 100)),
    };
  });
};
