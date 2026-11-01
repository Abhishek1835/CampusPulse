/**
 * Calculate distance in meters between two lat/lng points using the Haversine formula
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Verify if coordinates fall within the event venue geofence
 */
export function verifyGeofence(eventGeofence, userCoords) {
  if (!eventGeofence?.enabled) {
    return { verified: true, message: 'Geofence disabled' };
  }

  if (!userCoords || userCoords.latitude === undefined || userCoords.longitude === undefined) {
    return {
      verified: false,
      message: 'Location access is required to check in for this on-site event. Please enable GPS/Location.'
    };
  }

  const distance = calculateDistanceMeters(
    eventGeofence.latitude,
    eventGeofence.longitude,
    userCoords.latitude,
    userCoords.longitude
  );

  const radius = eventGeofence.radiusMeters || 150;

  if (distance > radius) {
    return {
      verified: false,
      distance: Math.round(distance),
      message: `You are approximately ${Math.round(distance)}m away from the venue. Check-in is only permitted within ${radius}m.`
    };
  }

  return { verified: true, distance: Math.round(distance) };
}

export const getHaversineDistance = calculateDistanceMeters;
export const isWithinGeofence = (lat1, lon1, lat2, lon2, radiusMeters) => {
  return calculateDistanceMeters(lat1, lon1, lat2, lon2) <= radiusMeters;
};
