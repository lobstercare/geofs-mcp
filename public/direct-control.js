/**
 * GeoFS Direct Control Script
 * 
 * This script directly controls the GeoFS aircraft using the Boeing 787 flight data
 * without requiring a WebSocket connection.
 * 
 * Version: 1.1.0 - Enhanced with more flight data and controls
 */

(function() {
  console.log('Starting GeoFS Direct Control...');
  
  // Check if GeoFS is loaded
  if (typeof geofs === 'undefined') {
    console.error('GeoFS not detected! Please run this script on the GeoFS website.');
    return;
  }
  
  // Load the Boeing 787 flight data - expanded with more detailed takeoff sequence
  const flightData = [
    // Initial position on runway
    {
      position: { latitude: 49.6233, longitude: 6.2044, altitude: 376 },
      attitude: { heading: 270, pitch: 0, roll: 0 },
      speed: { kias: 0, groundSpeed: 0, verticalSpeed: 0 },
      controls: { throttle: 0, flaps: 0.5, gear: 1 }
    },
    // Begin taxi
    {
      position: { latitude: 49.6233, longitude: 6.2044, altitude: 376 },
      attitude: { heading: 270, pitch: 0, roll: 0 },
      speed: { kias: 10, groundSpeed: 10, verticalSpeed: 0 },
      controls: { throttle: 0.2, flaps: 0.5, gear: 1 }
    },
    // Accelerating on runway
    {
      position: { latitude: 49.6232, longitude: 6.203, altitude: 376 },
      attitude: { heading: 270, pitch: 0, roll: 0 },
      speed: { kias: 40, groundSpeed: 40, verticalSpeed: 0 },
      controls: { throttle: 0.7, flaps: 0.5, gear: 1 }
    },
    // Continue acceleration
    {
      position: { latitude: 49.6232, longitude: 6.201, altitude: 376 },
      attitude: { heading: 270, pitch: 0, roll: 0 },
      speed: { kias: 80, groundSpeed: 80, verticalSpeed: 0 },
      controls: { throttle: 0.9, flaps: 0.5, gear: 1 }
    },
    // Approaching rotation speed
    {
      position: { latitude: 49.6231, longitude: 6.199, altitude: 376 },
      attitude: { heading: 270, pitch: 0, roll: 0 },
      speed: { kias: 120, groundSpeed: 120, verticalSpeed: 0 },
      controls: { throttle: 1.0, flaps: 0.5, gear: 1 }
    },
    // Rotation
    {
      position: { latitude: 49.623, longitude: 6.197, altitude: 376 },
      attitude: { heading: 270, pitch: 5, roll: 0 },
      speed: { kias: 140, groundSpeed: 140, verticalSpeed: 300 },
      controls: { throttle: 1.0, flaps: 0.5, gear: 1 }
    },
    // Liftoff
    {
      position: { latitude: 49.6229, longitude: 6.195, altitude: 380 },
      attitude: { heading: 270, pitch: 10, roll: 0 },
      speed: { kias: 160, groundSpeed: 160, verticalSpeed: 1000 },
      controls: { throttle: 1.0, flaps: 0.5, gear: 1 }
    },
    // Initial climb
    {
      position: { latitude: 49.6228, longitude: 6.193, altitude: 400 },
      attitude: { heading: 270, pitch: 15, roll: 0 },
      speed: { kias: 170, groundSpeed: 170, verticalSpeed: 1500 },
      controls: { throttle: 1.0, flaps: 0.5, gear: 0.5 } // Gear retracting
    },
    // Continuing climb
    {
      position: { latitude: 49.6227, longitude: 6.191, altitude: 450 },
      attitude: { heading: 270, pitch: 15, roll: 0 },
      speed: { kias: 180, groundSpeed: 180, verticalSpeed: 1800 },
      controls: { throttle: 1.0, flaps: 0.3, gear: 0 } // Gear up, reducing flaps
    },
    // Climbing and accelerating
    {
      position: { latitude: 49.6226, longitude: 6.189, altitude: 500 },
      attitude: { heading: 270, pitch: 12, roll: 0 },
      speed: { kias: 200, groundSpeed: 200, verticalSpeed: 1500 },
      controls: { throttle: 0.9, flaps: 0.1, gear: 0 } // Reducing flaps further
    },
    // Leveling at 1000ft
    {
      position: { latitude: 49.6225, longitude: 6.187, altitude: 680 }, // ~1000ft
      attitude: { heading: 270, pitch: 5, roll: 0 },
      speed: { kias: 220, groundSpeed: 220, verticalSpeed: 500 },
      controls: { throttle: 0.8, flaps: 0, gear: 0 } // Flaps up
    },
    // Cruising
    {
      position: { latitude: 49.6224, longitude: 6.185, altitude: 700 },
      attitude: { heading: 270, pitch: 2, roll: 0 },
      speed: { kias: 250, groundSpeed: 250, verticalSpeed: 0 },
      controls: { throttle: 0.7, flaps: 0, gear: 0 }
    }
  ];
  
  // Additional flight patterns
  const flightPatterns = {
    takeoff: flightData,
    rightTurn: [
      // Starting from level flight
      {
        position: { latitude: 49.6224, longitude: 6.185, altitude: 700 },
        attitude: { heading: 270, pitch: 2, roll: 0 },
        speed: { kias: 250, groundSpeed: 250, verticalSpeed: 0 },
        controls: { throttle: 0.7, flaps: 0, gear: 0 }
      },
      // Begin right turn
      {
        position: { latitude: 49.6224, longitude: 6.183, altitude: 700 },
        attitude: { heading: 290, pitch: 2, roll: 15 },
        speed: { kias: 250, groundSpeed: 250, verticalSpeed: 0 },
        controls: { throttle: 0.7, flaps: 0, gear: 0 }
      },
      // Continuing turn
      {
        position: { latitude: 49.6226, longitude: 6.181, altitude: 700 },
        attitude: { heading: 310, pitch: 2, roll: 20 },
        speed: { kias: 245, groundSpeed: 245, verticalSpeed: 0 },
        controls: { throttle: 0.7, flaps: 0, gear: 0 }
      },
      // Halfway through turn
      {
        position: { latitude: 49.6228, longitude: 6.180, altitude: 700 },
        attitude: { heading: 330, pitch: 2, roll: 20 },
        speed: { kias: 245, groundSpeed: 245, verticalSpeed: 0 },
        controls: { throttle: 0.7, flaps: 0, gear: 0 }
      },
      // Continuing turn
      {
        position: { latitude: 49.6230, longitude: 6.181, altitude: 700 },
        attitude: { heading: 350, pitch: 2, roll: 15 },
        speed: { kias: 245, groundSpeed: 245, verticalSpeed: 0 },
        controls: { throttle: 0.7, flaps: 0, gear: 0 }
      },
      // Completing turn
      {
        position: { latitude: 49.6232, longitude: 6.183, altitude: 700 },
        attitude: { heading: 10, pitch: 2, roll: 5 },
        speed: { kias: 250, groundSpeed: 250, verticalSpeed: 0 },
        controls: { throttle: 0.7, flaps: 0, gear: 0 }
      },
      // Leveled out on new heading
      {
        position: { latitude: 49.6234, longitude: 6.184, altitude: 700 },
        attitude: { heading: 30, pitch: 2, roll: 0 },
        speed: { kias: 250, groundSpeed: 250, verticalSpeed: 0 },
        controls: { throttle: 0.7, flaps: 0, gear: 0 }
      }
    ],
    descent: [
      // Starting from cruise
      {
        position: { latitude: 49.6234, longitude: 6.184, altitude: 700 },
        attitude: { heading: 30, pitch: 2, roll: 0 },
        speed: { kias: 250, groundSpeed: 250, verticalSpeed: 0 },
        controls: { throttle: 0.7, flaps: 0, gear: 0 }
      },
      // Begin descent
      {
        position: { latitude: 49.6236, longitude: 6.186, altitude: 690 },
        attitude: { heading: 30, pitch: -2, roll: 0 },
        speed: { kias: 260, groundSpeed: 260, verticalSpeed: -500 },
        controls: { throttle: 0.5, flaps: 0, gear: 0 }
      },
      // Continuing descent
      {
        position: { latitude: 49.6238, longitude: 6.188, altitude: 670 },
        attitude: { heading: 30, pitch: -3, roll: 0 },
        speed: { kias: 270, groundSpeed: 270, verticalSpeed: -800 },
        controls: { throttle: 0.4, flaps: 0, gear: 0 }
      },
      // Approaching pattern altitude
      {
        position: { latitude: 49.6240, longitude: 6.190, altitude: 600 },
        attitude: { heading: 30, pitch: -2, roll: 0 },
        speed: { kias: 250, groundSpeed: 250, verticalSpeed: -500 },
        controls: { throttle: 0.4, flaps: 0.1, gear: 0 }
      },
      // Leveling at pattern altitude
      {
        position: { latitude: 49.6242, longitude: 6.192, altitude: 550 },
        attitude: { heading: 30, pitch: 0, roll: 0 },
        speed: { kias: 230, groundSpeed: 230, verticalSpeed: 0 },
        controls: { throttle: 0.5, flaps: 0.2, gear: 0 }
      }
    ],
    approach: [
      // Starting approach from pattern altitude
      {
        position: { latitude: 49.6242, longitude: 6.192, altitude: 550 },
        attitude: { heading: 30, pitch: 0, roll: 0 },
        speed: { kias: 230, groundSpeed: 230, verticalSpeed: 0 },
        controls: { throttle: 0.5, flaps: 0.2, gear: 0 }
      },
      // Begin turn to final approach
      {
        position: { latitude: 49.6244, longitude: 6.194, altitude: 550 },
        attitude: { heading: 60, pitch: 0, roll: 15 },
        speed: { kias: 220, groundSpeed: 220, verticalSpeed: 0 },
        controls: { throttle: 0.4, flaps: 0.3, gear: 0 }
      },
      // Continuing turn
      {
        position: { latitude: 49.6246, longitude: 6.196, altitude: 550 },
        attitude: { heading: 90, pitch: 0, roll: 20 },
        speed: { kias: 210, groundSpeed: 210, verticalSpeed: 0 },
        controls: { throttle: 0.4, flaps: 0.3, gear: 0 }
      },
      // Halfway through turn
      {
        position: { latitude: 49.6248, longitude: 6.198, altitude: 550 },
        attitude: { heading: 120, pitch: 0, roll: 20 },
        speed: { kias: 200, groundSpeed: 200, verticalSpeed: 0 },
        controls: { throttle: 0.4, flaps: 0.4, gear: 0 }
      },
      // Continuing turn
      {
        position: { latitude: 49.6250, longitude: 6.200, altitude: 550 },
        attitude: { heading: 150, pitch: 0, roll: 15 },
        speed: { kias: 190, groundSpeed: 190, verticalSpeed: 0 },
        controls: { throttle: 0.4, flaps: 0.4, gear: 0 }
      },
      // Completing turn to final
      {
        position: { latitude: 49.6252, longitude: 6.202, altitude: 550 },
        attitude: { heading: 180, pitch: 0, roll: 5 },
        speed: { kias: 180, groundSpeed: 180, verticalSpeed: 0 },
        controls: { throttle: 0.4, flaps: 0.5, gear: 0 }
      },
      // Established on final approach
      {
        position: { latitude: 49.6254, longitude: 6.202, altitude: 550 },
        attitude: { heading: 180, pitch: -1, roll: 0 },
        speed: { kias: 170, groundSpeed: 170, verticalSpeed: -300 },
        controls: { throttle: 0.4, flaps: 0.5, gear: 0.5 } // Starting gear extension
      },
      // Begin glideslope
      {
        position: { latitude: 49.6256, longitude: 6.202, altitude: 530 },
        attitude: { heading: 180, pitch: -3, roll: 0 },
        speed: { kias: 160, groundSpeed: 160, verticalSpeed: -600 },
        controls: { throttle: 0.35, flaps: 0.7, gear: 1 } // Gear fully extended
      },
      // Continuing approach
      {
        position: { latitude: 49.6258, longitude: 6.202, altitude: 500 },
        attitude: { heading: 180, pitch: -3, roll: 0 },
        speed: { kias: 150, groundSpeed: 150, verticalSpeed: -600 },
        controls: { throttle: 0.35, flaps: 0.8, gear: 1 }
      },
      // Final approach
      {
        position: { latitude: 49.6260, longitude: 6.202, altitude: 470 },
        attitude: { heading: 180, pitch: -3, roll: 0 },
        speed: { kias: 145, groundSpeed: 145, verticalSpeed: -600 },
        controls: { throttle: 0.35, flaps: 1.0, gear: 1 } // Full flaps
      }
    ],
    landing: [
      // Short final
      {
        position: { latitude: 49.6260, longitude: 6.202, altitude: 470 },
        attitude: { heading: 180, pitch: -3, roll: 0 },
        speed: { kias: 145, groundSpeed: 145, verticalSpeed: -600 },
        controls: { throttle: 0.35, flaps: 1.0, gear: 1 }
      },
      // Over threshold
      {
        position: { latitude: 49.6262, longitude: 6.202, altitude: 400 },
        attitude: { heading: 180, pitch: -2, roll: 0 },
        speed: { kias: 140, groundSpeed: 140, verticalSpeed: -300 },
        controls: { throttle: 0.3, flaps: 1.0, gear: 1 }
      },
      // Flare
      {
        position: { latitude: 49.6264, longitude: 6.202, altitude: 380 },
        attitude: { heading: 180, pitch: 2, roll: 0 },
        speed: { kias: 135, groundSpeed: 135, verticalSpeed: -100 },
        controls: { throttle: 0.1, flaps: 1.0, gear: 1 }
      },
      // Touchdown
      {
        position: { latitude: 49.6266, longitude: 6.202, altitude: 376 },
        attitude: { heading: 180, pitch: 0, roll: 0 },
        speed: { kias: 130, groundSpeed: 130, verticalSpeed: 0 },
        controls: { throttle: 0, flaps: 1.0, gear: 1 }
      },
      // Deceleration
      {
        position: { latitude: 49.6268, longitude: 6.202, altitude: 376 },
        attitude: { heading: 180, pitch: 0, roll: 0 },
        speed: { kias: 100, groundSpeed: 100, verticalSpeed: 0 },
        controls: { throttle: 0, flaps: 1.0, gear: 1 }
      },
      // Continued deceleration
      {
        position: { latitude: 49.6270, longitude: 6.202, altitude: 376 },
        attitude: { heading: 180, pitch: 0, roll: 0 },
        speed: { kias: 60, groundSpeed: 60, verticalSpeed: 0 },
        controls: { throttle: 0, flaps: 1.0, gear: 1 }
      },
      // Taxi speed
      {
        position: { latitude: 49.6272, longitude: 6.202, altitude: 376 },
        attitude: { heading: 180, pitch: 0, roll: 0 },
        speed: { kias: 20, groundSpeed: 20, verticalSpeed: 0 },
        controls: { throttle: 0.1, flaps: 1.0, gear: 1 }
      }
    ],
    holdingPattern: [
      // Entry point
      {
        position: { latitude: 49.6234, longitude: 6.184, altitude: 700 },
        attitude: { heading: 30, pitch: 2, roll: 0 },
        speed: { kias: 250, groundSpeed: 250, verticalSpeed: 0 },
        controls: { throttle: 0.7, flaps: 0, gear: 0 }
      },
      // Begin turn
      {
        position: { latitude: 49.6236, longitude: 6.186, altitude: 700 },
        attitude: { heading: 60, pitch: 2, roll: 15 },
        speed: { kias: 240, groundSpeed: 240, verticalSpeed: 0 },
        controls: { throttle: 0.65, flaps: 0, gear: 0 }
      },
      // Continuing turn
      {
        position: { latitude: 49.6238, longitude: 6.188, altitude: 700 },
        attitude: { heading: 90, pitch: 2, roll: 20 },
        speed: { kias: 230, groundSpeed: 230, verticalSpeed: 0 },
        controls: { throttle: 0.6, flaps: 0, gear: 0 }
      },
      // Halfway through turn
      {
        position: { latitude: 49.6240, longitude: 6.190, altitude: 700 },
        attitude: { heading: 120, pitch: 2, roll: 20 },
        speed: { kias: 230, groundSpeed: 230, verticalSpeed: 0 },
        controls: { throttle: 0.6, flaps: 0, gear: 0 }
      },
      // Continuing turn
      {
        position: { latitude: 49.6242, longitude: 6.192, altitude: 700 },
        attitude: { heading: 150, pitch: 2, roll: 15 },
        speed: { kias: 230, groundSpeed: 230, verticalSpeed: 0 },
        controls: { throttle: 0.6, flaps: 0, gear: 0 }
      },
      // Completing turn
      {
        position: { latitude: 49.6244, longitude: 6.194, altitude: 700 },
        attitude: { heading: 180, pitch: 2, roll: 5 },
        speed: { kias: 230, groundSpeed: 230, verticalSpeed: 0 },
        controls: { throttle: 0.6, flaps: 0, gear: 0 }
      },
      // Outbound leg
      {
        position: { latitude: 49.6246, longitude: 6.194, altitude: 700 },
        attitude: { heading: 210, pitch: 2, roll: 0 },
        speed: { kias: 230, groundSpeed: 230, verticalSpeed: 0 },
        controls: { throttle: 0.6, flaps: 0, gear: 0 }
      },
      // Begin second turn
      {
        position: { latitude: 49.6248, longitude: 6.192, altitude: 700 },
        attitude: { heading: 240, pitch: 2, roll: 15 },
        speed: { kias: 230, groundSpeed: 230, verticalSpeed: 0 },
        controls: { throttle: 0.6, flaps: 0, gear: 0 }
      },
      // Continuing second turn
      {
        position: { latitude: 49.6246, longitude: 6.190, altitude: 700 },
        attitude: { heading: 270, pitch: 2, roll: 20 },
        speed: { kias: 230, groundSpeed: 230, verticalSpeed: 0 },
        controls: { throttle: 0.6, flaps: 0, gear: 0 }
      },
      // Halfway through second turn
      {
        position: { latitude: 49.6244, longitude: 6.188, altitude: 700 },
        attitude: { heading: 300, pitch: 2, roll: 20 },
        speed: { kias: 230, groundSpeed: 230, verticalSpeed: 0 },
        controls: { throttle: 0.6, flaps: 0, gear: 0 }
      },
      // Continuing second turn
      {
        position: { latitude: 49.6242, longitude: 6.186, altitude: 700 },
        attitude: { heading: 330, pitch: 2, roll: 15 },
        speed: { kias: 230, groundSpeed: 230, verticalSpeed: 0 },
        controls: { throttle: 0.6, flaps: 0, gear: 0 }
      },
      // Completing second turn
      {
        position: { latitude: 49.6240, longitude: 6.184, altitude: 700 },
        attitude: { heading: 0, pitch: 2, roll: 5 },
        speed: { kias: 230, groundSpeed: 230, verticalSpeed: 0 },
        controls: { throttle: 0.6, flaps: 0, gear: 0 }
      },
      // Inbound leg, completing the pattern
      {
        position: { latitude: 49.6238, longitude: 6.184, altitude: 700 },
        attitude: { heading: 30, pitch: 2, roll: 0 },
        speed: { kias: 240, groundSpeed: 240, verticalSpeed: 0 },
        controls: { throttle: 0.65, flaps: 0, gear: 0 }
      }
    ]
  };
  
  let currentIndex = 0;
  let updateInterval = null;
  let currentPattern = 'takeoff';
  let isPaused = false;
  
  // Function to update aircraft state
  function updateAircraftState(data) {
    try {
      console.log(`Updating aircraft state: Index ${currentIndex} in pattern ${currentPattern}`);
      
      // Update position
      if (data.position) {
        console.log(`Setting position: lat=${data.position.latitude}, lon=${data.position.longitude}, alt=${data.position.altitude}`);
        
        // Direct property setting
        if (geofs.aircraft.instance.llaLocation) {
          geofs.aircraft.instance.llaLocation[0] = data.position.latitude;
          geofs.aircraft.instance.llaLocation[1] = data.position.longitude;
          geofs.aircraft.instance.llaLocation[2] = data.position.altitude;
          console.log('Position set by directly updating llaLocation');
        }
      }
      
      // Update attitude
      if (data.attitude) {
        console.log(`Setting attitude: heading=${data.attitude.heading}, pitch=${data.attitude.pitch}, roll=${data.attitude.roll}`);
        
        // Direct property setting
        if (geofs.aircraft.instance.htr) {
          geofs.aircraft.instance.htr[0] = data.attitude.heading;
          geofs.aircraft.instance.htr[1] = data.attitude.pitch;
          geofs.aircraft.instance.htr[2] = data.attitude.roll;
          console.log('Attitude set by directly updating htr');
        }
      }
      
      // Update speed
      if (data.speed) {
        console.log(`Setting speed: kias=${data.speed.kias}, groundSpeed=${data.speed.groundSpeed}, verticalSpeed=${data.speed.verticalSpeed}`);
        
        // Set airspeed
        if (geofs.aircraft.instance.animationValue && geofs.aircraft.instance.animationValue.kias) {
          geofs.aircraft.instance.animationValue.kias = data.speed.kias;
          console.log('Airspeed set using animationValue.kias');
        }
        
        // Set ground speed
        if (typeof geofs.aircraft.instance.groundSpeed !== 'undefined') {
          geofs.aircraft.instance.groundSpeed = data.speed.groundSpeed;
          console.log('Ground speed set');
        }
        
        // Set vertical speed
        if (typeof geofs.aircraft.instance.verticalSpeed !== 'undefined') {
          geofs.aircraft.instance.verticalSpeed = data.speed.verticalSpeed;
          console.log('Vertical speed set');
        }
      }
      
      // Update controls
      if (data.controls) {
        console.log(`Setting controls: throttle=${data.controls.throttle}, flaps=${data.controls.flaps}, gear=${data.controls.gear}`);
        
        // Set throttle
        if (geofs.aircraft.instance.engines && geofs.aircraft.instance.engines.length > 0) {
          geofs.aircraft.instance.engines.forEach(engine => {
            engine.throttle = data.controls.throttle;
          });
          console.log('Throttle set');
        }
        
        // Set flaps
        if (geofs.aircraft.instance.controls && typeof geofs.aircraft.instance.controls.flaps !== 'undefined') {
          geofs.aircraft.instance.controls.flaps = data.controls.flaps;
          console.log('Flaps set');
        }
        
        // Set landing gear
        if (typeof geofs.aircraft.instance.gearPosition !== 'undefined') {
          geofs.aircraft.instance.gearPosition = data.controls.gear;
          console.log('Landing gear set');
        }
      }
      
      // Force update of aircraft physics
      if (typeof geofs.aircraft.instance.update === 'function') {
        geofs.aircraft.instance.update();
        console.log('Called aircraft update method');
      }
    } catch (error) {
      console.error('Error updating aircraft state:', error);
    }
  }
  
  // Start the replay
  function startReplay(patternName = 'takeoff') {
    console.log(`Starting flight pattern: ${patternName}`);
    
    // First, make sure we're using the Boeing 787
    if (typeof geofs.aircraft.instance.change === 'function') {
      geofs.aircraft.instance.change(18); // 18 is the ID for Boeing 787
      console.log('Changed aircraft to Boeing 787');
    }
    
    // Get the selected pattern
    const pattern = flightPatterns[patternName] || flightData;
    currentPattern = patternName;
    
    // Set initial state
    updateAircraftState(pattern[0]);
    currentIndex = 0;
    isPaused = false;
    
    // Update UI
    updateControlButtons();
    
    // Clear any existing interval
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    
    // Update at specified intervals
    updateInterval = setInterval(function() {
      if (isPaused) return;
      
      currentIndex++;
      
      if (currentIndex < pattern.length) {
        updateAircraftState(pattern[currentIndex]);
      } else {
        // End of data, stop the replay
        clearInterval(updateInterval);
        console.log('Flight pattern replay complete');
        
        // Reset UI
        const startButton = document.getElementById('direct-control-start');
        if (startButton) {
          startButton.textContent = 'Start Boeing 787 Takeoff';
          startButton.disabled = false;
        }
      }
    }, 2000); // 2-second intervals for easier visualization
  }
  
  // Pause or resume the replay
  function togglePause() {
    isPaused = !isPaused;
    console.log(isPaused ? 'Replay paused' : 'Replay resumed');
    updateControlButtons();
  }
  
  // Stop the replay
  function stopReplay() {
    if (updateInterval) {
      clearInterval(updateInterval);
      updateInterval = null;
    }
    isPaused = false;
    console.log('Replay stopped');
    updateControlButtons();
  }
  
  // Update control buttons state
  function updateControlButtons() {
    const startButton = document.getElementById('direct-control-start');
    const pauseButton = document.getElementById('direct-control-pause');
    const stopButton = document.getElementById('direct-control-stop');
    const patternSelect = document.getElementById('direct-control-pattern');
    
    if (startButton) {
      startButton.disabled = updateInterval !== null;
    }
    
    if (pauseButton) {
      pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
      pauseButton.disabled = updateInterval === null;
    }
    
    if (stopButton) {
      stopButton.disabled = updateInterval === null;
    }
    
    if (patternSelect) {
      patternSelect.disabled = updateInterval !== null;
    }
  }
  
  // Add UI controls
  function addControlPanel() {
    // Create control panel container
    const panel = document.createElement('div');
    panel.id = 'direct-control-panel';
    panel.style.position = 'absolute';
    panel.style.top = '50px';
    panel.style.right = '10px';
    panel.style.padding = '15px';
    panel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    panel.style.borderRadius = '8px';
    panel.style.color = '#fff';
    panel.style.zIndex = '1000';
    panel.style.width = '280px';
    panel.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
    panel.style.fontFamily = 'Arial, sans-serif';
    
    // Add title
    const title = document.createElement('div');
    title.textContent = 'Boeing 787 MCP Control';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '15px';
    title.style.textAlign = 'center';
    title.style.fontSize = '16px';
    title.style.borderBottom = '1px solid #444';
    title.style.paddingBottom = '8px';
    panel.appendChild(title);
    
    // Add tabs
    const tabContainer = document.createElement('div');
    tabContainer.style.display = 'flex';
    tabContainer.style.marginBottom = '15px';
    tabContainer.style.borderBottom = '1px solid #444';
    
    const tabs = [
      { id: 'flight-patterns-tab', text: 'Flight Patterns' },
      { id: 'flight-data-tab', text: 'Flight Data' },
      { id: 'connection-tab', text: 'Connection' },
      { id: 'gpt-tab', text: 'GPT Control' }
    ];
    
    const tabContents = {};
    
    tabs.forEach((tab, index) => {
      const tabElement = document.createElement('div');
      tabElement.id = tab.id;
      tabElement.textContent = tab.text;
      tabElement.style.padding = '8px 12px';
      tabElement.style.cursor = 'pointer';
      tabElement.style.flex = '1';
      tabElement.style.textAlign = 'center';
      tabElement.style.borderBottom = index === 0 ? '2px solid #28a745' : 'none';
      tabElement.style.color = index === 0 ? '#28a745' : '#ccc';
      
      // Create content div for this tab
      const contentDiv = document.createElement('div');
      contentDiv.id = `${tab.id}-content`;
      contentDiv.style.display = index === 0 ? 'block' : 'none';
      tabContents[tab.id] = contentDiv;
      
      tabElement.addEventListener('click', function() {
        // Update tab styles
        tabs.forEach(t => {
          const tabEl = document.getElementById(t.id);
          if (tabEl) {
            tabEl.style.borderBottom = 'none';
            tabEl.style.color = '#ccc';
          }
          const contentEl = document.getElementById(`${t.id}-content`);
          if (contentEl) {
            contentEl.style.display = 'none';
          }
        });
        
        // Highlight active tab
        tabElement.style.borderBottom = '2px solid #28a745';
        tabElement.style.color = '#28a745';
        
        // Show active content
        const contentEl = document.getElementById(`${tab.id}-content`);
        if (contentEl) {
          contentEl.style.display = 'block';
        }
      });
      
      tabContainer.appendChild(tabElement);
    });
    
    panel.appendChild(tabContainer);
    
    // Flight Patterns Tab Content
    const flightPatternsContent = tabContents['flight-patterns-tab'];
    
    // Add pattern selection
    const patternLabel = document.createElement('div');
    patternLabel.textContent = 'Select Flight Pattern:';
    patternLabel.style.marginBottom = '8px';
    patternLabel.style.fontSize = '14px';
    flightPatternsContent.appendChild(patternLabel);
    
    const patternSelect = document.createElement('select');
    patternSelect.id = 'direct-control-pattern';
    patternSelect.style.width = '100%';
    patternSelect.style.marginBottom = '15px';
    patternSelect.style.padding = '6px';
    patternSelect.style.borderRadius = '4px';
    patternSelect.style.backgroundColor = '#333';
    patternSelect.style.color = '#fff';
    patternSelect.style.border = '1px solid #555';
    
    // Add pattern options with descriptions
    const patternDescriptions = {
      'takeoff': 'Standard takeoff from runway',
      'rightTurn': 'Right turn at cruise altitude',
      'descent': 'Descent from cruise altitude',
      'approach': 'Approach to landing',
      'landing': 'Final approach and landing',
      'holdingPattern': 'Standard holding pattern'
    };
    
    // Add pattern options
    const patterns = Object.keys(flightPatterns);
    patterns.forEach(pattern => {
      const option = document.createElement('option');
      option.value = pattern;
      option.textContent = pattern.charAt(0).toUpperCase() + pattern.slice(1);
      patternSelect.appendChild(option);
    });
    
    flightPatternsContent.appendChild(patternSelect);
    
    // Add pattern description
    const patternDescription = document.createElement('div');
    patternDescription.id = 'pattern-description';
    patternDescription.style.fontSize = '12px';
    patternDescription.style.marginBottom = '15px';
    patternDescription.style.padding = '8px';
    patternDescription.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    patternDescription.style.borderRadius = '4px';
    patternDescription.textContent = patternDescriptions['takeoff'] || '';
    flightPatternsContent.appendChild(patternDescription);
    
    // Update description when pattern changes
    patternSelect.addEventListener('change', function() {
      const descriptionElement = document.getElementById('pattern-description');
      if (descriptionElement) {
        descriptionElement.textContent = patternDescriptions[this.value] || '';
      }
    });
    
    // Add buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'space-between';
    buttonsContainer.style.marginBottom = '15px';
    
    // Start button
    const startButton = document.createElement('button');
    startButton.id = 'direct-control-start';
    startButton.style.padding = '8px 12px';
    startButton.style.borderRadius = '4px';
    startButton.style.backgroundColor = '#28a745';
    startButton.style.color = '#fff';
    startButton.style.border = 'none';
    startButton.style.cursor = 'pointer';
    startButton.style.flex = '1';
    startButton.style.marginRight = '8px';
    startButton.style.fontWeight = 'bold';
    startButton.textContent = 'Start';
    
    startButton.addEventListener('click', function() {
      const patternSelect = document.getElementById('direct-control-pattern');
      const selectedPattern = patternSelect ? patternSelect.value : 'takeoff';
      startReplay(selectedPattern);
    });
    
    buttonsContainer.appendChild(startButton);
    
    // Pause button
    const pauseButton = document.createElement('button');
    pauseButton.id = 'direct-control-pause';
    pauseButton.style.padding = '8px 12px';
    pauseButton.style.borderRadius = '4px';
    pauseButton.style.backgroundColor = '#ffc107';
    pauseButton.style.color = '#000';
    pauseButton.style.border = 'none';
    pauseButton.style.cursor = 'pointer';
    pauseButton.style.flex = '1';
    pauseButton.style.marginRight = '8px';
    pauseButton.style.fontWeight = 'bold';
    pauseButton.textContent = 'Pause';
    pauseButton.disabled = true;
    
    pauseButton.addEventListener('click', togglePause);
    
    buttonsContainer.appendChild(pauseButton);
    
    // Stop button
    const stopButton = document.createElement('button');
    stopButton.id = 'direct-control-stop';
    stopButton.style.padding = '8px 12px';
    stopButton.style.borderRadius = '4px';
    stopButton.style.backgroundColor = '#dc3545';
    stopButton.style.color = '#fff';
    stopButton.style.border = 'none';
    stopButton.style.cursor = 'pointer';
    stopButton.style.flex = '1';
    stopButton.style.fontWeight = 'bold';
    stopButton.textContent = 'Stop';
    stopButton.disabled = true;
    
    stopButton.addEventListener('click', stopReplay);
    
    buttonsContainer.appendChild(stopButton);
    
    flightPatternsContent.appendChild(buttonsContainer);
    
    // Add progress bar
    const progressContainer = document.createElement('div');
    progressContainer.style.width = '100%';
    progressContainer.style.backgroundColor = '#333';
    progressContainer.style.borderRadius = '4px';
    progressContainer.style.overflow = 'hidden';
    progressContainer.style.height = '10px';
    progressContainer.style.marginBottom = '10px';
    
    const progressBar = document.createElement('div');
    progressBar.id = 'direct-control-progress';
    progressBar.style.width = '0%';
    progressBar.style.height = '100%';
    progressBar.style.backgroundColor = '#28a745';
    progressBar.style.transition = 'width 0.5s ease';
    
    progressContainer.appendChild(progressBar);
    flightPatternsContent.appendChild(progressContainer);
    
    // Add status display
    const statusDisplay = document.createElement('div');
    statusDisplay.id = 'direct-control-status';
    statusDisplay.style.marginTop = '10px';
    statusDisplay.style.fontSize = '12px';
    statusDisplay.style.textAlign = 'center';
    statusDisplay.style.padding = '5px';
    statusDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    statusDisplay.style.borderRadius = '4px';
    statusDisplay.textContent = 'Ready';
    
    flightPatternsContent.appendChild(statusDisplay);
    
    // Flight Data Tab Content
    const flightDataContent = tabContents['flight-data-tab'];
    
    // Create flight data display
    const createDataRow = (label, id) => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.marginBottom = '8px';
      row.style.fontSize = '13px';
      
      const labelElement = document.createElement('div');
      labelElement.textContent = label;
      labelElement.style.flex = '1';
      
      const valueElement = document.createElement('div');
      valueElement.id = id;
      valueElement.textContent = '—';
      valueElement.style.flex = '1';
      valueElement.style.textAlign = 'right';
      valueElement.style.fontFamily = 'monospace';
      
      row.appendChild(labelElement);
      row.appendChild(valueElement);
      
      return row;
    };
    
    const flightDataSection = document.createElement('div');
    flightDataSection.style.marginBottom = '15px';
    
    const positionTitle = document.createElement('div');
    positionTitle.textContent = 'Position';
    positionTitle.style.fontWeight = 'bold';
    positionTitle.style.marginBottom = '5px';
    positionTitle.style.borderBottom = '1px solid #444';
    flightDataSection.appendChild(positionTitle);
    
    flightDataSection.appendChild(createDataRow('Latitude:', 'data-latitude'));
    flightDataSection.appendChild(createDataRow('Longitude:', 'data-longitude'));
    flightDataSection.appendChild(createDataRow('Altitude (m):', 'data-altitude'));
    
    const attitudeTitle = document.createElement('div');
    attitudeTitle.textContent = 'Attitude';
    attitudeTitle.style.fontWeight = 'bold';
    attitudeTitle.style.marginTop = '10px';
    attitudeTitle.style.marginBottom = '5px';
    attitudeTitle.style.borderBottom = '1px solid #444';
    flightDataSection.appendChild(attitudeTitle);
    
    flightDataSection.appendChild(createDataRow('Heading (°):', 'data-heading'));
    flightDataSection.appendChild(createDataRow('Pitch (°):', 'data-pitch'));
    flightDataSection.appendChild(createDataRow('Roll (°):', 'data-roll'));
    
    const speedTitle = document.createElement('div');
    speedTitle.textContent = 'Speed';
    speedTitle.style.fontWeight = 'bold';
    speedTitle.style.marginTop = '10px';
    speedTitle.style.marginBottom = '5px';
    speedTitle.style.borderBottom = '1px solid #444';
    flightDataSection.appendChild(speedTitle);
    
    flightDataSection.appendChild(createDataRow('Airspeed (KIAS):', 'data-kias'));
    flightDataSection.appendChild(createDataRow('Ground Speed (kt):', 'data-gs'));
    flightDataSection.appendChild(createDataRow('Vertical Speed (ft/min):', 'data-vs'));
    
    const controlsTitle = document.createElement('div');
    controlsTitle.textContent = 'Controls';
    controlsTitle.style.fontWeight = 'bold';
    controlsTitle.style.marginTop = '10px';
    controlsTitle.style.marginBottom = '5px';
    controlsTitle.style.borderBottom = '1px solid #444';
    flightDataSection.appendChild(controlsTitle);
    
    flightDataSection.appendChild(createDataRow('Throttle:', 'data-throttle'));
    flightDataSection.appendChild(createDataRow('Flaps:', 'data-flaps'));
    flightDataSection.appendChild(createDataRow('Gear:', 'data-gear'));
    
    flightDataContent.appendChild(flightDataSection);
    
    // Connection Tab Content
    const connectionContent = tabContents['connection-tab'];
    
    // Connection status
    const connectionStatus = document.createElement('div');
    connectionStatus.id = 'connection-status';
    connectionStatus.style.padding = '10px';
    connectionStatus.style.marginBottom = '15px';
    connectionStatus.style.backgroundColor = '#333';
    connectionStatus.style.borderRadius = '4px';
    connectionStatus.style.textAlign = 'center';
    connectionStatus.innerHTML = '<span style="color: #dc3545;">●</span> Disconnected';
    connectionContent.appendChild(connectionStatus);
    
    // Connect to MCP Server button
    const connectButton = document.createElement('button');
    connectButton.id = 'connect-mcp-button';
    connectButton.style.width = '100%';
    connectButton.style.padding = '8px 12px';
    connectButton.style.borderRadius = '4px';
    connectButton.style.backgroundColor = '#007bff';
    connectButton.style.color = '#fff';
    connectButton.style.border = 'none';
    connectButton.style.cursor = 'pointer';
    connectButton.style.marginBottom = '15px';
    connectButton.style.fontWeight = 'bold';
    connectButton.textContent = 'Connect to MCP Server';
    
    connectButton.addEventListener('click', function() {
      sendToMCPServer();
      
      // Update connection status
      const connectionStatus = document.getElementById('connection-status');
      if (connectionStatus) {
        connectionStatus.innerHTML = '<span style="color: #ffc107;">●</span> Connecting to MCP Server...';
      }
      
      // Disable connect button
      this.disabled = true;
    });
    
    connectionContent.appendChild(connectButton);
    
    // Server info
    const serverInfo = document.createElement('div');
    serverInfo.style.fontSize = '12px';
    serverInfo.style.lineHeight = '1.5';
    serverInfo.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">Server Information:</div>
      <div>URL: ws://localhost:3002</div>
      <div>Protocol: WebSocket</div>
      <div style="margin-top: 10px; font-style: italic;">
        The MCP server must be running for the connection to succeed.
      </div>
    `;
    connectionContent.appendChild(serverInfo);
    
    // GPT Control Tab Content
    const gptControlContent = tabContents['gpt-tab'];
    
    // Create input area
    const inputContainer = document.createElement('div');
    inputContainer.className = 'gpt-input-container';
    
    const textInput = document.createElement('textarea');
    textInput.id = 'gpt-command-input';
    textInput.placeholder = 'Enter a natural language command for the aircraft (e.g., "Take off from runway 3 at Luxembourg airport")';
    textInput.style.width = '100%';
    textInput.style.height = '80px';
    textInput.style.padding = '8px';
    textInput.style.marginBottom = '10px';
    textInput.style.borderRadius = '4px';
    textInput.style.border = '1px solid #ccc';
    
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Send to GPT';
    submitButton.className = 'control-button';
    submitButton.style.backgroundColor = '#4CAF50';
    submitButton.style.color = 'white';
    submitButton.style.padding = '10px 15px';
    submitButton.style.border = 'none';
    submitButton.style.borderRadius = '4px';
    submitButton.style.cursor = 'pointer';
    
    submitButton.onclick = async () => {
      const command = textInput.value;
      if (!command.trim()) return;
      
      // Show loading state
      const responseArea = document.getElementById('gpt-response-area');
      responseArea.innerHTML = '<div class="loading">Processing your request...</div>';
      
      // Send command to server
      try {
        const response = await fetch('/gpt-command', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ command }),
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        
        const data = await response.json();
        
        // Display the response
        responseArea.innerHTML = `
          <div class="gpt-response">
            <h4>GPT Response:</h4>
            <div class="response-content">${formatGptResponse(data.response)}</div>
          </div>
        `;
      } catch (error) {
        responseArea.innerHTML = `
          <div class="gpt-error">
            <h4>Error:</h4>
            <div>${error.message}</div>
          </div>
        `;
      }
    };
    
    inputContainer.appendChild(textInput);
    inputContainer.appendChild(submitButton);
    
    // Create response area
    const responseArea = document.createElement('div');
    responseArea.id = 'gpt-response-area';
    responseArea.className = 'gpt-response-area';
    responseArea.style.marginTop = '20px';
    responseArea.style.padding = '10px';
    responseArea.style.backgroundColor = '#f8f9fa';
    responseArea.style.borderRadius = '4px';
    responseArea.style.minHeight = '100px';
    
    // Add API key input
    const apiKeyContainer = document.createElement('div');
    apiKeyContainer.className = 'api-key-container';
    apiKeyContainer.style.marginTop = '20px';
    
    const apiKeyLabel = document.createElement('label');
    apiKeyLabel.htmlFor = 'openai-api-key';
    apiKeyLabel.textContent = 'OpenAI API Key (optional):';
    
    const apiKeyInput = document.createElement('input');
    apiKeyInput.type = 'password';
    apiKeyInput.id = 'openai-api-key';
    apiKeyInput.placeholder = 'Enter your OpenAI API key';
    apiKeyInput.style.width = '100%';
    apiKeyInput.style.padding = '8px';
    apiKeyInput.style.marginTop = '5px';
    apiKeyInput.style.borderRadius = '4px';
    apiKeyInput.style.border = '1px solid #ccc';
    
    const saveKeyButton = document.createElement('button');
    saveKeyButton.textContent = 'Save API Key';
    saveKeyButton.className = 'control-button';
    saveKeyButton.style.marginTop = '5px';
    saveKeyButton.onclick = () => {
      const apiKey = apiKeyInput.value.trim();
      if (apiKey) {
        // Save API key to localStorage
        localStorage.setItem('openai-api-key', apiKey);
        alert('API key saved!');
        
        // Send API key to server
        fetch('/set-api-key', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ apiKey }),
        }).catch(error => console.error('Error saving API key:', error));
      }
    };
    
    apiKeyContainer.appendChild(apiKeyLabel);
    apiKeyContainer.appendChild(apiKeyInput);
    apiKeyContainer.appendChild(saveKeyButton);
    
    // Add note about API key
    const apiKeyNote = document.createElement('div');
    apiKeyNote.className = 'api-key-note';
    apiKeyNote.style.marginTop = '10px';
    apiKeyNote.style.fontSize = '12px';
    apiKeyNote.style.color = '#666';
    apiKeyNote.innerHTML = 'Note: Your API key is stored locally in your browser. If no API key is provided, the server will use simulated responses.';
    
    apiKeyContainer.appendChild(apiKeyNote);
    
    // Add everything to the tab content
    gptControlContent.appendChild(inputContainer);
    gptControlContent.appendChild(responseArea);
    gptControlContent.appendChild(apiKeyContainer);
    
    // Add all tab contents to panel
    Object.values(tabContents).forEach(content => {
      panel.appendChild(content);
    });
    
    document.body.appendChild(panel);
    console.log('Added enhanced control panel to UI');
    
    // Update flight data display periodically
    setInterval(function() {
      if (typeof geofs !== 'undefined' && geofs.aircraft && geofs.aircraft.instance) {
        const aircraft = geofs.aircraft.instance;
        
        // Update position data
        if (aircraft.llaLocation) {
          const latElement = document.getElementById('data-latitude');
          if (latElement) latElement.textContent = aircraft.llaLocation[0].toFixed(6);
          
          const lonElement = document.getElementById('data-longitude');
          if (lonElement) lonElement.textContent = aircraft.llaLocation[1].toFixed(6);
          
          const altElement = document.getElementById('data-altitude');
          if (altElement) altElement.textContent = aircraft.llaLocation[2].toFixed(1);
        }
        
        // Update attitude data
        if (aircraft.htr) {
          const headingElement = document.getElementById('data-heading');
          if (headingElement) headingElement.textContent = aircraft.htr[0].toFixed(1);
          
          const pitchElement = document.getElementById('data-pitch');
          if (pitchElement) pitchElement.textContent = aircraft.htr[1].toFixed(1);
          
          const rollElement = document.getElementById('data-roll');
          if (rollElement) rollElement.textContent = aircraft.htr[2].toFixed(1);
        }
        
        // Update speed data
        if (aircraft.animationValue && aircraft.animationValue.kias) {
          const kiasElement = document.getElementById('data-kias');
          if (kiasElement) kiasElement.textContent = aircraft.animationValue.kias.toFixed(1);
        }
        
        if (typeof aircraft.groundSpeed !== 'undefined') {
          const gsElement = document.getElementById('data-gs');
          if (gsElement) gsElement.textContent = aircraft.groundSpeed.toFixed(1);
        }
        
        if (typeof aircraft.verticalSpeed !== 'undefined') {
          const vsElement = document.getElementById('data-vs');
          if (vsElement) vsElement.textContent = (aircraft.verticalSpeed * 196.85).toFixed(0); // Convert to ft/min
        }
        
        // Update control data
        if (aircraft.engines && aircraft.engines.length > 0) {
          const throttleElement = document.getElementById('data-throttle');
          if (throttleElement) throttleElement.textContent = aircraft.engines[0].throttle.toFixed(2);
        }
        
        if (aircraft.controls && typeof aircraft.controls.flaps !== 'undefined') {
          const flapsElement = document.getElementById('data-flaps');
          if (flapsElement) flapsElement.textContent = aircraft.controls.flaps.toFixed(2);
        }
        
        if (typeof aircraft.gearPosition !== 'undefined') {
          const gearElement = document.getElementById('data-gear');
          if (gearElement) gearElement.textContent = aircraft.gearPosition.toFixed(2);
        }
      }
      
      // Update status display and progress bar
      const statusDisplay = document.getElementById('direct-control-status');
      const progressBar = document.getElementById('direct-control-progress');
      
      if (statusDisplay) {
        if (updateInterval === null) {
          statusDisplay.textContent = 'Ready';
          if (progressBar) progressBar.style.width = '0%';
        } else if (isPaused) {
          statusDisplay.textContent = `Paused at step ${currentIndex + 1}/${flightPatterns[currentPattern].length}`;
          if (progressBar) {
            const progress = ((currentIndex + 1) / flightPatterns[currentPattern].length) * 100;
            progressBar.style.width = `${progress}%`;
          }
        } else {
          statusDisplay.textContent = `Running: ${currentIndex + 1}/${flightPatterns[currentPattern].length}`;
          if (progressBar) {
            const progress = ((currentIndex + 1) / flightPatterns[currentPattern].length) * 100;
            progressBar.style.width = `${progress}%`;
          }
        }
      }
    }, 500);
  }
  
  // Send flight data to MCP server if WebSocket is available
  function sendToMCPServer() {
    try {
      // Check if WebSocket is defined in window
      if (typeof WebSocket !== 'undefined') {
        // Update connection status UI
        const connectionStatus = document.getElementById('connection-status');
        if (connectionStatus) {
          connectionStatus.innerHTML = '<span style="color: #ffc107;">●</span> Connecting to MCP Server...';
        }
        
        // Create WebSocket connection
        const ws = new WebSocket('ws://localhost:3002');
        let connectionActive = false;
        let reconnectAttempts = 0;
        let reconnectInterval = null;
        
        ws.onopen = function() {
          console.log('Connected to MCP server');
          connectionActive = true;
          reconnectAttempts = 0;
          
          // Update connection status in UI
          if (connectionStatus) {
            connectionStatus.innerHTML = '<span style="color: #28a745;">●</span> Connected to MCP Server';
          }
          
          // Disable connect button
          const connectButton = document.getElementById('connect-mcp-button');
          if (connectButton) {
            connectButton.disabled = true;
          }
          
          // Send initial aircraft state
          sendCurrentAircraftState(ws);
          
          // Set up interval to send data periodically
          const dataInterval = setInterval(function() {
            if (ws.readyState === WebSocket.OPEN) {
              sendCurrentAircraftState(ws);
            } else {
              clearInterval(dataInterval);
            }
          }, 1000); // Send data every second
        };
        
        ws.onmessage = function(event) {
          try {
            const message = JSON.parse(event.data);
            console.log('Received message from MCP server:', message);
            
            // Handle different message types
            if (message.type === 'command') {
              console.log(`Executing command: ${message.command}`);
              executeCommand(message.command, message.params);
            } else if (message.type === 'ping') {
              // Respond to ping with pong
              ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            }
          } catch (error) {
            console.error('Error processing message from server:', error);
          }
        };
        
        ws.onerror = function(error) {
          console.error('WebSocket error:', error);
          
          // Update connection status in UI
          if (connectionStatus) {
            connectionStatus.innerHTML = '<span style="color: #dc3545;">●</span> Connection Error';
          }
        };
        
        ws.onclose = function(event) {
          console.log(`Disconnected from MCP server: ${event.code} ${event.reason}`);
          connectionActive = false;
          
          // Update connection status in UI
          if (connectionStatus) {
            connectionStatus.innerHTML = '<span style="color: #dc3545;">●</span> Disconnected';
          }
          
          // Enable connect button
          const connectButton = document.getElementById('connect-mcp-button');
          if (connectButton) {
            connectButton.disabled = false;
          }
          
          // Attempt to reconnect
          if (reconnectAttempts < 5) {
            const reconnectDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            console.log(`Attempting to reconnect in ${reconnectDelay/1000} seconds...`);
            
            if (connectionStatus) {
              connectionStatus.innerHTML = `<span style="color: #ffc107;">●</span> Reconnecting in ${reconnectDelay/1000}s (${reconnectAttempts + 1}/5)`;
            }
            
            reconnectAttempts++;
            
            if (reconnectInterval) {
              clearTimeout(reconnectInterval);
            }
            
            reconnectInterval = setTimeout(function() {
              if (!connectionActive) {
                sendToMCPServer();
              }
            }, reconnectDelay);
          } else {
            console.log('Maximum reconnection attempts reached');
            
            if (connectionStatus) {
              connectionStatus.innerHTML = '<span style="color: #dc3545;">●</span> Failed to connect after 5 attempts';
            }
          }
        };
        
        // Function to send current aircraft state
        function sendCurrentAircraftState(ws) {
          try {
            if (typeof geofs !== 'undefined' && geofs.aircraft && geofs.aircraft.instance) {
              const aircraft = geofs.aircraft.instance;
              
              // Create comprehensive flight data object
              const flightData = {
                position: {
                  latitude: aircraft.llaLocation ? aircraft.llaLocation[0] : 0,
                  longitude: aircraft.llaLocation ? aircraft.llaLocation[1] : 0,
                  altitude: aircraft.llaLocation ? aircraft.llaLocation[2] : 0
                },
                attitude: {
                  heading: aircraft.htr ? aircraft.htr[0] : 0,
                  pitch: aircraft.htr ? aircraft.htr[1] : 0,
                  roll: aircraft.htr ? aircraft.htr[2] : 0
                },
                speed: {
                  kias: aircraft.animationValue && aircraft.animationValue.kias ? aircraft.animationValue.kias : 0,
                  groundSpeed: typeof aircraft.groundSpeed !== 'undefined' ? aircraft.groundSpeed : 0,
                  verticalSpeed: typeof aircraft.verticalSpeed !== 'undefined' ? aircraft.verticalSpeed : 0
                },
                controls: {
                  throttle: aircraft.engines && aircraft.engines.length > 0 ? aircraft.engines[0].throttle : 0,
                  flaps: aircraft.controls && typeof aircraft.controls.flaps !== 'undefined' ? aircraft.controls.flaps : 0,
                  gear: typeof aircraft.gearPosition !== 'undefined' ? aircraft.gearPosition : 0
                },
                aircraft: {
                  type: 'Boeing 787',
                  id: geofs.aircraft.instance.id || 3575,
                  name: 'Boeing 787-9 Dreamliner'
                },
                timestamp: Date.now()
              };
              
              // Send data to server
              ws.send(JSON.stringify({
                type: 'flightData',
                data: flightData
              }));
              
              // Update the flight data log in the UI
              updateFlightDataLog(flightData);
            }
          } catch (error) {
            console.error('Error sending aircraft state:', error);
          }
        }
        
        // Function to execute commands received from the server
        function executeCommand(command, params) {
          try {
            console.log(`Executing command: ${command} with params:`, params);
            
            switch (command) {
              case 'setThrottle':
                if (params && typeof params.value !== 'undefined' && 
                    geofs.aircraft.instance.engines && 
                    geofs.aircraft.instance.engines.length > 0) {
                  geofs.aircraft.instance.engines.forEach(engine => {
                    engine.throttle = Math.max(0, Math.min(1, params.value));
                  });
                  console.log(`Throttle set to ${params.value}`);
                }
                break;
                
              case 'setFlaps':
                if (params && typeof params.value !== 'undefined' && 
                    geofs.aircraft.instance.controls && 
                    typeof geofs.aircraft.instance.controls.flaps !== 'undefined') {
                  geofs.aircraft.instance.controls.flaps = Math.max(0, Math.min(1, params.value));
                  console.log(`Flaps set to ${params.value}`);
                }
                break;
                
              case 'setGear':
                if (params && typeof params.value !== 'undefined' && 
                    typeof geofs.aircraft.instance.gearPosition !== 'undefined') {
                  geofs.aircraft.instance.gearPosition = Math.max(0, Math.min(1, params.value));
                  console.log(`Gear set to ${params.value}`);
                }
                break;
                
              case 'startPattern':
                if (params && typeof params.pattern !== 'undefined' && 
                    flightPatterns[params.pattern]) {
                  startReplay(params.pattern);
                  console.log(`Started flight pattern: ${params.pattern}`);
                }
                break;
                
              case 'pauseReplay':
                togglePause();
                console.log('Toggled pause state');
                break;
                
              case 'stopReplay':
                stopReplay();
                console.log('Stopped replay');
                break;
                
              default:
                console.warn(`Unknown command: ${command}`);
            }
          } catch (error) {
            console.error(`Error executing command ${command}:`, error);
          }
        }
        
        // Function to update flight data log in the UI
        function updateFlightDataLog(flightData) {
          const logContainer = document.getElementById('flight-data-log');
          if (logContainer) {
            // Create log entry
            const logEntry = document.createElement('div');
            logEntry.style.fontSize = '11px';
            logEntry.style.marginBottom = '5px';
            logEntry.style.borderBottom = '1px dotted #444';
            logEntry.style.paddingBottom = '5px';
            
            const timestamp = new Date().toLocaleTimeString();
            logEntry.innerHTML = `
              <div><strong>${timestamp}</strong></div>
              <div>Pos: ${flightData.position.latitude.toFixed(4)}, ${flightData.position.longitude.toFixed(4)}, ${flightData.position.altitude.toFixed(1)}m</div>
              <div>Spd: ${flightData.speed.kias.toFixed(1)} KIAS, VS: ${(flightData.speed.verticalSpeed * 196.85).toFixed(0)} ft/min</div>
            `;
            
            // Add to the top of the log
            if (logContainer.firstChild) {
              logContainer.insertBefore(logEntry, logContainer.firstChild);
            } else {
              logContainer.appendChild(logEntry);
            }
            
            // Limit the number of log entries
            while (logContainer.childNodes.length > 10) {
              logContainer.removeChild(logContainer.lastChild);
            }
          }
        }
        
        // Add a flight data log to the Connection tab
        const connectionTab = document.getElementById('connection-tab-content');
        if (connectionTab) {
          const logTitle = document.createElement('div');
          logTitle.textContent = 'Flight Data Log';
          logTitle.style.fontWeight = 'bold';
          logTitle.style.marginTop = '20px';
          logTitle.style.marginBottom = '10px';
          logTitle.style.borderBottom = '1px solid #444';
          connectionTab.appendChild(logTitle);
          
          const logContainer = document.createElement('div');
          logContainer.id = 'flight-data-log';
          logContainer.style.maxHeight = '200px';
          logContainer.style.overflowY = 'auto';
          logContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
          logContainer.style.padding = '8px';
          logContainer.style.borderRadius = '4px';
          connectionTab.appendChild(logContainer);
        }
      } else {
        console.warn('WebSocket not available in this browser');
        
        // Update connection status
        const connectionStatus = document.getElementById('connection-status');
        if (connectionStatus) {
          connectionStatus.innerHTML = '<span style="color: #dc3545;">●</span> WebSocket not supported in this browser';
        }
      }
    } catch (error) {
      console.error('Error connecting to MCP server:', error);
      
      // Update connection status
      const connectionStatus = document.getElementById('connection-status');
      if (connectionStatus) {
        connectionStatus.innerHTML = `<span style="color: #dc3545;">●</span> Connection Error: ${error.message}`;
      }
    }
  }
  
  // Format GPT response with markdown-like syntax
  function formatGptResponse(text) {
    // Escape HTML
    const escaped = text.replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
    
    // Add some basic formatting
    return escaped
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  }

  // Initialize
  addControlPanel();
  console.log('GeoFS Direct Control initialized. Use the control panel to manage flight patterns.');
  
  // Expose API to window for debugging
  window.directControl = {
    startReplay,
    togglePause,
    stopReplay,
    updateAircraftState,
    sendToMCPServer,
    flightPatterns
  };
})();
