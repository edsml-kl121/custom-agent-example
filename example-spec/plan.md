# Implementation Plan: Photo Album Organization

**Branch**: `001-photo-albums` | **Date**: November 29, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-photo-albums/spec.md`

## Summary

Build a lightweight web application that organizes photos into date-based albums with drag-and-drop reordering capabilities. The application stores photo metadata in a local SQLite database and uses vanilla HTML, CSS, and JavaScript with Vite for development. The MVP focuses on viewing and browsing albums (P1), with drag-and-drop reordering (P2) and album preferences (P3) as incremental additions.

## Technical Context

**Language/Version**: JavaScript (ES2020+), HTML5, CSS3  
**Primary Dependencies**: Vite (build tooling), SQLite3 (Node.js driver), native HTML Drag & Drop API  
**Storage**: SQLite database (local file: `photos.db`)  
**Testing**: Vitest for unit tests, manual integration testing  
**Target Platform**: Web browser (desktop and mobile)  
**Project Type**: Single-page web application (SPA)  
**Performance Goals**: 60 FPS tile rendering, <500ms album load time, sub-second navigation  
**Constraints**: Minimal external dependencies, all photos stored locally (no cloud), responsive design (320px-2560px)  
**Scale/Scope**: Support collections of 1000+ photos across multiple date-based albums  

## Constitution Check

⚠️ **No Active Constitution Defined**: The project's constitution is a template with placeholders. Proceeding with standard web development best practices:
- Minimal dependencies ✅
- Vanilla JS preferred ✅
- Local storage only ✅
- Responsive design ✅

*Re-check after Phase 1 design complete.*

## Project Structure

### Documentation (this feature)

```text
specs/001-photo-albums/
├── spec.md              # Feature specification
├── plan.md              # This file (implementation roadmap)
├── research.md          # Phase 0: Research findings (to be generated)
├── data-model.md        # Phase 1: Data entities and relationships
├── contracts/           # Phase 1: API/Interface contracts
├── quickstart.md        # Phase 1: Development quickstart
└── tasks.md             # Phase 2: Actionable task checklist
```

### Source Code (repository root)

```text
photo-albums/
├── index.html                    # Main HTML entry point
├── package.json                  # Dependencies and scripts
├── vite.config.js               # Vite configuration
├── .env.example                 # Environment variables template
├── src/
│   ├── main.js                  # Application entry point
│   ├── styles/
│   │   ├── reset.css            # CSS reset
│   │   ├── globals.css          # Global styles
│   │   ├── layout.css           # Layout & responsive grid
│   │   ├── components.css       # Component styles
│   │   └── animations.css       # Drag-drop & transitions
│   ├── components/
│   │   ├── AlbumGrid.js         # Main album display grid
│   │   ├── AlbumCard.js         # Individual album card
│   │   ├── PhotoGallery.js      # Photo tile grid
│   │   ├── PhotoDetail.js       # Enlarged photo view
│   │   ├── Preferences.js       # Settings/preferences modal
│   │   └── DragDrop.js          # Drag-drop handler utilities
│   ├── services/
│   │   ├── database.js          # SQLite CRUD operations
│   │   ├── photoService.js      # Photo metadata & grouping
│   │   ├── albumService.js      # Album CRUD & sorting
│   │   ├── dragService.js       # Drag-drop state management
│   │   └── storageService.js    # Local preference persistence
│   ├── utils/
│   │   ├── dateUtils.js         # Date grouping & formatting
│   │   ├── imageUtils.js        # Image loading & caching
│   │   └── eventBus.js          # Simple event emitter
│   └── app.js                   # Application controller
├── tests/
│   ├── unit/
│   │   ├── dateUtils.test.js
│   │   ├── albumService.test.js
│   │   └── dragService.test.js
│   └── integration/
│       └── albumWorkflow.test.js
├── db/
│   └── schema.sql               # SQLite database schema
└── public/
    └── favicon.ico              # App icon
