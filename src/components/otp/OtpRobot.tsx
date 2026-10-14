import styles from "./OtpMission.module.css";

export type RobotMood = "waiting" | "scanning" | "confused" | "happy";

export const OtpRobot = ({ mood }: { mood: RobotMood }) => (
  <svg
    viewBox="0 0 320 300"
    role="img"
    aria-label={
      {
        waiting: "Robot maker curioso",
        scanning: "Robot maker escaneando el código",
        confused: "Robot maker confundido",
        happy: "Robot maker feliz",
      }[mood]
    }
    className={`${styles.robot} ${mood === "happy" ? styles.happy : ""}`}
  >
    <g fill="none" stroke="#00acc1" opacity=".25">
      <path
        d="M30 40h32m-32 0v32m228-32h32v32M30 228v32h32m228-32v32h-32"
        strokeWidth="2"
      />
      <circle cx="160" cy="146" r="113" strokeDasharray="3 9" />
    </g>
    <ellipse cx="160" cy="277" rx="76" ry="8" fill="#071014" opacity=".09" />
    <g stroke="#102a36" strokeWidth="4" strokeLinejoin="round">
      <path d="M160 47V28" fill="none" />
      <rect x="152" y="16" width="16" height="16" rx="3" fill="#08d9d6" />
      <path
        d="M103 181l-25 21-10 30m149-51 25 21 10-30"
        fill="none"
        strokeWidth="13"
      />
      <path d="M57 233l10-10 13 8m160-65 12 13 13-10" fill="none" />
      <path d="M122 243v21h-17m93-21v21h17" fill="none" strokeWidth="10" />
      <rect x="111" y="173" width="98" height="74" rx="12" fill="#e0f7f7" />
      <path d="M133 187h54v40h-54z" fill="#08d9d6" />
      <path d="M143 200h14v14h-14m29-14h-9v14h9" fill="none" strokeWidth="3" />
      <rect x="64" y="92" width="18" height="43" rx="4" fill="#00acc1" />
      <rect x="238" y="92" width="18" height="43" rx="4" fill="#00acc1" />
      <path d="M94 51h132l15 15v95l-15 15H94l-15-15V66z" fill="#08d9d6" />
      <rect x="94" y="72" width="132" height="81" rx="9" fill="#102a36" />
    </g>
    <g fill="#8ff5ee" stroke="#8ff5ee" strokeWidth="4" strokeLinecap="square">
      {mood === "happy" ? (
        <>
          <path d="m115 106 9-9 9 9m54 0 9-9 9 9" fill="none" />
          <path d="M145 121v7h30v-7" fill="none" />
        </>
      ) : mood === "confused" ? (
        <>
          <path d="m114 95 19 6m54 0 18-7" fill="none" />
          <rect x="121" y="107" width="7" height="8" />
          <rect x="190" y="106" width="7" height="12" />
          <path d="m148 135 9-4 14 3" fill="none" />
        </>
      ) : (
        <>
          <rect
            x={mood === "scanning" ? 120 : 116}
            y="99"
            width="17"
            height={mood === "scanning" ? 8 : 18}
            rx="2"
          />
          <rect
            x={mood === "scanning" ? 190 : 184}
            y="99"
            width="17"
            height={mood === "scanning" ? 8 : 18}
            rx="2"
          />
          <path d="M151 134h18" />
        </>
      )}
    </g>
    {mood === "scanning" && (
      <rect
        className={styles.scan}
        x="98"
        y="78"
        width="124"
        height="3"
        fill="#08d9d6"
      />
    )}
    {mood === "confused" && (
      <text
        x="264"
        y="83"
        fill="#00838f"
        fontFamily="Jersey 10, monospace"
        fontSize="42"
      >
        ?
      </text>
    )}
    {mood === "happy" && (
      <g fill="none" stroke="#00acc1" strokeWidth="3">
        <path d="m260 75 8 8 16-19M43 86v14m-7-7h14" />
      </g>
    )}
  </svg>
);
