/**
 * Central Certificate Eligibility Rule
 * Decides whether an attendee qualifies for automatic certificate generation.
 *
 * @param {Object} event - The Event document or object with attendance & certificate configs
 * @param {Object} attendance - The Attendance document or object for the student
 * @returns {{ eligible: boolean, reason: string }}
 */
export function isEligibleForCertificate(event, attendance) {
  if (!event || !event.certificate?.enabled) {
    return {
      eligible: false,
      reason: 'Certificates are not enabled for this event'
    };
  }

  if (!attendance) {
    return {
      eligible: false,
      reason: 'Absent — No check-in recorded for this event'
    };
  }

  if (attendance.status === 'absent') {
    return {
      eligible: false,
      reason: 'Student marked absent'
    };
  }

  // Manual marking by organizer
  if (attendance.status === 'manual') {
    return {
      eligible: true,
      reason: attendance.manualReason
        ? `Manually approved: ${attendance.manualReason}`
        : 'Manually approved by organizer'
    };
  }

  // On-time check-in
  if (attendance.status === 'on-time') {
    // Check minimum duration if configured
    if (event.attendance?.minDurationMinutes > 0) {
      const duration = attendance.durationMinutes || 0;
      if (duration < event.attendance.minDurationMinutes) {
        return {
          eligible: false,
          reason: `Minimum stay duration not met (${duration}/${event.attendance.minDurationMinutes} mins)`
        };
      }
    }

    // Check mandatory checkout if required
    if (event.attendance?.requireCheckOut && !attendance.checkOutTime) {
      return {
        eligible: false,
        reason: 'Event required check-out, but check-out was not recorded'
      };
    }

    return {
      eligible: true,
      reason: 'Verified on-time attendance'
    };
  }

  // Late check-in: not eligible by default, unless organizer explicitly toggled 'allowLateCertificates'
  if (attendance.status === 'late') {
    if (event.attendance?.allowLateCertificates) {
      return {
        eligible: true,
        reason: 'Checked in late (organizer permitted late attendee certificates)'
      };
    }
    return {
      eligible: false,
      reason: 'Late check-in — certificates restricted to on-time attendees'
    };
  }

  return {
    eligible: false,
    reason: 'Attendance criteria not fulfilled'
  };
}
