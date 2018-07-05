(async () => {
    const fastify = require('fastify')();
    const path = require('path');
    const concat = require('concat-stream');
    const rabbitmq = await require('amqplib').connect('amqp://localhost');
    const ch = await rabbitmq.createChannel();

    fastify.use(require('cors')());

    ch.assertQueue('train', { durable: false });
    fastify.decorate('rabbit', ch);

    fastify.register(require('fastify-static'), {
        root: path.join(__dirname, 'static'),
        prefix: '/'
    });

    fastify.register(require('fastify-multipart'));

    fastify.register(require('fastify-mongodb'), {
        url: 'mongodb://localhost/smart_attendance'
    });

    fastify.get('/', async (req, reply) => {
        await reply.sendFile('index.html');
    });

    fastify.register(require('./api'), { prefix: 'api' });

    fastify.listen(80, '0.0.0.0', (err, address) => {
        if (err)
            throw err;
        fastify.log.info(`Server listening on ${address}`);
    });
})();