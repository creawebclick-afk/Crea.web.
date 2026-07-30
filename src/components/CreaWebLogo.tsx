import React from 'react';

interface CreaWebLogoProps {
  variant?: 'full' | 'horizontal' | 'icon' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showText?: boolean;
}

export const CreaWebLogo: React.FC<CreaWebLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showText = true,
}) => {
  // Determine numerical dimensions based on size prop
  let pixelSize = 40;
  if (typeof size === 'number') {
    pixelSize = size;
  } else {
    switch (size) {
      case 'xs':
        pixelSize = 28;
        break;
      case 'sm':
        pixelSize = 36;
        break;
      case 'md':
        pixelSize = 48;
        break;
      case 'lg':
        pixelSize = 64;
        break;
      case 'xl':
        pixelSize = 96;
        break;
    }
  }

  // Pure SVG Emblem component representing the exact logo from the brand image
  const LogoEmblem = ({ width = pixelSize, height = pixelSize }: { width?: number; height?: number }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="select-none transition-transform hover:scale-105 duration-300"
    >
      <defs>
        {/* Neon Glow Outer Ring Gradient */}
        <linearGradient id="neonBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* Rocket Purple Gradient */}
        <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#581C87" />
        </linearGradient>

        {/* Mountain Peak 1 */}
        <linearGradient id="mountGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#7E22CE" />
        </linearGradient>

        {/* Mountain Peak 2 */}
        <linearGradient id="mountGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#6B21A8" />
        </linearGradient>

        {/* Trail Gradient */}
        <linearGradient id="trailGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7E22CE" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#A855F7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>

        {/* Outer Glow Filter */}
        <filter id="neonGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Circle Container Background */}
      <circle cx="250" cy="250" r="236" fill="#FFFFFF" />

      {/* Outer Neon Glow Ring */}
      <circle
        cx="250"
        cy="250"
        r="230"
        stroke="url(#neonBorder)"
        strokeWidth="14"
        fill="none"
        filter="url(#neonGlowFilter)"
      />

      {/* Decorative Swoosh Orbital Lines */}
      <path
        d="M 100 370 C 180 430, 320 440, 410 350"
        stroke="#9333EA"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M 70 340 C 130 400, 220 430, 290 410"
        stroke="#3B82F6"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M 230 60 C 330 70, 420 140, 440 230"
        stroke="#06B6D4"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Floating Dot Particles (Top left grid) */}
      <g fill="#A855F7" opacity="0.7">
        <circle cx="180" cy="80" r="4" />
        <circle cx="195" cy="80" r="4" />
        <circle cx="210" cy="80" r="4" />
        <circle cx="180" cy="95" r="4" />
        <circle cx="195" cy="95" r="4" />
        <circle cx="210" cy="95" r="4" />
        <circle cx="180" cy="110" r="4" />
        <circle cx="195" cy="110" r="4" />
        <circle cx="210" cy="110" r="4" />
      </g>

      {/* Floating Dot Particles (Bottom Right Grid) */}
      <g fill="#06B6D4" opacity="0.8">
        <circle cx="295" cy="325" r="4" />
        <circle cx="310" cy="325" r="4" />
        <circle cx="325" cy="325" r="4" />
        <circle cx="295" cy="340" r="4" />
        <circle cx="310" cy="340" r="4" />
        <circle cx="325" cy="340" r="4" />
        <circle cx="295" cy="355" r="4" />
        <circle cx="310" cy="355" r="4" />
        <circle cx="325" cy="355" r="4" />
      </g>

      {/* Decorative Sparkle Crosses (+) */}
      <g stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" opacity="0.8">
        <line x1="285" y1="120" x2="285" y2="132" />
        <line x1="279" y1="126" x2="291" y2="126" />

        <line x1="318" y1="180" x2="318" y2="190" />
        <line x1="313" y1="185" x2="323" y2="185" />

        <line x1="395" y1="290" x2="395" y2="304" />
        <line x1="388" y1="297" x2="402" y2="297" />

        <line x1="60" y1="190" x2="60" y2="198" />
        <line x1="56" y1="194" x2="64" y2="194" />
      </g>

      {/* Floating Dots */}
      <circle cx="115" cy="155" r="5" fill="#9333EA" />
      <circle cx="376" cy="170" r="4" fill="#3B82F6" />
      <circle cx="410" cy="370" r="6" fill="#06B6D4" />
      <circle cx="160" cy="380" r="6" fill="#9333EA" />

      {/* Computer Monitor Base & Frame */}
      <g>
        {/* Monitor Stand Base */}
        <path
          d="M 102 340 L 206 340 M 154 320 L 154 340"
          stroke="#0F0F23"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Outer Monitor Frame */}
        <rect
          x="64"
          y="200"
          width="180"
          height="120"
          rx="18"
          fill="#100A26"
          stroke="#0F0F23"
          strokeWidth="16"
        />

        {/* Monitor Screen Interior background */}
        <rect x="72" y="208" width="164" height="104" rx="12" fill="#181138" />

        {/* Mountain Peaks inside Screen */}
        {/* Mountain 1 (Left background) */}
        <polygon points="120,312 155,260 190,312" fill="url(#mountGrad1)" />
        {/* Mountain 2 (Right foreground) */}
        <polygon points="150,312 185,245 220,312" fill="url(#mountGrad2)" />
      </g>

      {/* Rocket Launch Trail (Curving out from screen) */}
      <path
        d="M 85 305 C 80 230, 115 190, 175 160"
        stroke="url(#trailGrad)"
        strokeWidth="32"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 85 305 C 80 230, 115 190, 175 160"
        stroke="#C084FC"
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Rocket Graphic */}
      <g transform="translate(140, 138) rotate(-35)">
        {/* Rocket Wings / Fins */}
        <path d="M -10 25 L -26 42 L -6 38 Z" fill="#0F0F23" />
        <path d="M 10 25 L 26 42 L 6 38 Z" fill="#0F0F23" />

        {/* Rocket Main Body */}
        <path
          d="M 0 -28 C 18 -10, 16 20, 12 36 L -12 36 C -16 20, -18 -10, 0 -28 Z"
          fill="url(#rocketBody)"
        />

        {/* Rocket Tip Highlight */}
        <path d="M 0 -28 C 10 -15, 8 0, 0 0 C -8 0, -10 -15, 0 -28 Z" fill="#A855F7" />

        {/* Rocket Window */}
        <circle cx="0" cy="10" r="7" fill="#FFFFFF" stroke="#0F0F23" strokeWidth="3" />
      </g>

      {/* Mouse Pointer Arrow Cursor */}
      <g transform="translate(205, 275)">
        <polygon
          points="0,0 0,42 12,30 22,50 30,46 20,26 34,26"
          fill="#0F0F23"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </g>

      {/* Text "CREAWEB" inside full emblem logo */}
      <text
        x="256"
        y="272"
        fill="#0F0F23"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontWeight="900"
        fontSize="56"
        letterSpacing="-1.5px"
      >
        CREAWEB
      </text>
    </svg>
  );

  // If variant is badge/icon, output pure badge emblem
  if (variant === 'badge' || variant === 'icon' || !showText) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <LogoEmblem width={pixelSize} height={pixelSize} />
      </div>
    );
  }

  // Full Circular Badge option (The entire artwork as uploaded)
  if (variant === 'full') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <LogoEmblem width={pixelSize * 2.5} height={pixelSize * 2.5} />
      </div>
    );
  }

  // Default 'horizontal' variant: Emblem icon + Crisp "CREAWEB" typography
  return (
    <div className={`inline-flex items-center gap-3 select-none group cursor-pointer ${className}`}>
      {/* Emblem SVG */}
      <div className="relative flex items-center justify-center">
        <LogoEmblem width={pixelSize} height={pixelSize} />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black tracking-tight text-white group-hover:text-purple-300 transition-colors">
              CREA<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">WEB</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              PE
            </span>
          </div>
          <span className="text-[10px] text-gray-400 tracking-wider font-medium uppercase -mt-0.5">
            Servicios Digitales
          </span>
        </div>
      )}
    </div>
  );
};
