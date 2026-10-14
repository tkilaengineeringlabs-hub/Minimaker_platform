import type { KitId } from "~/utils/kits";
import { units as fundamentosUnits, type Unit } from "~/utils/units";

export type LearningPathId = "fundamentos" | "rover" | "sensor" | "smart";

export type LearningPath = {
  id: LearningPathId;
  name: string;
  description: string;
  emoji: string;
  kitId: KitId;
  units: readonly Unit[];
};

const makerColors = {
  backgroundColor: "bg-[#00acc1]",
  textColor: "text-gray-500",
  borderColor: "border-[#00838f]",
} as const;

export const defaultLearningPathId: LearningPathId = "fundamentos";

export const learningPaths: readonly LearningPath[] = [
  {
    id: "fundamentos",
    name: "Fundamentos Maker",
    description: "Circuitos, LEDs, motores y componentes esenciales.",
    emoji: "⚡",
    kitId: "fundamentos-maker",
    units: fundamentosUnits,
  },
  {
    id: "rover",
    name: "Rover Bot",
    description:
      "Construye tu primer robot móvil y descubre cómo controlar su movimiento.",
    emoji: "🤖",
    kitId: "rover-bot",
    units: [
      {
        unitNumber: 1,
        description: "Construye tu Rover",
        ...makerColors,
        tiles: [
          { type: "chip", description: "Conoce las piezas del Rover" },
          { type: "book", description: "Chasis, ruedas y motores" },
          { type: "chip", description: "Monta los motores" },
          { type: "treasure" },
          { type: "book", description: "Instala las ruedas" },
          { type: "trophy", description: "Reto: termina el chasis" },
        ],
      },
      {
        unitNumber: 2,
        description: "Dale movimiento",
        ...makerColors,
        tiles: [
          { type: "book", description: "¿Cómo gira un motor?" },
          { type: "chip", description: "Movimiento hacia adelante" },
          { type: "chip", description: "Movimiento hacia atrás" },
          { type: "treasure" },
          { type: "book", description: "Cómo hacer que el robot gire" },
          { type: "dumbbell", description: "Prueba tus motores" },
          { type: "trophy", description: "Reto: mueve tu Rover" },
        ],
      },
      {
        unitNumber: 3,
        description: "Controla tu robot",
        ...makerColors,
        tiles: [
          { type: "chip", description: "Combina movimientos" },
          { type: "book", description: "Secuencias de movimiento" },
          { type: "chip", description: "Evita errores" },
          { type: "treasure" },
          { type: "dumbbell", description: "Circuito de prueba" },
          { type: "trophy", description: "Proyecto: Rover funcional" },
        ],
      },
    ],
  },
  {
    id: "sensor",
    name: "Sensor Lab",
    description:
      "Descubre cómo una máquina puede detectar lo que ocurre a su alrededor.",
    emoji: "📡",
    kitId: "sensor-lab",
    units: [
      {
        unitNumber: 1,
        description: "Descubre los sensores",
        ...makerColors,
        tiles: [
          { type: "chip", description: "¿Qué es un sensor?" },
          { type: "book", description: "Cómo perciben las máquinas" },
          { type: "chip", description: "Entradas y salidas" },
          { type: "treasure" },
          { type: "trophy", description: "Reto de sensores" },
        ],
      },
      {
        unitNumber: 2,
        description: "Detecta el mundo",
        ...makerColors,
        tiles: [
          { type: "book", description: "Sensor de luz" },
          { type: "chip", description: "Detecta luz y oscuridad" },
          { type: "book", description: "Sensor de distancia" },
          { type: "treasure" },
          { type: "chip", description: "Detecta objetos" },
          { type: "dumbbell", description: "Prueba tus sensores" },
          { type: "trophy", description: "Reto: sistema detector" },
        ],
      },
      {
        unitNumber: 3,
        description: "Automatiza",
        ...makerColors,
        tiles: [
          { type: "chip", description: "Sensor + acción" },
          { type: "book", description: "Toma decisiones" },
          { type: "chip", description: "Si ocurre esto, haz aquello" },
          { type: "treasure" },
          { type: "dumbbell", description: "Prueba tu sistema" },
          { type: "trophy", description: "Proyecto: alarma inteligente" },
        ],
      },
    ],
  },
  {
    id: "smart",
    name: "Smart Bot",
    description:
      "Descubre cómo los robots pueden percibir, decidir y reaccionar.",
    emoji: "🧠",
    kitId: "smart-bot",
    units: [
      {
        unitNumber: 1,
        description: "Hazlo inteligente",
        ...makerColors,
        tiles: [
          { type: "chip", description: "¿Qué hace inteligente a un robot?" },
          { type: "book", description: "Percibir, decidir y actuar" },
          { type: "chip", description: "Sensores y decisiones" },
          { type: "treasure" },
          { type: "trophy", description: "Reto: robot inteligente" },
        ],
      },
      {
        unitNumber: 2,
        description: "Decisiones automáticas",
        ...makerColors,
        tiles: [
          { type: "book", description: "Reglas y condiciones" },
          { type: "chip", description: "Si ocurre esto..." },
          { type: "chip", description: "Entonces haz aquello" },
          { type: "treasure" },
          { type: "dumbbell", description: "Prueba diferentes decisiones" },
          { type: "trophy", description: "Reto de automatización" },
        ],
      },
      {
        unitNumber: 3,
        description: "Tu Smart Bot",
        ...makerColors,
        tiles: [
          { type: "chip", description: "Diseña su comportamiento" },
          { type: "book", description: "Combina sensores y movimiento" },
          { type: "treasure" },
          { type: "dumbbell", description: "Prueba y corrige" },
          { type: "trophy", description: "Proyecto: Smart Bot" },
        ],
      },
    ],
  },
];

export const getLearningPathById = (
  pathId: string | undefined,
): LearningPath | undefined =>
  learningPaths.find((learningPath) => learningPath.id === pathId);
