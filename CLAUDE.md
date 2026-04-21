# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **PWA monthly work schedule calendar** for a rotating shift worker. The rotation pattern is: 2 day shifts → 2 night shifts → 5 rest days. The app displays schedule data from a GitHub Gist, supports offline caching, and includes pay calculations with shift allowances.

## Tech Stack

- Pure HTML/CSS/JavaScript (no frameworks)
- PWA with Service Worker (offline-capable)
- Data persistence via GitHub Gist API
- Weather from Open-Meteo API (free, no API key)

## Development Commands

- Serve locally: `npx serve .` or open `index.html` directly
- No build step required — runs directly in browser

## Architecture

### Entry Point
- `index.html` — loads all scripts and contains the UI structure

### Scripts (in `scripts/`)

| File | Purpose |
|------|---------|
| `app.js` | Main entry, initializes all modules, loads Gist data |
| `calendar.js` | Calendar rendering, schedule state, multi-day selection via drag/long-press, pay calculation |
| `gist.js` | GitHub Gist API load/save (Gist ID + encoded token embedded) |
| `weather.js` | Fetches weather for Ottawa, Yantai, Nanjing from Open-Meteo API |
| `language.js` | i18n (EN/ZH), date formatting |
| `dark-mode.js` | Dark mode toggle with localStorage persistence |
| `export.js` | Print functionality via `window.print()` |
| `pwa.js` | Service worker registration |

### Data Flow
1. `App.init()` loads data via `Gist.load()` (reads from GitHub Gist)
2. `Calendar.setData()` stores schedules and renders calendar
3. On save, `Gist.save()` patches the Gist with updated JSON

### Key Data Structures

```json
// schedule.json stored in Gist
{
  "schedules": [
    { "date": "2026-04-16", "type": "day", "text": "白班" }
  ]
}
```

**Shift types**: `day`, `night`, `rest`, `personal`, `sick`, `annual`

### Pay Calculation (in `calendar.js`)
- Day shift: 07:30–19:15, Night shift: 19:30–07:15 next day
- Hourly rate: $43.24 CAD, Daily hours: 11.75h
- Allowances: evening (15:00–23:00), night (23:00–07:00), weekend (Sat/Sun)
- Pay days: 2nd Friday of each month, then every 14 days

### Timezone Handling
- All schedule operations use **Ottawa timezone** (America/Toronto) via `_getOttawaDate()`
- Weather uses `timezone=auto` from Open-Meteo

### Multi-Day Selection
- Click and drag (or touch drag) to select a date range
- Long-press (500ms) triggers summary modal with pay calculation
- Single click opens status selection modal

### PWA/Offline
- Service Worker uses cache-first strategy for local assets
- GitHub API and CDN requests bypass cache
- Offline fallback returns `index.html`

### CSS Organization
- `main.css` — base styles, variables
- `calendar.css` — calendar grid and day cells
- `components.css` — modals, buttons, legend
- `dark.css` — dark mode overrides

### UI Structure
- Header with export, language toggle, dark mode buttons
- Month navigation (prev/next arrows, month title)
- Weekday headers (Mon–Sun)
- Calendar grid (6 rows × 7 cols, 42 cells)
- Status bar: current time, shift status, next pay day, weather for 3 cities
- Status modal: shift type selection
- Summary modal: pay breakdown for selected date range
