import { Kafka } from 'kafkajs';
import { criarEmailDeAviso } from '../services/fiscalizacaoService.js';
import { sendEmail } from '../utils/mailer.js';

// Configuração do cliente Kafka
const kafka = new Kafka({
    clientId: 'relatorio-app',
    brokers: ['localhost:9092'] // Endereço de conexão do seu Kafka
});

// Criando o consumidor e definindo o "Consumer Group"
const consumer = kafka.consumer({ groupId: 'email-notificacao-group' });

export async function iniciarConsumidorDeEmail() {
    try {
        // Usando o Admin Client para garantir que o tópico existe antes de escutar
        const admin = kafka.admin();
        await admin.connect();
        const topicosExistentes = await admin.listTopics();
        
        if (!topicosExistentes.includes('relatorio-finalizado')) {
            await admin.createTopics({
                topics: [{ topic: 'relatorio-finalizado', numPartitions: 1 }]
            });
            console.log('⚙️ Tópico "relatorio-finalizado" criado no Kafka com sucesso.');
        }
        await admin.disconnect();

        await consumer.connect();
        console.log('✅ Consumidor de E-mail conectado ao broker de mensageria.');

        // Inscrevendo-se no tópico
        await consumer.subscribe({ topic: 'relatorio-finalizado', fromBeginning: false });

        // Processo que fica rodando eternamente escutando mensagens
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const evento = JSON.parse(message.value.toString());
                console.log(`[Worker] Processando envio de e-mail para o relatório ID: ${evento.idRelatorio}`);

                try {
                    // Busca os dados e monta o HTML do e-mail
                    const configuracaoEmail = await criarEmailDeAviso(evento.idRelatorio);
                    
                    // Dispara o e-mail
                    const remetente = "chamados@everestengenharia.com.br";
                    await sendEmail(remetente, configuracaoEmail);
                    
                    console.log(`✅ E-mail do relatório ${evento.idRelatorio} enviado com sucesso!`);
                } catch (error) {
                    console.error(`❌ Falha ao tentar enviar e-mail do relatório ${evento.idRelatorio}:`, error);
                    // IMPORTANTE: Se o servidor de e-mail cair, o erro cai aqui.
                    // Você pode configurar o KafkaJS para tentar novamente (retry) automaticamente.
                }
            },
        });
    } catch (error) {
        console.error('Erro ao iniciar o consumidor:', error);
    }
}