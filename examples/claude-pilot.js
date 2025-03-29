// Claude AI Pilot for GeoFS MCP Server
const WebSocket = require('ws');
const fetch = require('node-fetch');
const { default: Anthropic } = require('@anthropic-ai/sdk');
const readline = require('readline');

// Configuration
const SERVER_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000';
const ANTHROPIC_API_KEY = 'YOUR_ANTHROPIC_API_KEY'; // Replace with your API key

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Connect to the WebSocket server
const ws = new WebSocket(WS_URL);

// Message ID counter
let messageId = 1;

// Flight state
let flightState = {
  flightData: null,
  lastCommand: null,
  history: []
};

// WebSocket event handlers
ws.on('open', () => {
  console.log('Connected to GeoFS MCP Server');
  startInteraction();
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('Received from GeoFS:', message);
    
    // Update flight state with response
    if (message.result) {
      if (flightState.lastCommand === 'getFlightData') {
        flightState.flightData = message.result;
      }
      
      // Add to history
      flightState.history.push({
        timestamp: new Date().toISOString(),
        command: flightState.lastCommand,
        result: message.result
      });
      
      // Keep history at a reasonable size
      if (flightState.history.length > 10) {
        flightState.history.shift();
      }
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('Disconnected from GeoFS MCP Server');
  process.exit(0);
});

// Send a command to GeoFS
function sendCommand(command, params = {}) {
  return new Promise((resolve, reject) => {
    const id = messageId++;
    
    // Set up one-time listener for this specific message ID
    const messageHandler = (data) => {
      try {
        const response = JSON.parse(data);
        if (response.id === id) {
          ws.removeListener('message', messageHandler);
          resolve(response.result);
        }
      } catch (error) {
        // Ignore parsing errors for other messages
      }
    };
    
    ws.on('message', messageHandler);
    
    // Store the last command
    flightState.lastCommand = command;
    
    // Send the command
    ws.send(JSON.stringify({
      id,
      type: 'command',
      command,
      params
    }));
    
    console.log(`Sent command: ${command}`, params);
    
    // Set timeout to prevent hanging
    setTimeout(() => {
      ws.removeListener('message', messageHandler);
      reject(new Error(`Command ${command} timed out`));
    }, 10000);
  });
}

// Get flight instructions from Claude
async function getFlightInstructions(userInput) {
  // First, get the latest flight data
  try {
    flightState.flightData = await sendCommand('getFlightData');
  } catch (error) {
    console.error('Error getting flight data:', error);
  }
  
  // Prepare the context for Claude
  const context = `
You are an AI flight assistant helping a pilot fly in the GeoFS flight simulator.
Current flight data:
${JSON.stringify(flightState.flightData, null, 2)}

Recent command history:
${JSON.stringify(flightState.history, null, 2)}

Available commands:
- setThrottle(value: 0-1) - Set engine throttle
- setHeading(degrees: 0-360) - Set target heading
- getPosition() - Get current aircraft position
- selectAircraft(aircraftId: number) - Change aircraft
- takeOff() - Execute takeoff procedure
- land() - Execute landing procedure
- getFlightData() - Get comprehensive flight data

The user wants to: ${userInput}

Respond with specific flight instructions that can be executed using the available commands.
Format your response as valid JSON with a "commands" array containing objects with "command" and "params" properties.
`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
      messages: [
        { role: 'user', content: context }
      ],
    });
    
    // Extract JSON from Claude's response
    const content = response.content[0].text;
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                     content.match(/```\n([\s\S]*?)\n```/) ||
                     content.match(/{[\s\S]*?}/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e) {
        console.error('Error parsing Claude response as JSON:', e);
        console.log('Raw response:', content);
        return null;
      }
    } else {
      console.error('Could not find JSON in Claude response');
      console.log('Raw response:', content);
      return null;
    }
  } catch (error) {
    console.error('Error getting instructions from Claude:', error);
    return null;
  }
}

// Execute flight instructions
async function executeInstructions(instructions) {
  if (!instructions || !instructions.commands || !Array.isArray(instructions.commands)) {
    console.log('No valid instructions received');
    return;
  }
  
  console.log('Executing flight instructions:');
  
  for (const cmd of instructions.commands) {
    console.log(`- ${cmd.command}:`, cmd.params);
    
    try {
      const result = await sendCommand(cmd.command, cmd.params);
      console.log(`  Result:`, result);
    } catch (error) {
      console.error(`  Error executing ${cmd.command}:`, error.message);
    }
    
    // Small delay between commands
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('All instructions executed');
}

// Start the interaction loop
function startInteraction() {
  console.log('\n=== Claude AI Pilot for GeoFS ===');
  console.log('Type your flight instructions or "exit" to quit');
  
  askForInput();
}

function askForInput() {
  rl.question('\nWhat would you like to do? ', async (input) => {
    if (input.toLowerCase() === 'exit') {
      console.log('Exiting...');
      ws.close();
      rl.close();
      return;
    }
    
    console.log('Getting instructions from Claude...');
    const instructions = await getFlightInstructions(input);
    
    if (instructions) {
      await executeInstructions(instructions);
    }
    
    askForInput();
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('Closing connection...');
  ws.close();
  rl.close();
  process.exit(0);
});
