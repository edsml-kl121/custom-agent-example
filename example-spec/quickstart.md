# Phase 1: Development Quickstart

**Feature**: Photo Album Organization | **Branch**: `001-photo-albums`

## 5-Minute Setup

### 1. Clone & Install

```bash
cd photo-albums
npm install
```

### 2. Start Dev Server

```bash
npm run dev
```

Visit `http://localhost:5173` (Vite default)

### 3. Create Test Database

```bash
npm run db:init
```

This creates `photos.db` with schema from `db/schema.sql`

### 4. Import Test Photos

```bash
# Copy test images to a folder
mkdir test-photos
cp ~/Pictures/sample1.jpg ~/Pictures/sample2.jpg test-photos/

# Import via UI: drag-and-drop folder or use "Import" button
# Or import via CLI:
npm run db:import test-photos/
```

### 5. View Albums

Open browser → see albums grouped by date on main page

---

## Project Structure Quick Reference

```
photo-albums/
├── src/
│   ├── main.js              ← Entry point
│   ├── app.js               ← App controller/state
│   ├── styles/
│   │   ├── globals.css      ← Base styles
│   │   ├── layout.css       ← Grid/Flexbox
│   │   └── components.css   ← Card/tile styles
│   ├── components/
│   │   ├── AlbumGrid.js     ← Main view (list of albums)
│   │   ├── PhotoGallery.js  ← Album detail view (photos)
│   │   └── DragDrop.js      ← Drag handler utilities
│   └── services/
│       ├── database.js      ← SQLite operations
│       ├── albumService.js  ← Album CRUD + grouping
│       └── photoService.js  ← Photo CRUD
├── db/
│   └── schema.sql           ← Database schema
├── tests/
│   ├── unit/
│   │   └── dateUtils.test.js
│   └── integration/
└── index.html               ← HTML shell
```

---

## Key Files to Understand

### 1. `db/schema.sql`

Database structure. Three main tables:
- `albums` - Date-grouped photo collections
- `photos` - Individual photo metadata
- `user_preferences` - User settings

### 2. `src/services/database.js`

CRUD operations:
```javascript
// Initialize database
await Database.init();

// Album operations
const albums = await Database.getAlbums(sortMode);
const album = await Database.getAlbum(albumId);
await Database.updateAlbumOrder([...reordered]);

// Photo operations
const photos = await Database.getPhotos(albumId);
await Database.importPhoto(filePath);
```

### 3. `src/services/albumService.js`

Business logic for albums:
```javascript
// Group photos by date into albums
const albums = await AlbumService.groupPhotosByDate(photos);

// Rename album
await AlbumService.renameAlbum(albumId, newName);

// Reorder albums
await AlbumService.reorderAlbums(newOrder);
```

### 4. `src/components/AlbumGrid.js`

Main view component:
```javascript
class AlbumGrid {
  render(albums) {
    // Display album cards in grid
  }
  
  onDragStart(event, albumId) {
    // Handle drag initiation
  }
  
  onDrop(event, targetAlbumId) {
    // Handle drop & reordering
  }
}
```

### 5. `src/app.js`

App controller - wires everything together:
```javascript
class App {
  async init() {
    await Database.init();
    const albums = await AlbumService.getAlbums();
    this.albumGrid.render(albums);
  }
  
  onAlbumClicked(albumId) {
    this.currentPage = 'album-detail';
    this.showPhotos(albumId);
  }
}
```

---

## Common Tasks

### Load All Albums

```javascript
const albums = await AlbumService.getAlbums(sortMode);
// Returns: [{ id, displayLabel, photoCount, coverThumbnail, ... }]
```

### View Photos in Album

```javascript
const photos = await PhotoService.getPhotos(albumId);
// Returns: [{ id, filename, thumbnail, dateTaken, ... }]
```

### Rename Album

```javascript
await AlbumService.renameAlbum(albumId, 'Vacation 2025');
eventBus.emit('album:updated', { albumId });
albumGrid.refresh();
```

