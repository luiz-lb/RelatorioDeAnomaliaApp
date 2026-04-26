import axios from "axios";
import {ClientSecretCredential} from "@azure/identity";

// Inicializa o gerador de credenciais do Azure
const credential = new ClientSecretCredential(
  process.env.MS_GRAPH_TENANT_ID,
  process.env.MS_GRAPH_CLIENT_ID,
  process.env.MS_GRAPH_VALUE
);

export async function sendEmail(remetente, mail) {
    try {
        // O escopo '.default' pega as permissões que foram configuradas no Azure AD
        const tokenResponse = await credential.getToken('https://graph.microsoft.com/.default');
        const url = `https://graph.microsoft.com/v1.0/users/${remetente}/sendMail`;
        
        await axios.post(url, mail, {
            headers: {
                'Authorization': `Bearer ${tokenResponse.token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('E-mail enviado com sucesso via Axios!');
        return true;
    } catch (error) {
        console.error('Erro ao enviar e-mail via Axios:', error);
        if (error.response) {
            console.error('Erro na resposta do Graph API:', error.response.status, error.response.data);
        } else {
            console.error('Erro na requisição:', error.message);
        }
        return false;
    }
}
