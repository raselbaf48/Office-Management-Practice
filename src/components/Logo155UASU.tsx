import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const Logo155UASU: React.FC<LogoProps> = ({
  className = 'w-12 h-14',
  size,
}) => {
  let sizeStyle: React.CSSProperties = {};

  if (typeof size === 'number') {
    sizeStyle = { width: size, height: (size * 1.2) };
  }

  const getSizeClass = () => {
    if (typeof size === 'number') return '';
    if (size === 'sm') return 'w-8 h-10';
    if (size === 'md') return 'w-12 h-15';
    if (size === 'lg') return 'w-18 h-22';
    if (size === 'xl') return 'w-24 h-30';
    return className;
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none ${getSizeClass()}`}
      style={sizeStyle}
    >
      <svg
        viewBox="0 0 300 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md overflow-visible"
        aria-label="155 UASU BAF Crest"
      >
        <defs>
          {/* Gold Gradients */}
          <linearGradient id="goldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2A3" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="60%" stopColor="#AA771C" />
            <stop offset="85%" stopColor="#F9E27A" />
            <stop offset="100%" stopColor="#8C5E0A" />
          </linearGradient>

          <linearGradient id="goldLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF6B8" />
            <stop offset="50%" stopColor="#DFB645" />
            <stop offset="100%" stopColor="#B38018" />
          </linearGradient>

          <linearGradient id="goldDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#966B12" />
            <stop offset="100%" stopColor="#4A3405" />
          </linearGradient>

          {/* Shield Body Gradient (Deep Military Emerald to Midnight Navy) */}
          <linearGradient id="shieldField" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#042617" />
            <stop offset="50%" stopColor="#021A10" />
            <stop offset="100%" stopColor="#01100A" />
          </linearGradient>

          {/* Banner Red Gradient */}
          <linearGradient id="bannerRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A81818" />
            <stop offset="50%" stopColor="#820D0D" />
            <stop offset="100%" stopColor="#5E0505" />
          </linearGradient>

          {/* Drone Metallic Silver */}
          <linearGradient id="droneSilver" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#E2E8F0" />
            <stop offset="80%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>

          {/* Lightning Glow */}
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#FFE066" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* ======================================================== */}
        {/* 1. OUTER LAUREL WREATH (FLANKING THE SHIELD)             */}
        {/* ======================================================== */}
        <g id="laurelWreath" opacity="0.95">
          {/* Left Laurel Leaves */}
          <g fill="url(#goldMetallic)" stroke="#744D06" strokeWidth="0.75">
            {/* Lower to Upper Left Leaves */}
            <path d="M75 285 C55 270 42 245 42 220 C42 205 48 190 56 175 C50 185 48 200 50 215 C52 235 62 260 75 285 Z" />
            <ellipse cx="44" cy="235" rx="14" ry="7" transform="rotate(-35 44 235)" />
            <ellipse cx="40" cy="208" rx="15" ry="7" transform="rotate(-20 40 208)" />
            <ellipse cx="42" cy="180" rx="15" ry="7" transform="rotate(-5 42 180)" />
            <ellipse cx="48" cy="153" rx="14" ry="7" transform="rotate(15 48 153)" />
            <ellipse cx="58" cy="128" rx="13" ry="6.5" transform="rotate(30 58 128)" />
            <ellipse cx="72" cy="106" rx="12" ry="6" transform="rotate(45 72 106)" />
            
            {/* Inner Left Leaves */}
            <ellipse cx="55" cy="248" rx="12" ry="6" transform="rotate(-50 55 248)" />
            <ellipse cx="50" cy="222" rx="13" ry="6" transform="rotate(-35 50 222)" />
            <ellipse cx="52" cy="195" rx="13" ry="6.5" transform="rotate(-15 52 195)" />
            <ellipse cx="58" cy="168" rx="12" ry="6" transform="rotate(5 58 168)" />
            <ellipse cx="68" cy="142" rx="11" ry="5.5" transform="rotate(25 68 142)" />
            <ellipse cx="82" cy="120" rx="10" ry="5" transform="rotate(40 82 120)" />
          </g>

          {/* Right Laurel Leaves */}
          <g fill="url(#goldMetallic)" stroke="#744D06" strokeWidth="0.75">
            {/* Lower to Upper Right Leaves */}
            <path d="M225 285 C245 270 258 245 258 220 C258 205 252 190 244 175 C250 185 252 200 250 215 C248 235 238 260 225 285 Z" />
            <ellipse cx="256" cy="235" rx="14" ry="7" transform="rotate(35 256 235)" />
            <ellipse cx="260" cy="208" rx="15" ry="7" transform="rotate(20 260 208)" />
            <ellipse cx="258" cy="180" rx="15" ry="7" transform="rotate(5 258 180)" />
            <ellipse cx="252" cy="153" rx="14" ry="7" transform="rotate(-15 252 153)" />
            <ellipse cx="242" cy="128" rx="13" ry="6.5" transform="rotate(-30 242 128)" />
            <ellipse cx="228" cy="106" rx="12" ry="6" transform="rotate(-45 228 106)" />
            
            {/* Inner Right Leaves */}
            <ellipse cx="245" cy="248" rx="12" ry="6" transform="rotate(50 245 248)" />
            <ellipse cx="250" cy="222" rx="13" ry="6" transform="rotate(35 250 222)" />
            <ellipse cx="248" cy="195" rx="13" ry="6.5" transform="rotate(15 248 195)" />
            <ellipse cx="242" cy="168" rx="12" ry="6" transform="rotate(-5 242 168)" />
            <ellipse cx="232" cy="142" rx="11" ry="5.5" transform="rotate(-25 232 142)" />
            <ellipse cx="218" cy="120" rx="10" ry="5" transform="rotate(-40 218 120)" />
          </g>

          {/* Bottom Laurel Tie Ribbon */}
          <path
            d="M135 295 C145 302 155 302 165 295 C170 305 160 315 150 312 C140 315 130 305 135 295 Z"
            fill="url(#goldLight)"
            stroke="#744D06"
            strokeWidth="1"
          />
        </g>

        {/* ======================================================== */}
        {/* 2. MAIN HERALDIC SHIELD                                  */}
        {/* ======================================================== */}
        {/* Outer Shield Gold Border */}
        <path
          d="M65 75 C65 75 110 65 150 65 C190 65 235 75 235 75 C235 150 230 225 150 280 C70 225 65 150 65 75 Z"
          fill="url(#goldMetallic)"
          stroke="#523604"
          strokeWidth="2.5"
          filter="drop-shadow(0 3px 4px rgba(0,0,0,0.4))"
        />

        {/* Inner Gold Rim Layer */}
        <path
          d="M72 82 C72 82 112 73 150 73 C188 73 228 82 228 82 C228 148 223 216 150 268 C77 216 72 148 72 82 Z"
          fill="url(#goldDark)"
        />

        {/* Inner Bevel Gold Border */}
        <path
          d="M75 85 C75 85 114 77 150 77 C186 77 225 85 225 85 C225 146 220 212 150 262 C80 212 75 146 75 85 Z"
          fill="url(#goldLight)"
        />

        {/* Shield Field / Canvas (Deep Emerald/Navy) */}
        <path
          d="M78 88 C78 88 115 81 150 81 C185 81 222 88 222 88 C222 144 217 208 150 256 C83 208 78 144 78 88 Z"
          fill="url(#shieldField)"
          stroke="#000000"
          strokeWidth="1"
        />

        {/* ======================================================== */}
        {/* 3. TACTICAL RADAR GRID & CROSSHAIRS                      */}
        {/* ======================================================== */}
        <g opacity="0.35" stroke="#4ADE80" strokeWidth="0.75" strokeDasharray="3 3">
          {/* Radar Circles */}
          <circle cx="150" cy="168" r="30" fill="none" />
          <circle cx="150" cy="168" r="55" fill="none" />
          <circle cx="150" cy="168" r="75" fill="none" />
          {/* Crosshairs */}
          <line x1="80" y1="168" x2="220" y2="168" />
          <line x1="150" y1="95" x2="150" y2="245" />
          {/* Diagonals */}
          <line x1="100" y1="118" x2="200" y2="218" />
          <line x1="100" y1="218" x2="200" y2="118" />
        </g>

        {/* ======================================================== */}
        {/* 4. DUAL GOLDEN LIGHTNING BOLTS (EW & STRIKE)             */}
        {/* ======================================================== */}
        <g id="lightningBolts" filter="url(#goldGlow)">
          {/* Left-to-Right Lightning Bolt */}
          <polygon
            points="105,120 138,155 125,160 175,215 150,175 163,170 120,125"
            fill="url(#goldLight)"
            stroke="#8C5E0A"
            strokeWidth="0.75"
          />
          {/* Right-to-Left Lightning Bolt */}
          <polygon
            points="195,120 162,155 175,160 125,215 150,175 137,170 180,125"
            fill="url(#goldLight)"
            stroke="#8C5E0A"
            strokeWidth="0.75"
          />
        </g>

        {/* ======================================================== */}
        {/* 5. TACTICAL UAV DRONE SILHOUETTE (155 UASU CENTERPIECE)  */}
        {/* ======================================================== */}
        <g id="uavDrone" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.6))">
          {/* Twin Tail Booms */}
          <path
            d="M130 165 L124 205 L130 210 L132 205 L134 165 Z"
            fill="url(#droneSilver)"
            stroke="#1E293B"
            strokeWidth="0.5"
          />
          <path
            d="M170 165 L176 205 L170 210 L168 205 L166 165 Z"
            fill="url(#droneSilver)"
            stroke="#1E293B"
            strokeWidth="0.5"
          />
          {/* Inverted V-Tail Stabilizers */}
          <polygon points="120,212 134,206 138,206 122,216" fill="#CBD5E1" />
          <polygon points="180,212 166,206 162,206 178,216" fill="#CBD5E1" />
          {/* Tail Connector Rudder */}
          <line x1="126" y1="205" x2="174" y2="205" stroke="#94A3B8" strokeWidth="2.5" />

          {/* Main Swept Wings */}
          <polygon
            points="150,150 220,160 222,165 178,168 150,172 122,168 78,165 80,160"
            fill="url(#droneSilver)"
            stroke="#334155"
            strokeWidth="0.75"
          />

          {/* Fuselage / Airframe Body */}
          <path
            d="M150 128 C153 128 157 135 157 150 C157 165 155 185 150 190 C145 185 143 165 143 150 C143 135 147 128 150 128 Z"
            fill="url(#droneSilver)"
            stroke="#1E293B"
            strokeWidth="0.75"
          />

          {/* Forward EO/IR Sensor Turret (Gimbal Camera Dome) */}
          <circle cx="150" cy="133" r="5" fill="#0284C7" stroke="#F8FAFC" strokeWidth="1" />
          <circle cx="151" cy="132" r="1.5" fill="#FFFFFF" />

          {/* Wingtip Antenna Pods */}
          <rect x="76" y="160" width="3.5" height="6" rx="1.5" fill="#F59E0B" />
          <rect x="220.5" y="160" width="3.5" height="6" rx="1.5" fill="#F59E0B" />

          {/* Fuselage Spine Accent */}
          <line x1="150" y1="140" x2="150" y2="182" stroke="#0F172A" strokeWidth="1" />
        </g>

        {/* ======================================================== */}
        {/* 6. BANGLADESH NATIONAL ROUNDEL INSIGNIA (CENTER)        */}
        {/* ======================================================== */}
        <g id="bafRoundel" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.5))">
          {/* Gold Insignia Ring */}
          <circle cx="150" cy="162" r="13" fill="#DFB645" stroke="#744D06" strokeWidth="1" />
          {/* Green Outer Disc (National Green) */}
          <circle cx="150" cy="162" r="11" fill="#006A4E" stroke="#004D38" strokeWidth="0.75" />
          {/* Red Inner Circle (National Red Sun) */}
          <circle cx="149.2" cy="162" r="6.5" fill="#F42A41" />
        </g>

        {/* ======================================================== */}
        {/* 7. TOP CREST: BAF EAGLE / WINGS OF GLORY                */}
        {/* ======================================================== */}
        <g id="topEagleCrest">
          {/* Eagle Spread Wings */}
          <path
            d="M150 48 C160 30 185 24 205 32 C185 36 170 45 162 56 C175 52 195 54 208 64 C190 65 175 72 165 80 C158 72 153 62 150 48 Z"
            fill="url(#goldLight)"
            stroke="#744D06"
            strokeWidth="0.75"
          />
          <path
            d="M150 48 C140 30 115 24 95 32 C115 36 130 45 138 56 C125 52 105 54 92 64 C110 65 125 72 135 80 C142 72 147 62 150 48 Z"
            fill="url(#goldLight)"
            stroke="#744D06"
            strokeWidth="0.75"
          />
          {/* Eagle Crown / Water Lily Star Center */}
          <polygon
            points="150,22 153,29 160,29 155,34 157,41 150,37 143,41 145,34 140,29 147,29"
            fill="url(#goldLight)"
            stroke="#8C5E0A"
            strokeWidth="0.75"
            filter="url(#goldGlow)"
          />
          <circle cx="150" cy="33" r="2.5" fill="#F42A41" />
        </g>

        {/* ======================================================== */}
        {/* 8. TOP BANNER: "155 UASU BAF"                            */}
        {/* ======================================================== */}
        <g id="topBanner">
          {/* Banner Ribbon Tails */}
          <polygon points="68,68 85,58 85,78 68,68" fill="#5E0505" stroke="#380202" strokeWidth="0.75" />
          <polygon points="232,68 215,58 215,78 232,68" fill="#5E0505" stroke="#380202" strokeWidth="0.75" />

          {/* Main Top Curved Banner Body */}
          <path
            d="M78 68 C115 56 185 56 222 68 L226 84 C185 72 115 72 74 84 Z"
            fill="url(#goldMetallic)"
            stroke="#523604"
            strokeWidth="1.5"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
          />

          {/* Inner Banner Inset */}
          <path
            d="M82 70 C117 60 183 60 218 70 L221 80 C183 71 117 71 79 80 Z"
            fill="url(#bannerRed)"
          />

          {/* Top Banner Text */}
          <text
            x="150"
            y="77.5"
            textAnchor="middle"
            fontFamily="'Arial Black', 'Impact', sans-serif"
            fontSize="11.5"
            fontWeight="900"
            letterSpacing="2.2"
            fill="#FFF5C2"
            stroke="#000000"
            strokeWidth="0.4"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
          >
            155 UASU BAF
          </text>
        </g>

        {/* ======================================================== */}
        {/* 9. BOTTOM MOTTO SCROLL BANNER: "INTEL • SURVEILLANCE • STRIKE" */}
        {/* ======================================================== */}
        <g id="bottomMottoBanner" filter="drop-shadow(0 3px 5px rgba(0,0,0,0.5))">
          {/* Ribbon End Fold Left */}
          <polygon points="35,310 55,296 55,322 35,310" fill="#5E0505" stroke="#4A3405" strokeWidth="0.75" />
          <polygon points="35,310 50,300 55,322 35,310" fill="#820D0D" />

          {/* Ribbon End Fold Right */}
          <polygon points="265,310 245,296 245,322 265,310" fill="#5E0505" stroke="#4A3405" strokeWidth="0.75" />
          <polygon points="265,310 250,300 245,322 265,310" fill="#820D0D" />

          {/* Main Flowing Scroll Body */}
          <path
            d="M48 304 C95 292 205 292 252 304 L248 326 C202 314 98 314 52 326 Z"
            fill="url(#goldMetallic)"
            stroke="#523604"
            strokeWidth="1.5"
          />

          {/* Inner Scroll Crimson Inset */}
          <path
            d="M53 306.5 C98 295.5 202 295.5 247 306.5 L244 322.5 C200 312 100 312 56 322.5 Z"
            fill="url(#bannerRed)"
            stroke="#450A0A"
            strokeWidth="0.75"
          />

          {/* Motto Text */}
          <text
            x="150"
            y="317"
            textAnchor="middle"
            fontFamily="'Arial Black', 'Impact', sans-serif"
            fontSize="8.5"
            fontWeight="900"
            letterSpacing="1.2"
            fill="#FFF5C2"
            stroke="#000000"
            strokeWidth="0.3"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}
          >
            INTEL • SURVEILLANCE • STRIKE
          </text>
        </g>
      </svg>
    </div>
  );
};
