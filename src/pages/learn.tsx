import { useUnlockedKits } from "~/hooks/useUnlockedKits";
import { type NextPage } from "next";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
  GuidebookSvg,
  UpArrowSvg,
  PracticeExerciseSvg,
} from "~/components/Svgs";
import { TopBar } from "~/components/TopBar";
import { BottomBar } from "~/components/BottomBar";
import { RightBar } from "~/components/RightBar";
import { LeftBar } from "~/components/LeftBar";
import { useRouter } from "next/router";
import { LoginScreen, useLoginScreen } from "~/components/LoginScreen";
import { LearningPathSelector } from "~/components/LearningPathSelector";
import { type BoundState, useBoundStore } from "~/hooks/useBoundStore";
import type { Tile, Unit } from "~/utils/units";
import {
  defaultLearningPathId,
  getLearningPathById,
  type LearningPathId,
} from "~/utils/learningPaths";
import { getKitById, isKitUnlocked } from "~/utils/kits";

type TileStatus = "LOCKED" | "ACTIVE" | "COMPLETE";
type MakerActivityType =
  | "LECCIÓN"
  | "PRÁCTICA"
  | "RETO"
  | "PROYECTO"
  | "RECOMPENSA";

const tileStatus = (
  tile: Tile,
  lessonsCompleted: number,
  units: readonly Unit[],
): TileStatus => {
  const lessonsPerTile = 4;
  const tilesCompleted = Math.floor(lessonsCompleted / lessonsPerTile);
  const tiles = units.flatMap((unit) => unit.tiles);
  const tileIndex = tiles.findIndex((t) => t === tile);

  if (tileIndex < tilesCompleted) {
    return "COMPLETE";
  }
  if (tileIndex > tilesCompleted) {
    return "LOCKED";
  }
  return "ACTIVE";
};

const tileLeftOffsets = [0, -45, -70, -45, 0, 45, 70, 45] as const;

const getTileLeftOffset = ({
  index,
  unitNumber,
  tilesLength,
}: {
  index: number;
  unitNumber: number;
  tilesLength: number;
}): number => {
  if (index >= tilesLength - 1) {
    return 0;
  }

  const offsets =
    unitNumber % 2 === 1
      ? tileLeftOffsets
      : [...tileLeftOffsets.slice(4), ...tileLeftOffsets.slice(0, 4)];

  return offsets[index % offsets.length] ?? 0;
};