### Reorder Albums (Drag-Drop Result)

```javascript
const newOrder = [3, 1, 2]; // album IDs in new order
await AlbumService.reorderAlbums(newOrder);
eventBus.emit('album:reordered', { newOrder });
albumGrid.refresh();
```

### Import Photos

```javascript
const filePaths = ['photo1.jpg', 'photo2.jpg'];
const imported = await PhotoService.importPhotos(filePaths);
// Auto-groups into albums by date
eventBus.emit('photo:imported', { count: imported.length });
albumGrid.refresh();
```

### Reset to Auto-Sort

```javascript
await AlbumService.resetToAutoSort();
eventBus.emit('preference:changed', { key: 'sortMode', value: 'auto' });
albumGrid.refresh();
```

---

## Testing

### Run Tests

```bash
npm test
```

### Write a Unit Test

Create `tests/unit/myTest.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { dateUtils } from '../../src/utils/dateUtils';

describe('dateUtils', () => {
  it('should group dates by week', () => {
    const dates = [
      '2025-11-29',
      '2025-11-30',
      '2025-12-01'
    ];
    const grouped = dateUtils.groupByWeek(dates);
    expect(Object.keys(grouped).length).toBe(1); // All same week
  });
});
```

### Test Database

```javascript
import Database from '../../src/services/database';

describe('Database', () => {
  beforeEach(async () => {
    await Database.init(':memory:'); // In-memory for tests
  });

  it('should create albums', async () => {
    const album = await Database.createAlbum({
      dateKey: '2025-11-24',
      displayLabel: 'Week of Nov 24...'
    });
    expect(album.id).toBeGreaterThan(0);
  });
});
```

---

## Debugging

### Enable Verbose Logging

```javascript
// In src/main.js
globalThis.DEBUG = true;

// In services
if (globalThis.DEBUG) {
  console.log('Loading albums...', albums);
}
```

### Inspect Database

```bash
# Open SQLite CLI
sqlite3 photos.db

# List albums
SELECT * FROM albums;

# List photos in album
SELECT * FROM photos WHERE album_id = 1;
```

### Browser DevTools

- **Console**: Log UI events, service calls
- **Network**: Check any HTTP calls (if applicable)
- **Storage**: Inspect IndexedDB/LocalStorage if used
- **Elements**: Inspect DOM structure, CSS

---

## MVP Checklist (Phase 1)

- [ ] Database initialized with schema
- [ ] Photo import working (folder scan or drag-drop)
- [ ] Albums grouped by date (weekly)
- [ ] Album grid renders on main page
- [ ] Album cover thumbnail shows
- [ ] Click album → view photos in tile grid
- [ ] Back button → return to albums
- [ ] Responsive design works (mobile to desktop)

---

## Next Steps

1. **Phase 2 (P2)**: Drag-and-drop reordering
   - Implement `DragDrop.js` handlers
   - Update `AlbumGrid` with drag events
   - Persist custom order to database

2. **Phase 3 (P3)**: Preferences UI
   - Toggle auto-sort vs manual
   - Rename albums
   - Reset to default

3. **Polish**: 
   - Error handling & user feedback
   - Performance optimization (lazy load, caching)
   - Accessibility (keyboard navigation, ARIA labels)

---

## Key Commands

```bash
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build locally
npm test                 # Run Vitest
npm run test:watch      # Watch mode
npm run lint            # ESLint check
npm run db:init         # Create schema
npm run db:import <dir> # Import photos from directory
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5173 in use | `npm run dev -- --port 3000` |
| Database locked | Close other tabs/instances, delete `photos.db`, restart |
| Photos not importing | Check file paths are absolute, permissions set, image format supported |
| Drag-drop not working | Test in Chrome first (best support), check console for errors |
| Performance slow | Enable lazy loading, reduce thumbnail size, check console for N+1 queries |

