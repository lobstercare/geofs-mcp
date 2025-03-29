import express from 'express';
import { Server } from 'http';
import WebSocket from 'ws';
import path from 'path';
import { GeoFSController } from './controllers/geofs-controller';
import { setupMCPRoutes } from './routes/mcp-routes';

// Create Express app
const app = express();
const port = process.env.PORT || 3002;

// Create HTTP server
const server = new Server(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Initialize GeoFS controller
const geofsController = new GeoFSController();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Add CORS headers to allow requests from GeoFS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Setup MCP routes
setupMCPRoutes(app, geofsController);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'GeoFS MCP Server is running' });
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message:', data);
      
      // Handle different message types
      if (data.type === 'command') {
        const result = await geofsController.executeCommand(data.command, data.params);
        ws.send(JSON.stringify({ id: data.id, result }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({ error: 'Failed to process message' }));
    }
  });
  
  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});

// Start the server
server.listen(port, () => {
  console.log(`GeoFS MCP Server is running on port ${port}`);
  console.log(`Health check available at http://localhost:${port}/health`);
  console.log(`Dashboard available at http://localhost:${port}/dashboard.html`);
  
  // Initialize GeoFS browser controller
  geofsController.initialize()
    .then(() => console.log('GeoFS controller initialized'))
    .catch((error) => console.error('Failed to initialize GeoFS controller:', error));
});
