const fastify = require('fastify')({ logger: true });
const path = require('path');
require('dotenv').config();

// Register plugins
fastify.register(require('@fastify/cors'), {
  origin: true,
  credentials: true
});

fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET
});

fastify.register(require('@fastify/multipart'));

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/'
});

// Import routes
fastify.register(require('./routes/auth'));
fastify.register(require('./routes/trades'));
fastify.register(require('./routes/screenshots'));
fastify.register(require('./routes/analytics'));

// Health check
fastify.get('/api/health', async (request, reply) => {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

// Serve main app
fastify.get('/', async (request, reply) => {
  return reply.sendFile('index.html');
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT || 5000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 BTMM Trading App running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