const CircuitConnector = ({
  fromOffset,
  toOffset,
  powered,
}: {
  fromOffset: number;
  toOffset: number;
  powered: boolean;
}) => {
  return (
    <svg
      className="pointer-events-none absolute left-1/2 top-[82px] z-0 h-[76px] w-px overflow-visible"
      aria-hidden="true"
    >
      <line
        x1={fromOffset}
        y1="0"
        x2={toOffset}
        y2="68"
        stroke={powered ? "#00acc1" : "#c7d2d8"}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1={fromOffset}
        y1="0"
        x2={toOffset}
        y2="68"
        stroke={powered ? "#9af8ff" : "#edf2f5"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx={fromOffset}
        cy="0"
        r="4.5"
        fill={powered ? "#00acc1" : "#c7d2d8"}
      />
      <circle
        cx={toOffset}
        cy="68"
        r="3.5"
        fill={powered ? "#00acc1" : "#c7d2d8"}
      />
    </svg>
  );
};

const CircuitTraces = ({
  status,
  isProject,
}: {
  status: TileStatus;
  isProject: boolean;
}) => {
  const colors = getTileColors({ status });
  return (
    <>
      <span
        className={[
          "absolute left-2 top-4 h-1 w-5 rounded-full",
          colors.circuit,
          status === "LOCKED" ? "opacity-70" : "opacity-100",
        ].join(" ")}
      />
      <span
        className={[
          "absolute bottom-4 right-2 h-1 w-5 rounded-full",
          colors.circuit,
          status === "LOCKED" ? "opacity-70" : "opacity-100",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-4 top-7 h-8 w-1 rounded-full",
          colors.circuit,
          status === "LOCKED" ? "opacity-50" : "opacity-80",
        ].join(" ")}
      />
      <span
        className={[
          "absolute right-4 top-5 h-5 w-1 rounded-full",
          colors.circuit,
          status === "LOCKED" ? "opacity-50" : "opacity-80",
        ].join(" ")}
      />
      {isProject && (
        <span
          className={[
            "absolute bottom-5 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full",
            colors.circuit,
            status === "LOCKED" ? "opacity-50" : "opacity-90",
          ].join(" ")}
        />
      )}
    </>
  );
};

const PinRails = ({ status }: { status: TileStatus }) => {
  const colors = getTileColors({ status });
  return (
    <>
      {[-24, -12, 0, 12, 24].map((pin) => (
        <span
          key={`top-${pin}`}
          className={[
            "absolute top-[-6px] h-3 w-1 rounded-full",
            colors.chip,
          ].join(" ")}
          style={{ left: `calc(50% + ${pin}px)` }}
        />
      ))}
      {[-24, -12, 0, 12, 24].map((pin) => (
        <span
          key={`bottom-${pin}`}
          className={[
            "absolute bottom-[-6px] h-3 w-1 rounded-full",
            colors.chip,
          ].join(" ")}
          style={{ left: `calc(50% + ${pin}px)` }}
        />
      ))}
    </>
  );
};

const StatusBadge = ({ status }: { status: TileStatus }) => {
  if (status === "ACTIVE") {
    return (
      <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#b9fbff] shadow-[0_0_14px_rgba(185,251,255,0.95)]" />
    );
  }
  if (status === "COMPLETE") {
    return (
      <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-sm border border-[#00acc1] bg-white text-base font-black leading-none text-[#00838f]">
        ✓
      </span>
    );
  }
  return (
    <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-sm border border-[#c6cdd2] bg-white text-xs text-[#8f9aa3]">
      <LockMiniIcon className="h-3.5 w-3.5" />
    </span>
  );
};

const LearningNode = ({
  tile,
  status,
  onClick,
}: {
  tile: Tile;
  status: TileStatus;
  onClick: () => void;
}) => {
  const colors = getTileColors({ status });
  const activityType = getActivityType(tile);
  const isChallenge = activityType === "RETO";
  const isProject = activityType === "PROYECTO";
  const isReward = activityType === "RECOMPENSA";

  return (
    <button
      className={[
        "group relative z-10 flex items-center justify-center border-2 shadow-inner shadow-white/30 transition duration-150 ease-out hover:-translate-y-0.5 hover:scale-[1.02] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#8ff5ff]/70 active:translate-y-[5px] active:scale-[0.99]",
        colors.surface,
        colors.border,
        colors.icon,
        colors.depth,
        status === "ACTIVE"
          ? "animate-[makerPulse_2.4s_ease-in-out_infinite]"
          : "",
        isProject
          ? "h-[86px] w-[min(250px,calc(100vw-70px))] px-5 [clip-path:polygon(7%_0,93%_0,100%_20%,100%_80%,93%_100%,7%_100%,0_80%,0_20%)]"
          : isChallenge
            ? "h-[82px] w-[108px] [clip-path:polygon(50%_0,94%_25%,94%_75%,50%_100%,6%_75%,6%_25%)]"
            : isReward
              ? "h-[72px] w-[118px] [clip-path:polygon(12%_0,88%_0,100%_26%,88%_100%,12%_100%,0_26%)]"
              : "h-[74px] w-[92px] [clip-path:polygon(18%_0,82%_0,100%_20%,100%_80%,82%_100%,18%_100%,0_80%,0_20%)]",
      ].join(" ")}
      onClick={onClick}
    >
      <span className="pointer-events-none absolute inset-x-3 top-2 h-3 rounded-full bg-white/25 blur-[1px]" />
      <PinRails status={status} />
      <CircuitTraces status={status} isProject={isProject} />
      <StatusBadge status={status} />
      {isProject ? (
        <span className="relative flex w-full items-center gap-3 text-left">
          <MakerIcon tile={tile} className="h-9 w-9 shrink-0" />
          <span className="min-w-0">
            <span className="block text-[10px] font-black tracking-[0.16em] opacity-80">
              PROYECTO
            </span>
            <span className="block truncate text-sm font-black leading-tight">
              {"description" in tile
                ? tile.description.replace(/^Proyecto:\s*/i, "")
                : "Maker"}
            </span>
          </span>
        </span>
      ) : (
        <span className="relative flex flex-col items-center gap-1">
          <MakerIcon
            tile={tile}
            className={isChallenge ? "h-9 w-9" : "h-8 w-8"}
          />
          {isChallenge || isReward ? (
            <span className="text-[10px] font-black tracking-[0.12em]">
              {isReward ? "BONUS" : "RETO"}
            </span>
          ) : null}
        </span>
      )}
      <span className="sr-only">Mostrar lección</span>
    </button>
  );
};

type MakerSvgProps = React.ComponentProps<"svg">;

const baseIconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.1,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const IdeaIcon = (props: MakerSvgProps) => (
  <svg {...baseIconProps} {...props}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M8.2 14.6a6 6 0 1 1 7.6 0c-.9.7-1.3 1.4-1.3 2.4h-5c0-1-.4-1.7-1.3-2.4Z" />
    <path d="M12 2v2" />
    <path d="m4.9 4.9 1.4 1.4" />
    <path d="m19.1 4.9-1.4 1.4" />
  </svg>
);

const LightningIcon = (props: MakerSvgProps) => (
  <svg {...baseIconProps} {...props}>
    <path d="M13 2 5 14h6l-1 8 9-13h-6l0-7Z" />
  </svg>
);

const CircuitIcon = (props: MakerSvgProps) => (
  <svg {...baseIconProps} {...props}>
    <path d="M4 7h5l3 5h8" />
    <path d="M4 17h6l2-5" />
    <circle cx="4" cy="7" r="2" />
    <circle cx="4" cy="17" r="2" />
    <circle cx="20" cy="12" r="2" />
  </svg>
);

const GearIcon = (props: MakerSvgProps) => (
  <svg {...baseIconProps} {...props}>
    <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
    <path d="M12 2v3" />
    <path d="M12 19v3" />
    <path d="m4.9 4.9 2.1 2.1" />
    <path d="m17 17 2.1 2.1" />
    <path d="M2 12h3" />
    <path d="M19 12h3" />
    <path d="m4.9 19.1 2.1-2.1" />
    <path d="m17 7 2.1-2.1" />
  </svg>
);

const SensorIcon = (props: MakerSvgProps) => (
  <svg {...baseIconProps} {...props}>
    <path d="M4 12h4" />
    <circle cx="12" cy="12" r="3" />
    <path d="M17 8.5a5 5 0 0 1 0 7" />
    <path d="M20 6a9 9 0 0 1 0 12" />
    <path d="M8 7v10" />
  </svg>
);

const CodeIcon = (props: MakerSvgProps) => (
  <svg {...baseIconProps} {...props}>
    <path d="m8 8-4 4 4 4" />
    <path d="m16 8 4 4-4 4" />
    <path d="m14 5-4 14" />
  </svg>
);

const RobotIcon = (props: MakerSvgProps) => (
  <svg {...baseIconProps} {...props}>
    <rect x="5" y="7" width="14" height="11" rx="3" />
    <path d="M12 7V4" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="15" cy="12" r="1" />
    <path d="M9.5 16h5" />
    <path d="M3 11v4" />
    <path d="M21 11v4" />
  </svg>
);

const ToolIcon = (props: MakerSvgProps) => (
  <svg {...baseIconProps} {...props}>
    <path d="M14.7 6.3a4 4 0 0 0 5 5L11 20a2.1 2.1 0 0 1-3-3l8.7-8.7a4 4 0 0 0-2-2Z" />
    <path d="m5 6 3 3" />
    <path d="m3 8 3-3" />
  </svg>
);

const FlagIcon = (props: MakerSvgProps) => (
  <svg {...baseIconProps} {...props}>
    <path d="M5 21V4" />
    <path d="M5 5h11l-2 4 2 4H5" />
    <path d="M9 17h8" />
  </svg>
);

const ProjectBoardIcon = (props: MakerSvgProps) => (
  <svg {...baseIconProps} {...props}>
    <rect x="4" y="5" width="16" height="14" rx="2" />
    <path d="M8 9h3v3H8z" />
    <path d="M14 9h2" />
    <path d="M14 13h2" />
    <path d="M8 16h8" />
    <path d="M2 9h2" />
    <path d="M2 15h2" />
    <path d="M20 9h2" />
    <path d="M20 15h2" />
  </svg>
);

const EnergyModuleIcon = (props: MakerSvgProps) => (
  <svg {...baseIconProps} {...props}>
    <rect x="4" y="6" width="16" height="12" rx="2" />
    <path d="M8 12h3" />
    <path d="M13 12h3" />
    <path d="M12 9v6" />
    <path d="M7 4v2" />
    <path d="M17 4v2" />
    <path d="M7 18v2" />
    <path d="M17 18v2" />
  </svg>
);

const LockMiniIcon = (props: MakerSvgProps) => (
  <svg {...baseIconProps} {...props}>
    <rect x="6" y="10" width="12" height="9" rx="2" />
    <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
  </svg>
);

const getTileColors = ({
  status,
}: {
  status: TileStatus;
}): {
  surface: string;
  border: string;
  circuit: string;
  icon: string;
  chip: string;
  depth: string;
} => {
  switch (status) {
    case "LOCKED":
      return {
        surface: "bg-gradient-to-b from-[#f4f6f7] to-[#e4e9ec]",
        border: "border-[#c4cdd2]",
        circuit: "bg-[#cfd6dc]",
        icon: "text-[#8f9aa3]",
        chip: "bg-[#d0d8dd]",
        depth:
          "drop-shadow-[0_6px_0_#b8c2c8] hover:drop-shadow-[0_8px_0_#b8c2c8] active:drop-shadow-[0_2px_0_#b8c2c8]",
      };
    case "COMPLETE":
      return {
        surface: "bg-gradient-to-b from-[#edfeff] to-[#c4f5fb]",
        border: "border-[#00acc1]",
        circuit: "bg-[#00acc1]",
        icon: "text-[#007c8a]",
        chip: "bg-white",
        depth:
          "drop-shadow-[0_7px_0_#08a0b2] hover:drop-shadow-[0_9px_0_#08a0b2] active:drop-shadow-[0_2px_0_#08a0b2]",
      };
    case "ACTIVE":
      return {
        surface: "bg-gradient-to-b from-[#34c8d7] to-[#00acc1]",
        border: "border-[#00838f]",
        circuit: "bg-[#8ff5ff]",
        icon: "text-white",
        chip: "bg-[#b9fbff]",
        depth:
          "drop-shadow-[0_8px_0_#078b99] hover:drop-shadow-[0_10px_0_#078b99] active:drop-shadow-[0_2px_0_#078b99]",
      };
  }
};

const getActivityType = (tile: Tile): MakerActivityType => {
  if (tile.type === "treasure") return "RECOMPENSA";
  if (tile.type === "trophy") {
    return tile.description.toLowerCase().includes("proyecto")
      ? "PROYECTO"
      : "RETO";
  }
  if (tile.type === "dumbbell" || tile.type === "fast-forward") {
    return "PRÁCTICA";
  }
  if (tile.type === "chip") {
    const description = tile.description.toLowerCase();
    return description.includes("controla") ||
      description.includes("construye") ||
      description.includes("monta") ||
      description.includes("instala") ||
      description.includes("detecta") ||
      description.includes("combina") ||
      description.includes("prueba")
      ? "PRÁCTICA"
      : "LECCIÓN";
  }
  return "LECCIÓN";
};

const getTileDescription = ({
  tile,
  status,
  unitNumber,
}: {
  tile: Tile;
  status: TileStatus;
  unitNumber: number;
}): string => {
  switch (tile.type) {
    case "book":
    case "dumbbell":
    case "chip":
      return tile.description;
    case "fast-forward":
      return status === "LOCKED" ? "Saltar a esta unidad" : tile.description;
    case "trophy":
      return tile.description || `Repaso Unidad ${unitNumber}`;
    case "treasure":
      return "Recompensa Maker";
  }
};

const MakerIcon = ({
  tile,
  className = "h-8 w-8",
}: {
  tile: Tile;
  className?: string;
}) => {
  const description =
    "description" in tile ? tile.description.toLowerCase() : "";
  const kind = getActivityType(tile);

  if (tile.type === "treasure")
    return <EnergyModuleIcon className={className} />;
  if (kind === "PROYECTO") return <ProjectBoardIcon className={className} />;
  if (kind === "RETO") return <FlagIcon className={className} />;
  if (tile.type === "dumbbell" || description.includes("fallas")) {
    return <ToolIcon className={className} />;
  }
  if (description.includes("motor") || description.includes("rueda")) {
    return <GearIcon className={className} />;
  }
  if (description.includes("sensor") || description.includes("detecta")) {
    return <SensorIcon className={className} />;
  }
  if (
    description.includes("si ocurre") ||
    description.includes("entonces") ||
    description.includes("secuencia") ||
    description.includes("regla")
  ) {
    return <CodeIcon className={className} />;
  }
  if (description.includes("led") || description.includes("electricidad")) {
    return <LightningIcon className={className} />;
  }
  if (description.includes("robot") || description.includes("rover")) {
    return <RobotIcon className={className} />;
  }
  if (kind === "PRÁCTICA") return <CircuitIcon className={className} />;
  return <IdeaIcon className={className} />;
};

const TileTooltip = ({
  selectedTile,
  index,
  lessonHref,
  description,
  activityType,
  status,
  closeTooltip,
}: {
  selectedTile: number | null;
  index: number;
  lessonHref: string;
  description: string;
  activityType: MakerActivityType;
  status: TileStatus;
  closeTooltip: () => void;
}) => {
  const tileTooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const containsTileTooltip = (event: MouseEvent) => {
      if (selectedTile !== index) return;
      const clickIsInsideTooltip = tileTooltipRef.current?.contains(
        event.target as Node,
      );
      if (clickIsInsideTooltip) return;
      closeTooltip();
    };

    window.addEventListener("click", containsTileTooltip, true);
    return () => window.removeEventListener("click", containsTileTooltip, true);
  }, [selectedTile, tileTooltipRef, closeTooltip, index]);

  const label =
    activityType === "RECOMPENSA"
      ? activityType
      : `${activityType} ${index + 1}`;
  const actionClassName =
    status === "LOCKED"
      ? "cursor-not-allowed rounded-xl border-2 border-b-[5px] border-[#c6cdd2] bg-[#edf1f3] px-4 py-2.5 text-sm font-black uppercase text-gray-400"
      : "flex w-full items-center justify-center rounded-xl border-2 border-b-[5px] border-[#078b99] bg-[#00acc1] px-4 py-2.5 text-sm font-black uppercase text-white shadow-sm transition duration-150 hover:-translate-y-0.5 hover:bg-[#20b5c4] active:translate-y-[3px] active:border-b-2";

  return (
    <div
      className={[
        "relative h-0 w-full",
        index === selectedTile ? "" : "invisible",
      ].join(" ")}
      ref={tileTooltipRef}
    >
      <div
        className={[
          "absolute z-30 flex w-[min(340px,calc(100vw-32px))] flex-col gap-2 rounded-[22px] border-2 bg-white p-3.5 font-bold shadow-[0_14px_30px_rgba(15,40,48,0.16)] transition-all duration-150",
          status === "ACTIVE"
            ? "border-[#00acc1]"
            : status === "LOCKED"
              ? "border-[#d7dfe4]"
              : "border-[#9eeff6]",
          index === selectedTile
            ? "top-3 translate-y-0 scale-100 opacity-100"
            : "-top-10 -translate-y-1 scale-95 opacity-0",
        ].join(" ")}
        style={{
          left: "max(16px, calc(50% - min(170px, calc((100vw - 32px) / 2))))",
        }}
      >
        <div
          className={[
            "absolute left-1/2 top-[-7px] h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-[3px] border-l-2 border-t-2 bg-white",
            status === "ACTIVE"
              ? "border-[#00acc1]"
              : status === "LOCKED"
                ? "border-[#d7dfe4]"
                : "border-[#9eeff6]",
          ].join(" ")}
        ></div>
        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#00838f]">
          {label}
        </div>
        <div
          className={[
            "text-base font-black leading-tight",
            status === "LOCKED" ? "text-gray-500" : "text-gray-800",
          ].join(" ")}
        >
          {description}
        </div>
        {status === "ACTIVE" ? (
          <Link href={lessonHref} className={actionClassName}>
            Empezar
          </Link>
        ) : status === "LOCKED" ? (
          <button className={actionClassName} disabled>
            Bloqueado
          </button>
        ) : (
          <Link href={lessonHref} className={actionClassName}>
            Practicar
          </Link>
        )}
      </div>
    </div>
  );
};

const UnitSection = ({
  unit,
  pathId,
  units,
}: {
  unit: Unit;
  pathId: LearningPathId;
  units: readonly Unit[];
}): JSX.Element => {
  const router = useRouter();

  const [selectedTile, setSelectedTile] = useState<null | number>(null);

  useEffect(() => {
    const unselectTile = () => setSelectedTile(null);
    window.addEventListener("scroll", unselectTile);
    return () => window.removeEventListener("scroll", unselectTile);
  }, []);

  const closeTooltip = useCallback(() => setSelectedTile(null), []);

  const lessonsCompleted = useBoundStore((x: BoundState) =>
    x.lessonsCompletedForPath(pathId),
  );
  const increaseLessonsCompleted = useBoundStore((x: BoundState) => {
    const increase: BoundState["increaseLessonsCompleted"] =
      x.increaseLessonsCompleted;
    return increase;
  });
  const increaseTeslas = useBoundStore((x: BoundState) => {
    const increase: BoundState["increaseTeslas"] = x.increaseTeslas;
    return increase;
  });

  return (
    <>
      <UnitHeader
        unitNumber={unit.unitNumber}
        description={unit.description}
        backgroundColor={unit.backgroundColor as `bg-${string}`}
        borderColor={unit.borderColor as `border-${string}`}
      />
      <div className="relative mb-8 mt-[67px] flex max-w-2xl flex-col items-center gap-8 px-4 sm:px-0">
        {unit.tiles.map((tile, i): JSX.Element => {
          const status = tileStatus(tile, lessonsCompleted, units);
          const nextTile = unit.tiles[i + 1];
          const nextStatus =
            nextTile !== undefined
              ? tileStatus(nextTile, lessonsCompleted, units)
              : undefined;
          const nodeOffset = getTileLeftOffset({
            index: i,
            unitNumber: unit.unitNumber,
            tilesLength: unit.tiles.length,
          });
          const nextNodeOffset =
            nextTile !== undefined
              ? getTileLeftOffset({
                  index: i + 1,
                  unitNumber: unit.unitNumber,
                  tilesLength: unit.tiles.length,
                })
              : 0;
          const activityType = getActivityType(tile);
          const description = getTileDescription({
            tile,
            status,
            unitNumber: unit.unitNumber,
          });
          const lessonHref = `/lesson?path=${pathId}&unit=${
            unit.unitNumber
          }&lesson=${i + 1}`;
          return (
            <Fragment key={i}>
              <div className="relative h-[104px] w-full">
                {nextStatus !== undefined && (
                  <CircuitConnector
                    fromOffset={nodeOffset}
                    toOffset={nextNodeOffset}
                    powered={status === "COMPLETE"}
                  />
                )}
                <div
                  className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 flex-col items-center"
                  style={{
                    transform: `translateX(calc(-50% + ${nodeOffset}px))`,
                  }}
                >
                  {tile.type === "fast-forward" && status === "LOCKED" ? (
                    <HoverLabel
                      text="Saltar"
                      textColor={unit.textColor as `text-${string}`}
                    />
                  ) : selectedTile !== i && status === "ACTIVE" ? (
                    <HoverLabel
                      text={activityType === "RECOMPENSA" ? "Bonus" : "Empezar"}
                      textColor={unit.textColor as `text-${string}`}
                    />
                  ) : null}
                  <LearningNode
                    tile={tile}
                    status={status}
                    onClick={() => {
                      if (tile.type === "treasure") {
                        if (status === "ACTIVE") {
                          increaseLessonsCompleted(4, pathId);
                          increaseTeslas(1);
                        }
                        return;
                      }
                      if (tile.type === "fast-forward" && status === "LOCKED") {
                        void router.push(
                          `/lesson?path=${pathId}&fast-forward=${unit.unitNumber}`,
                        );
                        return;
                      }
                      setSelectedTile(i);
                    }}
                  />
                  {activityType !== "PROYECTO" &&
                  activityType !== "RECOMPENSA" ? (
                    <div className="mt-2 max-w-[124px] truncate text-center text-[11px] font-bold text-gray-500">
                      {description}
                    </div>
                  ) : null}
                </div>
              </div>
              <TileTooltip
                selectedTile={selectedTile}
                index={i}
                lessonHref={lessonHref}
                description={description}
                activityType={activityType}
                status={status}
                closeTooltip={closeTooltip}
              />
            </Fragment>
          );
        })}
      </div>
    </>
  );
};

const getTopBarColors = (
  scrollY: number,
  units: readonly Unit[],
): {
  backgroundColor: `bg-${string}`;
  borderColor: `border-${string}`;
} => {
  const defaultColors = {
    backgroundColor: "bg-[#00ACC1]",
    borderColor: "border-[#00838F]",
  } as const;

  if (scrollY < 680) {
    return defaultColors;
  }

  const unit1 = units[1];
  if (scrollY < 1830 && unit1) {
    return {
      backgroundColor: unit1.backgroundColor as `bg-${string}`,
      borderColor: unit1.borderColor as `border-${string}`,
    };
  }

  const unit2 = units[2];
  if (unit2) {
    return {
      backgroundColor: unit2.backgroundColor as `bg-${string}`,
      borderColor: unit2.borderColor as `border-${string}`,
    };
  }

  return defaultColors;
};

const Learn: NextPage = () => {
  const router = useRouter();
  const { loginScreenState, setLoginScreenState } = useLoginScreen();
  const { unlockedKitIds, unlockedKitIdsLoaded } = useUnlockedKits();

  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const updateScrollY = () => setScrollY(globalThis.scrollY ?? scrollY);
    updateScrollY();
    document.addEventListener("scroll", updateScrollY);
    return () => document.removeEventListener("scroll", updateScrollY);
  }, [scrollY]);

  const requestedPathId =
    typeof router.query.path === "string"
      ? router.query.path
      : defaultLearningPathId;
  const requestedLearningPath =
    getLearningPathById(requestedPathId) ??
    getLearningPathById(defaultLearningPathId);
  const defaultLearningPath = getLearningPathById(defaultLearningPathId);

  const isLearningPathUnlocked = useCallback(
    (pathId: LearningPathId): boolean => {
      const learningPath = getLearningPathById(pathId);
      const kit =
        learningPath !== undefined ? getKitById(learningPath.kitId) : undefined;

      return kit !== undefined && isKitUnlocked(kit, unlockedKitIds);
    },
    [unlockedKitIds],
  );

  const selectedLearningPath =
    requestedLearningPath !== undefined &&
    (!unlockedKitIdsLoaded || isLearningPathUnlocked(requestedLearningPath.id))
      ? requestedLearningPath
      : defaultLearningPath;

  useEffect(() => {
    if (!router.isReady || !unlockedKitIdsLoaded) return;
    if (selectedLearningPath === undefined) return;
    if (requestedPathId === selectedLearningPath.id) return;

    void router.replace(
      {
        pathname: "/learn",
        query: { path: selectedLearningPath.id },
      },
      undefined,
      { shallow: true },
    );
  }, [router, requestedPathId, selectedLearningPath, unlockedKitIdsLoaded]);

  const learningPath = selectedLearningPath ?? defaultLearningPath;
  const units = learningPath?.units ?? [];
  const topBarColors = getTopBarColors(scrollY, units);
  const learningPathSelector =
    learningPath !== undefined ? (
      <LearningPathSelector
        selectedPathId={learningPath.id}
        isPathUnlocked={isLearningPathUnlocked}
        onSelectPath={(pathId) => {
          void router.push(
            {
              pathname: "/learn",
              query: { path: pathId },
            },
            undefined,
            { shallow: true },
          );
          scrollTo(0, 0);
        }}
      />
    ) : undefined;

  return (
    <>
      <TopBar
        backgroundColor={topBarColors.backgroundColor}
        borderColor={topBarColors.borderColor}
        learningPathName={learningPath?.name}
        learningPathEmoji={learningPath?.emoji}
        learningPathMenu={learningPathSelector}
      />

      <LeftBar selectedTab="APRENDER" />

      <div className="flex justify-center gap-3 pt-14 sm:p-6 sm:pt-10 md:ml-24 lg:ml-64 lg:gap-12">
        <div className="flex max-w-2xl grow flex-col">
          {units.map((unit) => (
            <UnitSection
              unit={unit}
              key={unit.unitNumber}
              pathId={learningPath?.id ?? defaultLearningPathId}
              units={units}
            />
          ))}
          <div className="sticky bottom-28 left-0 right-0 flex items-end justify-between">
            <Link
              href="/lesson?practice"
              className="absolute left-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-b-4 border-gray-200 bg-white transition hover:bg-gray-50 hover:brightness-90 md:left-0"
            >
              <span className="sr-only">Práctica</span>
              <PracticeExerciseSvg className="h-8 w-8" />
            </Link>
            {scrollY > 100 && (
              <button
                className="absolute right-4 flex h-14 w-14 items-center justify-center self-end rounded-2xl border-2 border-b-4 border-gray-200 bg-white transition hover:bg-gray-50 hover:brightness-90 md:right-0"
                onClick={() => scrollTo(0, 0)}
              >
                <span className="sr-only">Subir</span>
                <UpArrowSvg />
              </button>
            )}
          </div>
        </div>
        <RightBar
          learningPathId={learningPath?.id}
          learningPathName={learningPath?.name}
          learningPathEmoji={learningPath?.emoji}
          learningPathMenu={learningPathSelector}
        />
      </div>

      <div className="pt-[90px]"></div>

      <BottomBar selectedTab="APRENDER" />

      <LoginScreen
        loginScreenState={loginScreenState}
        setLoginScreenState={setLoginScreenState}
      />
    </>
  );
};

