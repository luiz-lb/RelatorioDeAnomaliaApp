import { Kafka } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'relatorio-app',
    brokers: [process.env.KAFKA_BROKERS || 'localhost:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'email-notificacao-group' });
const admin = kafka.admin();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function retryKafkaConnect(connectFn, label) {
    while (true) {
        try {
            await connectFn();
            console.log(`✅ ${label} conectado ao Kafka.`);
            return;
        } catch (error) {
            console.error(`❌ Falha ao conectar ${label} ao Kafka. Tentando novamente em 5 segundos...`, error.message || error);
            await sleep(5000);
        }
    }
}

async function connectProducer() {
    return retryKafkaConnect(() => producer.connect(), 'Producer Kafka');
}

async function connectConsumer() {
    return retryKafkaConnect(() => consumer.connect(), 'Consumer Kafka');
}

async function connectAdmin() {
    return retryKafkaConnect(() => admin.connect(), 'Admin Kafka');
}

export { kafka, producer, consumer, admin, connectProducer, connectConsumer, connectAdmin };
