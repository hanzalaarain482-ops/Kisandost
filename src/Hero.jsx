// Khet ki saada tasveer (SVG) — welcome screen ke liye
export default function Hero() {
  return (
    <svg className="hero-art" viewBox="0 0 400 220" role="img" aria-label="کھیت اور سورج">
      <rect width="400" height="220" fill="#dcebdc" />
      <circle cx="318" cy="62" r="34" fill="#f4c35a" />
      <circle cx="318" cy="62" r="48" fill="#f4c35a" opacity="0.25" />
      <path d="M0 132 C 80 100, 160 104, 240 122 S 360 140, 400 118 L400 220 L0 220 Z" fill="#7fb069" />
      <path d="M0 160 C 100 130, 220 138, 300 156 S 380 170, 400 160 L400 220 L0 220 Z" fill="#4c8a4a" />
      <path d="M0 188 C 120 166, 260 172, 400 190 L400 220 L0 220 Z" fill="#1f5135" />
      <g stroke="#2f6b3c" strokeWidth="3" strokeLinecap="round" opacity="0.55">
        <path d="M30 196 L60 172" /><path d="M90 198 L118 170" /><path d="M150 200 L176 170" />
        <path d="M210 200 L232 172" /><path d="M270 202 L290 174" /><path d="M330 204 L346 178" />
      </g>
      <g fill="#e2a01b">
        {[40, 72, 104, 136].map((x) => (
          <g key={x} transform={`translate(${x} 120)`}>
            <rect x="-1.5" y="0" width="3" height="46" fill="#a87a14" />
            <ellipse cx="0" cy="-2" rx="6" ry="12" />
            <ellipse cx="-7" cy="10" rx="4" ry="8" transform="rotate(-25 -7 10)" />
            <ellipse cx="7" cy="10" rx="4" ry="8" transform="rotate(25 7 10)" />
          </g>
        ))}
      </g>
    </svg>
  )
}
