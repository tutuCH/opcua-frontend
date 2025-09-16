# Frontend Integration Guide

This document provides comprehensive information for integrating with the OPC UA Dashboard backend API and WebSocket services.

## Table of Contents

- [Authentication](#authentication)
- [REST API Endpoints](#rest-api-endpoints)
- [WebSocket Integration](#websocket-integration)
- [Data Models](#data-models)
- [Integration Examples](#integration-examples)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication with AWS Cognito integration.

### Base URL
```
http://localhost:3000  # Development
https://your-production-domain.com  # Production
```

### Authentication Endpoints

#### POST /auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "email": "user@example.com",
    "username": "john_doe"
  }
}
```

#### POST /auth/sign-up
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "john_doe"
}
```

#### GET /auth/profile
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### POST /auth/forget-password
Request password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/reset-password/:token
Reset password with token.

**Request:**
```json
{
  "password": "newpassword123"
}
```

## REST API Endpoints

All protected endpoints require the `Authorization: Bearer <token>` header.

### Factories API

#### GET /factories
Get all factories for the authenticated user.

**Response:**
```json
[
  {
    "factoryId": 1,
    "factoryName": "Production Line A",
    "factoryIndex": "1",
    "width": "100",
    "height": "50",
    "createdAt": "2024-01-15T10:00:00Z",
    "machines": [...]
  }
]
```

#### POST /factories
Create a new factory.

**Request:**
```json
{
  "factoryName": "New Factory",
  "factoryIndex": 1,
  "width": 100,
  "height": 50
}
```

#### GET /factories/:id
Get a specific factory by ID.

#### PATCH /factories/:factoryId
Update factory information.

#### DELETE /factories/:id
Delete a factory.

#### GET /factories/user/factories
Get factories for current user (alternative endpoint).

### Machines API

#### GET /machines/factories-machines
Get all factories and their machines for the authenticated user.

**Response:**
```json
[
  {
    "factoryId": 1,
    "factoryName": "Production Line A",
    "machines": [
      {
        "machineId": 1,
        "machineName": "Injection Molding #1",
        "machineIpAddress": "192.168.1.100",
        "machineIndex": "001",
        "status": "running",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
]
```

#### POST /machines
Register a new machine.

**Request:**
```json
{
  "machineName": "New Machine",
  "machineIpAddress": "192.168.1.101",
  "machineIndex": "002",
  "factoryId": 1,
  "factoryIndex": 1,
  "status": "offline"
}
```

#### GET /machines/:id
Get machine details by ID.

#### PATCH /machines/:id
Update machine information.

#### POST /machines/update-index
Update machine index.

**Request:**
```json
{
  "machineId": 1,
  "newIndex": "003"
}
```

#### DELETE /machines/:id
Delete a machine.

### User API

#### GET /user
Get user information.

#### PATCH /user
Update user profile.

### Subscription API

#### GET /subscription/billing
Get user subscription information.

#### POST /subscription/create-payment-intent
Create Stripe payment intent.

#### POST /subscription/webhook
Stripe webhook endpoint (internal use).

### Debug API (Development Only)

#### GET /debug/redis/queue-lengths
Get MQTT queue lengths.

#### GET /debug/processor/status
Get MQTT processor status.

## WebSocket Integration

### Connection

Connect to the WebSocket server:

```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3000', {
  transports: ['websocket'],
  autoConnect: true
});
```

### Connection Events

#### connection
Emitted when client connects successfully.

```javascript
socket.on('connection', (data) => {
  console.log('Connected:', data);
  // {
  //   message: 'Connected to OPC UA Dashboard',
  //   serverTime: '2024-01-15T10:00:00.000Z',
  //   clientId: 'socket_id_123',
  //   connectionsFromIP: 1,
  //   maxConnections: 5
  // }
});
```

#### error
Emitted when connection errors occur.

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

### Machine Subscription System

#### subscribe-machine
Subscribe to real-time updates for a specific machine.

```javascript
socket.emit('subscribe-machine', { deviceId: 'machine-001' });

socket.on('subscription-confirmed', (data) => {
  console.log('Subscribed to machine:', data.deviceId);
});
```

#### unsubscribe-machine
Unsubscribe from machine updates.

```javascript
socket.emit('unsubscribe-machine', { deviceId: 'machine-001' });

socket.on('unsubscription-confirmed', (data) => {
  console.log('Unsubscribed from machine:', data.deviceId);
});
```

### Real-Time Data Events

#### realtime-update
Emitted when new real-time data is available.

```javascript
socket.on('realtime-update', (data) => {
  console.log('Real-time data:', data);
  // {
  //   deviceId: 'machine-001',
  //   data: {
  //     oil_temp: 45.5,
  //     auto_start: 1,
  //     operate_mode: 1,
  //     status: 1,
  //     temp_1: 220.5,
  //     temp_2: 221.0,
  //     // ... more temperature readings
  //   },
  //   timestamp: '2024-01-15T10:00:00.000Z'
  // }
});
```

#### spc-update
Emitted when new SPC (Statistical Process Control) data is available.

```javascript
socket.on('spc-update', (data) => {
  console.log('SPC data:', data);
  // {
  //   deviceId: 'machine-001',
  //   data: {
  //     cycle_number: 1234,
  //     cycle_time: 45.2,
  //     injection_velocity_max: 120.5,
  //     injection_pressure_max: 850.0,
  //     switch_pack_time: 5.2,
  //     temp_1: 220.5,
  //     temp_2: 225.0,
  //     // ... additional SPC metrics
  //   },
  //   timestamp: '2024-01-15T10:00:00.000Z'
  // }
});
```

#### machine-alert
Emitted when machine alerts occur.

```javascript
socket.on('machine-alert', (data) => {
  console.log('Machine alert:', data);
  // {
  //   deviceId: 'machine-001',
  //   alert: {
  //     level: 'warning',
  //     message: 'Temperature threshold exceeded',
  //     code: 'TEMP_HIGH'
  //   },
  //   timestamp: '2024-01-15T10:00:00.000Z'
  // }
});
```

### Data Request Events

#### get-machine-status
Request current machine status.

```javascript
socket.emit('get-machine-status', { deviceId: 'machine-001' });

socket.on('machine-status', (data) => {
  console.log('Machine status:', data);
  // {
  //   deviceId: 'machine-001',
  //   data: { ... current status ... },
  //   source: 'requested'
  // }
});
```

#### get-machine-history
Request historical data for a machine.

```javascript
socket.emit('get-machine-history', {
  deviceId: 'machine-001',
  timeRange: '-1h'  // Options: -5m, -1h, -6h, -24h
});

socket.on('machine-history', (data) => {
  console.log('Machine history:', data);
  // {
  //   deviceId: 'machine-001',
  //   data: {
  //     realtime: [...],
  //     spc: [...]
  //   },
  //   timeRange: '-1h'
  // }
});
```

### Health Check

#### ping/pong
Check connection health.

```javascript
socket.emit('ping');

socket.on('pong', (data) => {
  console.log('Pong received:', data.timestamp);
});
```

## Data Models

### User Entity
```typescript
interface User {
  userId: number;
  username: string;
  email: string;
  createdAt: Date;
}
```

### Factory Entity
```typescript
interface Factory {
  factoryId: number;
  factoryName: string;
  factoryIndex: string;
  width: string;
  height: string;
  createdAt: Date;
  machines: Machine[];
}
```

### Machine Entity
```typescript
interface Machine {
  machineId: number;
  machineName: string;
  machineIpAddress: string;
  machineIndex: string;
  status: string;
  createdAt: Date;
  factory: Factory;
  user: User;
}
```

### Real-Time Data Structure
```typescript
interface RealtimeData {
  devId: string;
  topic: string;
  sendTime: string;
  sendStamp: number;
  time: string;
  timestamp: number;
  Data: {
    OT: number;    // Oil Temperature
    ATST: number;  // Auto Start
    OPM: number;   // Operation Mode
    STS: number;   // Status
    T1: number;    // Temperature 1
    T2: number;    // Temperature 2
    T3: number;    // Temperature 3
    T4: number;    // Temperature 4
    T5: number;    // Temperature 5
    T6: number;    // Temperature 6
    T7: number;    // Temperature 7
  };
}
```

### SPC Data Structure
```typescript
interface SPCData {
  devId: string;
  topic: string;
  sendTime: string;
  sendStamp: number;
  time: string;
  timestamp: number;
  Data: {
    CYCN: string;    // Cycle Number
    ECYCT: string;   // Cycle Time
    EISS: string;    // Injection Start Signal
    EIVM: string;    // Injection Velocity Max
    EIPM: string;    // Injection Pressure Max
    ESIPT: string;   // Switch Pack Time
    ESIPP?: string;  // Switch Pack Pressure (optional)
    ESIPS?: string;  // Switch Pack Position (optional)
    EIPT?: string;   // Injection Time (optional)
    EIPSE?: string;  // Injection Position End (optional)
    EPLST?: string;  // Plasticizing Time (optional)
    EPLSSE?: string; // Plasticizing Screw End (optional)
    EPLSPM?: string; // Plasticizing Pressure Max (optional)
    ET1: string;     // Temperature 1
    ET2: string;     // Temperature 2
    ET3: string;     // Temperature 3
    ET4?: string;    // Temperature 4 (optional)
    ET5?: string;    // Temperature 5 (optional)
    ET6?: string;    // Temperature 6 (optional)
    ET7?: string;    // Temperature 7 (optional)
    ET8?: string;    // Temperature 8 (optional)
    ET9?: string;    // Temperature 9 (optional)
    ET10?: string;   // Temperature 10 (optional)
  };
}
```

## Integration Examples

### React/TypeScript Example

```typescript
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface MachineData {
  deviceId: string;
  data: any;
  timestamp: string;
}

const MachineMonitor: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [realtimeData, setRealtimeData] = useState<MachineData | null>(null);
  const [spcData, setSPCData] = useState<MachineData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io('ws://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to WebSocket server');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket server');
    });

    // Data event handlers
    socketInstance.on('realtime-update', (data: MachineData) => {
      setRealtimeData(data);
    });

    socketInstance.on('spc-update', (data: MachineData) => {
      setSPCData(data);
    });

    socketInstance.on('machine-alert', (data: any) => {
      console.warn('Machine Alert:', data);
    });

    // Error handling
    socketInstance.on('error', (error: any) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    // Cleanup on component unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const subscribeToMachine = (deviceId: string) => {
    if (socket && isConnected) {
      socket.emit('subscribe-machine', { deviceId });
    }
  };

  const unsubscribeFromMachine = (deviceId: string) => {
    if (socket && isConnected) {
      socket.emit('unsubscribe-machine', { deviceId });
    }
  };

  return (
    <div>
      <h2>Machine Monitor</h2>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>

      <button onClick={() => subscribeToMachine('machine-001')}>
        Subscribe to Machine 001
      </button>

      {realtimeData && (
        <div>
          <h3>Real-time Data</h3>
          <p>Device: {realtimeData.deviceId}</p>
          <p>Oil Temperature: {realtimeData.data.oil_temp}°C</p>
          <p>Status: {realtimeData.data.status}</p>
        </div>
      )}

      {spcData && (
        <div>
          <h3>SPC Data</h3>
          <p>Device: {spcData.deviceId}</p>
          <p>Cycle Number: {spcData.data.cycle_number}</p>
          <p>Cycle Time: {spcData.data.cycle_time}s</p>
        </div>
      )}
    </div>
  );
};

export default MachineMonitor;
```

### API Client Example

```typescript
class OPCUADashboardAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
  }

  // Get headers with authentication
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Authentication methods
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async signUp(email: string, password: string, username: string) {
    const response = await fetch(`${this.baseURL}/auth/sign-up`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, username }),
    });

    if (!response.ok) {
      throw new Error('Sign up failed');
    }

    return response.json();
  }

  // Factory methods
  async getFactories() {
    const response = await fetch(`${this.baseURL}/factories`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch factories');
    }

    return response.json();
  }

  async createFactory(factoryData: any) {
    const response = await fetch(`${this.baseURL}/factories`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(factoryData),
    });

    if (!response.ok) {
      throw new Error('Failed to create factory');
    }

    return response.json();
  }

  // Machine methods
  async getFactoriesAndMachines() {
    const response = await fetch(`${this.baseURL}/machines/factories-machines`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch factories and machines');
    }

    return response.json();
  }

  async createMachine(machineData: any) {
    const response = await fetch(`${this.baseURL}/machines`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(machineData),
    });

    if (!response.ok) {
      throw new Error('Failed to create machine');
    }

    return response.json();
  }
}

// Usage example
const api = new OPCUADashboardAPI();

// Login and use API
api.login('user@example.com', 'password123')
  .then(() => api.getFactoriesAndMachines())
  .then(data => console.log('Factories and machines:', data))
  .catch(error => console.error('API error:', error));
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### WebSocket Error Handling
```javascript
socket.on('error', (error) => {
  switch (error.code) {
    case 'CONNECTION_LIMIT_EXCEEDED':
      console.error('Too many connections from this IP');
      break;
    default:
      console.error('Socket error:', error.message);
  }
});

// Reconnection logic
socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Server initiated disconnect, reconnect manually
    socket.connect();
  }
  // Client-side disconnects will auto-reconnect
});
```

## CORS Configuration

The server is configured to accept requests from multiple origins:
- `http://localhost:3000`
- `http://localhost:3001`
- `https://*.vercel.app`
- `https://*.netlify.app`

