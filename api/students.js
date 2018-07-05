const concat = require('concat-stream');
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
    const patchSchema = {
        body: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                classes: { type: "array", items: {
                    type: "object",
                    properties: {
                        id: { type: 'string' },
                        subjectID: { type: 'string' },
                    },
                    required: ['id', 'subjectID'],
                    additionalProperties: false
                } },
            },
            anyOf: [
                { required: ['name', 'classes'] },
            ],
            additionalProperties: false
        }
    }

    fastify.get('/', async (request, reply) => {
        let db = fastify.mongo.db;
        return await db.collection('people').find({}).project({
            id: 1,
            name: 1,
            classes: 1
        }).toArray();
    });
    fastify.post('/', { schema: postSchema }, async (request, reply) => {
        let db = fastify.mongo.db;
        request.body.classes = [];
        return await db.collection('people').insertOne(request.body);
    });
    fastify.patch('/:id', { schema: patchSchema }, async (request, reply) => {
        let db = fastify.mongo.db;
        return await db.collection('people').updateOne({ id: request.params.id }, { $set: request.body });
    });

    const TRAIN_OPCODE_PERSON = 0;
    const TRAIN_OPCODE_ALL = 1;
    fastify.post('/:id/picture', async (req, reply) => {
        let db = fastify.mongo.db;
        let person = await db.collection('people').findOne({ id: req.params.id });

        let buffer = null;

        const mp = req.multipart(handler, async err => {
            if(err || !buffer)
                return reply.status(500).send({ status: 500 });

            /**
             * Buffer structure (OP 0)
             * From 0 to 3: opcode
             * From 4 to 27: person._id
             * From 28 till the end: png image
             */

            let b = Buffer.alloc(4 + 24 + buffer.length);
            b.writeUInt32LE(TRAIN_OPCODE_PERSON, 0);
            b.write(person._id.toHexString(), 4, 24, 'ascii');
            buffer.copy(b, 4 + 24, 0, buffer.length);

            fastify.rabbit.sendToQueue('train', b);
            
            return reply.send({ status: 200 });
        });

        mp.on('field', function (key, value) {
            // console.log('form-data', key, value)
        });
    
        function handler (field, file, filename, encoding, mimetype) {
            file.pipe(concat(b => buffer = b));
        }
    });
}

module.exports = routes;