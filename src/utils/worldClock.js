export function getWorldClock(now = new Date()) {
  const utcMonth = now.getUTCMonth()
  const season =
    utcMonth >= 2 && utcMonth <= 4 ? 'spring'
      : utcMonth >= 5 && utcMonth <= 7 ? 'summer'
        : utcMonth >= 8 && utcMonth <= 10 ? 'autumn'
          : 'winter'

  return {
    worldDate: now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }) + ', 2070',
    worldTime: now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    }) + ' UTC',
    season,
  }
}
