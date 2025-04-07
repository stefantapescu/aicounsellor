interface RoboYouniMascotProps {
  className?: string
  width?: number
  height?: number
}

export function RoboYouniMascot({ className, width = 120, height = 120 }: RoboYouniMascotProps) {
  return (
    <div className={className}>
      <svg width={width} height={height} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Robot Head */}
        <rect x="30" y="20" width="60" height="50" rx="10" fill="#6D28D9" />

        {/* Robot Eyes */}
        <circle cx="45" cy="40" r="8" fill="#F3F4F6" />
        <circle cx="75" cy="40" r="8" fill="#F3F4F6" />
        <circle cx="45" cy="40" r="4" fill="#EC4899" />
        <circle cx="75" cy="40" r="4" fill="#EC4899" />

        {/* Robot Mouth */}
        <rect x="40" y="55" width="40" height="5" rx="2.5" fill="#F3F4F6" />

        {/* Robot Antenna */}
        <rect x="55" y="10" width="10" height="10" rx="5" fill="#EC4899" />
        <rect x="57.5" y="10" width="5" height="15" fill="#6D28D9" />

        {/* Robot Body */}
        <rect x="40" y="70" width="40" height="30" rx="5" fill="#8B5CF6" />

        {/* Robot Arms */}
        <rect x="15" y="75" width="25" height="10" rx="5" fill="#8B5CF6" />
        <rect x="80" y="75" width="25" height="10" rx="5" fill="#8B5CF6" />

        {/* Robot Legs */}
        <rect x="45" y="100" width="10" height="20" rx="5" fill="#6D28D9" />
        <rect x="65" y="100" width="10" height="20" rx="5" fill="#6D28D9" />
      </svg>
    </div>
  )
}

