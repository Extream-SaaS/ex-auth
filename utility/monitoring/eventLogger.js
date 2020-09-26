const {PubSub} = require('@google-cloud/pubsub');
const grpc = require('grpc');
const projectId = 'stoked-reality-284921';

const pubsub = new PubSub({grpc, projectId});

class EventLogger {

    constructor(topic, source) {
        this.topic = topic;
        this.source = source;
        this.logEvent = this.logEvent.bind(this);
    }

    async logEvent(data, clientId, eventId = null) {
        data.clientId = clientId;
        data.eventId = eventId;
        data.source = this.source;
        data.timestamp = Date.now();
        const dataBuffer = Buffer.from(JSON.stringify(data));
        await pubsub.topic(this.topic).publish(dataBuffer);

    }
}

module.exports = EventLogger;
