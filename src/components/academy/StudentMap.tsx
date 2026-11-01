import { PAKISTAN_OUTLINE, projectPakistan } from './pakistanOutline'

/* Where students have joined from (FAA brief §1). The cities sit too close together to pin on the
   whole country, so a zoomed circle over the Punjab shows them apart. */
const CITIES = [
  { name: 'Sialkot', lon: 74.53, lat: 32.49, side: 'right' },
  { name: 'Daska', lon: 74.35, lat: 32.33, side: 'left' },
  { name: 'Gujranwala', lon: 74.19, lat: 32.16, side: 'right' },
  { name: 'Lahore', lon: 74.35, lat: 31.52, side: 'left' },
  { name: 'Kasur', lon: 74.45, lat: 31.12, side: 'right' },
] as const

const FOCUS = projectPakistan(74.36, 31.8)
const LENS = { x: 600, y: 370, radius: 156, zoom: 4.4 }

const inLens = (lon: number, lat: number) => {
  const { x, y } = projectPakistan(lon, lat)
  return {
    x: LENS.x + (x - FOCUS.x) * LENS.zoom,
    y: LENS.y + (y - FOCUS.y) * LENS.zoom,
  }
}

const lensTransform = `translate(${LENS.x - FOCUS.x * LENS.zoom} ${LENS.y - FOCUS.y * LENS.zoom}) scale(${LENS.zoom})`

export function StudentMap() {
  return (
    <svg
      viewBox="0 0 760 540"
      role="img"
      aria-label={`Map of Pakistan with pins on ${CITIES.map((c) => c.name).join(', ')}`}
      className="student-map mt-8 h-auto w-full"
    >
      <defs>
        <clipPath id="student-map-lens">
          <circle cx={LENS.x} cy={LENS.y} r={LENS.radius} />
        </clipPath>
      </defs>

      <path d={PAKISTAN_OUTLINE} className="student-map-land" />

      <circle cx={FOCUS.x} cy={FOCUS.y} r={34} className="student-map-focus" />
      <path
        d={`M${FOCUS.x + 26} ${FOCUS.y + 22} L${LENS.x - 34} ${LENS.y - LENS.radius + 4} M${FOCUS.x + 34} ${FOCUS.y + 2} L${LENS.x + 120} ${LENS.y - LENS.radius + 58}`}
        className="student-map-link"
      />

      <circle cx={LENS.x} cy={LENS.y} r={LENS.radius} className="student-map-lens" />
      <g clipPath="url(#student-map-lens)">
        <path
          d={PAKISTAN_OUTLINE}
          transform={lensTransform}
          vectorEffect="non-scaling-stroke"
          className="student-map-land"
        />
      </g>
      <circle cx={LENS.x} cy={LENS.y} r={LENS.radius} className="student-map-rim" />

      {CITIES.map((city, i) => {
        const { x, y } = inLens(city.lon, city.lat)
        const right = city.side === 'right'
        return (
          <g key={city.name}>
            <circle
              cx={x}
              cy={y}
              r={9}
              className="student-map-pulse"
              style={{ animationDelay: `${i * 0.35}s`, transformOrigin: `${x}px ${y}px` }}
            />
            <circle cx={x} cy={y} r={7} className="student-map-pin" />
            <text
              x={right ? x + 15 : x - 15}
              y={y + 8}
              textAnchor={right ? 'start' : 'end'}
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
