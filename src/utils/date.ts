/**
 * Date parsing and formatting utilities
 */

/**
 * Parses a date string into a Date object in the local timezone
 * Supports multiple date formats and handles timezones consistently
 */
export function parseDate(dateStr: string | number | Date): Date | null {
  if (dateStr === null || dateStr === undefined) return null;
  
  // If it's already a Date object, return a copy to avoid reference issues
  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? null : new Date(dateStr);
  }
  
  // If it's a number, assume it's a timestamp
  if (typeof dateStr === 'number') {
    // If it's in seconds, convert to milliseconds
    const timestamp = dateStr.toString().length === 10 ? dateStr * 1000 : dateStr;
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // Trim and check for empty string
  const str = dateStr.toString().trim();
  if (str === '') return null;
  
  // Try parsing common date formats first (treat date-only as UTC midnight)
  
  // YYYY-MM-DD or YYYY/MM/DD
  const yyyyMmDd = str.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (yyyyMmDd) {
    const [_, year, month, day] = yyyyMmDd;
    // Construct as UTC midnight to preserve calendar date in ISO output
    const date = new Date(Date.UTC(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10)
    ));
    if (!isNaN(date.getTime())) return date;
  }
  
  // DD/MM/YYYY or DD-MM-YYYY
  const ddMmYyyy = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (ddMmYyyy) {
    const [_, day, month, year] = ddMmYyyy;
    const fullYear = year.length === 2 ? `20${year}` : year;
    // Construct as UTC midnight to preserve calendar date
    const date = new Date(Date.UTC(
      parseInt(fullYear, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10)
    ));
    if (!isNaN(date.getTime())) return date;
  }
  
  // MM/DD/YYYY or MM-DD-YYYY (American format)
  const mmDdYyyy = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (mmDdYyyy) {
    const [_, month, day, year] = mmDdYyyy;
    const fullYear = year.length === 2 ? `20${year}` : year;
    // Construct as UTC midnight to preserve calendar date
    const date = new Date(Date.UTC(
      parseInt(fullYear, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10)
    ));
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try parsing as timestamp string (in milliseconds or seconds)
  if (/^\d+$/.test(str)) {
    const timestamp = str.length === 10 ? parseInt(str, 10) * 1000 : parseInt(str, 10);
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) return date;
  }
  
  // Finally, try parsing as ISO/datetime string (includes time or timezone)
  const isoDate = new Date(str);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }
  
  // If we get here, we couldn't parse the date
  return null;
}

/**
 * Formats a date according to the specified format
 * Supports both UTC and local time formatting
 */
export function formatDate(date: Date, formatStr: string = 'iso'): string | number | null {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }
  
  // Return timestamp if requested
  if (formatStr === 'timestamp') {
    return date.getTime();
  }
  
  // Return ISO string if requested
  if (formatStr === 'iso') {
    return date.toISOString();
  }
  
  // Handle common format strings
  if (formatStr === 'YYYY-MM-DD') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  if (formatStr === 'DD/MM/YYYY') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
  
  if (formatStr === 'MM/DD/YYYY') {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}/${year}`;
  }
  
  // Handle custom format strings
  const pad = (n: number) => n < 10 ? `0${n}` : `${n}`;
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  // Replace format placeholders with actual values
  return formatStr
    .replace(/yyyy/g, year.toString())
    .replace(/yy/g, year.toString().slice(-2))
    .replace(/MM/g, pad(month))
    .replace(/M/g, month.toString())
    .replace(/dd/g, pad(day))
    .replace(/d/g, day.toString())
    .replace(/HH/g, pad(hours))
    .replace(/H/g, hours.toString())
    .replace(/mm/g, pad(minutes))
    .replace(/m/g, minutes.toString())
    .replace(/ss/g, pad(seconds))
    .replace(/s/g, seconds.toString())
    .replace(/a/g, hours < 12 ? 'am' : 'pm')
    .replace(/A/g, hours < 12 ? 'AM' : 'PM');
}

/**
 * Converts a date to the specified timezone
 * Note: This is a simplified implementation that only handles UTC and local time
 */
export function convertToTimezone(date: Date, timezone: 'utc' | 'local' | string): Date {
  if (timezone === 'utc') {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  }
  
  if (timezone === 'local') {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  }
  
  // For other timezones, we'd need a proper timezone database
  // This is a simplified implementation that only handles UTC offsets in the format +HH:MM or -HH:MM
  const offsetMatch = timezone.match(/^([+-])(\d{2}):?(\d{2})?$/);
  if (offsetMatch) {
    const [_, sign, hours, minutes = '00'] = offsetMatch;
    const offsetMs = (parseInt(hours, 10) * 60 + parseInt(minutes, 10)) * 60000;
    const localOffset = date.getTimezoneOffset() * 60000;
    const targetOffset = sign === '+' ? -offsetMs : offsetMs;
    return new Date(date.getTime() + localOffset + targetOffset);
  }
  
  // If we can't parse the timezone, return the date as-is
  return date;
}

/**
 * Checks if a value is a valid date
 */
export function isValidDate(value: any): boolean {
  if (!value) return false;
  
  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }
  
  if (typeof value === 'string' || typeof value === 'number') {
    const date = parseDate(value);
    return date !== null && !isNaN(date.getTime());
  }
  
  return false;
}
