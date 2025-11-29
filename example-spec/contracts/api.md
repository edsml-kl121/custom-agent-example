# Phase 1 Design: API Contracts

**Feature**: [Photo Album Organization](./spec.md) | **Data Model**: [data-model.md](./data-model.md)

## API Overview

Simple REST-like interface. In a web app context, this could be:
- Electron IPC channels (desktop)
- Service Worker requests (PWA)
- Local backend server (Node.js + Express)

**Format**: JSON request/response bodies

---

## Album Endpoints

### GET /api/albums

**Description**: List all albums in current sort order

**Query Parameters**:
- `sort`: "auto" | "manual" (default: read from preferences)

**Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "dateKey": "2025-11-24",
      "displayLabel": "Week of Nov 24 - Nov 30, 2025",
      "customName": null,
      "coverPhotoId": 15,
      "photoCount": 42,
      "sortOrder": 0,
      "isAutoSorted": true,
      "coverThumbnail": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "updatedAt": "2025-11-29T10:30:00Z"
    },
    {
      "id": 2,
      "dateKey": "2025-11-17",
      "displayLabel": "Week of Nov 17 - Nov 23, 2025",
      "customName": "Thanksgiving 2025",
      "coverPhotoId": 78,
      "photoCount": 28,
      "sortOrder": 1,
      "isAutoSorted": false,
      "coverThumbnail": "data:image/jpeg;base64,...",
      "updatedAt": "2025-11-28T14:15:00Z"
    }
  ]
}
```

**Error** (500):
```json
{
  "success": false,
  "error": "Failed to fetch albums"
}
```

---

### GET /api/albums/:id

**Description**: Get single album with metadata

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "dateKey": "2025-11-24",
    "displayLabel": "Week of Nov 24 - Nov 30, 2025",
    "customName": null,
    "photoCount": 42,
    "sortOrder": 0,
    "isAutoSorted": true,
    "createdAt": "2025-11-24T08:00:00Z",
    "updatedAt": "2025-11-29T10:30:00Z"
  }
}
```

---

### PUT /api/albums/:id

**Description**: Update album (rename, change cover, etc.)

**Request Body**:

```json
{
  "customName": "Summer Vacation 2025",
  "coverPhotoId": 42
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "customName": "Summer Vacation 2025",
    "coverPhotoId": 42,
    "updatedAt": "2025-11-29T11:00:00Z"
  }
}
```

**Error** (400 Bad Request):
```json
{
  "success": false,
  "error": "Album not found or invalid photo for cover"
}
```

---

### PATCH /api/albums/reorder

**Description**: Update sort order for multiple albums (drag-drop result)

**Request Body**:

```json
{
  "albumOrder": [
    { "id": 2, "sortOrder": 0 },
    { "id": 1, "sortOrder": 1 },
    { "id": 3, "sortOrder": 2 }
  ]
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "updated": 3,
    "newOrder": [
      { "id": 2, "sortOrder": 0 },
      { "id": 1, "sortOrder": 1 },
      { "id": 3, "sortOrder": 2 }
    ]
  }
}
```

---

### POST /api/albums/reset-sort

**Description**: Reset all albums to auto-sort by date

**Request Body** (empty):

```json
{}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "message": "Albums reset to auto-sort",
    "albums": [
      { "id": 1, "displayLabel": "...", "sortOrder": null, "isAutoSorted": true },
      { "id": 2, "displayLabel": "...", "sortOrder": null, "isAutoSorted": true }
    ]
  }
}
```

---

## Photo Endpoints

### GET /api/albums/:albumId/photos

**Description**: Get all photos in album

**Query Parameters**:
- `limit`: number (default 50)
- `offset`: number (default 0)
- `sortBy`: "date" | "name" (default "date")

**Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "albumId": 1,
      "filename": "IMG_2025.jpg",
      "dateTaken": "2025-11-29T14:30:00Z",
      "fileSizeBytes": 2097152,
      "width": 4000,
      "height": 3000,
      "thumbnail": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "createdAt": "2025-11-29T15:00:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 50,
    "offset": 0
  }
}
```

---

### GET /api/photos/:id

**Description**: Get single photo with full metadata

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": 15,
    "albumId": 1,
    "filename": "IMG_2025.jpg",
    "filePath": "/Users/user/Pictures/IMG_2025.jpg",
    "dateTaken": "2025-11-29T14:30:00Z",
    "fileSizeBytes": 2097152,
    "width": 4000,
    "height": 3000,
    "thumbnail": "data:image/jpeg;base64,...",
    "fullImage": "file://..." or "data:image/jpeg;base64,...",
    "exifData": {
      "camera": "iPhone 14",
      "iso": 400,
      "focalLength": "28mm"
    },
    "createdAt": "2025-11-29T15:00:00Z",
    "updatedAt": "2025-11-29T15:00:00Z"
  }
}
```

---

### POST /api/photos/import

**Description**: Import photos from directory or drag-drop

**Request Body**:

```json
{
  "filePaths": [
    "/Users/user/Downloads/photo1.jpg",
    "/Users/user/Downloads/photo2.jpg"
  ]
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "imported": 2,
    "photos": [
      {
        "id": 101,
        "filename": "photo1.jpg",
        "albumId": 5,
        "dateTaken": "2025-11-29T14:30:00Z",
        "thumbnail": "data:image/jpeg;base64,..."
      }
    ],
    "albumsCreated": 1,
    "albumsUpdated": 1
  }
}
```

---

### DELETE /api/photos/:id

**Description**: Delete photo from album

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "message": "Photo deleted",
    "photoId": 15,
    "albumId": 1,
    "albumPhotoCountAfter": 41
  }
}
```

---

## Preferences Endpoints

### GET /api/preferences

**Description**: Get all user preferences

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "sortMode": "manual",
    "theme": "light",
    "tileSize": "medium",
    "lastImportPath": "/Users/user/Pictures",
    "albumCustomOrder": [2, 1, 3]
  }
}
```

---

### PUT /api/preferences

**Description**: Update one or more preferences

**Request Body**:

```json
{
  "sortMode": "auto",
  "theme": "dark",
  "tileSize": "large"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "updated": ["sortMode", "theme", "tileSize"],
    "preferences": {
      "sortMode": "auto",
      "theme": "dark",
      "tileSize": "large"
    }
  }
}
```

---

## Error Response Format

**Standard Error** (400/500):

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ALBUM_NOT_FOUND" or "INVALID_DATE_FORMAT" etc,
  "details": {
    "attemptedId": 999,
    "availableAlbums": [1, 2, 3]
  }
}
```

**Validation Error** (422):

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "customName",
    "message": "Must be less than 255 characters",
    "value": "very long string..."
  }
}
```

---

## Event Notifications (Client → UI)

While not traditional REST, these represent state changes the app emits:

```javascript
// Album events
eventBus.emit('album:created', { albumId, displayLabel });
eventBus.emit('album:updated', { albumId, customName, coverPhotoId });
eventBus.emit('album:reordered', { newOrder: [ids...] });
eventBus.emit('album:deleted', { albumId });

// Photo events
eventBus.emit('photo:imported', { photoIds, albumId });
eventBus.emit('photo:deleted', { photoId, albumId });

// Preference events
eventBus.emit('preference:changed', { key, value });
```

---

## Implementation Notes

1. **In Electron/Desktop Context**: Replace HTTP with IPC channels
   - `ipc.invoke('albums:list')` → returns Promise
   - `ipc.on('album:updated')` → listener pattern

2. **In PWA Context**: Use Service Worker or local backend
   - Could use Workbox for offline support
   - IndexedDB if browser-only (no Node.js backend)

3. **Validation Rules**:
   - Album `customName`: max 255 chars, required if not null
   - Photo `filePath`: must be valid filesystem path
   - Date fields: ISO 8601 format
   - All IDs: positive integers

4. **Pagination**: Optional for /api/albums (usually <100 albums), required for /api/photos (could be 1000+)

