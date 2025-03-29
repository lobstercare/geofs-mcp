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
  // Flag to track initialization status
  private _isInitialized = false;
  
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
      flaps: 0,
      gear: 1 // Default to gear down
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
      
      this._isInitialized = true;
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
   * Check if the controller is initialized
   */
  public isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Get current flight data
   */
  public getFlightData(): FlightData {
    return {
      position: { ...this.aircraft.position },
      attitude: { ...this.aircraft.attitude },
      speed: { ...this.aircraft.speed },
      controls: { ...this.aircraft.controls },
      aircraft: {
        id: this.aircraft.aircraftId,
        name: this.getAircraftName(this.aircraft.aircraftId),
        type: this.getAircraftType(this.aircraft.aircraftId)
      }
    };
  }

  /**
   * Set throttle value
   */
  public setThrottle(value: number): void {
    // Ensure value is between 0 and 1
    const throttle = Math.max(0, Math.min(1, value));
    
    // Update all engines
    this.aircraft.engines.forEach(engine => {
      engine.throttle = throttle;
      engine.running = throttle > 0;
    });
    
    this.aircraft.controls.throttle = throttle;
    
    console.log(`Throttle set to ${throttle}`);
  }

  /**
   * Set target heading
   */
  public setHeading(degrees: number): void {
    // Normalize heading to 0-360 range
    let heading = degrees % 360;
    if (heading < 0) heading += 360;
    
    // Set target heading
    const targetHeading = heading;
    
    // Simulate turning to the target heading
    this.turnToHeading(targetHeading);
    
    console.log(`Heading set to ${targetHeading} degrees`);
  }

  /**
   * Start a predefined flight pattern
   */
  public startPattern(pattern: string): void {
    console.log(`Starting pattern: ${pattern}`);
    
    switch (pattern.toLowerCase()) {
      case 'takeoff':
        this.executeTakeoffPattern();
        break;
      case 'landing':
        this.executeLandingPattern();
        break;
      case 'approach':
        this.executeApproachPattern();
        break;
      case 'holdingpattern':
        this.executeHoldingPattern();
        break;
      default:
        console.error(`Unknown pattern: ${pattern}`);
    }
  }

  /**
   * Execute takeoff pattern
   */
  private executeTakeoffPattern(): void {
    // Set flaps for takeoff
    this.aircraft.controls.flaps = 0.3;
    
    // Ensure gear is down
    this.aircraft.controls.gear = 1;
    
    // Apply full throttle
    this.setThrottle(1.0);
    
    // Simulate rotation at appropriate speed
    setTimeout(() => {
      // Pitch up for takeoff
      this.aircraft.attitude.pitch = 10;
      
      // Simulate positive climb
      setTimeout(() => {
        // Retract gear
        this.aircraft.controls.gear = 0;
        
        // Climb to 1000 feet
        this.aircraft.position.altitude += 300;
        
        // Reduce flaps
        setTimeout(() => {
          this.aircraft.controls.flaps = 0;
        }, 5000);
      }, 3000);
    }, 5000);
  }

  /**
   * Execute landing pattern
   */
  private executeLandingPattern(): void {
    // Reduce speed
    this.setThrottle(0.3);
    
    // Set flaps for approach
    this.aircraft.controls.flaps = 0.5;
    
    // Lower landing gear
    this.aircraft.controls.gear = 1;
    
    // Set approach pitch (3-degree glideslope)
    this.aircraft.attitude.pitch = -3;
    
    // Simulate touchdown
    setTimeout(() => {
      // Flare before touchdown
      this.aircraft.attitude.pitch = 0;
      
      // Touch down
      setTimeout(() => {
        // Reduce throttle to idle
        this.setThrottle(0);
      }, 3000);
    }, 10000);
  }

  /**
   * Execute approach pattern
   */
  private executeApproachPattern(): void {
    // Configure for approach
    this.setThrottle(0.4);
    this.aircraft.controls.flaps = 0.3;
    
    // Align with runway
    // (This would use the current airport data in a real implementation)
    
    // Descend to pattern altitude
    this.aircraft.position.altitude = 1000;
  }

  /**
   * Execute holding pattern
   */
  private executeHoldingPattern(): void {
    // Set up for holding pattern
    this.setThrottle(0.5);
    this.aircraft.controls.flaps = 0;
    
    // Execute a series of turns to create a racetrack pattern
    this.turnToHeading(this.aircraft.attitude.heading);
    
    // After 2 minutes, turn 90 degrees right
    setTimeout(() => {
      this.turnToHeading((this.aircraft.attitude.heading + 90) % 360);
      
      // After 1 minute, turn 90 degrees right again
      setTimeout(() => {
        this.turnToHeading((this.aircraft.attitude.heading + 90) % 360);
        
        // After 2 minutes, turn 90 degrees right again
        setTimeout(() => {
          this.turnToHeading((this.aircraft.attitude.heading + 90) % 360);
        }, 120000);
      }, 60000);
    }, 120000);
  }

  /**
   * Turn to a specific heading
   */
  private turnToHeading(targetHeading: number): void {
    // Calculate turn direction (shortest path)
    const currentHeading = this.aircraft.attitude.heading;
    let headingDiff = targetHeading - currentHeading;
    
    // Normalize to -180 to 180 range
    if (headingDiff > 180) headingDiff -= 360;
    if (headingDiff < -180) headingDiff += 360;
    
    // Determine bank direction
    const bankDirection = headingDiff > 0 ? 1 : -1;
    
    // Apply bank
    this.aircraft.attitude.roll = bankDirection * 20;
    
    // Simulate turn
    const turnRate = 3; // degrees per second
    const turnTime = Math.abs(headingDiff) / turnRate;
    
    // Gradually update heading
    const startTime = Date.now();
    const startHeading = currentHeading;
    
    const updateHeading = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(1, elapsed / turnTime);
      
      this.aircraft.attitude.heading = startHeading + headingDiff * progress;
      
      // Normalize heading
      this.aircraft.attitude.heading = (this.aircraft.attitude.heading + 360) % 360;
      
      if (progress < 1) {
        setTimeout(updateHeading, 100);
      } else {
        // Level off
        this.aircraft.attitude.roll = 0;
      }
    };
    
    updateHeading();
  }

  /**
   * Get aircraft name based on ID
   */
  private getAircraftName(id: number): string {
    const aircraftNames: { [key: number]: string } = {
      1: 'Cessna 172',
      18: 'Boeing 737-800',
      24: 'Boeing 787-9',
      25: 'Boeing 787-10'
    };
    
    return aircraftNames[id] || 'Unknown Aircraft';
  }

  /**
   * Get aircraft type based on ID
   */
  private getAircraftType(id: number): string {
    if (id >= 18 && id <= 25) {
      return 'airliner';
    } else if (id >= 1 && id <= 10) {
      return 'general';
    } else {
      return 'unknown';
    }
  }

  /**
   * Execute a command in the simulated GeoFS
   */
  public async executeCommand(command: string, params: any): Promise<any> {
    if (!this._isInitialized) {
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
        case 'startPattern':
          return this.startPattern(params.pattern);
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
   * Clean up resources
   */
  async close(): Promise<void> {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this._isInitialized = false;
    console.log('GeoFS simulation stopped');
  }
}
