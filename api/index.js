// Vercel API handler for the BTMM Trading App
const fastify = require('fastify')({ logger: false });
const path = require('path');

// Register plugins
fastify.register(require('@fastify/cors'), {
  origin: true,
  credentials: true
});

fastify.register(require('@fastify/multipart'));

// Import routes (auth removed)
fastify.register(require('../routes/trades'));
fastify.register(require('../routes/screenshots'));
fastify.register(require('../routes/analytics'));

// Health check
fastify.get('/api/health', async (request, reply) => {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

// Export handler for Vercel
module.exports = async (req, res) => {
  await fastify.ready();
  fastify.server.emit('request', req, res);
};