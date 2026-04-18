export const RobotSvg = ({ className = "" }) => (
  <svg
    viewBox="0 0 200 200"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* cabeza */}
    <rect x="30" y="40" width="140" height="110" rx="30" fill="#1C2541" />

    {/* cara */}
    <rect x="45" y="55" width="110" height="80" rx="20" fill="#0B132B" />

    {/* ojos */}
    <circle cx="80" cy="95" r="10" fill="#00F5D4" />
    <circle cx="120" cy="95" r="10" fill="#00F5D4" />

    {/* sonrisa */}
    <rect x="75" y="115" width="50" height="10" rx="5" fill="#00F5D4" />

    {/* antena */}
    <line x1="100" y1="40" x2="100" y2="20" stroke="#00F5D4" strokeWidth="4" />
    <circle cx="100" cy="15" r="6" fill="#00F5D4" />

    {/* microbit flotando */}
    <rect x="70" y="150" width="60" height="35" rx="10" fill="#000" />

    {/* leds */}
    <circle cx="85" cy="165" r="3" fill="#FF4D6D" />
    <circle cx="100" cy="165" r="3" fill="#FF4D6D" />
    <circle cx="115" cy="165" r="3" fill="#FF4D6D" />
    <circle cx="92" cy="175" r="3" fill="#FF4D6D" />
    <circle cx="108" cy="175" r="3" fill="#FF4D6D" />
  </svg>
);