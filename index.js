import Aedes from 'aedes';
import { createServer } from 'net';

// Initialize environment variables
const {
  PORT = 1883, // Default MQTT port
} = process.env;

// Create Aedes instance
const aedes = new Aedes();

// Start the Aedes MQTT server
function startAedes() {
  const server = createServer(aedes.handle);

  server.listen(PORT, () => {
    console.info(`Aedes (MQTT) server ready on *:${PORT}`);
  });

  aedes.on('client', (client) => {
    console.log('Client Connected:', client.id);
  });

  aedes.on('publish', (packet, client) => {
    if (client && packet.topic === 'home/doorbell') {
      const _pkt = {
        topic: 'home/doorbell',
        payload: Buffer.from('RING'),
        qos: 0,
        retain: false,
        cmd: 'publish',
        dup: true,
      };

      client.publish(_pkt, (err) => {
        if (err) {
          console.error('Failed to publish MQTT message', err);
        } else {
          console.info('MQTT message published successfully');
        }
      });
    }
  });

  // Clean up and shutdown logic
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  function shutdown() {
    console.info('Shutting down...');
    server.close(() => {
      console.info('MQTT server closed');
    });
    process.exit(0);
  }
}

// Initialize the server
async function init() {
  console.info('Starting server...');
  startAedes();
}

init().catch(err => {
  console.error('Error initializing server:', err);
});
