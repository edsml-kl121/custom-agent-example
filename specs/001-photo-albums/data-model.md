# Phase 1 Design: Data Model

**Feature**: [Photo Album Organization](./spec.md) | **Plan**: [plan.md](./plan.md) | **Research**: [research.md](./research.md)

## Database Schema

### Table: `albums`

Stores album metadata. Default grouping by date; custom sorting supported.

```sql
CREATE TABLE albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date_key TEXT NOT NULL UNIQUE,           -- ISO date (week/month key)
  display_label TEXT NOT NULL,              -- "Week of Nov 25-Dec 1, 2025"
  custom_name TEXT,                         -- User override (nullable)
  cover_photo_id INTEGER,                   -- Foreign key to photos (first/selected)
  sort_order INTEGER DEFAULT 0,             -- Position in custom order
  is_auto_sorted BOOLEAN DEFAULT 1,         -- 0 = manual order, 1 = date order
  photo_count INTEGER DEFAULT 0,            -- Cached count for UI
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cover_photo_id) REFERENCES photos(id)
);

-- Indices
CREATE INDEX idx_albums_date_key ON albums(date_key);
CREATE INDEX idx_albums_sort_order ON albums(sort_order) WHERE is_auto_sorted = 0;
CREATE INDEX idx_albums_created_at ON albums(created_at DESC);
```

### Table: `photos`

Stores individual photo metadata. Never directly organized; only belongs to albums.

```sql
CREATE TABLE photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id INTEGER NOT NULL,
  file_path TEXT NOT NULL UNIQUE,           -- Absolute or relative FS path
  filename TEXT NOT NULL,                   -- Original filename
  date_taken TEXT,                          -- ISO string or null if undated
  file_size_bytes INTEGER,                  -- For UI display
  thumbnail_base64 TEXT,                    -- Cached thumbnail
  width INTEGER,                            -- Image dimensions
  height INTEGER,
  exif_data TEXT,                           -- JSON: Camera, ISO, etc. (optional)
  import_source TEXT,                       -- "user-upload", "folder-scan", etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
);

-- Indices
CREATE INDEX idx_photos_album_id ON photos(album_id);
CREATE INDEX idx_photos_date_taken ON photos(date_taken);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);
```

### Table: `user_preferences`

Stores application-level settings and UI state.

```sql
CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,                 -- "sort_mode", "theme", etc.
  value TEXT NOT NULL,                      -- JSON value
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Example rows:
-- ("sort_mode", '"auto"')  -- "auto" or "manual"
-- ("theme", '"light"')     -- "light" or "dark"
-- ("album_custom_order", '[1, 3, 2, 5]')  -- Array of album IDs in custom order
-- ("last_import_path", '"/Users/..."')
```

---

## Entity Relationships

```
┌──────────────┐
│   albums     │
├──────────────┤
│ id (PK)      │──────┐
│ date_key     │      │ 1:N
│ custom_name  │      │
│ sort_order   │      │
│ ...          │      │
└──────────────┘      │
                      │
                      ↓
                ┌──────────────┐
                │   photos     │
                ├──────────────┤
                │ id (PK)      │
                │ album_id (FK)│
                │ file_path    │
                │ date_taken   │
                │ ...          │
                └──────────────┘

┌─────────────────────┐
│ user_preferences    │
├─────────────────────┤
│ id (PK)             │
│ key (sort_mode etc) │
│ value (JSON)        │
└─────────────────────┘
```

