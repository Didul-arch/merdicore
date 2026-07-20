interface VillageLogoProps {
  size?: number;
  className?: string;
}

export default function VillageLogo({ size = 40, className = '' }: VillageLogoProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="45" fill="#0f766e" />
      <path
        d="M50 22L53.5 31.5H63L55.5 37L58.5 46.5L50 41L41.5 46.5L44.5 37L37 31.5H46.5L50 22Z"
        fill="#eab308"
      />
      <path
        d="M30 65C35 60 42 58 50 58C58 58 65 60 70 65"
        stroke="#fef08a"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M50 35V58" stroke="#ffffff" strokeWidth="3" />
    </svg>
  );
}
