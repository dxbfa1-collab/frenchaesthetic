import { KASHMIR_OUTLINE, PAKISTAN_OUTLINE, projectPakistan } from './pakistanOutline'

/*
  Cities students have joined from (owner, 1 Nov 2026). Only add a city the owner has confirmed.
  Many pins sit close together, so each label has its own place (x, y) and a thin line to its pin.
  `end` means the label's text ends at x. Twin cities get a small `shift` so both pins show.
*/
type City = {
  name: string
  lon: number
  lat: number
  x: number
  y: number
  end?: boolean
  shift?: number
}

const CITIES: City[] = [
  { name: 'Swat', lon: 72.36, lat: 34.77, x: 372, y: 62, end: true },
  { name: 'Swabi', lon: 72.47, lat: 34.12, x: 312, y: 92, end: true },
  { name: 'Peshawar', lon: 71.58, lat: 34.02, x: 312, y: 128, end: true },
  { name: 'Abbottabad', lon: 73.21, lat: 34.15, x: 490, y: 92 },
  { name: 'Islamabad', lon: 73.05, lat: 33.69, x: 490, y: 122 },
  { name: 'Rawalpindi', lon: 73.05, lat: 33.6, x: 490, y: 152, shift: 3 },
  { name: 'Sialkot', lon: 74.53, lat: 32.49, x: 490, y: 182 },
  { name: 'Daska', lon: 74.35, lat: 32.33, x: 490, y: 212 },
  { name: 'Gujranwala', lon: 74.19, lat: 32.16, x: 396, y: 196, end: true },
  { name: 'Lahore', lon: 74.35, lat: 31.52, x: 490, y: 242 },
  { name: 'Kasur', lon: 74.45, lat: 31.12, x: 490, y: 272 },
  { name: 'Multan', lon: 71.47, lat: 30.16, x: 336, y: 272, end: true },
  { name: 'Bahawalpur', lon: 71.68, lat: 29.4, x: 342, y: 310, end: true },
]

export function StudentMap() {
  return (
    <svg
      viewBox="0 0 640 530"
      role="img"
      aria-label={`Map of Pakistan with pins on ${CITIES.map((c) => c.name).join(', ')}`}
      className="student-map mt-8 h-auto w-full"
    >
      <defs>
        <pattern
          id="student-map-hatch"
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="7" className="student-map-hatch" />
        </pattern>
      </defs>

      <path d={KASHMIR_OUTLINE} fill="url(#student-map-hatch)" className="student-map-disputed" />
      <path d={PAKISTAN_OUTLINE} className="student-map-land" />

      {CITIES.map((city) => {
        const pin = projectPakistan(city.lon, city.lat)
        const y = pin.y + (city.shift ?? 0)
        return (
          <line
            key={city.name}
            x1={pin.x}
            y1={y}
            x2={city.end ? city.x + 5 : city.x - 5}
            y2={city.y - 6}
            className="student-map-leader"
          />
        )
      })}

      {CITIES.map((city, i) => {
        const pin = projectPakistan(city.lon, city.lat)
        const y = pin.y + (city.shift ?? 0)
        return (
          <g key={city.name}>
            <circle
              cx={pin.x}
              cy={y}
              r={6}
              className="student-map-pulse"
              style={{ animationDelay: `${i * 0.25}s`, transformOrigin: `${pin.x}px ${y}px` }}
            />
            <circle cx={pin.x} cy={y} r={5} className="student-map-pin" />
            <text
              x={city.x}
              y={city.y}
              textAnchor={city.end ? 'end' : 'start'}
              className="student-map-label"
            >
              {city.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