For production deployments, ensure your domain is added to the CORS configuration.

## Rate Limiting

- WebSocket connections are limited to 5 per IP address
- Connection timeout is set to 5 minutes of inactivity
- MQTT message processing has built-in backpressure handling

## Testing WebSocket Connections

### Using curl (Limited WebSocket Support)

While curl has limited WebSocket support, you can test the HTTP upgrade request:

```bash
# Test WebSocket connection upgrade
curl -i -N -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Version: 13" \
     -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" \
     http://localhost:3000/socket.io/?EIO=4&transport=websocket
```

### Postman WebSocket Testing

**Step 1: Create WebSocket Request**
1. In Postman, create a new WebSocket request
2. URL: `ws://localhost:3000/socket.io/?EIO=4&transport=websocket`
3. Connect to establish the WebSocket connection

**Step 2: Send Socket.IO Messages**

Socket.IO uses a specific message format. Send these messages after connecting:

**Connect to Socket.IO:**
```
40
```

**Subscribe to Machine:**
```
42["subscribe-machine",{"deviceId":"machine-001"}]
```

**Request Machine Status:**
```
42["get-machine-status",{"deviceId":"machine-001"}]
```

**Request Machine History:**
```
42["get-machine-history",{"deviceId":"machine-001","timeRange":"-1h"}]
```

