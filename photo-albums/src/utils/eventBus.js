/**
 * Simple event bus for component communication
 */

class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to an event
   */
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    
    // Return unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Subscribe to event once (auto-unsubscribe after first trigger)
   */
  once(eventName, callback) {
    const wrappedCallback = (...args) => {
      callback(...args);
      this.off(eventName, wrappedCallback);
    };
    this.on(eventName, wrappedCallback);
  }

  /**
   * Unsubscribe from an event
   */
  off(eventName, callback) {
    if (!this.events[eventName]) return;
    
    this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    
    if (this.events[eventName].length === 0) {
      delete this.events[eventName];
    }
  }

  /**
   * Emit an event
   */
  emit(eventName, ...args) {
    if (!this.events[eventName]) return;
    
    this.events[eventName].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for "${eventName}":`, error);
      }
    });
  }

  /**
   * Clear all listeners for an event
   */
  clear(eventName) {
    if (eventName) {
      delete this.events[eventName];
    } else {
      this.events = {};
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(eventName) {
    return this.events[eventName] ? this.events[eventName].length : 0;
  }
}

// Export singleton instance
export const eventBus = new EventBus();

// Common event names
export const EVENTS = {
  ALBUMS_LOADED: 'albums:loaded',
  ALBUMS_UPDATED: 'albums:updated',
  ALBUM_SELECTED: 'album:selected',
  ALBUM_REORDERED: 'album:reordered',
  ALBUM_RENAMED: 'album:renamed',
  PHOTOS_LOADED: 'photos:loaded',
  PHOTOS_UPDATED: 'photos:updated',
  PREFERENCE_CHANGED: 'preference:changed',
  SORT_MODE_CHANGED: 'sort:mode:changed',
  ERROR_OCCURRED: 'error:occurred',
  LOADING_STARTED: 'loading:started',
  LOADING_ENDED: 'loading:ended',
};

export default eventBus;