```

**Structure Decision**: Single web application structure (Option 1). All UI, services, and data operations contained in one cohesive SPA project. Database schema and driver handled via Node.js backend or Electron integration if desktop app is needed.

## Complexity Tracking

| Decision | Reasoning | Alternatives Considered |
|----------|-----------|----------------------|
| SQLite over LocalStorage | Handles large photo collections with metadata queries; SQL-based grouping/filtering more efficient | LocalStorage adequate for UI state; SQLite chosen for metadata persistence |
| Vanilla JS over Framework | Minimal dependencies per requirements; DOM manipulation sufficient for this UX | Could use React/Vue for component reusability; not needed for single-page album app |
| Vite over Webpack | Fast dev server, modern bundler, minimal config | Standard webpack works; Vite chosen for faster iteration |
| HTML Drag & Drop API | Native browser support, no library needed | Custom pointer event handlers more verbose; native API preferred |

## Technology Decisions

### Database (SQLite)

SQLite chosen for:
- No server required (embedded)
- ACID compliance for metadata
- Query support for date-based grouping
- Simple SQL schema

**Driver**: `better-sqlite3` (Node.js) or `sql.js` (WASM) depending on deployment model

### Frontend Stack

- **Vite**: Modern, fast build tool with HMR
- **Vanilla JS**: No framework overhead; DOM directly manipulated
- **CSS Grid/Flexbox**: Responsive tile layouts
- **Fetch API**: Any async operations
- **Service Workers** (optional): Offline support for loaded images

### Build & Development

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "better-sqlite3": "^9.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "eslint": "^8.0.0"
  }
}
```

## Data Model Preview

### Core Entities (detailed in data-model.md)

1. **Albums**
   - `id`: Auto-increment primary key
   - `date`: ISO string (default grouping date)
   - `title`: User-overridable name
   - `custom_name`: Nullable (user-provided name overrides date)
   - `order`: Integer for custom sort order
   - `is_auto_sorted`: Boolean (date-based vs manual)

2. **Photos**
   - `id`: Auto-increment primary key
   - `album_id`: Foreign key to Albums
   - `file_path`: Local filesystem path
   - `date_taken`: ISO string
   - `filename`: Original filename
   - `file_size`: Bytes
   - `thumbnail`: Base64 or cached path
   - `created_at`: Insertion timestamp

3. **UserPreferences**
   - `key`: String (e.g., "sort_mode", "theme")
   - `value`: JSON value
   - `updated_at`: Timestamp

## API Contracts Preview

### Key Endpoints (detailed in contracts/)

**Album Operations**:
- `GET /api/albums` → List all albums in sort order
- `GET /api/albums/:id/photos` → Photos in album
- `PUT /api/albums/:id` → Update album (reorder, rename)
- `PATCH /api/albums/:id/order` → Reorder albums
- `POST /api/albums/:id/reset` → Reset to date-based sort

**Photo Operations**:
- `GET /api/photos/:id` → Photo metadata + preview
- `POST /api/photos` → Import photo + extract metadata
- `DELETE /api/photos/:id` → Remove photo

**Preferences**:
- `GET /api/preferences` → User settings
- `PUT /api/preferences` → Update settings

## MVP Scope (Phase 1 Focus)

**Phase 1 (P1)**: View and Browse
- Load photos from directory
- Auto-group by date (weekly grouping)
- Display album grid with cover thumbnails
- Click to view photos in tile grid
- Back navigation to album list

**Phase 2 (P2)**: Drag-and-Drop Reordering
- Drag album cards on main page
- Visual reorder feedback
- Persist custom order to database
- Maintain across sessions

**Phase 3 (P3)**: Preferences
- Toggle auto-sort vs manual mode
- Album renaming
- Reset to default

---

**Next Phase**: Generate `research.md` (Phase 0) to address any clarifications, then proceed to Phase 1 design deliverables (`data-model.md`, `contracts/`, `quickstart.md`).

