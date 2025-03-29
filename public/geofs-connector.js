/**
 * GeoFS MCP Connector
 * 
 * This script connects the GeoFS flight simulator to the MCP server.
 * To use:
 * 1. Open GeoFS in your browser
 * 2. Open the browser console (F12 or Ctrl+Shift+I)
 * 3. Copy and paste this entire script into the console
 * 4. Press Enter to run it
 * 
 * Version: 1.1.0 - Enhanced with improved error handling and reconnection logic
 */

(function() {
  // Configuration
  const MCP_SERVER_URL = 'ws://localhost:3000';
  const RECONNECT_INTERVAL = 5000; // 5 seconds
  const MAX_RECONNECT_ATTEMPTS = 10;
  
  // Connect to the MCP server
  let ws = null;
  let connected = false;
  let updateInterval = null;
  let reconnectAttempts = 0;
  let reconnectTimer = null;
  
  // Initialize the connection
  function initialize() {
    console.log('Initializing GeoFS MCP Connector...');
    
    // Check if GeoFS is loaded
    if (typeof geofs === 'undefined') {
      console.error('GeoFS not detected! Please run this script on the GeoFS website.');
      return;
    }
    
    // Connect to the MCP server
    connectToServer();
    
    // Start sending updates to the server
    startUpdates();
    
    // Add UI indicator
    addConnectionIndicator();
    
    console.log('GeoFS MCP Connector initialized successfully!');
  }
  
  // Connect to the MCP server
  function connectToServer() {
    try {
      // Clear any existing reconnect timer
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      
      console.log(`Connecting to MCP server at ${MCP_SERVER_URL}...`);
      updateConnectionIndicator('connecting');
      
      ws = new WebSocket(MCP_SERVER_URL);
      
      ws.onopen = function() {
        console.log('Connected to MCP server');
        connected = true;
        reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        updateConnectionIndicator(true);
        
        // Send initial aircraft state
        sendFlightData();
      };
      
      ws.onclose = function(event) {
        console.log(`Disconnected from MCP server. Code: ${event.code}, Reason: ${event.reason}`);
        connected = false;
        updateConnectionIndicator(false);
        
        // Try to reconnect after a delay, with exponential backoff
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_INTERVAL * Math.pow(1.5, reconnectAttempts);
          console.log(`Attempting to reconnect in ${delay/1000} seconds (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
          
          reconnectTimer = setTimeout(function() {
            reconnectAttempts++;
            connectToServer();
          }, delay);
        } else {
          console.error(`Failed to reconnect after ${MAX_RECONNECT_ATTEMPTS} attempts. Please reload the page.`);
          updateConnectionIndicator('failed');
        }
      };
      
      ws.onerror = function(error) {
        console.error('WebSocket error:', error);
        connected = false;
        updateConnectionIndicator(false);
      };
      
      ws.onmessage = function(event) {
        handleServerMessage(event.data);
      };
    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      updateConnectionIndicator(false);
      
      // Try to reconnect after a delay
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = RECONNECT_INTERVAL * Math.pow(1.5, reconnectAttempts);
        console.log(`Attempting to reconnect in ${delay/1000} seconds (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
        
        reconnectTimer = setTimeout(function() {
          reconnectAttempts++;
          connectToServer();
        }, delay);
      }
    }
  }
  
  // Handle messages from the server
  function handleServerMessage(data) {
    try {
      console.log('Received raw message from server:', data);
      
      // Try to parse as JSON
      let message;
      try {
        message = JSON.parse(data);
        console.log('Parsed message:', message);
      } catch (parseError) {
        console.warn('Failed to parse message as JSON:', parseError);
        // Try to handle it as a raw command if JSON parsing failed
        handleRawCommand(data);
        return;
      }
      
      // Handle different message types
      if (message.type === 'command') {
        // Standard command format
        console.log(`Processing command: ${message.command}`, message.params);
        executeCommand(message.command, message.params);
        
        // Send acknowledgment if there's an ID
        if (message.id && ws && connected) {
          ws.send(JSON.stringify({
            id: message.id,
            type: 'response',
            status: 'acknowledged',
            timestamp: Date.now()
          }));
        }
      } else if (message.command) {
        // Legacy format support
        console.log(`Processing legacy command: ${message.command}`, message.params);
        executeCommand(message.command, message.params);
      } else if (message.id && message.result !== undefined) {
        // This is a response to a command we sent
        console.log(`Command ${message.id} result: ${message.result}`);
      } else if (message.type === 'ping') {
        // Respond to ping with pong
        console.log('Received ping, sending pong');
        if (ws && connected) {
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: Date.now()
          }));
        }
      } else {
        // Try to extract command information from any message format
        const command = message.command || message.type || (message.params && message.params.command);
        const params = message.params || message;
        
        if (command) {
          console.log(`Attempting to execute command from alternate format: ${command}`);
          executeCommand(command, params);
        } else {
          console.log('Received message in unknown format:', message);
        }
      }
    } catch (error) {
      console.error('Error handling message:', error);
      handleRawCommand(data);
    }
  }
  
  // Try to handle non-JSON messages
  function handleRawCommand(data) {
    try {
      console.log('Attempting to handle as raw command:', data);
      
      if (typeof data === 'string') {
        // Check for updateAircraftState command
        if (data.includes('updateAircraftState')) {
          console.log('Detected updateAircraftState command in raw data');
          
          // Try to extract position data
          const posMatch = data.match(/latitude:\s*([\d.-]+),\s*longitude:\s*([\d.-]+),\s*altitude:\s*([\d.-]+)/);
          if (posMatch) {
            const params = {
              position: {
                latitude: parseFloat(posMatch[1]),
                longitude: parseFloat(posMatch[2]),
                altitude: parseFloat(posMatch[3])
              }
            };
            updateAircraftState(params);
            return;
          }
        }
        
        // Check for setThrottle command
        if (data.includes('setThrottle')) {
          const throttleMatch = data.match(/value:\s*([\d.]+)/);
          if (throttleMatch) {
            const value = parseFloat(throttleMatch[1]);
            setThrottle(value);
            return;
          }
        }
        
        // Check for setHeading command
        if (data.includes('setHeading')) {
          const headingMatch = data.match(/degrees:\s*([\d.]+)/);
          if (headingMatch) {
            const degrees = parseFloat(headingMatch[1]);
            setHeading(degrees);
            return;
          }
        }
      }
      
      console.warn('Could not interpret raw command:', data);
    } catch (e) {
      console.error('Failed to handle as raw command:', e);
    }
  }
  
  // Execute a command from the server
  function executeCommand(command, params) {
    console.log(`Executing command: ${command}`, params);
    
    switch (command) {
      case 'setThrottle':
        setThrottle(params.value);
        break;
      case 'setHeading':
        setHeading(params.degrees);
        break;
      case 'selectAircraft':
        selectAircraft(params.aircraftId);
        break;
      case 'updateAircraftState':
        updateAircraftState(params);
        break;
      default:
        console.warn(`Unknown command: ${command}`);
    }
  }
  
  // Set the throttle value
  function setThrottle(value) {
    if (typeof geofs.aircraft.instance.engines !== 'undefined') {
      // Set throttle for all engines
      geofs.aircraft.instance.engines.forEach(function(engine) {
        engine.throttle = value;
      });
      
      console.log(`Throttle set to ${value * 100}%`);
    }
  }
  
  // Set the aircraft heading
  function setHeading(degrees) {
    // This is a simplified approach - in a real implementation,
    // you would use the autopilot or flight controls to change heading
    if (typeof geofs.autopilot !== 'undefined') {
      geofs.autopilot.setHeading(degrees);
      console.log(`Heading set to ${degrees}°`);
    }
  }
  
  // Select an aircraft
  function selectAircraft(aircraftId) {
    if (typeof geofs.aircraft !== 'undefined') {
      geofs.aircraft.instance.change(aircraftId);
      console.log(`Aircraft changed to ID ${aircraftId}`);
    }
  }
  
  // Update aircraft state from external data
  function updateAircraftState(params) {
    try {
      console.log('Updating aircraft state with params:', params);
      
      // Update position if provided
      if (params.position) {
        console.log(`Setting position to: lat=${params.position.latitude}, lon=${params.position.longitude}, alt=${params.position.altitude}`);
        
        // Try different methods to set position
        try {
          // Method 1: Using setPosition
          if (typeof geofs.aircraft.instance.setPosition === 'function') {
            geofs.aircraft.instance.setPosition(
              params.position.latitude,
              params.position.longitude,
              params.position.altitude
            );
            console.log('Position set using setPosition method');
          } 
          // Method 2: Direct property setting
          else if (geofs.aircraft.instance.llaLocation) {
            geofs.aircraft.instance.llaLocation[0] = params.position.latitude;
            geofs.aircraft.instance.llaLocation[1] = params.position.longitude;
            geofs.aircraft.instance.llaLocation[2] = params.position.altitude;
            console.log('Position set by directly updating llaLocation');
          }
          // Method 3: Using coordinates property
          else if (geofs.aircraft.instance.coordinates) {
            geofs.aircraft.instance.coordinates = {
              lat: params.position.latitude,
              lon: params.position.longitude,
              alt: params.position.altitude
            };
            console.log('Position set using coordinates property');
          } else {
            console.warn('Could not find a method to set aircraft position');
          }
        } catch (posError) {
          console.error('Error setting position:', posError);
        }
      }
      
      // Update attitude if provided
      if (params.attitude) {
        console.log(`Setting attitude to: heading=${params.attitude.heading}, pitch=${params.attitude.pitch}, roll=${params.attitude.roll}`);
        
        try {
          // Method 1: Using setRotation
          if (typeof geofs.aircraft.instance.setRotation === 'function') {
            geofs.aircraft.instance.setRotation(
              params.attitude.heading,
              params.attitude.pitch,
              params.attitude.roll
            );
            console.log('Attitude set using setRotation method');
          } 
          // Method 2: Direct property setting
          else if (geofs.aircraft.instance.htr) {
            geofs.aircraft.instance.htr[0] = params.attitude.heading;
            geofs.aircraft.instance.htr[1] = params.attitude.pitch;
            geofs.aircraft.instance.htr[2] = params.attitude.roll;
            console.log('Attitude set by directly updating htr');
          } else {
            console.warn('Could not find a method to set aircraft attitude');
          }
        } catch (attError) {
          console.error('Error setting attitude:', attError);
        }
      }
      
      // Update speed if provided (simplified)
      if (params.speed) {
        console.log(`Setting speed: kias=${params.speed.kias}, groundSpeed=${params.speed.groundSpeed}, verticalSpeed=${params.speed.verticalSpeed}`);
        
        try {
          // Set airspeed
          if (geofs.aircraft.instance.animationValue && typeof geofs.aircraft.instance.animationValue.kias !== 'undefined') {
            geofs.aircraft.instance.animationValue.kias = params.speed.kias;
            console.log('Airspeed set using animationValue.kias');
          }
          
          // Set ground speed
          if (typeof geofs.aircraft.instance.groundSpeed !== 'undefined') {
            geofs.aircraft.instance.groundSpeed = params.speed.groundSpeed;
            console.log('Ground speed set');
          }
          
          // Set vertical speed
          if (typeof geofs.aircraft.instance.verticalSpeed !== 'undefined') {
            geofs.aircraft.instance.verticalSpeed = params.speed.verticalSpeed;
            console.log('Vertical speed set');
          }
        } catch (speedError) {
          console.error('Error setting speed:', speedError);
        }
      }
      
      // Force update of aircraft physics
      if (typeof geofs.aircraft.instance.update === 'function') {
        geofs.aircraft.instance.update();
        console.log('Called aircraft update method');
      }
      
      console.log('Aircraft state updated from external data');
    } catch (error) {
      console.error('Error updating aircraft state:', error);
    }
  }
  
  // Start sending regular updates to the server
  function startUpdates() {
    // Send updates at 10Hz
    updateInterval = setInterval(function() {
      if (connected && typeof geofs.aircraft.instance !== 'undefined') {
        sendFlightData();
      }
    }, 100);
  }
  
  // Send flight data to the server
  function sendFlightData() {
    try {
      if (!connected || !ws) {
        console.debug('Not sending flight data: not connected to server');
        return;
      }
      
      const aircraft = geofs.aircraft.instance;
      if (!aircraft) {
        console.debug('Not sending flight data: aircraft instance not available');
        return;
      }
      
      // Get aircraft type information
      const aircraftType = {
        id: aircraft.aircraftId || 0,
        name: aircraft.name || 'Unknown',
        type: aircraft.aircraftType || 'Unknown'
      };
      
      // Prepare flight data with safe property access
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
          verticalSpeed: typeof aircraft.verticalSpeed !== 'undefined' ? aircraft.verticalSpeed : 0,
          mach: aircraft.animationValue && aircraft.animationValue.mach ? aircraft.animationValue.mach : 0
        },
        controls: {
          throttle: aircraft.engines && aircraft.engines[0] ? aircraft.engines[0].throttle : 0,
          elevators: aircraft.controls && typeof aircraft.controls.elevator !== 'undefined' ? aircraft.controls.elevator : 0,
          ailerons: aircraft.controls && typeof aircraft.controls.aileron !== 'undefined' ? aircraft.controls.aileron : 0,
          rudder: aircraft.controls && typeof aircraft.controls.rudder !== 'undefined' ? aircraft.controls.rudder : 0,
          flaps: aircraft.controls && typeof aircraft.controls.flaps !== 'undefined' ? aircraft.controls.flaps : 0,
          gear: typeof aircraft.gearPosition !== 'undefined' ? aircraft.gearPosition : 1,
          spoilers: aircraft.controls && typeof aircraft.controls.spoilers !== 'undefined' ? aircraft.controls.spoilers : 0,
          brakes: aircraft.controls && typeof aircraft.controls.brakes !== 'undefined' ? aircraft.controls.brakes : 0
        },
        environment: {
          windSpeed: typeof geofs.weather !== 'undefined' && geofs.weather.windSpeed ? geofs.weather.windSpeed : 0,
          windDirection: typeof geofs.weather !== 'undefined' && geofs.weather.windDirection ? geofs.weather.windDirection : 0,
          temperature: typeof geofs.weather !== 'undefined' && geofs.weather.temperature ? geofs.weather.temperature : 15
        },
        aircraft: aircraftType,
        timestamp: Date.now()
      };
      
      // Add autopilot information if available
      if (typeof geofs.autopilot !== 'undefined') {
        flightData.autopilot = {
          on: geofs.autopilot.on || false,
          heading: geofs.autopilot.heading || 0,
          altitude: geofs.autopilot.altitude || 0,
          verticalSpeed: geofs.autopilot.verticalSpeed || 0,
          speed: geofs.autopilot.speed || 0
        };
      }
      
      // Send to server
      const message = {
        type: 'flightData',
        data: flightData
      };
      
      try {
        ws.send(JSON.stringify(message));
      } catch (sendError) {
        console.error('Error sending data to server:', sendError);
        // If we get an error sending, the connection might be broken
        if (connected) {
          console.warn('Connection appears to be broken, attempting to reconnect...');
          connected = false;
          updateConnectionIndicator(false);
          connectToServer();
        }
      }
    } catch (error) {
      console.error('Error preparing flight data:', error);
    }
  }
  
  // Add a connection indicator to the GeoFS UI
  function addConnectionIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'mcp-connection-indicator';
    indicator.style.position = 'absolute';
    indicator.style.top = '10px';
    indicator.style.right = '10px';
    indicator.style.padding = '5px 10px';
    indicator.style.borderRadius = '5px';
    indicator.style.fontSize = '12px';
    indicator.style.fontWeight = 'bold';
    indicator.style.zIndex = '1000';
    indicator.style.backgroundColor = '#333';
    indicator.style.color = '#fff';
    indicator.textContent = 'MCP: Connecting...';
    
    document.body.appendChild(indicator);
    
    // Initial state
    updateConnectionIndicator('connecting');
  }
  
  // Update the connection indicator
  function updateConnectionIndicator(status) {
    const indicator = document.getElementById('mcp-connection-indicator');
    if (indicator) {
      if (status === true) {
        indicator.textContent = 'MCP: Connected';
        indicator.style.backgroundColor = '#28a745';
      } else if (status === 'connecting') {
        indicator.textContent = 'MCP: Connecting...';
        indicator.style.backgroundColor = '#ffc107';
      } else if (status === 'failed') {
        indicator.textContent = 'MCP: Connection Failed';
        indicator.style.backgroundColor = '#dc3545';
      } else {
        indicator.textContent = 'MCP: Disconnected';
        indicator.style.backgroundColor = '#dc3545';
      }
    }
  }
  
  // Initialize the connector
  initialize();
  
  // Clean up on page unload
  window.addEventListener('beforeunload', function() {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    
    if (ws) {
      ws.close();
    }
  });
  
  // Expose API for console access
  window.mcpConnector = {
    connect: connectToServer,
    disconnect: function() {
      if (ws) {
        ws.close();
      }
    },
    status: function() {
      return {
        connected: connected,
        serverUrl: MCP_SERVER_URL
      };
    }
  };
  
  console.log('GeoFS MCP Connector loaded. Use window.mcpConnector to access the API.');
})();
