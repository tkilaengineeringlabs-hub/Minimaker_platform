import { isSupabaseConfigured } from "~/lib/supabase";

export type KitId =
  | "fundamentos-maker"
  | "rover-bot"
  | "sensor-lab"
  | "smart-bot";

export type KitData = {
  id: KitId;
  learningPathId: "fundamentos" | "rover" | "sensor" | "smart";
  emoji: string;
  name: string;
  description: string;
  shopDescription: string;
  age: string;
  difficulty: string;
  price: string;
  features: readonly string[];
  childWillLearn: readonly string[];
  label?: string;
  defaultProgress: number;
  unlockStorageKey?: string;
};

export const roverUnlockCode = "MM-ROVER-001";
export const roverStorageKey = "mini-maker-rover-bot-unlocked";
export const sensorStorageKey = "mini-maker-sensor-lab-unlocked";
export const smartStorageKey = "mini-maker-smart-bot-unlocked";

export const kits: readonly KitData[] = [
  {
    id: "fundamentos-maker",
    learningPathId: "fundamentos",
    emoji: "⚡",
    name: "Kit Fundamentos Maker",
    description: "Circuitos, LEDs, motores y componentes esenciales.",
    shopDescription:
      "Aprende circuitos, LEDs, motores y electrónica desde cero.",
    age: "8+",
    difficulty: "Principiante",
    price: "$699 MXN",
    features: [
      "LEDs",
      "cables",
      "motor",
      "interruptores",
      "componentes básicos",
      "acceso a ruta Fundamentos Maker",
    ],
    childWillLearn: [
      "Identificar componentes básicos",
      "Construir sus primeros circuitos",
      "Comprender luz, movimiento y conexiones",
    ],
    label: "RECOMENDADO PARA EMPEZAR",
    defaultProgress: 25,
  },
  {
    id: "rover-bot",
    learningPathId: "rover",
    emoji: "🤖",
    name: "Rover Bot",
    description: "Construye y programa tu primer robot móvil.",
    shopDescription:
      "Construye tu primer robot móvil y aprende cómo funcionan motores y movimiento.",
    age: "9+",
    difficulty: "Intermedio",
    price: "$999 MXN",
    features: [
      "chasis",
      "motores",
      "ruedas",
      "cableado",
      "componentes electrónicos",
      "acceso a ruta Rover Bot",
    ],
    childWillLearn: [
      "Ensamblar una base móvil",
      "Controlar motores",
      "Relacionar energía, dirección y movimiento",
    ],
    label: "MÁS POPULAR",
    defaultProgress: 0,
    unlockStorageKey: roverStorageKey,
  },
  {
    id: "sensor-lab",
    learningPathId: "sensor",
    emoji: "📡",
    name: "Sensor Lab",
    description: "Experimenta con luz, distancia y automatización.",
    shopDescription:
      "Descubre cómo los robots perciben su entorno usando sensores.",
    age: "10+",
    difficulty: "Intermedio",
    price: "$899 MXN",
    features: [
      "sensor de luz",
      "sensor de distancia",
      "cables",
      "componentes",
      "proyectos guiados",
    ],
    childWillLearn: [
      "Leer entradas del entorno",
      "Usar sensores en proyectos reales",
      "Crear respuestas automáticas simples",
    ],
    defaultProgress: 0,
    unlockStorageKey: sensorStorageKey,
  },
  {
    id: "smart-bot",
    learningPathId: "smart",
    emoji: "🧠",
    name: "Smart Bot",
    description: "Combina sensores, movimiento y decisiones automáticas.",
    shopDescription:
      "Construye proyectos con sensores, movimiento y decisiones automáticas.",
    age: "11+",
    difficulty: "Avanzado",
    price: "$1,299 MXN",
    features: [
      "kit robótico",
      "sensores",
      "componentes",
      "actividades inteligentes",
      "acceso a ruta Smart Bot",
    ],
    childWillLearn: [
      "Combinar sensores y decisiones",
      "Diseñar comportamientos inteligentes",
      "Crear respuestas automáticas simples",
    ],
    label: "AVANZADO",
    defaultProgress: 0,
    unlockStorageKey: smartStorageKey,
  },
];

export const getKitById = (kitId: KitId): KitData | undefined =>
  kits.find((kit) => kit.id === kitId);

export const readUnlockedKitIds = (): Set<KitId> => {
  if (isSupabaseConfigured) return new Set<KitId>();
  const unlockedKitIds = new Set<KitId>(["fundamentos-maker"]);

  if (typeof window === "undefined") {
    return unlockedKitIds;
  }

  kits.forEach((kit) => {
    if (
      kit.unlockStorageKey !== undefined &&
      localStorage.getItem(kit.unlockStorageKey) === "true"
    ) {
      unlockedKitIds.add(kit.id);
    }
  });

  return unlockedKitIds;
};

export const isKitUnlocked = (
  kit: KitData,
  unlockedKitIds: ReadonlySet<KitId>,
): boolean => unlockedKitIds.has(kit.id);