**Ping Health Check:**
```
42["ping"]
```

**Unsubscribe from Machine:**
```
42["unsubscribe-machine",{"deviceId":"machine-001"}]
```

### Better WebSocket Testing Tools

#### 1. WebSocket King (Browser Extension)
```
URL: ws://localhost:3000/socket.io/?EIO=4&transport=websocket
```

#### 2. wscat (Node.js CLI tool)
```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c "ws://localhost:3000/socket.io/?EIO=4&transport=websocket"

# After connection, send:
40
42["subscribe-machine",{"deviceId":"machine-001"}]
```

#### 3. Socket.IO Client Tester (JavaScript)
```javascript
// Save as test-websocket.js and run with node
const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('✓ Connected to server');

  // Test machine subscription
  socket.emit('subscribe-machine', { deviceId: 'machine-001' });
});

socket.on('subscription-confirmed', (data) => {
  console.log('✓ Subscription confirmed:', data);

  // Request machine status
  socket.emit('get-machine-status', { deviceId: 'machine-001' });
});

socket.on('machine-status', (data) => {
  console.log('✓ Machine status received:', data);
});

socket.on('realtime-update', (data) => {
  console.log('✓ Real-time update:', data);
});

socket.on('spc-update', (data) => {
  console.log('✓ SPC update:', data);
});

socket.on('error', (error) => {
  console.error('✗ Error:', error);
});

// Run: node test-websocket.js
```

