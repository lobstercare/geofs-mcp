/**
 * Simulated GeoFS Controller
 * 
 * This is a simplified version that simulates a GeoFS flight simulator
 * without requiring browser automation. It maintains an internal state
 * that mimics the behavior of an aircraft in GeoFS.
 */

// Import flight data models
import { FlightData, PositionData } from '../models/flight-data';

export class GeoFSController {
  private isInitialized = false;
  
  // Aircraft state
  private aircraft = {
    // Current position (lat, long, altitude)
    position: {
      latitude: 37.6213, // Default to San Francisco airport
      longitude: -122.3790,
      altitude: 0 // Ground level
    },
    
    // Speed data
    speed: {
      kias: 0, // Knots Indicated Airspeed
      groundSpeed: 0,
      verticalSpeed: 0
    },
    
    // Attitude data
    attitude: {
      roll: 0,
      pitch: 0,
      heading: 0 // North
    },
    
    // Control surfaces
    controls: {
      throttle: 0,
      elevators: 0,
      ailerons: 0,
      rudder: 0,
      flaps: 0
    },
    
    // Aircraft type (default: Cessna 172)
    aircraftId: 1,
    
    // Engine state
    engines: [{ throttle: 0, running: false }]
  };
  
  // Physics update interval
  private updateInterval: NodeJS.Timeout | null = null;
  
  /**
   * Initialize the GeoFS controller
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing simulated GeoFS controller');
      
      // Start the physics simulation
      this.startPhysicsSimulation();
      
      this.isInitialized = true;
      console.log('GeoFS simulation started successfully');
    } catch (error) {
      console.error('Failed to initialize GeoFS controller:', error);
      throw error;
    }
  }
  
  /**
   * Start the physics simulation that updates aircraft state
   */
  private startPhysicsSimulation(): void {
    // Update physics at 10Hz
    this.updateInterval = setInterval(() => {
      this.updateAircraftPhysics();
    }, 100);
  }
  
  /**
   * Update aircraft physics based on current state
   */
  private updateAircraftPhysics(): void {
    // Simple physics model
    const dt = 0.1; // 100ms in seconds
    
    // Update speed based on throttle
    const maxSpeed = 150; // knots
    const targetSpeed = this.aircraft.engines[0].throttle * maxSpeed;
    
    // Gradually approach target speed
    this.aircraft.speed.kias += (targetSpeed - this.aircraft.speed.kias) * 0.1;
    this.aircraft.speed.groundSpeed = this.aircraft.speed.kias;
    
    // Convert knots to meters per second for position calculations
    const speedMps = this.aircraft.speed.groundSpeed * 0.51444;
    
    // Update position based on heading and speed
    const headingRad = this.aircraft.attitude.heading * (Math.PI / 180);
    const distanceM = speedMps * dt;
    
    // Calculate new position (simplified, not accounting for Earth's curvature for small distances)
    const earthRadius = 6371000; // meters
    const latChange = (distanceM * Math.cos(headingRad)) / earthRadius * (180 / Math.PI);
    const lonChange = (distanceM * Math.sin(headingRad)) / (earthRadius * Math.cos(this.aircraft.position.latitude * (Math.PI / 180))) * (180 / Math.PI);
    
    this.aircraft.position.latitude += latChange;
    this.aircraft.position.longitude += lonChange;
    
    // Update altitude based on vertical speed
    this.aircraft.position.altitude += this.aircraft.speed.verticalSpeed * dt / 60; // fpm to m/s conversion
    
    // Ensure altitude doesn't go below ground
    if (this.aircraft.position.altitude < 0) {
      this.aircraft.position.altitude = 0;
      this.aircraft.speed.verticalSpeed = 0;
    }
  }
  
