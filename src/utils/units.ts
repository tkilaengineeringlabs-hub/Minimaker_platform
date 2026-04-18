// TIPOS
export type TileType = Tile["type"];

export type Tile =
  | {
      type: "chip" | "dumbbell" | "book" | "trophy" | "fast-forward";
      description: string;
    }
  | { type: "treasure" };

export type Unit = {
  unitNumber: number;
  description: string;
  backgroundColor: string; // 🔥 FIX (antes rompía todo)
  textColor: string;
  borderColor: string;
  tiles: Tile[];
};

// DATA
export const units: readonly Unit[] = [
  {
    unitNumber: 1,
    description: "Despierta tu mente maker",
    backgroundColor: "bg-[#00acc1]",
    textColor: "text-gray-500",
    borderColor: "border-[#00838f]",
    tiles: [
      { type: "chip", description: "Lección: ¿Qué es un sistema?" },
      { type: "book", description: "Electricidad básica" },
      { type: "chip", description: "Mini desafío mental" },
      { type: "treasure" },
      { type: "book", description: "Proyecto guiado" },
      { type: "trophy", description: "Logro + verificación real" },
    ],
  },
  {
    unitNumber: 2,
    description: "Empieza a construir de verdad",
    backgroundColor: "bg-[#00acc1]",
    textColor: "text-gray-500",
    borderColor: "border-[#00838f]",
    tiles: [
      { type: "fast-forward", description: "Tu primer circuito funcional" },
      { type: "dumbbell", description: "Entrenamiento: conecta y prueba" },
      { type: "book", description: "Entradas y salidas (inputs/outputs)" },
      { type: "treasure" },
      { type: "chip", description: "Controla luz, movimiento y señales" },
      { type: "book", description: "Errores reales y cómo solucionarlos" },
      { type: "chip", description: "Haz que tu sistema responda solo" },
      { type: "book", description: "Interacción con el mundo real" },
      { type: "treasure" },
      { type: "dumbbell", description: "Reto técnico guiado" },
      { type: "trophy", description: "Proyecto: construye tu primer prototipo" },
    ],
  },
  {
    unitNumber: 3,
    description: "Piensa como ingeniero",
    backgroundColor: "bg-[#00acc1]",
    textColor: "text-gray-500",
    borderColor: "border-[#00838f]",
    tiles: [
      { type: "fast-forward", description: "Diseña sistemas completos" },
      { type: "book", description: "Estructura: cómo organizar tu lógica" },
      { type: "chip", description: "Automatiza decisiones" },
      { type: "treasure" },
      { type: "book", description: "Optimiza lo que ya construiste" },
      { type: "chip", description: "Hazlo más rápido, más inteligente" },
      { type: "treasure" },
      { type: "dumbbell", description: "Simulación de problema real" },
      { type: "book", description: "Pensamiento modular" },
      { type: "trophy", description: "Proyecto final: sistema funcional completo" },
    ],
  },
];