### REST API Testing with curl

#### Authentication
```bash
# Login and get JWT token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Save the access_token from response for subsequent requests
export TOKEN="your_jwt_token_here"
```

#### Factory Management
```bash
# Get all factories
curl -X GET http://localhost:3000/factories \
  -H "Authorization: Bearer $TOKEN"

# Create factory
curl -X POST http://localhost:3000/factories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "factoryName": "Test Factory",
    "factoryIndex": 1,
    "width": 100,
    "height": 50
  }'
```

#### Machine Management
```bash
# Get factories and machines
curl -X GET http://localhost:3000/machines/factories-machines \
  -H "Authorization: Bearer $TOKEN"

# Create machine
curl -X POST http://localhost:3000/machines \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "machineName": "Test Machine",
    "machineIpAddress": "192.168.1.100",
    "machineIndex": "001",
    "factoryId": 1,
    "factoryIndex": 1,
    "status": "offline"
  }'
```

#### Debug Endpoints (Development Only)
```bash
# Check MQTT queue lengths
curl -X GET http://localhost:3000/debug/redis/queue-lengths

# Check processor status
curl -X GET http://localhost:3000/debug/processor/status

# Process single realtime message
curl -X GET http://localhost:3000/debug/process/single-realtime

# Process single SPC message
curl -X GET http://localhost:3000/debug/process/single-spc

# Test InfluxDB connection
curl -X GET http://localhost:3000/debug/influxdb/test-connection
```

