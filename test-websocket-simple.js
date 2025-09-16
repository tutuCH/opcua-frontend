// Simple WebSocket test to diagnose the issue
const io = require('socket.io-client');

console.log('🔌 Connecting to WebSocket server...');

const socket = io('http://localhost:3000', {
  transports: ['websocket']
});

let messageCount = 0;

socket.on('connect', () => {
  console.log('✅ Connected to server, Socket ID:', socket.id);

  // Test sequence
  console.log('📡 Subscribing to machine...');
  socket.emit('subscribe-machine', { deviceId: 'postgres machine 1' });

  setTimeout(() => {
    console.log('🔍 Requesting machine status...');
    socket.emit('get-machine-status', { deviceId: 'postgres machine 1' });
  }, 1000);

  setTimeout(() => {
    console.log('📊 Requesting machine history...');
    socket.emit('get-machine-history', { deviceId: 'postgres machine 1', timeRange: '-1h' });
  }, 2000);

  setTimeout(() => {
    console.log('🏓 Sending ping...');
    socket.emit('ping');
  }, 3000);

  // Auto-disconnect after 30 seconds
  setTimeout(() => {
    console.log('\n📈 Summary:');
    console.log(`Total messages received: ${messageCount}`);
    socket.disconnect();
    process.exit(0);
  }, 30000);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});

// All possible events
const events = [
  'realtime-update',
  'spc-update',
  'machine-status',
  'machine-history',
  'machine-alert',
  'subscription-confirmed',
  'unsubscription-confirmed',
  'pong',
  'error'
];

events.forEach(event => {
  socket.on(event, (data) => {
    messageCount++;
    console.log(`📨 [${event}]:`, JSON.stringify(data, null, 2));
  });
});

// Catch any other events
const originalOn = socket.on.bind(socket);
socket.on = function(event, handler) {
  if (!events.includes(event) && !['connect', 'disconnect', 'connect_error'].includes(event)) {
    console.log(`🔍 Listening for unknown event: ${event}`);
  }
  return originalOn(event, handler);
};

console.log('⏳ Waiting for messages (will auto-disconnect in 30 seconds)...');