export default Learn;

const HoverLabel = ({
  text,
  textColor,
}: {
  text: string;
  textColor: `text-${string}`;
}) => {
  const hoverElement = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(72);

  useEffect(() => {
    setWidth(hoverElement.current?.clientWidth ?? width);
  }, [hoverElement.current?.clientWidth, width]);

  return (
    <div
      className={`absolute z-20 w-max rounded-md border-2 border-[#c6eef3] bg-white px-3 py-2 text-xs font-black uppercase shadow-sm ${textColor}`}
      style={{
        top: "-46px",
        left: `calc(50% - ${width / 2}px)`,
      }}
      ref={hoverElement}
    >
      {text}
      <div
        className="absolute h-3 w-3 rotate-45 border-b-2 border-r-2 border-[#c6eef3] bg-white"
        style={{ left: "calc(50% - 8px)", bottom: "-8px" }}
      ></div>
    </div>
  );
};

const UnitHeader = ({
  unitNumber,
  description,
  backgroundColor,
  borderColor,
}: {
  unitNumber: number;
  description: string;
  backgroundColor: `bg-${string}`;
  borderColor: `border-${string}`;
}) => {
  const [guideMessageShown, setGuideMessageShown] = useState(false);

  return (
    <article
      className={["max-w-2xl text-white sm:rounded-xl", backgroundColor].join(
        " ",
      )}
    >
      <header className="flex items-center justify-between gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">Unidad {unitNumber}</h2>
          <p className="text-lg">{description}</p>
        </div>
        <button
          className={[
            "flex items-center gap-3 rounded-2xl border-2 border-b-4 p-3 transition hover:text-gray-100",
            borderColor,
          ].join(" ")}
          onClick={() => setGuideMessageShown(true)}
        >
          <GuidebookSvg />
          <span className="sr-only font-bold uppercase lg:not-sr-only">
            Guía
          </span>
        </button>
      </header>
      {guideMessageShown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 text-gray-800">
          <section className="w-full max-w-sm rounded-2xl border-2 border-b-4 border-gray-200 bg-white p-6 text-center shadow-xl">
            <h3 className="text-2xl font-black">Guía Maker</h3>
            <p className="mt-3 font-bold text-gray-500">
              La guía de esta unidad estará disponible próximamente.
            </p>
            <button
              className="mt-5 rounded-2xl border-b-4 border-[#00838f] bg-[#00acc1] px-6 py-3 font-black uppercase text-white"
              onClick={() => setGuideMessageShown(false)}
            >
              Entendido
            </button>
          </section>
        </div>
      )}
    </article>
  );
};
