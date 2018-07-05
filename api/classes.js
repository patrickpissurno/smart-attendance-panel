const moment = require('moment');
async function routes(fastify, options)
{
    const getOneSchema = {
        params: {
            type: 'object',
            properties: {
                subjectID: { type: 'string' },
            },
            required: ['subjectID'],
            additionalProperties: false
        },
        querystring: {
            type: 'object',
            properties: {
                id: { type: 'string' },
            },
            required: ['id'],
            additionalProperties: false
        },
    }
    const postSchema = {
        body: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                subjectID: { type: 'string' },
                roomID: { type: 'string' },
                students: { type: "array", items: { type: "string" } },
                startTime: { type: "array", items: { type: "string" } },
                endTime: { type: "array", items: { type: "string" } }
            },
            required: ['id', 'name', 'subjectID', 'roomID', 'startTime', 'endTime'],
            additionalProperties: false
        }
    }
    const patchSchema = {
        params: {
            type: 'object',
            properties: {
                subjectID: { type: 'string' },
            },
            required: ['subjectID'],
            additionalProperties: false
        },
        querystring: {
            type: 'object',
            properties: {
                id: { type: 'string' },
            },
            required: ['id'],
            additionalProperties: false
        },
        body: {
            type: 'object',
            properties: {
                students: { type: "array", items: { type: "string" } },
            },
            anyOf: [
                { required: ['students'] },
            ],
            additionalProperties: false
        }
    }

    fastify.get('/', async (request, reply) => {
        let db = fastify.mongo.db;
        return await db.collection('classes').find({}).project({
            id: 1,
            subjectID: 1,
            name: 1,
            roomID: 1,
            students: 1,
            startTime: 1,
            endTime: 1
        }).toArray();
    });

    fastify.get('/:subjectID', { schema: getOneSchema }, async (request, reply) => {
        let db = fastify.mongo.db;
        return await db.collection('classes').findOne({ subjectID: request.params.subjectID, id: request.query.id });
    });

    fastify.post('/', { schema: postSchema }, async (request, reply) => {
        let db = fastify.mongo.db;
        request.body.groupID = 1;
        request.body.attendance = [];
        return await db.collection('classes').insertOne(request.body);
    });

    fastify.patch('/:subjectID', { schema: patchSchema }, async (request, reply) => {
        let db = fastify.mongo.db;
        return await db.collection('classes').updateOne({ subjectID: request.params.subjectID, id: request.query.id }, { $set: request.body });
    });

    fastify.get('/now', async (request, reply) => {
        let db = fastify.mongo.db;
        let m = moment()
                .utc()
                .year(0)
                .month(0)
                .date(2)
                .day(moment().day() - 1);
            
        let classes = await db.collection('classes').find({}).project({
            id: 1,
            subjectID: 1,
            name: 1,
            roomID: 1,
            students: 1,
            startTime: 1,
            endTime: 1
        }).toArray();

        return classes.filter(c => {
            for(let i = 0; i<c.startTime.length; i++){
                if(m.isBetween(moment(c.startTime[i]).utc(), moment(c.endTime[i]).utc()))
                    return true;
            }
            return false;
        }).map(x => {
            x.classID = x.id;
            delete x.id;
            return x;
        });
    });
}

module.exports = routes;