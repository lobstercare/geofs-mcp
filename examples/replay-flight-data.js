// Flight data replay client for the GeoFS MCP Server
const WebSocket = require('ws');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Server configuration
const SERVER_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000';

// Default flight data file path (can be overridden via command line)
const DEFAULT_FLIGHT_DATA_PATH = path.join(__dirname, 'boeing787-data.json');

// Parse command line arguments
const args = process.argv.slice(2);
const flightDataPath = args[0] || DEFAULT_FLIGHT_DATA_PATH;

// Load flight data from file
let flightData;
try {
  const data = fs.readFileSync(flightDataPath, 'utf8');
  flightData = JSON.parse(data);
  console.log(`Loaded flight data from ${flightDataPath}`);
  console.log(`Flight data contains ${flightData.length} data points`);
} catch (error) {
  console.error(`Error loading flight data: ${error.message}`);
  process.exit(1);
}

// Connect to the WebSocket server
const ws = new WebSocket(WS_URL);

// Message ID counter
let messageId = 1;

// Command queue and processing flag
const commandQueue = [];
let isProcessingCommand = false;

// Process the next command in the queue
function processNextCommand() {
  if (commandQueue.length === 0 || isProcessingCommand) {
    return;
  }

  isProcessingCommand = true;
  const command = commandQueue.shift();
  
  // Send the command
  ws.send(JSON.stringify({
    id: messageId++,
    type: 'command',
    command: command.name,
    params: command.params
  }));

  console.log(`Sent command: ${command.name}`, command.params);
}

// Add a command to the queue
function queueCommand(name, params = {}) {
  commandQueue.push({ name, params });
  processNextCommand();
}

// WebSocket event handlers
ws.on('open', () => {
  console.log('Connected to GeoFS MCP Server');
  
  // Start the flight replay after connection
  startFlightReplay();
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('Received message:', message);
    
    // Mark the current command as processed
    isProcessingCommand = false;
    
    // Process the next command in the queue
    processNextCommand();
  } catch (error) {
    console.error('Error parsing message:', error);
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('Disconnected from GeoFS MCP Server');
});

// Flight replay function
async function startFlightReplay() {
  try {
    // Check server capabilities first
    const response = await fetch(`${SERVER_URL}/mcp`);
    const capabilities = await response.json();
    console.log('Server capabilities:', capabilities);

    // Select Boeing 787 aircraft (ID 18)
    queueCommand('selectAircraft', { aircraftId: 18 });
    
    console.log('Starting flight data replay...');
    
    // Start replaying flight data with a slight delay
    setTimeout(() => {
      replayFlightData();
    }, 2000);
  } catch (error) {
    console.error('Error starting flight replay:', error);
  }
}

// Function to replay flight data
function replayFlightData() {
  // Set initial position from first data point
  if (flightData.length > 0) {
    const initialData = flightData[0];
    
    // Create a custom command to update aircraft position and state
    queueCommand('updateAircraftState', {
      position: {
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        altitude: initialData.altitude
      },
      attitude: {
        heading: initialData.heading,
        pitch: initialData.pitch,
        roll: initialData.roll
      },
      speed: {
        kias: initialData.airspeed,
        groundSpeed: initialData.groundSpeed,
        verticalSpeed: initialData.verticalSpeed
      }
    });
    
    console.log('Set initial aircraft position and state');
    
    // Start replay loop for remaining data points
    let dataIndex = 1;
    
    const replayInterval = setInterval(() => {
      if (dataIndex < flightData.length) {
        const currentData = flightData[dataIndex];
        
        // Update aircraft position and state
        queueCommand('updateAircraftState', {
          position: {
            latitude: currentData.latitude,
            longitude: currentData.longitude,
            altitude: currentData.altitude
          },
          attitude: {
            heading: currentData.heading,
            pitch: currentData.pitch,
            roll: currentData.roll
          },
          speed: {
            kias: currentData.airspeed,
            groundSpeed: currentData.groundSpeed,
            verticalSpeed: currentData.verticalSpeed
          }
        });
        
        // Log progress periodically
        if (dataIndex % 10 === 0) {
          console.log(`Replaying data point ${dataIndex}/${flightData.length}`);
        }
        
        dataIndex++;
      } else {
        // End of flight data
        clearInterval(replayInterval);
        console.log('Flight data replay completed');
      }
    }, 1000); // Update every second (adjust as needed)
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('Closing connection...');
  ws.close();
  process.exit(0);
});