### Complete Testing Script

Create a bash script to test the entire flow:

```bash
#!/bin/bash
# save as test-api.sh

BASE_URL="http://localhost:3000"

echo "🔐 Testing Authentication..."
# Login
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful"
echo "Token: ${TOKEN:0:20}..."

echo -e "\n🏭 Testing Factories..."
# Get factories
FACTORIES=$(curl -s -X GET $BASE_URL/factories \
  -H "Authorization: Bearer $TOKEN")
echo "Factories: $FACTORIES"

echo -e "\n🤖 Testing Machines..."
# Get machines
MACHINES=$(curl -s -X GET $BASE_URL/machines/factories-machines \
  -H "Authorization: Bearer $TOKEN")
echo "Machines: $MACHINES"

echo -e "\n📊 Testing Debug Endpoints..."
# Queue lengths
QUEUES=$(curl -s -X GET $BASE_URL/debug/redis/queue-lengths)
echo "Queue lengths: $QUEUES"

# Processor status
STATUS=$(curl -s -X GET $BASE_URL/debug/processor/status)
echo "Processor status: $STATUS"

echo -e "\n✅ API testing complete"
```

Make it executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Development Tools

### Debug Endpoints (Development Only)
- `GET /debug/redis/queue-lengths` - Check message queue status
- `GET /debug/processor/status` - Check MQTT processor status
- `GET /debug/process/single-realtime` - Process one realtime message
- `GET /debug/process/single-spc` - Process one SPC message

These endpoints are marked as `@Public()` and should be removed in production.

## Expected WebSocket Responses from Mock Data

### Machine Device ID Format
Based on the backend implementation, machine device IDs follow this pattern:
- Database machines: `"postgres machine 1"`, `"postgres machine 2"`, etc.
- Test devices: Use actual machine IDs from your database

