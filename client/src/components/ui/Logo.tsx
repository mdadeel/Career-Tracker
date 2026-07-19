import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const Logo: React.FC<LogoProps> = ({ size = 28, className, ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="ct-grad-1" x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f46e5" /> {/* Indigo 600 */}
          <stop offset="50%" stopColor="#6366f1" /> {/* Indigo 500 */}
          <stop offset="100%" stopColor="#818cf8" /> {/* Indigo 400 */}
        </linearGradient>
        <linearGradient id="ct-grad-2" x1="12" y1="28" x2="30" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" /> {/* Blue 500 */}
          <stop offset="50%" stopColor="#8b5cf6" /> {/* Purple 500 */}
          <stop offset="100%" stopColor="#ec4899" /> {/* Pink 500 */}
        </linearGradient>
      </defs>
      
      {/* Wave ribbon 1 (Blue/Purple) */}
      <path
        d="M 6 24 C 8 16, 12 14, 15 18 C 18 22, 21 21, 23.5 17.5 L 27.5 11"
        stroke="url(#ct-grad-2)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Wave ribbon 2 (Indigo/Pink) */}
      <path
        d="M 11 25 C 12.5 18, 15.5 16, 18 19.5 C 20.5 23, 23 20, 25.5 14.5 L 27.5 11"
        stroke="url(#ct-grad-1)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Arrowhead at top-right */}
      <path
        d="M 21.5 10.5 H 28 V 17"
        stroke="url(#ct-grad-1)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const LogoFull: React.FC<{ size?: number; showSubtitle?: boolean; className?: string; textClassName?: string }> = ({
  size = 28,
  showSubtitle = false,
  className = '',
  textClassName = 'text-ink dark:text-white/90',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Logo size={size} />
      <div className="flex flex-col">
        <span className={`text-base font-semibold tracking-tight leading-tight ${textClassName}`}>
          CareerTrack
        </span>
        {showSubtitle && (
          <span className="text-[8px] font-bold uppercase tracking-widest text-ink-tertiary dark:text-white/40 leading-none">
            Growth Platform
          </span>
        )}
      </div>
    </div>
  );
};

