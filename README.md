# GeoFS MCP Server

A Model Context Protocol (MCP) server for the GeoFS flight simulator, allowing AI models to control and interact with aircraft in the GeoFS browser-based flight simulator.
![image](https://github.com/user-attachments/assets/9b9f8c68-10c1-43b5-b040-f9b7740c04cd)
![image](https://github.com/user-attachments/assets/611c64f4-1b88-4e86-b289-adfcb12dc97d)

## Features

- 🛫 Control aircraft flight parameters (throttle, heading, etc.)
- 📊 Access real-time flight data (position, speed, attitude)
- 🗺️ Navigate between waypoints and airports
- ✈️ Select different aircraft models
- 🔄 Execute flight maneuvers (takeoff, landing)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A modern web browser (Chrome recommended)

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/geofs-mcp-server.git
   cd geofs-mcp-server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the project:
   ```
   npm run build
   ```

## Usage

### Starting the Server

1. Start the MCP server:
   ```
   npm start
   ```

2. The server will launch a browser window that navigates to GeoFS
   - You may need to log in to GeoFS if required
   - The server will wait for GeoFS to fully load before accepting commands

3. The MCP server will be available at:
   - HTTP: `http://localhost:3000`
   - WebSocket: `ws://localhost:3000`

### Using with AI Models

This MCP server can be used with AI models that support the Model Context Protocol, allowing them to:

1. Control aircraft in the simulator
2. Retrieve flight data and simulator state
3. Execute complex flight maneuvers
4. Plan and follow flight routes

### API Endpoints

- `GET /mcp` - Get server capabilities and available endpoints
- `GET /mcp/aircraft` - Get current aircraft data
- `POST /mcp/aircraft` - Control aircraft parameters
- `GET /mcp/flight-data` - Get comprehensive flight data
- `POST /mcp/navigation` - Set navigation parameters
- `GET /mcp/simulation` - Get simulation status
- `POST /mcp/simulation` - Control simulation parameters

### WebSocket Commands

The server also supports WebSocket for real-time communication:

```javascript
// Example WebSocket message
{
  "id": 1,
  "type": "command",
  "command": "setThrottle",
  "params": {
    "value": 0.75
  }
}
```

Available commands:
- `setThrottle` - Set engine throttle (0-1)
- `setHeading` - Set target heading in degrees
- `getPosition` - Get current aircraft position
- `selectAircraft` - Change to a different aircraft
- `takeOff` - Execute takeoff procedure
- `land` - Execute landing procedure
- `getFlightData` - Get comprehensive flight data

## Example Client

See the `examples/simple-client.js` file for a basic example of how to connect to and use the GeoFS MCP server.

To run the example:
```
node examples/simple-client.js
```

## How It Works

The GeoFS MCP server uses Puppeteer to control a browser instance running GeoFS. It provides a standardized MCP interface that allows AI models to interact with the flight simulator through HTTP and WebSocket APIs.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [GeoFS](https://www.geo-fs.com/) - The browser-based flight simulator
- [Model Context Protocol](https://github.com/modelcontextprotocol/mcp) - Protocol specification for AI model context
