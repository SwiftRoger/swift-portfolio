export default function WorldGlobeButton({ onClick, active }) {
  return (
    <button
      type="button"
      className={`world-globe-btn ${active ? 'world-globe-btn--active' : ''}`}
      onClick={onClick}
      title="World map — all regions"
      aria-label="Open world map"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.8 4 6.2 4 9s-1.5 6.2-4 9M12 3c-2.5 2.8-4 6.2-4 9s1.5 6.2 4 9" />
      </svg>
      <span>WORLD MAP</span>
    </button>
  )
}