**Cardinality**:
- **Albums ↔ Photos**: 1-to-many (each album has many photos)
- **Albums ↔ Preferences**: Many-to-one (prefs stored globally, not per album)
- **Photos ↔ Preferences**: None (photos don't have individual prefs)

---

## Data Model Rules

### Album Grouping Logic

1. **Date-Based (Default)**
   - Automatically group by week (Monday-Sunday)
   - Label: "Week of Nov 25 - Dec 1, 2025"
   - Fallback for undated photos: "Undated" album (special key: "undated")

2. **Custom Order**
   - Once user enables manual mode, albums get `sort_order` values
   - `sort_order` is independent of `date_key`
   - New albums appended to end of `sort_order` list

3. **Reset to Default**
   - Clear all `sort_order` values
   - Set `is_auto_sorted = 1`
   - Resort by date

### Photo Grouping

- **No Photo Nesting**: Photos only belong to ONE album (enforced by FK)
- **Missing Dates**: Photos without `date_taken` go to "Undated" album
- **Multiple Photos Same Date**: Merge into one album per date
- **Duplicate Paths**: Handled by UNIQUE constraint on `file_path`

### Cover Photo Selection

- Album `cover_photo_id` defaults to first imported photo in that album
- User can change cover via UI (updates `cover_photo_id`)
- If cover photo deleted, auto-select new cover from remaining photos

---

## State Management

### UI State (Client-Side, NOT persisted to DB)

```javascript
{
  currentPage: "albums" | "album-detail" | "photo-detail",
  selectedAlbumId: null | <id>,
  selectedPhotoId: null | <id>,
  draggedAlbumId: null | <id>,
  sortMode: "auto" | "manual",
  viewSettings: {
    tileSize: "small" | "medium" | "large",
    showMetadata: true
  }
}
```

### Persisted State (SQLite)

- Album order (sort_order)
- Album names (custom_name)
- Photo metadata (all columns)
- Preferences (user_preferences table)

---

## Example Workflows

### Workflow 1: Load App & Display Albums

```
1. App starts
2. Query: SELECT * FROM albums WHERE is_auto_sorted = 1 
          ORDER BY date_key DESC
   OR     SELECT * FROM albums WHERE is_auto_sorted = 0 
          ORDER BY sort_order ASC
3. For each album, fetch cover_photo_id and load thumbnail
4. Render AlbumGrid with cover thumbnails
```

### Workflow 2: Click Album → View Photos

```
1. User clicks album card
2. State: currentPage = "album-detail", selectedAlbumId = <id>
3. Query: SELECT * FROM photos WHERE album_id = <id> 
          ORDER BY date_taken DESC
4. Load thumbnails (lazy) as user scrolls
5. Render PhotoGallery tile grid
```

### Workflow 3: Drag Album to Reorder

```
1. User drags album A to position of album B
2. Update album A: sort_order = <new_position>
3. Reorder all albums' sort_order to maintain sequence
4. Update in DB: UPDATE albums SET sort_order = ? WHERE id = ?
5. Store preference: user_preferences["album_custom_order"] = [reordered IDs]
6. Re-render AlbumGrid
```

### Workflow 4: Rename Album

```
1. User double-clicks album name
2. Enable edit mode UI
3. User enters new name
4. Update album: custom_name = "<new>" (or clear if reverting)
5. If custom_name set, use it; else use display_label (from date_key)
6. Persist to DB: UPDATE albums SET custom_name = ? WHERE id = ?
```

---

## Constraints & Validation

| Field | Constraint | Error Handling |
|-------|-----------|----------------|
| `album.date_key` | UNIQUE, NOT NULL | Reject duplicate date groupings |
| `photo.file_path` | UNIQUE, NOT NULL | Reject duplicate photos (same path) |
| `photo.album_id` | FK NOT NULL | Enforce album exists before photo insert |
| `album.sort_order` | UNIQUE per is_auto_sorted | Prevent sort order collisions |
| `user_preferences.key` | UNIQUE | Only one value per preference |
| Date format | ISO 8601 (YYYY-MM-DD) | Validate on insert |

---

## Migration Path (Future)

If data model needs to evolve:
- Add migration scripts in `db/migrations/`
- Version schema with `PRAGMA user_version`
- Example: Adding album descriptions, photo tags, sharing metadata

---

## Performance Considerations

- **Index Strategy**: date_key, album_id, sort_order for fast queries
- **Thumbnail Caching**: Store as Base64 to avoid repeated file I/O
- **Photo Count Caching**: Update `photo_count` on photo insert/delete (denormalized for speed)
- **Lazy Loading**: Don't load all thumbnails at once; use Intersection Observer