### Quick Test Commands

#### 1. WebSocket Connection (Postman)
**URL:** `ws://localhost:3000/socket.io/?EIO=4&transport=websocket`

**Messages to send in order:**
```
40  # Connect to Socket.IO
42["subscribe-machine",{"deviceId":"postgres machine 1"}]  # Subscribe to machine
42["get-machine-status",{"deviceId":"postgres machine 1"}]  # Request status
```

#### 2. Using wscat (Node.js CLI tool)
```bash
npm install -g wscat
wscat -c "ws://localhost:3000/socket.io/?EIO=4&transport=websocket"

# After connection, send these messages:
40
42["subscribe-machine",{"deviceId":"postgres machine 1"}]
42["get-machine-status",{"deviceId":"postgres machine 1"}]
```

#### 3. Browser WebSocket Test
Create an HTML file to test WebSocket connectivity:

```html
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Test</title>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
</head>
<body>
    <h2>WebSocket Test</h2>
    <div id="status">Disconnected</div>
    <div id="messages"></div>

    <script>
        const socket = io('http://localhost:3000', {
            transports: ['websocket']
        });

        const statusDiv = document.getElementById('status');
        const messagesDiv = document.getElementById('messages');

        function addMessage(type, data) {
            const msg = document.createElement('div');
            msg.innerHTML = `<strong>${type}:</strong> ${JSON.stringify(data, null, 2)}`;
            msg.style.margin = '10px 0';
            msg.style.padding = '10px';
            msg.style.backgroundColor = type === 'realtime-update' ? '#e8f5e8' :
                                      type === 'spc-update' ? '#e8f0ff' : '#f5f5f5';
            messagesDiv.appendChild(msg);
        }

        socket.on('connect', () => {
            statusDiv.textContent = 'Connected';
            statusDiv.style.color = 'green';

            // Auto-subscribe to test machine
            socket.emit('subscribe-machine', { deviceId: 'postgres machine 1' });
            socket.emit('get-machine-status', { deviceId: 'postgres machine 1' });
        });

        socket.on('disconnect', () => {
            statusDiv.textContent = 'Disconnected';
            statusDiv.style.color = 'red';
        });

        socket.on('realtime-update', (data) => addMessage('realtime-update', data));
        socket.on('spc-update', (data) => addMessage('spc-update', data));
        socket.on('machine-status', (data) => addMessage('machine-status', data));
        socket.on('subscription-confirmed', (data) => addMessage('subscription-confirmed', data));
        socket.on('error', (error) => addMessage('error', error));
    </script>
</body>
</html>
```

### Expected WebSocket Responses

#### Realtime Data (Every 5 seconds)
```javascript
42["realtime-update",{
  "deviceId": "postgres machine 1",
  "data": {
    "devId": "postgres machine 1",
    "topic": "realtime",
    "sendTime": "2025-09-13 14:41:07",
    "sendStamp": 1726244467000,
    "time": "2025-09-13 14:41:06",
    "timestamp": 1726244466000,
    "Data": {
      "OT": 52.3,      // Oil Temperature (°C)
      "ATST": 0,       // Auto Time Start (0=disabled, 1=enabled)
      "OPM": 2,        // Operation Mode (1=Semi-auto, 2=Eye auto, 3=Time auto)
      "STS": 2,        // Status (0=offline, 1=online, 2=production, 3=warning)
      "T1": 221.5,     // Temperature Zone 1 (°C)
      "T2": 220.8,     // Temperature Zone 2 (°C)
      "T3": 222.1,     // Temperature Zone 3 (°C)
      "T4": 219.7,     // Temperature Zone 4 (°C)
      "T5": 221.9,     // Temperature Zone 5 (°C)
      "T6": 220.4,     // Temperature Zone 6 (°C)
      "T7": 222.3      // Temperature Zone 7 (°C)
    }
  },
  "timestamp": "2025-09-13T14:41:07.000Z"
}]
```

