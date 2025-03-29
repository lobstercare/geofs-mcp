/**
 * Interface for aircraft speed data
 */
export interface SpeedData {
  kias: number;           // Knots Indicated Airspeed
  groundSpeed: number;    // Ground speed in knots
  verticalSpeed: number;  // Vertical speed in feet per minute
}

/**
 * Interface for aircraft attitude data
 */
export interface AttitudeData {
  roll: number;     // Roll angle in degrees
  pitch: number;    // Pitch angle in degrees
  heading: number;  // Heading in degrees
}

/**
 * Interface for aircraft position data
 */
export interface PositionData {
  latitude: number;   // Latitude in degrees
  longitude: number;  // Longitude in degrees
  altitude: number;   // Altitude in meters
}

/**
 * Interface for aircraft control surfaces data
 */
export interface ControlsData {
  throttle: number;  // Throttle position (0-1)
  elevators: number; // Elevator position (-1 to 1)
  ailerons: number;  // Aileron position (-1 to 1)
  rudder: number;    // Rudder position (-1 to 1)
  flaps: number;     // Flaps position (0-1)
  gear: number;      // Landing gear position (0-1)
}

/**
 * Interface for aircraft information
 */
export interface AircraftData {
  id: number;        // Aircraft ID in GeoFS
  name: string;      // Aircraft name/model
  type: string;      // Aircraft type (e.g., "airliner", "general")
}

/**
 * Interface for comprehensive flight data
 */
export interface FlightData {
  speed: SpeedData;
  attitude: AttitudeData;
  position: PositionData;
  controls: ControlsData;
  aircraft?: AircraftData;  // Aircraft information
}

/**
 * Interface for navigation waypoint
 */
export interface Waypoint {
  name: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  type: 'airport' | 'navaid' | 'fix' | 'custom';
}

/**
 * Interface for flight plan
 */
export interface FlightPlan {
  departure?: Waypoint;
  arrival?: Waypoint;
  waypoints: Waypoint[];
  currentWaypointIndex: number;
}