  /**
   * Execute a command in the simulated GeoFS
   */
  async executeCommand(command: string, params: any): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('GeoFS controller not initialized');
    }

    try {
      switch (command) {
        case 'setThrottle':
          return this.setThrottle(params.value);
        case 'setHeading':
          return this.setHeading(params.degrees);
        case 'getPosition':
          return this.getPosition();
        case 'selectAircraft':
          return this.selectAircraft(params.aircraftId);
        case 'takeOff':
          return this.takeOff();
        case 'land':
          return this.land();
        case 'getFlightData':
          return this.getFlightData();
        case 'updateAircraftState':
          return this.updateAircraftState(params);
        default:
          throw new Error(`Unknown command: ${command}`);
      }
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
      throw error;
    }
  }

  /**
   * Update aircraft state directly from external data
   * Used for replaying flight data
   */
  private updateAircraftState(params: any): boolean {
    try {
      // Update position if provided
      if (params.position) {
        this.aircraft.position = {
          ...this.aircraft.position,
          ...params.position
        };
      }
      
      // Update attitude if provided
      if (params.attitude) {
        this.aircraft.attitude = {
          ...this.aircraft.attitude,
          ...params.attitude
        };
      }
      
      // Update speed if provided
      if (params.speed) {
        this.aircraft.speed = {
          ...this.aircraft.speed,
          ...params.speed
        };
      }
      
      // Update controls if provided
      if (params.controls) {
        this.aircraft.controls = {
          ...this.aircraft.controls,
          ...params.controls
        };
      }
      
      console.log('Aircraft state updated from external data');
      return true;
    } catch (error) {
      console.error('Error updating aircraft state:', error);
      return false;
    }
  }

  /**
   * Set the throttle value (0-1)
   */
  private setThrottle(value: number): boolean {
    // Ensure value is between 0 and 1
    const throttleValue = Math.max(0, Math.min(1, value));
    
    // Set throttle on all engines
    this.aircraft.engines.forEach(engine => {
      engine.throttle = throttleValue;
    });
    
    // Update control value
    this.aircraft.controls.throttle = throttleValue;
    
    console.log(`Throttle set to ${throttleValue * 100}%`);
    return true;
  }

  /**
   * Set the aircraft heading
   */
  private setHeading(degrees: number): boolean {
    // Normalize degrees to 0-360
    const normalizedDegrees = ((degrees % 360) + 360) % 360;
    
    // Set new heading
    this.aircraft.attitude.heading = normalizedDegrees;
    
    console.log(`Heading set to ${normalizedDegrees}°`);
    return true;
  }

  /**
   * Get the current aircraft position
   */
  private getPosition(): PositionData {
    return { ...this.aircraft.position };
  }

  /**
   * Select an aircraft by ID
   */
  private selectAircraft(aircraftId: number): boolean {
    // Store previous aircraft ID
    const previousAircraftId = this.aircraft.aircraftId;
    
    // Set new aircraft ID
    this.aircraft.aircraftId = aircraftId;
    
    console.log(`Aircraft changed from ID ${previousAircraftId} to ID ${aircraftId}`);
    return true;
  }

  /**
   * Simulate takeoff procedure
   */
  private takeOff(): boolean {
    // Set throttle to max
    this.setThrottle(1.0);
    
    // Set initial climb
    this.aircraft.speed.verticalSpeed = 500; // 500 feet per minute
    this.aircraft.attitude.pitch = 10; // 10 degrees nose up
    
    console.log('Takeoff procedure initiated');
    return true;
  }

  /**
   * Simulate landing procedure
   */
  private land(): boolean {
    // Reduce throttle
    this.setThrottle(0.3);
    
    // Set descent rate
    this.aircraft.speed.verticalSpeed = -300; // -300 feet per minute
    this.aircraft.attitude.pitch = -3; // 3 degrees nose down
    
    console.log('Landing procedure initiated');
    return true;
  }

  /**
   * Get current flight data
   */
  private getFlightData(): FlightData {
    return {
      speed: { ...this.aircraft.speed },
      attitude: { ...this.aircraft.attitude },
      position: { ...this.aircraft.position },
      controls: { ...this.aircraft.controls }
    };
  }

  /**
   * Clean up resources
   */
  async close(): Promise<void> {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.isInitialized = false;
    console.log('GeoFS simulation stopped');
  }
}
