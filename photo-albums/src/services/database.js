import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../db/photos.db');
const schemaPath = path.join(__dirname, '../../db/schema.sql');

let db = null;

/**
 * Initialize database connection and create schema
 */
export function initializeDatabase() {
  try {
    db = new Database(dbPath);
    
    // Load and execute schema
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get database instance
 */
export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Close database connection
 */
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// ===== ALBUM OPERATIONS =====

/**
 * Get all albums
 */
export function getAlbums() {
  const query = `
    SELECT * FROM albums 
    ORDER BY is_auto_sorted DESC, "order" ASC, date DESC
  `;
  return db.prepare(query).all();
}

/**
 * Get album by ID
 */
export function getAlbumById(albumId) {
  const query = 'SELECT * FROM albums WHERE id = ?';
  return db.prepare(query).get(albumId);
}

/**
 * Create album
 */
export function createAlbum(data) {
  const { date, title = '', customName = null, order = 0, isAutoSorted = 1 } = data;
  const query = `
    INSERT INTO albums (date, title, custom_name, "order", is_auto_sorted)
    VALUES (?, ?, ?, ?, ?)
  `;
  const result = db.prepare(query).run(date, title, customName, order, isAutoSorted);
  return result.lastInsertRowid;
}

/**
 * Update album
 */
export function updateAlbum(albumId, data) {
  const { title, customName, order, isAutoSorted } = data;
  const query = `
    UPDATE albums 
    SET title = COALESCE(?, title),
        custom_name = COALESCE(?, custom_name),
        "order" = COALESCE(?, "order"),
        is_auto_sorted = COALESCE(?, is_auto_sorted),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  return db.prepare(query).run(title, customName, order, isAutoSorted, albumId).changes > 0;
}

/**
 * Delete album and all associated photos
 */
export function deleteAlbum(albumId) {
  const query = 'DELETE FROM albums WHERE id = ?';
  return db.prepare(query).run(albumId).changes > 0;
}

/**
 * Update album order
 */
export function updateAlbumOrder(albumId, newOrder) {
  const query = 'UPDATE albums SET "order" = ?, is_auto_sorted = 0 WHERE id = ?';
  return db.prepare(query).run(newOrder, albumId).changes > 0;
}

// ===== PHOTO OPERATIONS =====

/**
 * Get photos by album
 */
export function getPhotosByAlbum(albumId) {
  const query = 'SELECT * FROM photos WHERE album_id = ? ORDER BY date_taken DESC';
  return db.prepare(query).all(albumId);
}

/**
 * Get photo by ID
 */
export function getPhotoById(photoId) {
  const query = 'SELECT * FROM photos WHERE id = ?';
  return db.prepare(query).get(photoId);
}

/**
 * Create photo
 */
export function createPhoto(data) {
  const { albumId, filePath, dateTaken, filename, fileSize = 0, thumbnail = null } = data;
  const query = `
    INSERT INTO photos (album_id, file_path, date_taken, filename, file_size, thumbnail)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const result = db.prepare(query).run(albumId, filePath, dateTaken, filename, fileSize, thumbnail);
  return result.lastInsertRowid;
}

/**
 * Update photo
 */
export function updatePhoto(photoId, data) {
  const { thumbnail } = data;
  const query = 'UPDATE photos SET thumbnail = ? WHERE id = ?';
  return db.prepare(query).run(thumbnail, photoId).changes > 0;
}

/**
 * Delete photo
 */
export function deletePhoto(photoId) {
  const query = 'DELETE FROM photos WHERE id = ?';
  return db.prepare(query).run(photoId).changes > 0;
}

/**
 * Get all photos
 */
export function getAllPhotos() {
  const query = 'SELECT * FROM photos ORDER BY date_taken DESC';
  return db.prepare(query).all();
}

// ===== PREFERENCE OPERATIONS =====

/**
 * Get preference value
 */
export function getPreference(key) {
  const query = 'SELECT value FROM user_preferences WHERE key = ?';
  const result = db.prepare(query).get(key);
  return result ? JSON.parse(result.value) : null;
}

/**
 * Set preference value
 */
export function setPreference(key, value) {
  const query = `
    INSERT INTO user_preferences (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
  `;
  return db.prepare(query).run(key, JSON.stringify(value), JSON.stringify(value)).changes > 0;
}

/**
 * Get all preferences
 */
export function getAllPreferences() {
  const query = 'SELECT key, value FROM user_preferences';
  const results = db.prepare(query).all();
  const preferences = {};
  results.forEach(row => {
    preferences[row.key] = JSON.parse(row.value);
  });
  return preferences;
}

/**
 * Delete preference
 */
export function deletePreference(key) {
  const query = 'DELETE FROM user_preferences WHERE key = ?';
  return db.prepare(query).run(key).changes > 0;
}

// ===== TRANSACTION HELPERS =====

/**
 * Execute function within a transaction
 */
export function transaction(fn) {
  const trans = db.transaction(fn);
  return trans();
}

/**
 * Batch insert photos (for bulk imports)
 */
export function batchInsertPhotos(photos) {
  return transaction(() => {
    const stmt = db.prepare(`
      INSERT INTO photos (album_id, file_path, date_taken, filename, file_size, thumbnail)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const results = [];
    photos.forEach(photo => {
      const result = stmt.run(
        photo.albumId,
        photo.filePath,
        photo.dateTaken,
        photo.filename,
        photo.fileSize,
        photo.thumbnail
      );
      results.push(result.lastInsertRowid);
    });
    return results;
  });
}
