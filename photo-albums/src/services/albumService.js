import * as db from './database.js';
import { getWeekKey, sortDateKeys } from '../utils/dateUtils.js';
import { eventBus, EVENTS } from '../utils/eventBus.js';

/**
 * Album service - handles album operations and grouping logic
 */

/**
 * Get all albums sorted by current sort mode
 */
export function getAllAlbums() {
  return db.getAlbums();
}

/**
 * Get album by ID
 */
export function getAlbumById(albumId) {
  return db.getAlbumById(albumId);
}

/**
 * Create or get album for a date
 */
export function ensureAlbumForDate(dateStr) {
  const weekKey = getWeekKey(dateStr);
  
  // Check if album exists
  const albums = getAllAlbums();
  const existing = albums.find(a => a.date === weekKey);
  
  if (existing) {
    return existing;
  }
  
  // Create new album
  const albumId = db.createAlbum({
    date: weekKey,
    title: weekKey,
    isAutoSorted: 1
  });
  
  eventBus.emit(EVENTS.ALBUMS_UPDATED);
  return db.getAlbumById(albumId);
}

/**
 * Update album details
 */
export function updateAlbumName(albumId, customName) {
  const success = db.updateAlbum(albumId, { customName });
  if (success) {
    eventBus.emit(EVENTS.ALBUM_RENAMED, albumId, customName);
  }
  return success;
}

/**
 * Reorder album
 */
export function reorderAlbum(albumId, newOrder) {
  const success = db.updateAlbumOrder(albumId, newOrder);
  if (success) {
    eventBus.emit(EVENTS.ALBUM_REORDERED, albumId, newOrder);
  }
  return success;
}

/**
 * Reorder multiple albums at once
 */
export function reorderAlbums(albumOrders) {
  return db.transaction(() => {
    albumOrders.forEach(({ albumId, order }) => {
      db.updateAlbumOrder(albumId, order);
    });
    eventBus.emit(EVENTS.ALBUMS_UPDATED);
  });
}

/**
 * Reset album to auto-sort
 */
export function resetAlbumToAutoSort(albumId) {
  const success = db.updateAlbum(albumId, { isAutoSorted: 1, order: 0 });
  if (success) {
    eventBus.emit(EVENTS.ALBUMS_UPDATED);
  }
  return success;
}

/**
 * Reset all albums to auto-sort
 */
export function resetAllAlbumsToAutoSort() {
  return db.transaction(() => {
    const albums = getAllAlbums();
    albums.forEach(album => {
      db.updateAlbum(album.id, { isAutoSorted: 1, order: 0 });
    });
    eventBus.emit(EVENTS.ALBUMS_UPDATED);
  });
}

/**
 * Delete album
 */
export function deleteAlbum(albumId) {
  const success = db.deleteAlbum(albumId);
  if (success) {
    eventBus.emit(EVENTS.ALBUMS_UPDATED);
  }
  return success;
}

/**
 * Get albums grouped by sort mode
 */
export function getAlbumsForDisplay() {
  const albums = getAllAlbums();
  
  // Group by auto-sorted vs manual
  const autoSorted = albums.filter(a => a.is_auto_sorted);
  const manualOrder = albums.filter(a => !a.is_auto_sorted);
  
  // Combine: manual first (in order), then auto-sorted by date
  return [...manualOrder, ...autoSorted];
}

/**
 * Get display name for album
 */
export function getAlbumDisplayName(album) {
  return album.custom_name || album.title || album.date;
}

/**
 * Validate and fix album sort order
 */
export function validateAndFixAlbumOrder() {
  const albums = getAllAlbums();
  let needsUpdate = false;
  
  // Check for gaps in manual order
  const manualAlbums = albums.filter(a => !a.is_auto_sorted).sort((a, b) => a.order - b.order);
  
  return db.transaction(() => {
    manualAlbums.forEach((album, index) => {
      if (album.order !== index) {
        db.updateAlbumOrder(album.id, index);
        needsUpdate = true;
      }
    });
    
    if (needsUpdate) {
      eventBus.emit(EVENTS.ALBUMS_UPDATED);
    }
  });
}

/**
 * Get statistics about albums
 */
export function getAlbumStats() {
  const albums = getAllAlbums();
  const allPhotos = db.getAllPhotos();
  
  return {
    totalAlbums: albums.length,
    totalPhotos: allPhotos.length,
    autoSortedAlbums: albums.filter(a => a.is_auto_sorted).length,
    manualOrderAlbums: albums.filter(a => !a.is_auto_sorted).length,
    avgPhotosPerAlbum: allPhotos.length / (albums.length || 1)
  };
}