#### SPC Data (Every 30-60 seconds)
```javascript
42["spc-update",{
  "deviceId": "postgres machine 1",
  "data": {
    "devId": "postgres machine 1",
    "topic": "spc",
    "sendTime": "2025-09-13 14:41:45",
    "sendStamp": 1726244505000,
    "time": "2025-09-13 14:41:44",
    "timestamp": 1726244504000,
    "Data": {
      "CYCN": "6026",           // Cycle Number
      "ECYCT": "45.2",          // Effective Cycle Time (seconds)
      "EISS": "2025-09-13T14:41:14.000Z", // Effective Injection Start Time
      "EIVM": "152.3",          // Effective Injection Velocity Max (mm/s)
      "EIPM": "78.5",           // Effective Injection Pressure Max (bar)
      "ESIPT": "2.5",           // Effective Switch-over Injection Pressure Time (s)
      "ESIPP": "87.2",          // Effective Switch-over Injection Pressure Position (%)
      "ESIPS": "32.1",          // Effective Switch-over Injection Pressure Speed (mm/s)
      "EIPT": "5.2",            // Effective Injection Pressure Time (s)
      "EIPSE": "2025-09-13T14:41:19.000Z", // Effective Injection Pressure Start End
      "EPLST": "4.1",           // Effective Plasticizing Time (s)
      "EPLSSE": "2025-09-13T14:41:23.000Z", // Effective Plasticizing Start End
      "EPLSPM": "118.7",        // Effective Plasticizing Pressure Max (bar)
      "ET1": "221.5",           // Effective Temperature 1-10 (°C)
      "ET2": "220.8",
      "ET3": "222.1",
      "ET4": "219.7",
      "ET5": "221.9",
      "ET6": "220.4",
      "ET7": "222.3",
      "ET8": "220.9",
      "ET9": "221.2",
      "ET10": "222.0"
    }
  },
  "timestamp": "2025-09-13T14:41:45.000Z"
}]
```

#### Machine Status Response
```javascript
42["machine-status",{
  "deviceId": "postgres machine 1",
  "data": {
    // Current cached status data
    "lastUpdate": "2025-09-13T14:41:07.000Z",
    "status": "production",
    "Data": {
      "STS": 2,
      "OT": 52.3,
      "T1": 221.5
      // ... additional cached fields
    }
  },
  "source": "requested",  // or "cache"
  "timestamp": "2025-09-13T14:41:50.000Z"
}]
```

#### Subscription Confirmation
```javascript
42["subscription-confirmed",{
  "deviceId": "postgres machine 1",
  "message": "Subscribed to machine updates"
}]
```

### Debugging Steps

#### 1. Backend Health Check
```bash
# Check if backend is running
curl -X GET http://localhost:3000/debug/processor/status

# Expected response (if debug endpoints are enabled):
{
  "mqttProcessor": {
    "isRunning": true,
    "realtimeQueueSize": 0,
    "spcQueueSize": 0
  },
  "mockDataService": {
    "isEnabled": true,
    "machines": ["postgres machine 1", "postgres machine 2"],
    "lastRealtimeSent": "2025-09-13T14:41:07.000Z",
    "lastSPCSent": "2025-09-13T14:41:45.000Z"
  }
}
```

**⚠️ Current Status**: Debug endpoints may not be accessible in your current backend configuration. If you get "Backend debug endpoint not accessible", this is expected behavior for security reasons.

#### 2. Check Message Queues
```bash
# Check Redis queue lengths
curl -X GET http://localhost:3000/debug/redis/queue-lengths

# Expected response:
{
  "realtime": 0,
  "spc": 0,
  "processed": 1250
}
```

