/**
 * Utility to parse an event's Date and time string (e.g. "10:00 AM", "14:30")
 * into a definitive JavaScript Date.
 */
export function parseEventTime(dateInput, timeStr) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return new Date();

  const baseYear = d.getFullYear();
  const baseMonth = d.getMonth();
  const baseDay = d.getDate();

  let hours = 10;
  let minutes = 0;

  if (timeStr && typeof timeStr === 'string') {
    const cleanTime = timeStr.trim().toUpperCase();
    const isPM = cleanTime.includes('PM');
    const isAM = cleanTime.includes('AM');

    const numMatch = cleanTime.match(/(\d{1,2}):(\d{2})/);
    if (numMatch) {
      hours = parseInt(numMatch[1], 10);
      minutes = parseInt(numMatch[2], 10);

      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
    } else {
      const singleNum = cleanTime.match(/(\d{1,2})/);
      if (singleNum) {
        hours = parseInt(singleNum[1], 10);
        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
      }
    }
  }

  // Construct local date with hours & minutes
  return new Date(baseYear, baseMonth, baseDay, hours, minutes, 0, 0);
}

export function getEventStartDateTime(event) {
  return parseEventTime(event.date, event.startTime);
}

export function getEventEndDateTime(event) {
  return parseEventTime(event.date, event.endTime);
}

/**
 * Compute the check-in time windows for an event
 */
export function getAttendanceWindow(event) {
  const start = getEventStartDateTime(event);
  const cfg = event.attendance || {};

  const opensBefore = cfg.checkInOpensBefore ?? 15;
  const grace = cfg.onTimeGraceMinutes ?? 15;
  const closesAfter = cfg.checkInClosesAfter ?? 30;

  const opensAt = new Date(start.getTime() - opensBefore * 60 * 1000);
  const onTimeUntil = new Date(start.getTime() + grace * 60 * 1000);
  const closesAt = new Date(start.getTime() + closesAfter * 60 * 1000);

  return { start, opensAt, onTimeUntil, closesAt };
}

/**
 * Determine check-in status using the server's authoritative clock
 */
export function determineAttendanceStatus(event, checkInTime = new Date()) {
  const { opensAt, onTimeUntil, closesAt, start } = getAttendanceWindow(event);

  if (checkInTime < opensAt) {
    const minutesLeft = Math.ceil((opensAt.getTime() - checkInTime.getTime()) / 60000);
    return {
      allowed: false,
      reason: `Check-in has not opened yet. It opens ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'} before the event at ${opensAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    };
  }

  if (checkInTime > closesAt) {
    return {
      allowed: false,
      reason: `Check-in is now closed. The check-in window closed at ${closesAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    };
  }

  if (checkInTime <= onTimeUntil) {
    return {
      allowed: true,
      status: 'on-time',
      message: 'Checked in on time!'
    };
  }

  return {
    allowed: true,
    status: 'late',
    message: 'Checked in after the on-time grace period (marked Late).'
  };
}
