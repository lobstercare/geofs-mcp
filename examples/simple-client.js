// Simple client example for the GeoFS MCP Server
const WebSocket = require('ws');
const fetch = require('node-fetch');

// Server configuration
const SERVER_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000';

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
  
  // Start the flight sequence after connection
  startFlightSequence();
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

// Example flight sequence
async function startFlightSequence() {
  try {
    // Check server capabilities first
    const response = await fetch(`${SERVER_URL}/mcp`);
    const capabilities = await response.json();
    console.log('Server capabilities:', capabilities);

    // Select aircraft (Boeing 737-800)
    queueCommand('selectAircraft', { aircraftId: 18 });
    
    // Wait a bit before starting the engines
    setTimeout(() => {
      // Set throttle to 100%
      queueCommand('setThrottle', { value: 1.0 });
      
      // Get current position
      queueCommand('getPosition');
      
      // After takeoff, set a heading of 90 degrees (east)
      setTimeout(() => {
        queueCommand('setHeading', { degrees: 90 });
        
        // Get flight data
        setTimeout(() => {
          queueCommand('getFlightData');
        }, 10000);
      }, 15000);
    }, 5000);
  } catch (error) {
    console.error('Error starting flight sequence:', error);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('Closing connection...');
  ws.close();
  process.exit(0);
});
