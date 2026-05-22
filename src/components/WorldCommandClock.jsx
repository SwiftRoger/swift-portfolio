import { WEATHER_ICON } from '../world/realms'

export default function WorldCommandClock({ clock, weather }) {
  const w = weather?.toLowerCase()
  return (
    <div className="world-command-clock">
      <div className="world-command-clock__grid">
        <div className="world-command-clock__block">
          <span className="world-command-clock__label">STATION DATE</span>
          <span className="world-command-clock__date">{clock.worldDate}</span>
        </div>
        <div className="world-command-clock__block world-command-clock__block--time">
          <span className="world-command-clock__label">LIVE TIME (UTC)</span>
          <span className="world-command-clock__time">{clock.worldTime}</span>
        </div>
        <div className="world-command-clock__block world-command-clock__block--meta">
          <span className="world-command-clock__label">CONDITIONS</span>
          <span className="world-command-clock__meta">
            <span className="world-command-clock__season">{clock.season}</span>
            {weather && (
              <span className="world-command-clock__weather">
                {WEATHER_ICON[w] || '◌'} {weather}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
