const concat = require('concat-stream');
async function routes(fastify, options)
{
    const schema = {
        params: {
            type: 'object',
            properties: {
                id: { type: 'integer' },
            },
            required: ['id'],
            additionalProperties: false
        }
    }

    const TRAIN_OPCODE_PERSON = 0;
    const TRAIN_OPCODE_ALL = 1;
    fastify.get('/:id', async (req, reply) => {
        let buffer = null;

        let b = Buffer.alloc(4 + 4);
        b.writeUInt32LE(TRAIN_OPCODE_ALL, 0);
        b.writeUInt32LE(req.params.id, 4);

        fastify.rabbit.sendToQueue('train', b);
        
        return reply.send({ status: 200 });
    });
}

module.exports = routes;