#### 3. Verify Database Machines
```bash
# Get your actual machines from the API
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Use the token to get machines
curl -X GET http://localhost:3000/machines/factories-machines \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 4. Console Logs to Watch For

**Backend logs (successful data flow):**
```
[MqttProcessor] Processing realtime message for device: postgres machine 1
[MachineGateway] Broadcasted realtime update for device postgres machine 1
[MqttProcessor] Processing SPC message for device: postgres machine 1
[MachineGateway] Broadcasted SPC update for device postgres machine 1
```

**Frontend logs (successful reception):**
```
✓ REALTIME UPDATE: { deviceId: 'postgres machine 1', timestamp: '2025-09-13T14:41:07.000Z' }
✓ SPC UPDATE: { deviceId: 'postgres machine 1', timestamp: '2025-09-13T14:41:45.000Z' }
Machine Status Card - deriving status from payload: { deviceId: '1', STS: 2 }
```

### Troubleshooting Common Issues

#### Issue: No WebSocket messages received
**Solution:**
1. Verify backend is running: `lsof -i :3000`
2. Check debug endpoints work: `curl http://localhost:3000/debug/processor/status`
3. Ensure your deviceId matches database machine names exactly
4. Check browser console for WebSocket connection errors

#### Issue: Wrong machine status colors
**Solution:**
1. Check STS values in console logs
2. Verify status mapping: 0=offline, 1=online, 2=production, 3=warning
3. Ensure deriveStatus function uses correct mapping

#### Issue: Data shows as 0 or undefined
**Solution:**
1. Verify data structure matches expected format
2. Check console logs for actual received data structure
3. Ensure temperature fields (T1-T7, OT) are properly extracted

### Data Flow Architecture
```
MockDataService → MQTT Broker → Redis Queue → MqttProcessor → InfluxDB Storage
                                                    ↓
                                            WebSocket Gateway → Frontend Components
```

The system generates realistic injection molding data every 5 seconds (realtime) and every 30-60 seconds (SPC), broadcasts via WebSocket to subscribed clients, and stores in InfluxDB for historical analysis.

## Current Observed Behavior (September 2025)

### ✅ What Works
1. **WebSocket Connection**: Successfully connects to `ws://localhost:3000/socket.io/`
2. **Ping/Pong**: Health check works correctly
3. **History Requests**: Returns structured response (currently empty arrays)

### ❌ What's Not Working / Missing
1. **Subscription Confirmations**: No `subscription-confirmed` events received
2. **Machine Status**: No `machine-status` responses to `get-machine-status` requests
3. **Real-time Data**: No `realtime-update` events being broadcast
4. **SPC Data**: No `spc-update` events being broadcast
5. **Debug Endpoints**: `/debug/*` endpoints not accessible (may be disabled for security)

### Test Results Summary
When testing with the provided HTML test page or Node.js script:

**Messages Received:**
```javascript
// ✅ History request (empty but working)
{
  "deviceId": "postgres machine 1",
  "data": {
    "realtime": [],
    "spc": []
  },
  "timeRange": "-1h"
}

// ✅ Ping response (working)
{
  "timestamp": "2025-09-14T17:04:50.794Z"
}
```

**Messages NOT Received:**
- `subscription-confirmed` events
- `machine-status` responses
- `realtime-update` broadcasts
- `spc-update` broadcasts

### Possible Causes
1. **Mock Data Service**: May not be enabled or configured
2. **MQTT Processor**: May not be running or processing messages
3. **Database Integration**: Machine records may not exist with expected names
4. **Environment Configuration**: Backend may be in production mode without mock data

### Recommendations
1. **Backend Configuration**: Ensure mock data service is enabled for development
2. **Machine Records**: Verify machines exist in database with names like "postgres machine 1"
3. **Environment Variables**: Check if `NODE_ENV=development` or similar flags are set
4. **Real Backend Integration**: Consider connecting to actual OPC UA/MQTT data sources

### Frontend Implications
Since realtime data is not currently flowing:
- Machine status cards will show default "offline" status
- Production status tiles will show zero values
- Temperature readings will not update
- Utilization metrics will remain static

The frontend code is correctly structured to handle live data when it becomes available.