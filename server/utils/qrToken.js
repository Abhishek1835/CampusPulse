import crypto from 'crypto';

const QR_SECRET = process.env.QR_TOKEN_SECRET || 'campus_pulse_qr_secret_key_vtu_2026';

/**
 * Generate a dynamic, cryptographically signed attendance token expiring in 30 seconds.
 *
 * @param {string} eventId
 * @returns {{ token: string, expiresAt: number, remainingSeconds: number }}
 */
export function generateAttendanceQRToken(eventId) {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomBytes(4).toString('hex');
  const payload = `${eventId}:${timestamp}:${nonce}`;

  const hmac = crypto.createHmac('sha256', QR_SECRET);
  hmac.update(payload);
  const signature = hmac.digest('hex');

  const token = Buffer.from(`${payload}:${signature}`).toString('base64url');

  return {
    token,
    timestamp,
    expiresAt: timestamp + 30,
    remainingSeconds: 30
  };
}

/**
 * Verify an incoming attendance QR token.
 *
 * @param {string} token
 * @param {string} expectedEventId
 * @returns {{ valid: boolean, message: string }}
 */
export function verifyAttendanceQRToken(token, expectedEventId) {
  if (!token) {
    return { valid: false, message: 'Missing attendance token' };
  }

  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 4) {
      return { valid: false, message: 'Malformed QR token' };
    }

    const [eventId, timestampStr, nonce, receivedSignature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (eventId !== expectedEventId.toString()) {
      return { valid: false, message: 'This QR code is for a different event' };
    }

    const now = Math.floor(Date.now() / 1000);
    // Allow up to 30s validity + 5s network latency buffer
    if (now - timestamp > 35) {
      return { valid: false, message: 'QR code expired. Please scan the current live QR code on screen.' };
    }

    if (timestamp > now + 5) {
      return { valid: false, message: 'Invalid token timestamp from future' };
    }

    // Recompute signature
    const payload = `${eventId}:${timestampStr}:${nonce}`;
    const hmac = crypto.createHmac('sha256', QR_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signatureBuffer(receivedSignature)),
        Buffer.from(signatureBuffer(expectedSignature))
      )
    ) {
      return { valid: false, message: 'Invalid or forged QR token signature' };
    }

    return { valid: true, message: 'Token verified' };
  } catch (err) {
    return { valid: false, message: 'Failed to parse attendance token' };
  }
}

function signatureBuffer(hexStr) {
  const buf = Buffer.alloc(32);
  const incoming = Buffer.from(hexStr, 'hex');
  incoming.copy(buf, 0, 0, Math.min(incoming.length, 32));
  return buf;
}

export const generateQRToken = (eventId) => {
  const result = generateAttendanceQRToken(eventId);
  return result.token;
};

export const verifyQRToken = (token, eventId) => {
  return verifyAttendanceQRToken(token, eventId);
};
