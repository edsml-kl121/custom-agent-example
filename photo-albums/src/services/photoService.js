import * as db from './database.js';
import * as albumService from './albumService.js';
import { eventBus, EVENTS } from '../utils/eventBus.js';

/**
 * Photo service - handles photo operations, import, and metadata
 */

/**
 * Get photos in album
 */
export function getPhotosByAlbum(albumId) {
  return db.getPhotosByAlbum(albumId);
}

/**
 * Get photo by ID
 */
export function getPhotoById(photoId) {
  return db.getPhotoById(photoId);
}

/**
 * Import photo from file
 * Assumes file object with name and lastModifiedDate properties
 */
export async function importPhoto(albumId, file, thumbnail = null) {
  try {
    const dateTaken = file.lastModifiedDate || new Date().toISOString();
    
    const photoId = db.createPhoto({
      albumId,
      filePath: file.name,
      dateTaken,
      filename: file.name,
      fileSize: file.size,
      thumbnail
    });
    
    eventBus.emit(EVENTS.PHOTOS_UPDATED);
    return photoId;
  } catch (error) {
    console.error('Failed to import photo:', error);
    eventBus.emit(EVENTS.ERROR_OCCURRED, error);
    throw error;
  }
}

/**
 * Batch import photos
 */
export async function importPhotos(albumId, files) {
  try {
    eventBus.emit(EVENTS.LOADING_STARTED);
    
    const photoIds = [];
    for (const file of files) {
      const photoId = await importPhoto(albumId, file);
      photoIds.push(photoId);
    }
    
    eventBus.emit(EVENTS.PHOTOS_UPDATED);
    eventBus.emit(EVENTS.LOADING_ENDED);
    
    return photoIds;
  } catch (error) {
    eventBus.emit(EVENTS.ERROR_OCCURRED, error);
    eventBus.emit(EVENTS.LOADING_ENDED);
    throw error;
  }
}

/**
 * Generate thumbnail from file (as Base64 data URL)
 */
export async function generateThumbnail(file, maxWidth = 200, maxHeight = 200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate scaling
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          resolve(thumbnail);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = event.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Update photo thumbnail
 */
export function updatePhotoThumbnail(photoId, thumbnail) {
  const success = db.updatePhoto(photoId, { thumbnail });
  if (success) {
    eventBus.emit(EVENTS.PHOTOS_UPDATED);
  }
  return success;
}

/**
 * Delete photo
 */
export function deletePhoto(photoId) {
  const success = db.deletePhoto(photoId);
  if (success) {
    eventBus.emit(EVENTS.PHOTOS_UPDATED);
  }
  return success;
}

/**
 * Get first photo (cover) for album
 */
export function getAlbumCover(albumId) {
  const photos = getPhotosByAlbum(albumId);
  return photos.length > 0 ? photos[0] : null;
}

/**
 * Extract metadata from file (basic)
 */
export function extractFileMetadata(file) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    lastModifiedDate: new Date(file.lastModified).toISOString()
  };
}

/**
 * Check if file is supported image format
 */
export function isSupportedImageFormat(file) {
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  return supportedTypes.includes(file.type);
}

/**
 * Validate and filter files for import
 */
export function validateFilesForImport(files) {
  const valid = [];
  const invalid = [];
  
  Array.from(files).forEach(file => {
    if (isSupportedImageFormat(file)) {
      valid.push(file);
    } else {
      invalid.push({
        name: file.name,
        reason: `Unsupported format: ${file.type}`
      });
    }
  });
  
  return { valid, invalid };
}

/**
 * Get all photos
 */
export function getAllPhotos() {
  return db.getAllPhotos();
}

/**
 * Get photo count by album
 */
export function getPhotoCountByAlbum(albumId) {
  return getPhotosByAlbum(albumId).length;
}

/**
 * Get statistics about photos
 */
export function getPhotoStats() {
  const allPhotos = getAllPhotos();
  
  return {
    totalPhotos: allPhotos.length,
    avgPhotoSize: allPhotos.length > 0
      ? allPhotos.reduce((sum, p) => sum + (p.file_size || 0), 0) / allPhotos.length
      : 0
  };
}
