const fastify = require('fastify')();
const path = require('path');

fastify.register(require('fastify-static'), {
  root: path.join(__dirname, 'static'),
  prefix: '/'
});

fastify.get('/', async (req, reply) => {
    await reply.sendFile('index.html');
});

fastify.listen(3000, (err, address) => {
    if (err)
        throw err;
    fastify.log.info(`Server listening on ${address}`);
});