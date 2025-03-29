import { Express, Request, Response } from 'express';
import { GeoFSController } from '../controllers/geofs-controller';

/**
 * Setup MCP routes for the GeoFS server
 */
export function setupMCPRoutes(app: Express, geofsController: GeoFSController): void {
  // MCP standard endpoint for server capabilities
  app.get('/mcp', (req: Request, res: Response) => {
    res.json({
      name: 'geofs-mcp-server',
      version: '0.1.0',
      description: 'Model Context Protocol server for GeoFS flight simulator',
      capabilities: [
        'aircraft-control',
        'flight-data',
        'navigation',
        'simulation-control'
      ],
      endpoints: [
        { path: '/mcp/aircraft', methods: ['GET', 'POST'] },
        { path: '/mcp/flight-data', methods: ['GET'] },
        { path: '/mcp/navigation', methods: ['GET', 'POST'] },
        { path: '/mcp/simulation', methods: ['GET', 'POST'] }
      ]
    });
  });

  // Aircraft control endpoints
  app.get('/mcp/aircraft', async (req: Request, res: Response) => {
    try {
      const flightData = await geofsController.executeCommand('getFlightData', {});
      res.json({
        status: 'success',
        data: flightData
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to get aircraft data',
        error: (error as Error).message
      });
    }
  });

  app.post('/mcp/aircraft', async (req: Request, res: Response) => {
    try {
      const { action, params } = req.body;
      
      if (!action) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required parameter: action'
        });
      }
      
      let result;
      switch (action) {
        case 'setThrottle':
          result = await geofsController.executeCommand('setThrottle', { value: params.value });
          break;
        case 'selectAircraft':
          result = await geofsController.executeCommand('selectAircraft', { aircraftId: params.aircraftId });
          break;
        default:
          return res.status(400).json({
            status: 'error',
            message: `Unknown action: ${action}`
          });
      }
      
      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to execute aircraft command',
        error: (error as Error).message
      });
    }
  });

  // Flight data endpoints
  app.get('/mcp/flight-data', async (req: Request, res: Response) => {
    try {
      const flightData = await geofsController.executeCommand('getFlightData', {});
      res.json({
        status: 'success',
        data: flightData
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to get flight data',
        error: (error as Error).message
      });
    }
  });

  // Navigation endpoints
  app.get('/mcp/navigation', async (req: Request, res: Response) => {
    try {
      const position = await geofsController.executeCommand('getPosition', {});
      res.json({
        status: 'success',
        data: position
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to get navigation data',
        error: (error as Error).message
      });
    }
  });

  app.post('/mcp/navigation', async (req: Request, res: Response) => {
    try {
      const { action, params } = req.body;
      
      if (!action) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required parameter: action'
        });
      }
      
      let result;
      switch (action) {
        case 'setHeading':
          result = await geofsController.executeCommand('setHeading', { degrees: params.degrees });
          break;
        default:
          return res.status(400).json({
            status: 'error',
            message: `Unknown action: ${action}`
          });
      }
      
      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to execute navigation command',
        error: (error as Error).message
      });
    }
  });

  // Simulation control endpoints
  app.post('/mcp/simulation', async (req: Request, res: Response) => {
    try {
      const { action, params } = req.body;
      
      if (!action) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required parameter: action'
        });
      }
      
      let result;
      switch (action) {
        case 'takeOff':
          result = await geofsController.executeCommand('takeOff', {});
          break;
        case 'land':
          result = await geofsController.executeCommand('land', {});
          break;
        default:
          return res.status(400).json({
            status: 'error',
            message: `Unknown action: ${action}`
          });
      }
      
      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to execute simulation command',
        error: (error as Error).message
      });
    }
  });
}
