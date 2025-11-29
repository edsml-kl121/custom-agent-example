/**
 * Date utility functions for album grouping and formatting
 */

/**
 * Get week key from a date (for grouping photos by week)
 * Returns ISO week start date in format: YYYY-Www
 */
export function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  
  // Thursday of current week
  d.setDate(d.getDate() - d.getDay() + 4);
  
  // Week 1 is the week with the first Thursday of the year
  const time = d.getTime();
  d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  
  // Adjust to Thursday
  d.setDate(d.getDate() - d.getDay() + 4);
  
  const weekOne = d.getTime();
  const week = Math.ceil((time - weekOne + 1) / 604800000);
  const year = d.getFullYear();
  
  return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * Get month key from a date (for grouping photos by month)
 * Returns format: YYYY-MM
 */
export function getMonthKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get day key from a date (for grouping photos by day)
 * Returns format: YYYY-MM-DD
 */
export function getDayKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for display (e.g., "Nov 15, 2024")
 */
export function formatDateDisplay(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format date range for display (e.g., "Nov 15 - 21, 2024")
 */
export function formatWeekDisplay(weekKey) {
  // Parse week key (YYYY-Www)
  const [year, week] = weekKey.split('-W');
  const weekNum = parseInt(week);
  
  // Calculate Monday of the week
  const simple = new Date(year, 0, 1 + (weekNum - 1) * 7);
  const mon = new Date(simple);
  const day = simple.getDay();
  const diff = simple.getDate() - day + (day === 0 ? -6 : 1);
  mon.setDate(diff);
  
  // Sunday of the same week
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  
  const startStr = mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = sun.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  return `${startStr} - ${endStr}`;
}

/**
 * Format date range for month
 */
export function formatMonthDisplay(monthKey) {
  const date = new Date(`${monthKey}-01`);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
}

/**
 * Group photos by date key (week by default)
 */
export function groupPhotosByDate(photos, groupBy = 'week') {
  const groups = {};
  
  photos.forEach(photo => {
    let key;
    switch (groupBy) {
      case 'day':
        key = getDayKey(photo.date_taken);
        break;
      case 'month':
        key = getMonthKey(photo.date_taken);
        break;
      case 'week':
      default:
        key = getWeekKey(photo.date_taken);
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(photo);
  });
  
  return groups;
}

/**
 * Sort date keys in descending order (newest first)
 */
export function sortDateKeys(keys) {
  return keys.sort().reverse();
}

/**
 * Check if date is today
 */
export function isToday(date) {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is this week
 */
export function isThisWeek(date) {
  return getWeekKey(new Date()) === getWeekKey(date);
}

/**
 * Get relative date string (e.g., "Today", "Yesterday", "This week")
 */
export function getRelativeDateString(date) {
  if (isToday(date)) {
    return 'Today';
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (getDayKey(date) === getDayKey(yesterday)) {
    return 'Yesterday';
  }
  
  if (isThisWeek(date)) {
    return 'This week';
  }
  
  return formatDateDisplay(date);
}
