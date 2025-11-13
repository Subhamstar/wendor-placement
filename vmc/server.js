import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { createServer } from 'http';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// VMC State
let vendingState = {
  status: 'idle', // 'idle' or 'vending'
  currentItems: [],
  startTime: null,
  timeout: null,
  lastActivity: Date.now(),
  screenSaverActive: false,
  screenSaverTimeout: null
};

// Broadcast to all connected WebSocket clients
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(data));
    }
  });
}

// Function to reset screen saver timer
function resetScreenSaverTimer() {
  vendingState.lastActivity = Date.now();
  
  // Clear existing screen saver timeout
  if (vendingState.screenSaverTimeout) {
    clearTimeout(vendingState.screenSaverTimeout);
  }

  // If screen saver was active, deactivate it
  if (vendingState.screenSaverActive) {
    vendingState.screenSaverActive = false;
    broadcast({
      type: 'screen-saver',
      active: false,
      message: 'Screen saver deactivated'
    });
  }

  // Set new screen saver timeout (30 seconds)
  vendingState.screenSaverTimeout = setTimeout(() => {
    vendingState.screenSaverActive = true;
    broadcast({
      type: 'screen-saver',
      active: true,
      message: 'Screen saver activated - white screen'
    });
    console.log('Screen saver activated after 30 seconds of inactivity');
  }, 30000); // 30 seconds
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  
  // Initialize screen saver timer for this session
  resetScreenSaverTimer();
  
  // Send current status to new client
  ws.send(JSON.stringify({
    type: 'status',
    status: vendingState.status,
    items: vendingState.currentItems,
    screenSaver: {
      active: vendingState.screenSaverActive,
      inactivitySeconds: 30
    }
  }));

  ws.on('message', (message) => {
    // Reset screen saver on any activity
    resetScreenSaverTimer();

    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid JSON'
      }));
      return;
    }

    // Handle vend command
    if (data.type === 'vend') {
      const { items } = data;

      // Validate input
      if (!Array.isArray(items) || items.length === 0) {
        ws.send(JSON.stringify({
          type: 'vend-response',
          success: false,
          message: 'Invalid items array. Expected non-empty array of item numbers.'
        }));
        return;
      }

      // Check if already vending
      if (vendingState.status === 'vending') {
        ws.send(JSON.stringify({
          type: 'vend-response',
          success: false,
          message: 'Vending machine is currently busy',
          currentItems: vendingState.currentItems
        }));
        return;
      }

      // Update state to vending
      vendingState.status = 'vending';
      vendingState.currentItems = items;
      vendingState.startTime = Date.now();

      // Broadcast status change to all clients
      broadcast({
        type: 'status',
        status: 'vending',
        items: items,
        message: 'Vending started',
        screenSaver: {
          active: vendingState.screenSaverActive
        }
      });

      // Respond to this client that vending has started
      ws.send(JSON.stringify({
        type: 'vend-response',
        success: true,
        message: 'Vending started',
        items: items,
        estimatedTime: 5000 // 5 seconds
      }));

      // Simulate vending process (5 seconds delay)
      const vendingDelay = 5000;

      vendingState.timeout = setTimeout(() => {
        // Complete vending
        vendingState.status = 'idle';
        const vendedItems = [...vendingState.currentItems];
        vendingState.currentItems = [];
        vendingState.startTime = null;
        vendingState.timeout = null;

        // Broadcast completion to all clients
        broadcast({
          type: 'vend-complete',
          status: 'idle',
          message: 'Vending completed successfully',
          vendedItems: vendedItems,
          timestamp: new Date().toISOString(),
          screenSaver: {
            active: vendingState.screenSaverActive
          }
        });

        console.log(`Vending completed for items: ${vendedItems.join(', ')}`);
      }, vendingDelay);
    }

    // Handle status request
    else if (data.type === 'status') {
      let response = {
        type: 'status',
        status: vendingState.status,
        timestamp: new Date().toISOString(),
        screenSaver: {
          active: vendingState.screenSaverActive,
          inactivitySeconds: 30
        }
      };

      if (vendingState.status === 'vending') {
        const elapsed = Date.now() - vendingState.startTime;
        response = {
          ...response,
          items: vendingState.currentItems,
          elapsedTime: elapsed,
          message: 'Vending in progress'
        };
      } else {
        response.message = 'Machine is idle';
      }
      ws.send(JSON.stringify(response));
    }

    // Handle screen saver toggle (activity to wake up)
    else if (data.type === 'activity') {
      resetScreenSaverTimer();
      ws.send(JSON.stringify({
        type: 'activity-response',
        screenSaver: {
          active: vendingState.screenSaverActive,
          message: 'Screen saver timer reset'
        }
      }));
    }

    // Health check (optional)
    else if (data.type === 'health') {
      ws.send(JSON.stringify({
        type: 'health',
        status: 'healthy',
        service: 'VMC Mock Server',
        timestamp: new Date().toISOString()
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🤖 VMC Mock Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  console.log(`\nEndpoints:`);
  console.log(`  POST http://localhost:${PORT}/vend`);
  console.log(`  GET  http://localhost:${PORT}/status`);
  console.log(`  WS   ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down VMC Mock Server...');
  if (vendingState.timeout) {
    clearTimeout(vendingState.timeout);
  }
  if (vendingState.screenSaverTimeout) {
    clearTimeout(vendingState.screenSaverTimeout);
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
