# Phase 0 Research: Photo Album Organization

**Date**: November 29, 2025 | **Feature**: [001-photo-albums](./spec.md)

## Clarifications Resolved

### 1. Database Choice: SQLite vs Alternatives

**Decision**: SQLite with `better-sqlite3` Node.js driver

**Rationale**:
- Zero server overhead (file-based)
- Built-in SQL support for complex queries (date grouping, filtering)
- ACID compliance for data integrity
- Small footprint, perfect for local apps
- Native support in most runtimes

**Alternatives Considered**:
- **IndexedDB** (browser): Limited query capabilities, harder to group by date ranges
- **LocalStorage**: Key-value only, insufficient for metadata queries
- **PostgreSQL**: Overkill for local-only app, requires server
- **File-based JSON**: Slower with large collections, no indexing

### 2. Photo Storage Architecture

**Decision**: Photos stored locally on filesystem; metadata in SQLite

**Rationale**:
- User requirement: "Images are not uploaded anywhere"
- Supports large collections without network overhead
- Metadata (date, size, location) indexed in database for fast queries

**Implementation Details**:
- Photos remain in original filesystem location
- Store file_path in database (absolute or relative)
- Generate thumbnails on first load and cache
- Support drag-and-drop file import from OS

### 3. Date Grouping Strategy

**Decision**: Weekly grouping (Mon-Sun) as default, with fallback to daily/monthly

**Rationale**:
- Weekly balances granularity with manageability
- Most users take photos over multiple days in a week
- Prevents dozens of single-day albums for casual users
- Easy to toggle between week/month/day views

**Implementation**:
```javascript
// Group photos by week starting Monday
function getWeekKey(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

// Format: "Week of Nov 25 - Dec 1, 2025"
function formatWeekLabel(weekKey) {
  // parse weekKey and format readable label
}
```

### 4. Drag-and-Drop Implementation

**Decision**: Native HTML5 Drag & Drop API + pointer event fallback for mobile

**Rationale**:
- HTML5 drag-drop supported in all modern browsers
- No library dependencies required
- Touch support via polyfill/pointer events

**Technical Approach**:
```javascript
// Drag events: dragstart → dragover → drop → dragend
// Data transfer: store album ID in dataTransfer
// Mobile: detect touch, add visual handles or use alternative UI

// For mobile touch: consider swipe gesture library OR
// fallback to up/down buttons in preferences
```

### 5. Thumbnail Generation

**Decision**: In-memory thumbnail generation on photo load, cached as Base64 in DB

**Rationale**:
- No separate image processing service needed
- Thumbnails small enough for localStorage/DB indexing
- Generated once, reused across sessions

**Options Considered**:
- External image service: Adds complexity, violates "minimal libraries"
- Generate on import only: User could wait long for large collections
- Cache as separate files: Works but adds filesystem complexity

### 6. Responsive Design Strategy

**Decision**: CSS Grid for album cards (auto-fit, minmax); Flexbox for photo tiles

**Rationale**:
- CSS Grid handles responsive layout without JS calculations
- `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))` works 320px→2560px
- Modern browsers all support CSS Grid (99%+)

**Breakpoints** (if needed):
- Mobile: 1-2 columns (320-600px)
- Tablet: 2-3 columns (600-1000px)
- Desktop: 3-6 columns (1000px+)

### 7. Performance: Lazy Loading vs Eager Loading

**Decision**: Lazy load photo thumbnails, eager load album metadata

**Rationale**:
- Album list must load fast (< 500ms target)
- Photos within album can lazy-load as user scrolls (progressive rendering)
- Intersection Observer API handles visibility detection

**Implementation**:
```javascript
// Load album metadata on app start (metadata only)
// Load album cover + thumbnail on album card render
// Load photo thumbnails as they scroll into view (Intersection Observer)
```

### 8. Persistence Layer: IndexedDB vs SQLite vs localStorage

**Decision**: SQLite (via better-sqlite3) for production; IndexedDB for browser-only PWA alternative

**Why SQLite chosen**:
- Spec requires "local SQLite database"
- More structured than IndexedDB
- SQL queries for grouping/filtering more readable

**PWA Alternative** (if browser-only):
- Could use IndexedDB + Web Workers for DB operations
- Same schema, translated to IndexedDB object stores
- But SQLite is explicit requirement, so proceed with that

### 9. Event Architecture: Direct DOM vs Event Bus

**Decision**: Simple event emitter pattern (custom EventBus) for component communication

**Rationale**:
- Decouples components without framework complexity
- Vanilla JS doesn't have built-in component event system
- Simpler than Redux/Vuex overkill
- Supports UI state sync (e.g., album reordered → refresh view)

**Pattern**:
```javascript
// eventBus.js: simple publish-subscribe
eventBus.on('album:reordered', (albumId) => refreshAlbumGrid());
eventBus.emit('album:reordered', albumId);
```

### 10. Testing Strategy

**Decision**: Vitest for unit tests; manual integration testing for drag-drop

**Rationale**:
- Vitest is Vite-native, minimal config
- Unit tests for utilities (date grouping, sorting)
- Integration tests for database operations
- Drag-drop difficult to automate; manual/E2E via Playwright if needed later

**Coverage Goals**:
- Date grouping logic: 100%
- Database operations: 95%+
- Service layer: 80%+
- UI components: Manual testing

---

## Decisions Summary

| Question | Decision | Why |
|----------|----------|-----|
| Database | SQLite + better-sqlite3 | Local, queryable, ACID |
| Photo Storage | Filesystem + metadata in DB | Per spec, scalable |
| Date Grouping | Weekly with day/month fallback | Balanced UX |
| Drag-Drop | HTML5 + pointer events | Native, no deps |
| Thumbnails | Generated on load, cached Base64 | Fast, reusable |
| Responsive | CSS Grid auto-fit | No JS calculations |
| Lazy Loading | Partial (photos, not albums) | Performance |
| Persistence | SQLite (EventBus for UI state) | Clear separation |
| Testing | Vitest + manual | Pragmatic coverage |
| Tech Stack | Vite + Vanilla JS | Minimal, fast |

---

## Remaining Unknowns → Escalate

None. All clarifications resolved in Phase 0.

**Status**: ✅ Ready to proceed to Phase 1 (Data Model, Contracts, Quickstart)

