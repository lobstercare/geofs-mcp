import axios from 'axios';
import WebSocket from 'ws';
import { FlightData } from '../models/flight-data';

/**
 * GPT Controller for GeoFS MCP
 * 
 * This controller handles communication between GPT-4o and the MCP server,
 * allowing natural language commands to be translated into aircraft controls.
 */
export class GPTController {
  private ws: WebSocket | null = null;
  private openaiApiKey: string;
  private messageId = 1;
  private currentFlightData: FlightData | null = null;
  private isConnected = false;
  private commandQueue: Array<{name: string, params: any}> = [];
  private isProcessingCommand = false;
  private lastGptResponse = '';

  constructor(openaiApiKey: string, wsUrl: string = 'ws://localhost:3002') {
    this.openaiApiKey = openaiApiKey;
    this.connectToMCP(wsUrl);
  }

  /**
   * Connect to the MCP server via WebSocket
   */
  private connectToMCP(wsUrl: string): void {
    console.log(`Connecting to MCP server at ${wsUrl}...`);
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.on('open', () => {
      console.log('Connected to MCP server');
      this.isConnected = true;
      
      // Request initial flight data
      this.sendCommand('getFlightData');
    });
    
    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received message from MCP server:', message);
        
        // Handle different message types
        if (message.type === 'flightData') {
          this.currentFlightData = message.data;
          console.log('Updated flight data');
        } else if (message.id && this.isProcessingCommand) {
          this.isProcessingCommand = false;
          this.processNextCommand();
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
    
    this.ws.on('close', () => {
      console.log('Disconnected from MCP server');
      this.isConnected = false;
      
      // Try to reconnect after 5 seconds
      setTimeout(() => {
        this.connectToMCP(wsUrl);
      }, 5000);
    });
    
    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  /**
   * Process a natural language command using GPT-4o
   */
  public async processNaturalLanguageCommand(command: string): Promise<string> {
    if (!this.isConnected) {
      return 'Not connected to MCP server. Please try again later.';
    }
    
    try {
      // Prepare the context for GPT-4o
      const context = this.prepareGptContext();
      
      // Call GPT-4o API
      const gptResponse = await this.callGpt(command, context);
      this.lastGptResponse = gptResponse;
      
      // Parse the response and extract commands
      const commands = this.parseGptResponse(gptResponse);
      
      // Queue the commands for execution
      commands.forEach(cmd => {
        this.queueCommand(cmd.name, cmd.params);
      });
      
      // Start processing commands
      this.processNextCommand();
      
      return gptResponse;
    } catch (error) {
      console.error('Error processing natural language command:', error);
      return 'Error processing your command. Please try again.';
    }
  }

  /**
   * Prepare the context for GPT-4o based on current flight data
   */
  private prepareGptContext(): string {
    let context = 'You are an AI flight assistant that helps control an aircraft in the GeoFS flight simulator. ';
    
    if (this.currentFlightData) {
      const { position, attitude, speed, controls, aircraft } = this.currentFlightData;
      
      context += `Current flight data:\n`;
      context += `- Aircraft: ${aircraft?.name || 'Unknown'}\n`;
      context += `- Position: Latitude ${position?.latitude.toFixed(6)}, Longitude ${position?.longitude.toFixed(6)}, Altitude ${position?.altitude.toFixed(1)}m\n`;
      context += `- Attitude: Heading ${attitude?.heading.toFixed(1)}°, Pitch ${attitude?.pitch.toFixed(1)}°, Roll ${attitude?.roll.toFixed(1)}°\n`;
      context += `- Speed: ${speed?.kias.toFixed(1)} KIAS, Vertical Speed ${(speed?.verticalSpeed * 196.85).toFixed(0)} ft/min\n`;
      context += `- Controls: Throttle ${controls?.throttle.toFixed(2)}, Flaps ${controls?.flaps.toFixed(2)}, Gear ${controls?.gear.toFixed(2)}\n\n`;
    } else {
      context += 'No current flight data available.\n\n';
    }
    
    context += `You can control the aircraft using these commands:
- setThrottle: Set engine throttle (0-1)
- setFlaps: Set flaps position (0-1)
- setGear: Set landing gear position (0-1 where 0 is up, 1 is down)
- setHeading: Set target heading in degrees
- setPitch: Set target pitch in degrees
- setRoll: Set target roll in degrees
- setAltitude: Set target altitude in meters
- startPattern: Start a predefined flight pattern (options: takeoff, landing, approach, holdingPattern)

When responding to user requests, provide a brief explanation of what you're doing, then output a JSON array of commands in this format:
[
  {"name": "commandName", "params": {"paramName": paramValue}},
  {"name": "anotherCommand", "params": {"paramName": paramValue}}
]

For complex maneuvers like takeoff, break them down into a sequence of commands with appropriate parameters.`;
    
    return context;
  }

  /**
   * Call the GPT-4o API with the user's command and context
   */
  private async callGpt(command: string, context: string): Promise<string> {
    try {
      // This is a placeholder for the actual OpenAI API call
      // In a real implementation, you would use the OpenAI SDK or API
      
      // For demo purposes, we'll simulate responses for common commands
      if (command.toLowerCase().includes('takeoff') || command.toLowerCase().includes('take off')) {
        return this.simulateTakeoffResponse(command);
      } else if (command.toLowerCase().includes('land')) {
        return this.simulateLandingResponse(command);
      } else if (command.toLowerCase().includes('turn')) {
        return this.simulateTurnResponse(command);
      } else {
        // Generic response for other commands
        return `I'll help you with that request. Here's what I'll do:\n\n[{"name":"getFlightData","params":{}}]`;
      }
      
      // Actual OpenAI API call would look something like this:
      /*
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: context },
            { role: 'user', content: command }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.choices[0].message.content;
      */
    } catch (error) {
      console.error('Error calling GPT API:', error);
      throw error;
    }
  }

  /**
   * Simulate a takeoff response for demo purposes
   */
  private simulateTakeoffResponse(command: string): string {
    return `I'll help you take off. Here's the sequence of commands I'll execute:

1. First, I'll set the flaps to takeoff position (30%)
2. Then I'll make sure the landing gear is down
3. I'll gradually increase throttle to 100%
4. Once we reach takeoff speed, I'll pitch up to 10 degrees
5. After positive climb, I'll retract the landing gear
6. At 1000ft, I'll reduce flaps and maintain climb

[
  {"name":"setFlaps","params":{"value":0.3}},
  {"name":"setGear","params":{"value":1}},
  {"name":"setThrottle","params":{"value":1.0}},
  {"name":"startPattern","params":{"pattern":"takeoff"}}
]`;
  }

  /**
   * Simulate a landing response for demo purposes
   */
  private simulateLandingResponse(command: string): string {
    return `I'll help you land the aircraft. Here's the sequence:

1. I'll reduce speed by setting throttle to 30%
2. I'll extend flaps to 50% for initial approach
3. I'll lower the landing gear
4. I'll maintain a 3-degree glideslope to the runway
5. Just before touchdown, I'll flare by pitching up slightly
6. After touchdown, I'll reduce throttle to idle

[
  {"name":"setThrottle","params":{"value":0.3}},
  {"name":"setFlaps","params":{"value":0.5}},
  {"name":"setGear","params":{"value":1}},
  {"name":"startPattern","params":{"pattern":"landing"}}
]`;
  }

  /**
   * Simulate a turn response for demo purposes
   */
  private simulateTurnResponse(command: string): string {
    // Extract heading from command if possible
    let heading = 90; // Default to 90 degrees
    const headingMatch = command.match(/(\d+)\s*degrees/);
    if (headingMatch) {
      heading = parseInt(headingMatch[1], 10);
    }
    
    return `I'll turn the aircraft to a heading of ${heading} degrees.

1. I'll bank the aircraft by setting roll to 20 degrees
2. Once we reach the desired heading, I'll level off

[
  {"name":"setHeading","params":{"degrees":${heading}}}
]`;
  }

  /**
   * Parse GPT-4o response to extract commands
   */
  private parseGptResponse(response: string): Array<{name: string, params: any}> {
    try {
      // Extract JSON array from the response
      const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        const commands = JSON.parse(jsonStr);
        return commands;
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing GPT response:', error);
      return [];
    }
  }

  /**
   * Queue a command for execution
   */
  private queueCommand(name: string, params: any = {}): void {
    this.commandQueue.push({ name, params });
    this.processNextCommand();
  }

  /**
   * Process the next command in the queue
   */
  private processNextCommand(): void {
    if (this.commandQueue.length === 0 || this.isProcessingCommand || !this.isConnected) {
      return;
    }

    this.isProcessingCommand = true;
    const command = this.commandQueue.shift();
    
    if (command) {
      this.sendCommand(command.name, command.params);
    }
  }

  /**
   * Send a command to the MCP server
   */
  private sendCommand(command: string, params: any = {}): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      this.isProcessingCommand = false;
      return;
    }
    
    const message = {
      id: this.messageId++,
      type: 'command',
      command,
      params
    };
    
    this.ws.send(JSON.stringify(message));
    console.log(`Sent command: ${command}`, params);
  }

  /**
   * Get the last GPT response
   */
  public getLastGptResponse(): string {
    return this.lastGptResponse;
  }

  /**
   * Get the current flight data
   */
  public getCurrentFlightData(): FlightData | null {
    return this.currentFlightData;
  }

  /**
   * Close the WebSocket connection
   */
  public close(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}
