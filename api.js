async function routes(fastify, options)
{
    fastify.register(require('./api/students'), { prefix: 'students' });
    fastify.register(require('./api/classes'), { prefix: 'classes' });
    fastify.register(require('./api/subjects'), { prefix: 'subjects' });
    fastify.register(require('./api/train'), { prefix: 'train' });
}

module.exports = routes;