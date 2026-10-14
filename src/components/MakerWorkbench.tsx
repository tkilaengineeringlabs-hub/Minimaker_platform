/** One transparent, scalable composition; board details are semi-stylized. */
export const MakerWorkbench = () => (
  <svg
    viewBox="0 0 720 620"
    role="img"
    aria-labelledby="maker-workbench-title"
    className="h-auto w-full max-w-[720px]"
  >
    <title id="maker-workbench-title">
      Mesa maker con micro:bit, Arduino, Raspberry Pi, protoboard y sensores conectados
    </title>
    <defs>
      <pattern id="breadboard-holes" width="12" height="12" patternUnits="userSpaceOnUse">
        <rect x="4" y="4" width="3" height="3" rx="1" fill="#52616a" />
      </pattern>
      <pattern id="header-pins" width="10" height="10" patternUnits="userSpaceOnUse">
        <rect x="2" y="2" width="5" height="5" fill="#d6ba70" />
      </pattern>
    </defs>
    <g fill="none" stroke="#00acc1" strokeWidth="1" opacity=".3">
      <path d="M35 125H660M35 470H660M115 55V560M600 55V560" strokeDasharray="4 8" />
      <circle cx="355" cy="310" r="238" strokeDasharray="3 12" />
    </g>
    <g fill="none" strokeWidth="5" strokeLinecap="round">
      <path d="M290 260C415 235 290 460 442 460S620 390 564 325" stroke="#00acc1" />
      <path d="M265 260C350 315 222 413 321 451" stroke="#1c3543" />
      <path d="M505 215C615 190 625 60 526 65S451 121 478 149" stroke="#00acc1" />
      <path d="M238 409C105 465 56 358 126 326" stroke="#d89d3c" />
      <path d="M340 490C400 567 605 570 612 454" stroke="#1c3543" />
    </g>
    {/* micro:bit: LED matrix, buttons and edge connector. */}
    <g transform="translate(85 125) rotate(-8 110 70)">
      <rect x="4" y="8" width="220" height="145" rx="10" fill="#071014" opacity=".12" />
      <rect width="220" height="145" rx="10" fill="#152732" stroke="#071014" strokeWidth="2" />
      <path d="M17 22H62V46M157 24H198V57M22 95H63M158 96H194" fill="none" stroke="#356273" strokeWidth="2" />
      {Array.from({ length: 25 }, (_, i) => (
        <rect key={i} x={77 + (i % 5) * 14} y={30 + Math.floor(i / 5) * 14} width="7" height="7" fill={[6, 8, 16, 17, 18, 11, 13].includes(i) ? "#08d9d6" : "#4d6670"} />
      ))}
      {[30, 181].map((x) => <g key={x}><rect x={x - 9} y="55" width="26" height="26" rx="2" fill="#84949a" /><circle cx={x + 4} cy="68" r="7" fill="#071014" /></g>)}
      {[19, 61, 103, 145, 187].map((x) => <g key={x}><rect x={x} y="119" width="15" height="26" fill="#d6ba70" /><circle cx={x + 7.5} cy="130" r="4" fill="#152732" /></g>)}
      <text x="12" y="17" fill="#d8eeed" fontSize="10" fontFamily="monospace">micro:bit</text>
    </g>
    {/* Raspberry Pi: GPIO, processor, metal ports and board traces. */}
    <g transform="translate(421 144) rotate(10 103 74)">
      <rect x="4" y="8" width="204" height="151" rx="6" fill="#071014" opacity=".12" />
      <rect width="204" height="151" rx="6" fill="#246052" stroke="#123e36" strokeWidth="2" />
      <path d="M22 35H57V67H84M21 116H51V88H87M123 96H164V125M124 43H156V64H180" fill="none" stroke="#69a390" />
      <rect x="18" y="9" width="162" height="20" fill="#142b2b" />
      <rect x="20" y="11" width="158" height="16" fill="url(#header-pins)" />
      <rect x="72" y="49" width="53" height="53" fill="#1a252c" stroke="#9dada7" />
      <rect x="82" y="59" width="33" height="33" fill="#485a60" />
      {[45, 94].map((y) => <g key={y}><rect x="172" y={y} width="44" height="37" fill="#b6c2c7" stroke="#667d85" /><rect x="196" y={y + 6} width="20" height="24" fill="#243740" /></g>)}
      <rect x="41" y="131" width="28" height="24" fill="#b6c2c7" stroke="#667d85" />
      <rect x="85" y="132" width="34" height="22" fill="#b6c2c7" stroke="#667d85" />
      {[12, 157].map((x) => <circle key={x} cx={x} cy="137" r="5" fill="#d6ba70" />)}
      <text x="14" y="119" fill="#e0f4ec" fontSize="10" fontFamily="monospace">RASPBERRY PI</text>
    </g>
    {/* Arduino and its socket headers. */}
    <g transform="translate(108 326) rotate(6 112 75)">
      <rect x="4" y="8" width="226" height="157" rx="7" fill="#071014" opacity=".12" />
      <path d="M0 0H215L226 12V143L211 157H0Z" fill="#008c9e" stroke="#075766" strokeWidth="2" />
      <path d="M31 65H65V91H93M52 122H73V106H174M67 40H151V69H180" fill="none" stroke="#71c6cc" />
      <rect x="-10" y="27" width="45" height="42" fill="#bdcbd0" stroke="#647e86" />
      <rect x="-7" y="35" width="20" height="26" fill="#263a43" />
      <rect x="-6" y="94" width="38" height="28" rx="3" fill="#132a34" />
      <rect x="50" y="9" width="156" height="15" fill="#152732" />
      <rect x="52" y="11" width="150" height="10" fill="url(#header-pins)" />
      <rect x="62" y="133" width="140" height="15" fill="#152732" />
      <rect x="64" y="135" width="135" height="10" fill="url(#header-pins)" />
      <rect x="86" y="81" width="99" height="24" fill="#152732" />
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${90 + i * 7} 76v5m0 24v5`} stroke="#b8c7cb" strokeWidth="3" />)}
      <rect x="51" y="71" width="20" height="34" rx="7" fill="#b8c7cb" />
      <text x="76" y="58" fill="#e7fafb" fontSize="16" fontFamily="monospace" letterSpacing="2">ARDUINO</text>
      <circle cx="199" cy="76" r="4" fill="#08d9d6" />
    </g>
    {/* Breadboard and discrete components. */}
    <g transform="translate(410 387) rotate(-7 115 56)">
      <rect x="3" y="7" width="224" height="119" rx="5" fill="#071014" opacity=".12" />
      <rect width="224" height="119" rx="5" fill="#dfe9e8" stroke="#8ba2a6" />
      <rect x="12" y="20" width="200" height="80" fill="url(#breadboard-holes)" />
      <path d="M12 9H212M12 110H212" stroke="#00acc1" strokeWidth="2" />
      <path d="M12 15H212M12 104H212" stroke="#b8734c" />
      <path d="M12 59H212" stroke="#acbdbe" strokeWidth="5" />
      <path d="M50 37V67M84 37V67" stroke="#647e86" strokeWidth="2" />
      <rect x="48" y="42" width="38" height="12" rx="4" fill="#c8a979" />
      <path d="M57 42v12m8-12v12m12-12v12" stroke="#4d342a" strokeWidth="3" />
      <path d="M145 39V76M157 39V76" stroke="#647e86" strokeWidth="2" />
      <path d="M143 39V29a9 9 0 0 1 18 0v10Z" fill="#00acc1" stroke="#007b8c" />
      <path d="M101 86V70H122V39" fill="none" stroke="#1c3543" strokeWidth="3" />
    </g>
    <g transform="translate(339 291) rotate(-12)">
      <rect width="64" height="65" rx="3" fill="#15566a" stroke="#071014" />
      <rect x="16" y="10" width="32" height="32" fill="#a7bdc4" />
      <circle cx="32" cy="26" r="12" fill="#243c48" />
      <circle cx="32" cy="26" r="6" fill="#08d9d6" />
      <rect x="14" y="51" width="38" height="14" fill="url(#header-pins)" />
    </g>
    <g fill="#34505c" fontFamily="monospace" fontSize="12" letterSpacing="2">
      <text x="85" y="100">01 / PROGRAMAR</text>
      <text x="427" y="117">02 / CONECTAR</text>
      <text x="125" y="528">03 / CONSTRUIR</text>
      <text x="420" y="552">04 / EXPERIMENTAR</text>
    </g>
  </svg>
);
