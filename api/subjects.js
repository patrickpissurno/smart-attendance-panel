async function routes(fastify, options)
{
    const postSchema = {
        body: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
            },
            required: ['id', 'name'],
            additionalProperties: false
        }
    }

    fastify.get('/', async (request, reply) => {
        let db = fastify.mongo.db;
        return await db.collection('subjects').find({}).project({
            id: 1,
            name: 1
        }).toArray();
    });

    fastify.post('/', { schema: postSchema }, async (request, reply) => {
        let db = fastify.mongo.db;
        return await db.collection('subjects').insertOne(request.body);
    });
}

module.exports = routes;