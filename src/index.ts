import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import path from 'path';
import cors from 'cors';
import { GeoFSController } from './controllers/geofs-controller';
import { GPTController } from './ai/gpt-controller';

// Initialize Express app
const app = express();
const port = 3002;

// Enable CORS for all routes
app.use(cors({
  origin: ['https://www.geo-fs.com', 'https://geo-fs.com', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Initialize controllers
const geofsController = new GeoFSController();
let gptController: GPTController | null = null;

// API routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'GeoFS MCP Server is running',
    controller: {
      initialized: geofsController.isInitialized()
    }
  });
});

// Route for GPT commands
app.post('/gpt-command', async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }
    
    if (!gptController) {
      // Use a default API key or empty string for simulated responses
      const apiKey = process.env.OPENAI_API_KEY || '';
      gptController = new GPTController(apiKey);
    }
    
    const response = await gptController.processNaturalLanguageCommand(command);
    
    res.json({ response });
  } catch (error) {
    console.error('Error processing GPT command:', error);
    res.status(500).json({ error: 'Failed to process command' });
  }
});

// Route for setting API key
app.post('/set-api-key', (req, res) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    // Initialize or reinitialize GPT controller with the new API key
    if (gptController) {
      gptController.close();
    }
    
    gptController = new GPTController(apiKey);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error setting API key:', error);
    res.status(500).json({ error: 'Failed to set API key' });
  }
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'info',
    message: 'Connected to GeoFS MCP Server'
  }));
  
  // Handle messages from clients
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message:', data);
      
      // Handle different message types
      if (data.type === 'command') {
        handleCommand(data, ws);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Error processing message'
      }));
    }
  });
  
  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Handle commands from clients
function handleCommand(data: any, ws: WebSocket) {
  const { id, command, params } = data;
  
  try {
    switch (command) {
      case 'getFlightData':
        const flightData = geofsController.getFlightData();
        ws.send(JSON.stringify({
          id,
          type: 'flightData',
          data: flightData
        }));
        break;
        
      case 'setThrottle':
        geofsController.setThrottle(params.value);
        ws.send(JSON.stringify({
          id,
          type: 'success',
          message: `Throttle set to ${params.value}`
        }));
        break;
        
      case 'setHeading':
        geofsController.setHeading(params.degrees);
        ws.send(JSON.stringify({
          id,
          type: 'success',
          message: `Heading set to ${params.degrees} degrees`
        }));
        break;
        
      case 'startPattern':
        geofsController.startPattern(params.pattern);
        ws.send(JSON.stringify({
          id,
          type: 'success',
          message: `Started pattern: ${params.pattern}`
        }));
        break;
        
      // Add more commands as needed
        
      default:
        ws.send(JSON.stringify({
          id,
          type: 'error',
          message: `Unknown command: ${command}`
        }));
    }
  } catch (error) {
    console.error(`Error executing command ${command}:`, error);
    ws.send(JSON.stringify({
      id,
      type: 'error',
      message: `Error executing command: ${error}`
    }));
  }
}

// Start the server
server.listen(port, () => {
  console.log(`GeoFS MCP Server running at http://localhost:${port}`);
});
