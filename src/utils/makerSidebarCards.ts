import type { LearningPathId } from "~/utils/learningPaths";

export type MakerChallenge = {
  title: string;
  description: string;
  xpReward: number;
  teslasReward: number;
};

export type MakerProject = {
  title: string;
  description: string;
};

export type MakerSidebarCards = {
  challenge: MakerChallenge;
  project: MakerProject;
};

const makerSidebarCardsByPath: Record<LearningPathId, MakerSidebarCards> = {
  fundamentos: {
    challenge: {
      title: "Enciende tu primer LED",
      description: "Construye un circuito y logra encender tu LED.",
      xpReward: 20,
      teslasReward: 5,
    },
    project: {
      title: "Circuito eléctrico básico",
      description:
        "Construye un circuito funcional usando las piezas de tu kit.",
    },
  },
  rover: {
    challenge: {
      title: "Haz mover tu Rover",
      description: "Consigue que tu robot avance usando sus motores.",
      xpReward: 20,
      teslasReward: 5,
    },
    project: {
      title: "Mi primer Rover",
      description: "Construye y controla tu primer robot móvil.",
    },
  },
  sensor: {
    challenge: {
      title: "Detecta un objeto",
      description:
        "Usa un sensor para detectar algo frente a tu proyecto.",
      xpReward: 20,
      teslasReward: 5,
    },
    project: {
      title: "Alarma inteligente",
      description:
        "Construye un sistema capaz de detectar cambios en su entorno.",
    },
  },
  smart: {
    challenge: {
      title: "Haz que tu robot decida",
      description:
        "Combina una entrada y una condición para provocar una acción.",
      xpReward: 20,
      teslasReward: 5,
    },
    project: {
      title: "Robot inteligente",
      description:
        "Combina sensores, decisiones y acciones en un solo proyecto.",
    },
  },
};

export const getMakerSidebarCards = (
  pathId: LearningPathId,
): MakerSidebarCards => makerSidebarCardsByPath[pathId];
