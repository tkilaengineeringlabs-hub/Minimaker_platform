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
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  tiles: Tile[];
};

// DATA
export const units: readonly Unit[] = [
  {
    unitNumber: 1,
    description: "Tu primer circuito",
    backgroundColor: "bg-[#00acc1]",
    textColor: "text-gray-500",
    borderColor: "border-[#00838f]",
    tiles: [
      { type: "chip", description: "Conoce tu Kit" },
      { type: "book", description: "¿Qué es la electricidad?" },
      { type: "chip", description: "Identifica los componentes" },
      { type: "treasure" },
      { type: "book", description: "Enciende tu primer LED" },
      { type: "trophy", description: "Reto: construye un circuito funcional" },
    ],
  },
  {
    unitNumber: 2,
    description: "Domina los motores",
    backgroundColor: "bg-[#00acc1]",
    textColor: "text-gray-500",
    borderColor: "border-[#00838f]",
    tiles: [
      { type: "chip", description: "¿Qué es un motor?" },
      { type: "book", description: "Polaridad y dirección" },
      { type: "chip", description: "Controla un motor" },
      { type: "treasure" },
      { type: "book", description: "Construye un ventilador" },
      { type: "dumbbell", description: "Soluciona fallas" },
      { type: "trophy", description: "Proyecto: vehículo sencillo" },
    ],
  },
  {
    unitNumber: 3,
    description: "Descubre los sensores",
    backgroundColor: "bg-[#00acc1]",
    textColor: "text-gray-500",
    borderColor: "border-[#00838f]",
    tiles: [
      { type: "chip", description: "¿Qué es un sensor?" },
      { type: "book", description: "Entradas y salidas" },
      { type: "chip", description: "Sensor de luz" },
      { type: "treasure" },
      { type: "book", description: "Sensor de distancia" },
      { type: "dumbbell", description: "Automatización" },
      { type: "trophy", description: "Proyecto: alarma inteligente" },
    ],
  },
];
